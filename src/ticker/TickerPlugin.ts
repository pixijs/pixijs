import { ExtensionType } from '../extensions/Extensions';
import { UPDATE_PRIORITY } from './const';
import { Ticker } from './Ticker';

import type { ExtensionMetadata } from '../extensions/Extensions';

export interface TickerPluginOptions
{
    /**
     * Automatically starts the rendering after the construction.
     *  **Note**: Setting this parameter to `false` does NOT stop the shared ticker even if you set
     *  `options.sharedTicker` to `true` in case that it is already started. Stop it by your own.
     * @memberof ApplicationOptions
     * @default true
     */
    autoStart?: boolean;
    /**
     * Set`true` to use `Ticker.shared`, `false` to create new ticker.
     *  If set to `false`, you cannot register a handler to occur before anything that runs on the shared ticker.
     *  The system ticker will always run before both the shared ticker and the app ticker.
     * @memberof ApplicationOptions
     * @default false
     */
    sharedTicker?: boolean;
}

/**
 * Middleware for for Application Ticker.
 * @class
 */
export class TickerPlugin
{
    /** @ignore */
    public static extension: ExtensionMetadata = ExtensionType.Application;

    public static start: () => void;
    public static stop: () => void;
    private static _ticker: Ticker;
    public static ticker: Ticker;

    /**
     * Initialize the plugin with scope of application instance
     * @static
     * @private
     * @param {object} [options] - See application options
     */
    protected static init(options?: PixiMixins.ApplicationOptions): void
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

        /**
         * Convenience method for stopping the render.
         * @method
         * @memberof Application
         * @instance
         */
        this.stop = (): void =>
        {
            this._ticker.stop();
        };

        /**
         * Convenience method for starting the render.
         * @method
         * @memberof Application
         * @instance
         */
        this.start = (): void =>
        {
            this._ticker.start();
        };

        /**
         * Internal reference to the ticker.
         * @type {Ticker}
         * @name _ticker
         * @memberof Application#
         * @private
         */
        this._ticker = null;

        /**
         * Ticker for doing render updates.
         * @type {Ticker}
         * @name ticker
         * @memberof Application#
         * @default Ticker.shared
         */
        this.ticker = options.sharedTicker ? Ticker.shared : new Ticker();

        // Start the rendering
        if (options.autoStart)
        {
            this.start();
        }
    }

    /**
     * Clean up the ticker, scoped to application.
     * @static
     * @private
     */
    protected static destroy(): void
    {
        if (this._ticker)
        {
            const oldTicker = this._ticker;

            this.ticker = null;
            oldTicker.destroy();
        }
    }
}