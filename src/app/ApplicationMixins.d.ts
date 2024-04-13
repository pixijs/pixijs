import type { ResizePluginOptions } from './ResizePlugin';
import type { TickerPluginOptions } from './TickerPlugin';

declare global
{
    namespace PixiMixins
    {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface Application
        {
            resizeTo: Window | HTMLElement;
            resize(): void;
            queueResize: () => void;
            cancelResize: () => void;

            ticker: import('../ticker/Ticker').Ticker;
            stop(): void;
            start(): void;
        }

        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface ApplicationOptions extends ResizePluginOptions, TickerPluginOptions
        {
        }
    }
}

export {};
