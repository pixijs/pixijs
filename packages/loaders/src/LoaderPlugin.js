import Loader from './Loader';

/**
 * Application plugin for supporting loader option. Installing the LoaderPlugin
 * is not necessary if using **pixi.js** or **pixi.js-legacy**.
 * @example
 * import {LoaderPlugin} from '@pixi/loaders';
 * import {Application} from '@pixi/app';
 * Application.registerPlugin(LoaderPlugin);
 * @class
 * @memberof PIXI
 */
export default class LoaderPlugin
{
    /**
     * Called on application constructor
     * @param {object} options
     * @private
     */
    static init(options)
    {
        options = Object.assign({
            sharedLoader: false,
        }, options);

        /**
         * Loader instance to help with asset loading.
         * @name PIXI.Application#loader
         * @type {PIXI.Loader}
         * @readonly
         */
        this.loader = options.sharedLoader ? Loader.shared : new Loader();
    }

    /**
     * Called when application destroyed
     * @private
     */
    static destroy()
    {
        if (this.loader)
        {
            this.loader.destroy();
            this.loader = null;
        }
    }
}
