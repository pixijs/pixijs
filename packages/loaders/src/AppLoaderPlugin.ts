import { ExtensionMetadata, ExtensionType } from '@pixi/core';
import { Loader } from './Loader';

/**
 * Application plugin for supporting loader option. Installing the LoaderPlugin
 * is not necessary if using **pixi.js** or **pixi.js-legacy**.
 * @example
 * import {AppLoaderPlugin} from '@pixi/loaders';
 * import {extensions} from '@pixi/core';
 * extensions.add(AppLoaderPlugin);
 * @memberof PIXI
 */
export class AppLoaderPlugin
{
    /** @ignore */
    static extension: ExtensionMetadata = ExtensionType.Application;

    /**
     * Loader instance to help with asset loading.
     * @memberof PIXI.Application#
     * @readonly
     */
    public static loader: Loader;

    /**
     * Called on application constructor
     * @param options
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
