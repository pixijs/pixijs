import { Ticker } from './Ticker';
import { UPDATE_PRIORITY } from './const';

/**
 * Middleware for for Application Ticker.
 *
 * @example
 * import {TickerPlugin} from '@pixi/ticker';
 * import {Application} from '@pixi/app';
 * Application.registerPlugin(TickerPlugin);
 *
 * @class
 * @memberof PIXI
 */
export class TickerPlugin
{
    /**
     * Initialize the plugin with scope of application instance
     *
     * @static
     * @private
     * @param {object} [options] - See application options
     */
    static init(options)
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
         *
         * @method PIXI.Application#stop
         */
        this.stop = () =>
        {
            this._ticker.stop();
        };

        /**
         * Convenience method for starting the render.
         *
         * @method PIXI.Application#start
         */
        this.start = () =>
        {
            this._ticker.start();
        };

        /**
         * Internal reference to the ticker.
         *
         * @type {PIXI.Ticker}
         * @name _ticker
         * @memberof PIXI.Application#
         * @private
         */
        this._ticker = null;

        /**
         * Ticker for doing render updates.
         *
         * @type {PIXI.Ticker}
         * @name ticker
         * @memberof PIXI.Application#
         * @default PIXI.Ticker.shared
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
     *
     * @static
     * @private
     */
    static destroy()
    {
        if (this._ticker)
        {
            const oldTicker = this._ticker;

            this.ticker = null;
            oldTicker.destroy();
        }
    }
}
