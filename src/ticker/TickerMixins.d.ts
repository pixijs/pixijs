declare namespace PixiMixins
{
    type TickerPluginOptions = import('./TickerPlugin').TickerPluginOptions;

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ApplicationOptions extends TickerPluginOptions
    {
    }

    interface Application
    {
        ticker: import('./Ticker').Ticker;
        stop(): void;
        start(): void;
    }
}

// TickerPluginOptions
