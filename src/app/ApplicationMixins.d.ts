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
            /** Element to automatically resize the renderer to. */
            resizeTo: Window | HTMLElement;
            /**
             * Execute an immediate resize on the renderer, this is not
             * throttled and can be expensive to call many times in a row.
             * Will resize only if `resizeTo` property is set.
             */
            resize(): void;
            /** Resize is throttled, so it's safe to call this multiple times per frame and it'll only be called once. */
            queueResize(): void;
            /** Cancel the resize queue. */
            cancelResize(): void;

            /** Ticker for doing render updates. */
            ticker: Ticker;
            /** Convenience method for stopping the render. */
            stop(): void;
            /** Convenience method for starting the render. */
            start(): void;
        }

        // Combine ResizePluginOptions and TickerPluginOptions into ApplicationOptions
        interface ApplicationOptions extends ResizePluginOptions, TickerPluginOptions {}
    }
}

export {};
