import ResourceLoader from 'resource-loader';
import textureParser from './textureParser';
import spritesheetParser from './spritesheetParser';
import bitmapFontParser from './bitmapFontParser';

/**
 *
 * The new loader, extends Resource Loader by Chad Engler : https://github.com/englercj/resource-loader
 *
 * ```js
 * let loader = PIXI.loader; // pixi exposes a premade instance for you to use.
 * //or
 * let loader = new PIXI.loaders.Loader(); // you can also create your own if you want
 *
 * loader.add('bunny',"data/bunny.png");
 *
 * loader.once('complete',onAssetsLoaded);
 *
 * loader.load();
 * ```
 *
 * @see https://github.com/englercj/resource-loader
 *
 * @class
 * @extends module:resource-loader.ResourceLoader
 * @memberof PIXI.loaders
 */
export default class Loader extends ResourceLoader
{
    /**
     * @param {string} [baseUrl=''] - The base url for all resources loaded by this loader.
     * @param {number} [concurrency=10] - The number of resources to load concurrently.
     */
    constructor(baseUrl, concurrency)
    {
        super(baseUrl, concurrency);

        for (let i = 0; i < Loader._pixiMiddleware.length; ++i)
        {
            this.use(Loader._pixiMiddleware[i]());
        }
    }

    /**
     * Adds a default middleware to the pixi loader.
     *
     * @static
     * @param {Function} fn - The middleware to add.
     */
    static addPixiMiddleware(fn)
    {
        Loader._pixiMiddleware.push(fn);
    }
}

Loader._pixiMiddleware = [
    // parse any blob into more usable objects (e.g. Image)
    ResourceLoader.middleware.parsing.blob,
    // parse any Image objects into textures
    textureParser,
    // parse any spritesheet data into multiple textures
    spritesheetParser,
    // parse bitmap font data into multiple textures
    bitmapFontParser,
];

// Add custom extentions
const Resource = ResourceLoader.Resource;

Resource.setExtensionXhrType('fnt', Resource.XHR_RESPONSE_TYPE.DOCUMENT);
