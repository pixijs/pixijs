import ResourceLoader from 'resource-loader';
import { blobMiddlewareFactory } from 'resource-loader/lib/middlewares/parsing/blob';
import EventEmitter from 'eventemitter3';
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
 * loader.add('bunny', 'data/bunny.png');
 * loader.add('spaceship', 'assets/spritesheet.json');
 * loader.add('scoreFont', 'assets/score.fnt');
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
        EventEmitter.call(this);

        for (let i = 0; i < Loader._pixiMiddleware.length; ++i)
        {
            this.use(Loader._pixiMiddleware[i]());
        }

        // Compat layer, translate the new v2 signals into old v1 events.
        this.onStart.add((l) => this.emit('start', l));
        this.onProgress.add((l, r) => this.emit('progress', l, r));
        this.onError.add((e, l, r) => this.emit('error', e, l, r));
        this.onLoad.add((l, r) => this.emit('load', l, r));
        this.onComplete.add((l, r) => this.emit('complete', l, r));
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

// Copy EE3 prototype (mixin)
for (const k in EventEmitter.prototype)
{
    Loader.prototype[k] = EventEmitter.prototype[k];
}

Loader._pixiMiddleware = [
    // parse any blob into more usable objects (e.g. Image)
    blobMiddlewareFactory,
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
