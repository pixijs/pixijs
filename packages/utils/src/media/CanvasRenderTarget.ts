import { settings } from '@pixi/settings';

import type { ICanvas, ICanvasRenderingContext2D } from '@pixi/settings';

/**
 * Creates a Canvas element of the given size to be used as a target for rendering to.
 * @class
 * @memberof PIXI.utils
 */
export class CanvasRenderTarget
{
    protected _canvas: ICanvas | null;

    protected _context: ICanvasRenderingContext2D | null;

    /**
     * The resolution / device pixel ratio of the canvas
     * @default 1
     */
    public resolution: number;

    /**
     * @param width - the width for the newly created canvas
     * @param height - the height for the newly created canvas
     * @param {number} [resolution=PIXI.settings.RESOLUTION] - The resolution / device pixel ratio of the canvas
     */
    constructor(width: number, height: number, resolution?: number)
    {
        this._canvas = settings.ADAPTER.createCanvas();

        this._context = this._canvas.getContext('2d');

        this.resolution = resolution || settings.RESOLUTION;

        this.resize(width, height);
    }

    /**
     * Clears the canvas that was created by the CanvasRenderTarget class.
     * @private
     */
    clear(): void
    {
        // #if _DEBUG
        this._checkDestroyed();
        // #endif

        this._context.setTransform(1, 0, 0, 1, 0, 0);
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }

    /**
     * Resizes the canvas to the specified width and height.
     * @param desiredWidth - the desired width of the canvas
     * @param desiredHeight - the desired height of the canvas
     */
    resize(desiredWidth: number, desiredHeight: number): void
    {
        // #if _DEBUG
        this._checkDestroyed();
        // #endif

        this._canvas.width = Math.round(desiredWidth * this.resolution);
        this._canvas.height = Math.round(desiredHeight * this.resolution);
    }

    /** Destroys this canvas. */
    destroy(): void
    {
        this._context = null;
        this._canvas = null;
    }

    /**
     * The width of the canvas buffer in pixels.
     * @member {number}
     */
    get width(): number
    {
        // #if _DEBUG
        this._checkDestroyed();
        // #endif

        return this._canvas.width;
    }

    set width(val: number)
    {
        // #if _DEBUG
        this._checkDestroyed();
        // #endif

        this._canvas.width = Math.round(val);
    }

    /**
     * The height of the canvas buffer in pixels.
     * @member {number}
     */
    get height(): number
    {
        // #if _DEBUG
        this._checkDestroyed();
        // #endif

        return this._canvas.height;
    }

    set height(val: number)
    {
        // #if _DEBUG
        this._checkDestroyed();
        // #endif

        this._canvas.height = Math.round(val);
    }

    /** The Canvas object that belongs to this CanvasRenderTarget. */
    public get canvas(): ICanvas
    {
        // #if _DEBUG
        this._checkDestroyed();
        // #endif

        return this._canvas;
    }

    /** A CanvasRenderingContext2D object representing a two-dimensional rendering context. */
    public get context(): ICanvasRenderingContext2D
    {
        // #if _DEBUG
        this._checkDestroyed();
        // #endif

        return this._context;
    }

    // #if _DEBUG
    private _checkDestroyed(): asserts this is this & { _canvas: ICanvas; _context: ICanvasRenderingContext2D }
    {
        if (this._canvas === null)
        {
            throw new TypeError('The CanvasRenderTarget has already been destroyed');
        }
    }
    // #endif
}
