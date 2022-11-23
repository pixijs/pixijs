declare namespace GlobalMixins
{
    interface Application
    {
        ticker: import('@pixi/ticker').Ticker;
        stop(): void;
        start(): void;
    }

    interface IApplicationOptions
    {
        autoStart?: boolean;
        sharedTicker?: boolean;
    }

    interface Settings
    {
        TARGET_FPMS: number;
    }
}
