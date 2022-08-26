import type { ExtensionMetadata } from '@pixi/extensions';
import { extensions, ExtensionType } from '@pixi/extensions';
import { UPDATE_PRIORITY } from './const';
import { Ticker } from './Ticker';

/**
 * Middleware for for Application Ticker.
 * @class
 * @memberof PIXI
 */
export class TickerPlugin
{
    /** @ignore */
    static extension: ExtensionMetadata = ExtensionType.Application;

    static start: () => void;
    static stop: () => void;
    static _ticker: Ticker;
    static ticker: Ticker;

    /**
     * Initialize the plugin with scope of application instance
     * @static
     * @private
     * @param {object} [options] - See application options
     */
    static init(options?: GlobalMixins.IApplicationOptions): void
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
         * @memberof PIXI.Application
         * @instance
         */
        this.stop = (): void =>
        {
            this._ticker.stop();
        };

        /**
         * Convenience method for starting the render.
         * @method
         * @memberof PIXI.Application
         * @instance
         */
        this.start = (): void =>
        {
            this._ticker.start();
        };

        /**
         * Internal reference to the ticker.
         * @type {PIXI.Ticker}
         * @name _ticker
         * @memberof PIXI.Application#
         * @private
         */
        this._ticker = null;

        /**
         * Ticker for doing render updates.
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
     * @static
     * @private
     */
    static destroy(): void
    {
        if (this._ticker)
        {
            const oldTicker = this._ticker;

            this.ticker = null;
            oldTicker.destroy();
        }
    }
}

extensions.add(TickerPlugin);
