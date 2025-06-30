import { ExtensionType } from '../extensions/Extensions';

import type { ExtensionMetadata } from '../extensions/Extensions';
import type { Renderer } from '../rendering/renderers/types';

type ResizeableRenderer = Pick<Renderer, 'resize'>;

/**
 * Application options for the {@link ResizePlugin}.
 * These options control how your application handles window and element resizing.
 * @example
 * ```ts
 * // Auto-resize to window
 * await app.init({ resizeTo: window });
 *
 * // Auto-resize to container element
 * await app.init({ resizeTo: document.querySelector('#game') });
 * ```
 * @category app
 * @standard
 */
export interface ResizePluginOptions
{
    /**
     * Element to automatically resize the renderer to.
     * @example
     * ```ts
     * const app = new Application();
     * await app.init({
     *     resizeTo: window, // Resize to the entire window
     *     // or
     *     resizeTo: document.querySelector('#game-container'), // Resize to a specific element
     *     // or
     *     resizeTo: null, // Disable auto-resize
     * });
     * ```
     * @default null
     */
    resizeTo?: Window | HTMLElement;
}

/**
 * Middleware for Application's resize functionality. This plugin handles automatic
 * and manual resizing of your PixiJS application.
 *
 * Adds the following features to {@link Application}:
 * - `resizeTo`: Set an element to automatically resize to
 * - `resize`: Manually trigger a resize
 * - `queueResize`: Queue a resize for the next animation frame
 * - `cancelResize`: Cancel a queued resize
 * @example
 * ```ts
 * import { Application, ResizePlugin } from 'pixi.js';
 *
 * // Create application
 * const app = new Application();
 *
 * // Example 1: Auto-resize to window
 * await app.init({ resizeTo: window });
 *
 * // Example 2: Auto-resize to specific element
 * const container = document.querySelector('#game-container');
 * await app.init({ resizeTo: container });
 *
 * // Example 3: Change resize target at runtime
 * app.resizeTo = window;                    // Enable auto-resize to window
 * app.resizeTo = null;                      // Disable auto-resize
 * ```
 * @category app
 * @standard
 */
export class ResizePlugin
{
    /** @ignore */
    public static extension: ExtensionMetadata = ExtensionType.Application;
    /** @internal */
    public static resizeTo: Window | HTMLElement;
    /** @internal */
    public static resize: () => void;
    /** @internal */
    public static renderer: ResizeableRenderer;
    /** @internal */
    public static queueResize: () => void;
    /** @internal */
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
