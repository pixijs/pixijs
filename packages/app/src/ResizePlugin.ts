import { CanvasRenderer } from '@pixi/canvas-renderer';
import { Renderer } from '@pixi/core';
import { IApplicationOptions } from './Application';

/**
 * Middleware for for Application's resize functionality
 * @private
 * @class
 */
export class ResizePlugin
{
    public static _resizeTo: Window|HTMLElement;
    public static resize: () => void;
    public static renderer: Renderer|CanvasRenderer;

    /**
     * Initialize the plugin with scope of application instance
     * @static
     * @private
     * @param {object} [options] - See application options
     */
    static init(options?: IApplicationOptions): void
    {
        /**
         * The element or window to resize the application to.
         * @type {Window|HTMLElement}
         * @name resizeTo
         * @memberof PIXI.Application#
         */
        Object.defineProperty(this, 'resizeTo',
            {
                set(dom)
                {
                    window.removeEventListener('resize', this.resize);
                    this._resizeTo = dom;
                    if (dom)
                    {
                        window.addEventListener('resize', this.resize);
                        this.resize();
                    }
                },
                get()
                {
                    return this._resizeTo;
                },
            });

        /**
         * If `resizeTo` is set, calling this function
         * will resize to the width and height of that element.
         * @method PIXI.Application#resize
         */
        this.resize = (): void =>
        {
            if (this._resizeTo)
            {
                // Resize to the window
                if (this._resizeTo === window)
                {
                    this.renderer.resize(
                        window.innerWidth,
                        window.innerHeight
                    );
                }
                // Resize to other HTML entities
                else
                {
                    this.renderer.resize(
                        (this._resizeTo as HTMLElement).clientWidth,
                        (this._resizeTo as HTMLElement).clientHeight
                    );
                }
            }
        };

        // On resize
        this._resizeTo = null;
        this.resizeTo = options.resizeTo || null;
    }

    /**
     * Clean up the ticker, scoped to application
     * @static
     * @private
     */
    static destroy(): void
    {
        this.resizeTo = null;
        this.resize = null;
    }

    /**
     * The element or window to resize the application to.
     * @type {Window|HTMLElement}
     * @name resizeTo
     * @memberof PIXI.Application#
     */
    static get resizeTo(): Window|HTMLElement
    {
        return this._resizeTo;
    }

    static set resizeTo(dom)
    {
        window.removeEventListener('resize', this.resize);
        this._resizeTo = dom;
        if (dom)
        {
            window.addEventListener('resize', this.resize);
            this.resize();
        }
    }
}
