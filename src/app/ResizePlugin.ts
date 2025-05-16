import { ExtensionType } from '../extensions/Extensions';

import type { ExtensionMetadata } from '../extensions/Extensions';
import type { Renderer } from '../rendering/renderers/types';

type ResizeableRenderer = Pick<Renderer, 'resize'>;

/**
 * Application options for the {@link ResizePlugin}.
 * @category app
 */
export interface ResizePluginOptions
{
    /** Element to automatically resize the renderer to. If not set, the renderer will not resize automatically. */
    resizeTo?: Window | HTMLElement;
}

/**
 * Middleware for Application's resize functionality.
 *
 * Adds the following methods to {@link Application}:
 * * {@link Application#resizeTo}
 * * {@link Application#resize}
 * * {@link Application#queueResize}
 * * {@link Application#cancelResize}
 * @example
 * import { extensions, ResizePlugin } from 'pixi.js';
 *
 * extensions.add(ResizePlugin);
 * @category app
 */
export class ResizePlugin
{
    /** @ignore */
    public static extension: ExtensionMetadata = ExtensionType.Application;

    public static resizeTo: Window | HTMLElement;
    public static resize: () => void;
    /** @internal */
    public static renderer: ResizeableRenderer;
    public static queueResize: () => void;
    public static render: () => void;
    /** @internal */
    private static _resizeId: number;
    /** @internal */
    private static _resizeTo: Window | HTMLElement;
    /** @internal */
    private static _cancelResize: () => void;

    /**
     * Initialize the plugin with scope of application instance
     * @private
     * @param {object} [options] - See application options
     */
    public static init(options: ResizePluginOptions): void
    {
        Object.defineProperty(this, 'resizeTo',
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

        this._cancelResize = (): void =>
        {
            if (this._resizeId)
            {
                cancelAnimationFrame(this._resizeId);
                this._resizeId = null;
            }
        };

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
