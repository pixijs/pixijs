import Application from '../core/Application';
import Loader from './loader';

/**
 * This namespace contains APIs which extends the {@link https://github.com/englercj/resource-loader resource-loader} module
 * for loading assets, data, and other resources dynamically.
 * @example
 * const loader = new PIXI.loaders.Loader();
 * loader.add('bunny', 'data/bunny.png')
 *       .add('spaceship', 'assets/spritesheet.json');
 * loader.load((loader, resources) => {
 *    // resources.bunny
 *    // resources.spaceship
 * });
 * @namespace PIXI.loaders
 */
export { Loader };
export { default as bitmapFontParser, parse as parseBitmapFontData } from './bitmapFontParser';
export { default as spritesheetParser, getResourcePath } from './spritesheetParser';
export { default as textureParser } from './textureParser';

/**
 * Reference to **resource-loader**'s Resource class.
 * See https://github.com/englercj/resource-loader
 * @class Resource
 * @memberof PIXI.loaders
 */
export { Resource } from 'resource-loader';

/**
 * A premade instance of the loader that can be used to load resources.
 * @name shared
 * @memberof PIXI.loaders
 * @type {PIXI.loaders.Loader}
 */
const shared = new Loader();

shared.destroy = () =>
{
    // protect destroying shared loader
};

export { shared };

// Mixin the loader construction
const AppPrototype = Application.prototype;

AppPrototype._loader = null;

/**
 * Loader instance to help with asset loading.
 * @name PIXI.Application#loader
 * @type {PIXI.loaders.Loader}
 */
Object.defineProperty(AppPrototype, 'loader', {
    get()
    {
        if (!this._loader)
        {
            const sharedLoader = this._options.sharedLoader;

            this._loader = sharedLoader ? shared : new Loader();
        }

        return this._loader;
    },
});

// Override the destroy function
// making sure to destroy the current Loader
AppPrototype._parentDestroy = AppPrototype.destroy;
AppPrototype.destroy = function destroy()
{
    if (this._loader)
    {
        this._loader.destroy();
        this._loader = null;
    }
    this._parentDestroy();
};
