import ResourceLoader from 'resource-loader';
import EventEmitter from 'eventemitter3';
import { blobMiddlewareFactory } from 'resource-loader/lib/middlewares/parsing/blob';
import TextureLoader from './TextureLoader';

/**
 *
 * The new loader, extends Resource Loader by Chad Engler: https://github.com/englercj/resource-loader
 *
 * ```js
 * const loader = PIXI.Loader.shared; // PixiJS exposes a premade instance for you to use.
 * //or
 * const loader = new PIXI.Loader(); // you can also create your own if you want
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
 * @memberof PIXI
 * @param {string} [baseUrl=''] - The base url for all resources loaded by this loader.
 * @param {number} [concurrency=10] - The number of resources to load concurrently.
 */
export default class Loader extends ResourceLoader
{
    constructor(baseUrl, concurrency)
    {
        super(baseUrl, concurrency);
        EventEmitter.call(this);

        for (let i = 0; i < Loader._plugins.length; ++i)
        {
            const plugin = Loader._plugins[i];
            const { pre, use } = plugin;

            if (pre)
            {
                this.pre(pre);
            }

            if (use)
            {
                this.use(use);
            }
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

    /**
     * A premade instance of the loader that can be used to load resources.
     * @name shared
     * @type {PIXI.Loader}
     * @static
     * @memberof PIXI.Loader
     */
    static get shared()
    {
        let shared = Loader._shared;

        if (!shared)
        {
            shared = new Loader();
            shared._protected = true;
            Loader._shared = shared;
        }

        return shared;
    }
}

// Copy EE3 prototype (mixin)
Object.assign(Loader.prototype, EventEmitter.prototype);

/**
 * Collection of all installed `use` middleware for Loader.
 *
 * @static
 * @member {Array<PIXI.Loader~LoaderPlugin>}
 * @memberof PIXI.Loader
 * @private
 */
Loader._plugins = [];

/**
 * Adds a Loader plugin for the global shared loader and all
 * new Loader instances created.
 *
 * @static
 * @method registerPlugin
 * @memberof PIXI.Loader
 * @param {PIXI.Loader~LoaderPlugin} plugin - The plugin to add
 * @return {PIXI.Loader} Reference to PIXI.Loader for chaining
 */
Loader.registerPlugin = function registerPlugin(plugin)
{
    Loader._plugins.push(plugin);

    if (plugin.add)
    {
        plugin.add();
    }

    return Loader;
};

// parse any blob into more usable objects (e.g. Image)
Loader.registerPlugin({ use: blobMiddlewareFactory() });

// parse any Image objects into textures
Loader.registerPlugin(TextureLoader);

/**
 * Plugin to be installed for handling specific Loader resources.
 * @typedef {object} PIXI.Loader~LoaderPlugin
 * @property {function} [plugin.add] - Function to call immediate after registering plugin.
 * @property {PIXI.Loader~loaderMiddleware} [plugin.pre] - Middleware function to run before load, the
 *           arguments for this are `(resource, next)`
 * @property {PIXI.Loader~loaderMiddleware} [plugin.use] - Middleware function to run after load, the
 *           arguments for this are `(resource, next)`
 */

/**
 * @callback PIXI.Loader~loaderMiddleware
 * @param {PIXI.LoaderResource} resource
 * @param {function} next
 */
