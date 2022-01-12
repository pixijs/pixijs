import { Loader } from './Loader';

/**
 * Application plugin for supporting loader option. Installing the LoaderPlugin
 * is not necessary if using **pixi.js** or **pixi.js-legacy**.
 * @example
 * import {AppLoaderPlugin} from '@pixi/loaders';
 * import {Application} from '@pixi/app';
 * Application.registerPlugin(AppLoaderPlugin);
 * @memberof PIXI
 */
export class AppLoaderPlugin
{
    /**
     * Loader instance to help with asset loading.
     * @memberof PIXI.Application#
     * @readonly
     */
    public static loader: Loader;

    /**
     * Called on application constructor
     *
     * @private
     */
    static init(options?: GlobalMixins.IApplicationOptions): void
    {
        options = Object.assign({
            sharedLoader: false,
        }, options);

        this.loader = options.sharedLoader ? Loader.shared : new Loader();
    }

    /**
     * Called when application destroyed
     *
     * @private
     */
    static destroy(): void
    {
        if (this.loader)
        {
            this.loader.destroy();
            this.loader = null;
        }
    }
}
