import { ExtensionType } from '../extensions/Extensions';
import { ResizeController } from './ResizeController';

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
    public static cancelResize: () => void;
    /** @internal */
    public static render: () => void;
    /** @internal */
    private static _resizeController: ResizeController;

    /**
     * Initialize the plugin with scope of application instance
     * @private
     * @param {object} [options] - See application options
     */
    public static init(options: ResizePluginOptions): void
    {
        const resizeController = new ResizeController((width: number, height: number) =>
        {
            this.renderer.resize(width, height);
            this.render();
        });

        this._resizeController = resizeController;

        Object.defineProperty(this, 'resizeTo',
            {
                configurable: true,
                set(dom: Window | HTMLElement)
                {
                    resizeController.resizeTo = dom;
                },
                get()
                {
                    return resizeController.resizeTo;
                },
            });

        this.queueResize = (): void => resizeController.queueResize();
        this.cancelResize = (): void => resizeController.cancelResize();
        this.resize = (): void => resizeController.resizeNow();

        // Set the target last so the initial resize fires.
        this.resizeTo = options.resizeTo || null;
    }

    /**
     * Clean up the ticker, scoped to application
     * @private
     */
    public static destroy(): void
    {
        this._resizeController?.destroy();
        this._resizeController = null;
        this.queueResize = null;
        this.cancelResize = null;
        this.resizeTo = null;
        this.resize = null;
    }
}
