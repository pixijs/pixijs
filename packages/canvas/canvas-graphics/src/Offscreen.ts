import { forge } from './canvas';

import type { ISize } from '@pixi/math';
import type { Canvas } from './canvas';

type onError = (err: Error, label: string) => void;

type IContextConfig = CanvasRenderingContext2DSettings;

interface IConfig extends IContextConfig
{
    onError?: string|onError;
}

/**
 * Utility class for enhanced off-screen rendering.
 */
export class Offscreen
{
    private _canvas: Canvas;
    private _context: CanvasRenderingContext2D;

    /**
     * A new off-screen Canvas of given size is created.
     * The new drawing context is acquired and, if provided, the given config is used.
     *
     * @param {PIXI.ISize} size - The size (width and height) of the new Canvas instance
     * @param {PIXI.IContextConfig} [config] - For configuring the newly acquired CanvasRenderingContext2D
     */
    constructor(size: ISize, config?: IContextConfig)
    {
        this._canvas = forge(size);
        this._context = this._canvas.getContext('2d', config) as CanvasRenderingContext2D;
    }

    /**
     * Resets the current RenderingContext by restoring its internal state.
     */
    private _reset(): void
    {
        this._context.restore();
    }

    /**
     * The current Canvas.
     */
    public get canvas(): Canvas
    {
        return this._canvas;
    }

    /**
     * The current RenderingContext.
     * First, the current RenderingContext is reset and it's internal state saved.
     */
    public get context(): CanvasRenderingContext2D
    {
        this._reset();
        this._context.save();

        return this._context;
    }

    /**
     * The current Canvas width.
     */
    public get width(): number
    {
        return this._canvas.width;
    }

    /**
     * The current Canvas height.
     */
    public get height(): number
    {
        return this._canvas.height;
    }

    /**
     * Clears the current RenderingContext, (optionally) according to given coordinates.
     *
     * @param {number} [x] - The X coordinate
     * @param {number} [y] - The Y coordinate
     * @param {number} [w] - The width
     * @param {number} [h] - the Height
     */
    public clear(x = 0, y = 0, w = Infinity, h = Infinity): void
    {
        this._reset();
        this._context.clearRect(x, y, Math.min(w, this.width), Math.min(h, this.height));
    }

    /**
     * Creates a new Offscreen instance based on the given context.
     * The new instance will have same Canvas dimensions dn type as given context's Canvas.
     * THe given config may specify onError (either as a string or function) for handling errors.
     *
     * @param {PIXI.ISize} size - For initializing the newly created Canvas
     * @param {PIXI.IConfig} [config] - For configuring the newly acquired drawing context
     * @return {PIXI.Offscreen} The newly created instance, or null on error (throws if onError is 'throw')
     */
    public static forge(size: ISize, config?: IConfig): Offscreen
    {
        try
        {
            return new Offscreen(size, config);
        }
        catch (err)
        {
            if (config && config.onError)
            {
                const label = `Off-screen Canvas context not created`;

                if (typeof config.onError === 'function')
                {
                    config.onError(err, label);
                }
                else
                {
                    if (config.onError === 'throw') throw err;

                    if (config.onError)
                    {
                        const report = (console as any)[config.onError] || (console as any).warn;

                        if (typeof report === 'function')
                        {
                            report(`${label}:`, err);
                        }
                    }
                }
            }

            return null;
        }
    }
}
