import { Application } from '@pixi/app';
import { Loader } from '@pixi/loaders';

/**
 * Application plugin for supporting loader option
 * @class
 * @private
 */
class LoaderPlugin
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

// Register the plugin with Application
Application.registerPlugin(LoaderPlugin);
