import type { Ticker } from '../ticker/Ticker';
import type { ResizePluginOptions } from './ResizePlugin';
import type { TickerPluginOptions } from './TickerPlugin';

declare global
{
    namespace PixiMixins
    {
        // Extend the Application interface with resize and ticker functionalities
        interface Application
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
            resizeTo: Window | HTMLElement;
            /**
             * Element to automatically resize the renderer to.
             * > [!IMPORTANT]
             * > You do not need to call this method manually in most cases.
             * > A `resize` event will be dispatched automatically when the `resizeTo` element changes size.
             * @remarks
             * - Automatically resizes the renderer to match the size of the `resizeTo` element
             * - If `resizeTo` is `null`, auto-resizing is disabled
             * - If `resizeTo` is a `Window`, it resizes to the full window size
             * - If `resizeTo` is an `HTMLElement`, it resizes to the element's bounding client rectangle
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
             *
             * // Manually trigger a resize
             * app.resize();
             * ```
             * @default null
             */
            resize(): void;
            /**
             * Queue a resize operation for the next animation frame. This method is throttled
             * and optimized for frequent calls.
             * > [!IMPORTANT]
             * > You do not need to call this method manually in most cases.
             * > A `resize` event will be dispatched automatically when the `resizeTo` element changes size.
             * @remarks
             * - Safe to call multiple times per frame
             * - Only one resize will occur on next frame
             * - Cancels any previously queued resize
             * @example
             * ```ts
             * app.queueResize(); // Queue for next frame
             * ```
             */
            queueResize(): void;
            /**
             * Cancel any pending resize operation that was queued with `queueResize()`.
             * @remarks
             * - Clears the resize operation queued for next frame
             * @example
             * ```ts
             * // Queue a resize
             * app.queueResize();
             *
             * // Cancel if needed
             * app.cancelResize();
             * ```
             */
            cancelResize(): void;

            /**
             * The application's ticker instance that manages the update/render loop.
             * @example
             * ```ts
             * // Basic animation
             * app.ticker.add((ticker) => {
             *     sprite.rotation += 0.1 * ticker.deltaTime;
             * });
             *
             * // Control update priority
             * app.ticker.add(
             *     (ticker) => {
             *         // Physics update (runs first)
             *     },
             *     undefined,
             *     UPDATE_PRIORITY.HIGH
             * );
             *
             * // One-time update
             * app.ticker.addOnce(() => {
             *     console.log('Runs next frame only');
             * });
             *
             * // Access timing info
             * console.log(app.ticker.FPS);      // Current FPS
             * console.log(app.ticker.deltaTime); // Scaled time delta
             * console.log(app.ticker.deltaMS);   // MS since last update
             * ```
             * @see {@link Ticker} For detailed ticker functionality
             * @see {@link UPDATE_PRIORITY} For priority constants
             */
            ticker: Ticker;

            /**
             * Stops the render/update loop.
             * @example
             * ```ts
             * // Stop the application
             * app.stop();
             * // ... custom update logic ...
             * app.render(); // Manual render
             * ```
             */
            stop(): void;

            /**
             * Starts the render/update loop.
             * @example
             * ```ts
             * // Initialize without auto-start
             * await app.init({ autoStart: false });
             *
             * // Start when ready
             * app.start();
             * ```
             */
            start(): void;
        }

        // Combine ResizePluginOptions and TickerPluginOptions into ApplicationOptions
        interface ApplicationOptions extends ResizePluginOptions, TickerPluginOptions {}
    }
}

export {};
