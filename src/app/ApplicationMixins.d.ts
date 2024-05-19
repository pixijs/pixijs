import type { ResizePluginOptions } from './ResizePlugin';
import type { TickerPluginOptions } from './TickerPlugin';
import type { Ticker } from '../ticker/Ticker';

declare global {
    namespace PixiMixins {
        // Extend the Application interface with resize and ticker functionalities
        interface Application {
            resizeTo: Window | HTMLElement;
            resize(): void;
            queueResize(): void;
            cancelResize(): void;

            ticker: Ticker;
            stop(): void;
            start(): void;
        }

        // Combine ResizePluginOptions and TickerPluginOptions into ApplicationOptions
        interface ApplicationOptions extends ResizePluginOptions, TickerPluginOptions {}
    }
}

export {};
