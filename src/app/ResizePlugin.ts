import { ExtensionType } from '../extensions/Extensions';

import type { ExtensionMetadata } from '../extensions/Extensions';
import type { Renderer } from '../rendering/renderers/types';

type ResizeableRenderer = Pick<Renderer, 'resize'>;

/**
 * Application options for the {@link app.ResizePlugin}.
 * @memberof app
 * @property {Window|HTMLElement} [resizeTo=window] - Element to automatically resize the renderer to.
 */
export interface ResizePluginOptions
{
    /**
     * Element to automatically resize the renderer to.
     * @memberof app.ApplicationOptions
     */
    resizeTo?: Window | HTMLElement;
}

/**
 * Middleware for Application's resize functionality.
 *
 * Adds the following methods to {@link app.Application}:
 * * {@link app.Application#resizeTo}
 * * {@link app.Application#resize}
 * * {@link app.Application#queueResize}
 * * {@link app.Application#cancelResize}
 * @example
 * import { extensions, ResizePlugin } from 'pixi.js';
 *
 * extensions.add(ResizePlugin);
 * @memberof app
 */
export class ResizePlugin
{
    /** @ignore */
    public static extension: ExtensionMetadata = ExtensionType.Application;

    public static resizeTo: Window | HTMLElement;
    public static resize: () => void;
    public static renderer: ResizeableRenderer;
    public static queueResize: () => void;
    public static render: () => void;
    private static _resizeId: number;
    private static _resizeTo: Window | HTMLElement;
    private static _cancelResize: () => void;

    /**
     * Initialize the plugin with scope of application instance
     * @static
     * @private
     * @param {object} [options] - See application options
     */
    public static init(options: ResizePluginOptions): void
    {
        Object.defineProperty(this, 'resizeTo',
            /**
             * The HTML element or window to automatically resize the
             * renderer's view element to match width and height.
             * @member {Window|HTMLElement}
             * @name resizeTo
             * @memberof app.Application#
             */
            {
                set(dom: Window | HTMLElement)
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
         * @memberof app.Application#
         * @method queueResize
         * @private
         */
        this.queueResize = (): void =>
        {
            if (!this._resizeTo)
            {
                return;
            }

            this._cancelResize();

            // // Throttle resize events per raf
            this._resizeId = requestAnimationFrame(() => this.resize());
        };

        /**
         * Cancel the resize queue.
         * @memberof app.Application#
         * @method cancelResize
         * @private
         */
        this._cancelResize = (): void =>
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
         * @memberof app.Application#
         * @method resize
         */
        this.resize = (): void =>
        {
            if (!this._resizeTo)
            {
                return;
            }

            // clear queue resize
            this._cancelResize();

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
            this.render();
        };

        // On resize
        this._resizeId = null;
        this._resizeTo = null;
        this.resizeTo = options.resizeTo || null;
    }

    /**
     * Clean up the ticker, scoped to application
     * @static
     * @private
     */
    public static destroy(): void
    {
        globalThis.removeEventListener('resize', this.queueResize);
        this._cancelResize();
        this._cancelResize = null;
        this.queueResize = null;
        this.resizeTo = null;
        this.resize = null;
    }
}
