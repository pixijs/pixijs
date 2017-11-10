import ResourceLoader from 'resource-loader';
import EventEmitter from 'eventemitter3';
import { blobMiddlewareFactory } from 'resource-loader/lib/middlewares/parsing/blob';
import textureParser from './textureParser';

/**
 *
 * The new loader, extends Resource Loader by Chad Engler: https://github.com/englercj/resource-loader
 *
 * ```js
 * const loader = PIXI.loader; // PixiJS exposes a premade instance for you to use.
 * //or
 * const loader = new PIXI.loaders.Loader(); // you can also create your own if you want
 *
 * const sprites = {};
 *
 * // Chainable `add` to enqueue a resource
 * loader.add('bunny', 'data/bunny.png')
 *       .add('spaceship', 'assets/spritesheet.json');
 * loader.add('scoreFont', 'assets/score.fnt');
 *
 * // Chainable `pre` to add a middleware that runs for each resource, *before* loading that resource.
 * // This is useful to implement custom caching modules (using filesystem, indexeddb, memory, etc).
 * loader.pre(cachingMiddleware);
 *
 * // Chainable `use` to add a middleware that runs for each resource, *after* loading that resource.
 * // This is useful to implement custom parsing modules (like spritesheet parsers, spine parser, etc).
 * loader.use(parsingMiddleware);
 *
 * // The `load` method loads the queue of resources, and calls the passed in callback called once all
 * // resources have loaded.
 * loader.load((loader, resources) => {
 *     // resources is an object where the key is the name of the resource loaded and the value is the resource object.
 *     // They have a couple default properties:
 *     // - `url`: The URL that the resource was loaded from
 *     // - `error`: The error that happened when trying to load (if any)
 *     // - `data`: The raw data that was loaded
 *     // also may contain other properties based on the middleware that runs.
 *     sprites.bunny = new PIXI.TilingSprite(resources.bunny.texture);
 *     sprites.spaceship = new PIXI.TilingSprite(resources.spaceship.texture);
 *     sprites.scoreFont = new PIXI.TilingSprite(resources.scoreFont.texture);
 * });
 *
 * // throughout the process multiple signals can be dispatched.
 * loader.onProgress.add(() => {}); // called once per loaded/errored file
 * loader.onError.add(() => {}); // called once per errored file
 * loader.onLoad.add(() => {}); // called once per loaded file
 * loader.onComplete.add(() => {}); // called once when the queued resources all load.
 * ```
 *
 * @see https://github.com/englercj/resource-loader
 *
 * @class Loader
 * @extends module:resource-loader.ResourceLoader
 * @memberof PIXI.loaders
 * @param {string} [baseUrl=''] - The base url for all resources loaded by this loader.
 * @param {number} [concurrency=10] - The number of resources to load concurrently.
 */
export class Loader extends ResourceLoader
{
    constructor(baseUrl, concurrency)
    {
        super(baseUrl, concurrency);
        EventEmitter.call(this);

        for (let i = 0; i < Loader._middleware.length; ++i)
        {
            this.use(Loader._middleware[i]());
        }

        // Compat layer, translate the new v2 signals into old v1 events.
        this.onStart.add((l) => this.emit('start', l));
        this.onProgress.add((l, r) => this.emit('progress', l, r));
        this.onError.add((e, l, r) => this.emit('error', e, l, r));
        this.onLoad.add((l, r) => this.emit('load', l, r));
        this.onComplete.add((l, r) => this.emit('complete', l, r));

        /**
         * If this loader cannot be destroyed.
         * @member {boolean}
         * @default false
         * @private
         */
        this._protected = false;
    }

    /**
     * Destroy the loader, removes references.
     */
    destroy()
    {
        if (!this._protected)
        {
            this.removeAllListeners();
            this.reset();
        }
    }
}

// Copy EE3 prototype (mixin)
Object.assign(Loader.prototype, EventEmitter.prototype);

/**
 * Collection of all installed middleware for Loader.
 *
 * @static
 * @member {Array<function>}
 * @memberof PIXI.loaders.Loader
 * @private
 */
Loader._middleware = [];

/**
 * A premade instance of the loader that can be used to load resources.
 * @name shared
 * @memberof PIXI.loaders
 * @type {PIXI.loaders.Loader}
 */
export const shared = new Loader();
shared._protected = true;

/**
 * Adds a middleware for the global shared loader and all
 * new Loader instances created.
 *
 * @static
 * @method useMiddleware
 * @memberof PIXI.loaders.Loader
 * @param {Function} fn - The middleware to add.
 */
Loader.useMiddleware = function useMiddleware(fn)
{
    // Install for current shared loader
    shared.use(fn);

    // Install for all future loaders
    Loader._middleware.push(fn);
};

// parse any blob into more usable objects (e.g. Image)
Loader.useMiddleware(blobMiddlewareFactory);

// parse any Image objects into textures
Loader.useMiddleware(textureParser);
