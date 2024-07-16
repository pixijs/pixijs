import { ExtensionType } from '../extensions/Extensions';
import { UPDATE_PRIORITY } from '../ticker/const';
import { Ticker } from '../ticker/Ticker';

import type { ExtensionMetadata } from '../extensions/Extensions';

/**
 * Application options for the {@link app.TickerPlugin}.
 * @memberof app
 * @property {boolean} [autoStart=true] - Automatically starts the rendering after the construction.
 * **Note**: Setting this parameter to `false` does NOT stop the shared ticker even if you set
 * `options.sharedTicker` to `true` in case that it is already started. Stop it by your own.
 * @property {boolean} [sharedTicker=false] - Set`true` to use `Ticker.shared`, `false` to create new ticker.
 * If set to `false`, you cannot register a handler to occur before anything that runs on the shared ticker.
 * The system ticker will always run before both the shared ticker and the app ticker.
 */
export interface TickerPluginOptions
{
    /**
     * Automatically starts the rendering after the construction.
     *  **Note**: Setting this parameter to `false` does NOT stop the shared ticker even if you set
     *  `options.sharedTicker` to `true` in case that it is already started. Stop it by your own.
     * @memberof app.ApplicationOptions
     * @default true
     */
    autoStart?: boolean;
    /**
     * Set`true` to use `Ticker.shared`, `false` to create new ticker.
     *  If set to `false`, you cannot register a handler to occur before anything that runs on the shared ticker.
     *  The system ticker will always run before both the shared ticker and the app ticker.
     * @memberof app.ApplicationOptions
     * @default false
     */
    sharedTicker?: boolean;
}

/**
 * Middleware for Application's {@link ticker.Ticker} functionality.
 *
 * Adds the following methods to {@link app.Application}:
 * * {@link app.Application#start}
 * * {@link app.Application#stop}
 * * {@link app.Application#ticker}
 * @example
 * import { extensions, TickerPlugin } from 'pixi.js';
 *
 * extensions.add(TickerPlugin);
 * @memberof app
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

        /**
         * Convenience method for stopping the render.
         * @method
         * @memberof app.Application
         * @instance
         */
        this.stop = (): void =>
        {
            this._ticker.stop();
        };

        /**
         * Convenience method for starting the render.
         * @method
         * @memberof app.Application
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
         * @memberof app.Application#
         * @private
         */
        this._ticker = null;

        /**
         * Ticker for doing render updates.
         * @type {ticker.Ticker}
         * @name ticker
         * @memberof app.Application#
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
