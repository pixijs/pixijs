import { nextPow2 } from '../../../../maths/pow2';
import { settings } from '../../../../settings/settings';

import type { ICanvas, ICanvasRenderingContext2DSettings } from '../../../../settings/adapter/ICanvas';
import type { ICanvasRenderingContext2D } from '../../../../settings/adapter/ICanvasRenderingContext2D';

export interface CanvasAndContext
{
    canvas: ICanvas;
    context: ICanvasRenderingContext2D;
}

/**
 * Texture pool, used by FilterSystem and plugins.
 *
 * Stores collection of temporary pow2 or screen-sized renderTextures
 *
 * If you use custom RenderTexturePool for your filters, you can use methods
 * `getFilterTexture` and `returnFilterTexture` same as in
 * @memberof PIXI
 */
export class CanvasPoolClass
{
    public canvasOptions: ICanvasRenderingContext2DSettings;

    /**
     * Allow renderTextures of the same size as screen, not just pow2
     *
     * Automatically sets to true after `setScreenSize`
     * @default false
     */
    public enableFullScreen: boolean;
    canvasPool: {[x in string | number]: CanvasAndContext[]};
    poolKeyHash: Record<number, string> = {};

    constructor(canvasOptions?: ICanvasRenderingContext2DSettings)
    {
        this.canvasPool = {};
        this.canvasOptions = canvasOptions || {};
        this.enableFullScreen = false;
    }

    /**
     * Creates texture with params that were specified in pool constructor.
     * @param pixelWidth - Width of texture in pixels.
     * @param pixelHeight - Height of texture in pixels.
     */
    createCanvasAndContext(pixelWidth: number, pixelHeight: number): CanvasAndContext
    {
        const canvas = settings.ADAPTER.createCanvas();

        canvas.width = pixelWidth;
        canvas.height = pixelHeight;

        const context = canvas.getContext('2d');

        return { canvas, context };
    }

    /**
     * Gets a Power-of-Two render texture or fullScreen texture
     * @param minWidth - The minimum width of the render texture.
     * @param minHeight - The minimum height of the render texture.
     * @param resolution - The resolution of the render texture.
     * @returns The new render texture.
     */
    getOptimalCanvasAndContext(minWidth: number, minHeight: number, resolution = 1): CanvasAndContext
    {
        minWidth = Math.ceil((minWidth * resolution) - 1e-6);
        minHeight = Math.ceil((minHeight * resolution) - 1e-6);
        minWidth = nextPow2(minWidth);
        minHeight = nextPow2(minHeight);

        const key = (minWidth << 17) + (minHeight << 1);

        if (!this.canvasPool[key])
        {
            this.canvasPool[key] = [];
        }

        let canvasAndContext = this.canvasPool[key].pop();

        if (!canvasAndContext)
        {
            canvasAndContext = this.createCanvasAndContext(minWidth, minHeight);
        }

        return canvasAndContext;
    }

    /**
     * Place a render texture back into the pool.
     * @param canvasAndContext
     */
    returnCanvasAndContext(canvasAndContext: CanvasAndContext): void
    {
        const { width, height } = canvasAndContext.canvas;

        const key = (width << 17) + (height << 1);

        this.canvasPool[key].push(canvasAndContext);
    }

    clear(): void
    {
        this.canvasPool = {};
    }
}

export const CanvasPool = new CanvasPoolClass();
