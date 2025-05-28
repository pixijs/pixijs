import { ExtensionType } from '../extensions/Extensions';
import { UPDATE_PRIORITY } from '../ticker/const';
import { Ticker } from '../ticker/Ticker';

import type { ExtensionMetadata } from '../extensions/Extensions';

/**
 * Application options for the {@link TickerPlugin}.
 * @category app
 * @standard
 */
export interface TickerPluginOptions
{
    /**
     * Automatically starts the rendering after the construction.
     *  **Note**: Setting this parameter to `false` does NOT stop the shared ticker even if you set
     *  `options.sharedTicker` to `true` in case that it is already started. Stop it by your own.
     * @category app.ApplicationOptions
     * @default true
     */
    autoStart?: boolean;
    /**
     * Set`true` to use `Ticker.shared`, `false` to create new ticker.
     *  If set to `false`, you cannot register a handler to occur before anything that runs on the shared ticker.
     *  The system ticker will always run before both the shared ticker and the app ticker.
     * @category app.ApplicationOptions
     * @default false
     */
    sharedTicker?: boolean;
}

/**
 * Middleware for Application's {@link Ticker} functionality.
 *
 * Adds the following methods to {@link Application}:
 * * {@link Application#start}
 * * {@link Application#stop}
 * * {@link Application#ticker}
 * @example
 * import { extensions, TickerPlugin } from 'pixi.js';
 *
 * extensions.add(TickerPlugin);
 * @category app
 * @standard
 */
export class TickerPlugin
{
    /** @ignore */
    public static extension: ExtensionMetadata = ExtensionType.Application;

    /** @internal */
    public static start: () => void;
    /** @internal */
    public static stop: () => void;
    /** @internal */
    private static _ticker: Ticker;
    /** @internal */
    public static ticker: Ticker;

    /**
     * Initialize the plugin with scope of application instance
     * @private
     * @param {object} [options] - See application options
     */
    public static init(options?: PixiMixins.ApplicationOptions): void
    {
        // Set default
        options = Object.assign({
            autoStart: true,
            sharedTicker: false,
        }, options);

        // Create ticker setter
        Object.defineProperty(this, 'ticker',
            {
                set(ticker)
                {
                    if (this._ticker)
                    {
                        this._ticker.remove(this.render, this);
                    }
                    this._ticker = ticker;
                    if (ticker)
                    {
                        ticker.add(this.render, this, UPDATE_PRIORITY.LOW);
                    }
                },
                get()
                {
                    return this._ticker;
                },
            });

        this.stop = (): void =>
        {
            this._ticker.stop();
        };

        this.start = (): void =>
        {
            this._ticker.start();
        };

        this._ticker = null;
        this.ticker = options.sharedTicker ? Ticker.shared : new Ticker();

        // Start the rendering
        if (options.autoStart)
        {
            this.start();
        }
    }

    /**
     * Clean up the ticker, scoped to application.
     * @private
     */
    public static destroy(): void
    {
        if (this._ticker)
        {
            const oldTicker = this._ticker;

            this.ticker = null;
            oldTicker.destroy();
        }
    }
}
