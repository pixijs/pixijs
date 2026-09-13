import { DOMAdapter } from '../../../../environment/adapter';
import { isPow2, nextPow2 } from '../../../../maths/misc/pow2';
import { warn } from '../../../../utils/logging/warn';
import { GlobalResourceRegistry } from '../../../../utils/pool/GlobalResourceRegistry';
import { ScreenSizeRegistry } from './utils/ScreenSizeRegistry';

import type { ICanvas, ICanvasRenderingContext2DSettings } from '../../../../environment/canvas/ICanvas';
import type { ICanvasRenderingContext2D } from '../../../../environment/canvas/ICanvasRenderingContext2D';
import type { Size } from '../../../../maths/misc/Size';

/** the largest dimension that fits in one of the 15 bit fields of a pool key */
const maxKeyDimension = 32767;

/**
 * A utility type that represents a canvas and its rendering context.
 * @category rendering
 * @internal
 */
export interface CanvasAndContext
{
    /** The canvas element. */
    canvas: ICanvas;
    /** The rendering context of the canvas. */
    context: ICanvasRenderingContext2D;
}

function bucketKey(width: number, height: number): number
{
    return (width << 17) + (height << 2);
}

/**
 * CanvasPool is a utility class that manages a pool of reusable canvas elements
 * @category rendering
 * @internal
 */
export class CanvasPoolClass
{
    public canvasOptions: ICanvasRenderingContext2DSettings;

    /** idle canvases, keyed by size */
    private readonly _buckets = new Map<number, CanvasAndContext[]>();
    /** the screens this pool is sizing its canvases for */
    private readonly _screens = new ScreenSizeRegistry();

    constructor(canvasOptions?: ICanvasRenderingContext2DSettings)
    {
        this.canvasOptions = canvasOptions || {};
    }

    /**
     * Creates texture with params that were specified in pool constructor.
     * @param pixelWidth - Width of texture in pixels.
     * @param pixelHeight - Height of texture in pixels.
     */
    private _createCanvasAndContext(pixelWidth: number, pixelHeight: number): CanvasAndContext
    {
        const canvas = DOMAdapter.get().createCanvas();

        canvas.width = pixelWidth;
        canvas.height = pixelHeight;

        const context = canvas.getContext('2d');

        return { canvas, context };
    }

    /**
     * Gets a Power-of-Two canvas or screen sized canvas
     * @param minWidth - The minimum width of the canvas.
     * @param minHeight - The minimum height of the canvas.
     * @param resolution - The resolution of the canvas.
     * @returns The new canvas and its context.
     */
    public getOptimalCanvasAndContext(minWidth: number, minHeight: number, resolution = 1): CanvasAndContext
    {
        const { width: canvasWidth, height: canvasHeight } = this.getOptimalSize(minWidth, minHeight, resolution);

        // #if _DEBUG
        if (canvasWidth > maxKeyDimension || canvasHeight > maxKeyDimension)
        {
            warn(`CanvasPool: ${canvasWidth}x${canvasHeight} is larger than the `
                + `${maxKeyDimension}px pool key limit, canvases of this size may be pooled together`);
        }
        // #endif

        const key = bucketKey(canvasWidth, canvasHeight);
        let bucket = this._buckets.get(key);

        if (!bucket)
        {
            bucket = [];
            this._buckets.set(key, bucket);
        }

        let canvasAndContext = bucket.pop();

        if (!canvasAndContext)
        {
            canvasAndContext = this._createCanvasAndContext(canvasWidth, canvasHeight);
        }

        return canvasAndContext;
    }

    /**
     * The backing size, in physical pixels, that
     * {@link CanvasPoolClass#getOptimalCanvasAndContext|getOptimalCanvasAndContext} would allocate for a request,
     * without taking a canvas from the pool.
     *
     * Each axis is the next power of two, or the smallest registered screen the request fits inside
     * (see {@link CanvasPoolClass#setScreenSize|setScreenSize}).
     * @param minWidth - The minimum width of the canvas.
     * @param minHeight - The minimum height of the canvas.
     * @param resolution - The resolution of the canvas.
     * @returns The width and height the pooled canvas would have, in physical pixels.
     */
    public getOptimalSize(minWidth: number, minHeight: number, resolution = 1): Size
    {
        const pixelWidth = Math.ceil((minWidth * resolution) - 1e-6);
        const pixelHeight = Math.ceil((minHeight * resolution) - 1e-6);

        const po2Width = nextPow2(pixelWidth);
        const screenWidth = this._screens.getFittingWidth(pixelWidth);
        const po2Height = nextPow2(pixelHeight);
        const screenHeight = this._screens.getFittingHeight(pixelHeight);

        return {
            width: screenWidth !== undefined ? Math.min(screenWidth, po2Width) : po2Width,
            height: screenHeight !== undefined ? Math.min(screenHeight, po2Height) : po2Height,
        };
    }

    /**
     * Place a canvas back into the pool.
     * @param canvasAndContext
     */
    public returnCanvasAndContext(canvasAndContext: CanvasAndContext): void
    {
        const canvas = canvasAndContext.canvas;
        const { width, height } = canvas;

        const canvases = this._buckets.get(bucketKey(width, height));

        // the bucket this canvas belongs to was pruned (its size no longer matches a screen),
        // so there is nothing to return it to - drop it rather than resurrect a dead bucket
        if (!canvases) return;

        canvasAndContext.context.resetTransform();
        canvasAndContext.context.clearRect(0, 0, width, height);

        canvases.push(canvasAndContext);
    }

    /**
     * Registers the screen size of a renderer with the pool, in physical pixels.
     *
     * While a screen is registered, a request that fits inside it on an axis is given that screen's size on
     * that axis instead of the next power of two, which stops a full screen canvas from being allocated far
     * larger than the screen. Requests larger than every registered screen on an axis keep the power of two
     * size - the pool never rounds a request up to a screen it does not fit in.
     * @param rendererUid - The uid of the renderer, used to update or remove this screen later.
     * @param pixelWidth - The width of the screen in physical pixels.
     * @param pixelHeight - The height of the screen in physical pixels.
     */
    public setScreenSize(rendererUid: number, pixelWidth: number, pixelHeight: number): void
    {
        if (!this._screens.set(rendererUid, pixelWidth, pixelHeight)) return;

        this._pruneScreenCanvases();
    }

    /**
     * Removes a screen previously registered with
     * {@link CanvasPoolClass#setScreenSize|setScreenSize}, dropping any idle canvases that were
     * only being kept for it.
     * @param rendererUid - The uid the screen was registered with.
     */
    public removeScreen(rendererUid: number): void
    {
        if (!this._screens.remove(rendererUid)) return;

        this._pruneScreenCanvases();
    }

    /** Clears the pool. */
    public clear(): void
    {
        this._buckets.clear();
    }

    /**
     * Drops the idle canvases in every bucket that has a non power of two dimension matching no live
     * screen. Power of two buckets are always kept, as any request can fall back to them.
     */
    private _pruneScreenCanvases(): void
    {
        for (const [key] of this._buckets)
        {
            const width = key >>> 17;
            const height = (key >>> 2) & 0x7FFF;

            if ((isPow2(width) || this._screens.hasWidth(width))
                && (isPow2(height) || this._screens.hasHeight(height))) continue;

            this._buckets.delete(key);
        }
    }
}

/**
 * CanvasPool is a utility class that manages a pool of reusable canvas elements
 * @category rendering
 * @internal
 */
export const CanvasPool = new CanvasPoolClass();
GlobalResourceRegistry.register(CanvasPool);
