import type { CanvasRenderer } from '@pixi/canvas-renderer';
import type { Renderer } from '@pixi/core';
import type { IApplicationOptions } from './Application';

/**
 * Middleware for for Application's resize functionality
 * @private
 * @class
 */
export class ResizePlugin
{
    public static resizeTo: Window|HTMLElement;
    public static resize: () => void;
    public static renderer: Renderer|CanvasRenderer;
    public static queueResize: () => void;
    private static _resizeId: number;
    private static _resizeTo: Window|HTMLElement;
    private static cancelResize: () => void;

    /**
     * Initialize the plugin with scope of application instance
     * @static
     * @private
     * @param {object} [options] - See application options
     */
    static init(options?: IApplicationOptions): void
    {
        Object.defineProperty(this, 'resizeTo',
            /**
             * The HTML element or window to automatically resize the
             * renderer's view element to match width and height.
             * @member {Window|HTMLElement}
             * @name resizeTo
             * @memberof PIXI.Application#
             */
            {
                set(dom: Window|HTMLElement)
                {
                    globalThis.removeEventListener('resize', this.queueResize);
                    this._resizeTo = dom;
                    if (dom)
                    {
                        globalThis.addEventListener('resize', this.queueResize);
                        this.resize();
                    }
                },
                get()
                {
                    return this._resizeTo;
                },
            });

        /**
         * Resize is throttled, so it's safe to call this multiple times per frame and it'll
         * only be called once.
         *
         * @memberof PIXI.Application#
         * @method queueResize
         * @private
         */
        this.queueResize = (): void =>
        {
            if (!this._resizeTo)
            {
                return;
            }

            this.cancelResize();

            // // Throttle resize events per raf
            this._resizeId = requestAnimationFrame(() => this.resize());
        };

        /**
         * Cancel the resize queue.
         *
         * @memberof PIXI.Application#
         * @method cancelResize
         * @private
         */
        this.cancelResize = (): void =>
        {
            if (this._resizeId)
            {
                cancelAnimationFrame(this._resizeId);
                this._resizeId = null;
            }
        };

        /**
         * Execute an immediate resize on the renderer, this is not
         * throttled and can be expensive to call many times in a row.
         * Will resize only if `resizeTo` property is set.
         *
         * @memberof PIXI.Application#
         * @method resize
         */
        this.resize = (): void =>
        {
            if (!this._resizeTo)
            {
                return;
            }

            // clear queue resize
            this.cancelResize();

            let width: number;
            let height: number;

            // Resize to the window
            if (this._resizeTo === globalThis.window)
            {
                width = globalThis.innerWidth;
                height = globalThis.innerHeight;
            }
            // Resize to other HTML entities
            else
            {
                const { clientWidth, clientHeight } = this._resizeTo as HTMLElement;

                width = clientWidth;
                height = clientHeight;
            }

            this.renderer.resize(width, height);
        };

        // On resize
        this._resizeId = null;
        this._resizeTo = null;
        this.resizeTo = options.resizeTo || null;
    }

    /**
     * Clean up the ticker, scoped to application
     *
     * @static
     * @private
     */
    static destroy(): void
    {
        globalThis.removeEventListener('resize', this.queueResize);
        this.cancelResize();
        this.cancelResize = null;
        this.queueResize = null;
        this.resizeTo = null;
        this.resize = null;
    }
}
