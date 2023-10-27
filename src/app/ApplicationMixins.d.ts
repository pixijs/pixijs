declare namespace PixiMixins
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

    type ResizePluginOptions = import('./ResizePlugin').ResizePluginOptions;
    type TickerPluginOptions = import('./TickerPlugin').TickerPluginOptions;

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ApplicationOptions extends ResizePluginOptions, TickerPluginOptions
    {
    }
}
