import type { Dict } from '@pixi/utils';
import type { IApplicationOptions } from '@pixi/app';
import { Loader as Loader_2 } from 'resource-loader';
import { Resource } from 'resource-loader';
import type { Spritesheet } from '@pixi/spritesheet';
import type { Texture } from '@pixi/core';

/**
 * Application plugin for supporting loader option. Installing the LoaderPlugin
 * is not necessary if using **pixi.js** or **pixi.js-legacy**.
 * @example
 * import {AppLoaderPlugin} from '@pixi/loaders';
 * import {Application} from '@pixi/app';
 * Application.registerPlugin(AppLoaderPlugin);
 * @class
 * @memberof PIXI
 */
export declare class AppLoaderPlugin
{
    static loader: Loader;
    /**
     * Called on application constructor
     * @param {object} options
     * @private
     */
    static init(options?: IApplicationOptions): void;
    /**
     * Called when application destroyed
     *
     * @private
     */
    static destroy(): void;
}

export declare interface ILoaderPlugin {
    add?(): void;
    pre?(resource: Resource, next?: (...args: any[]) => void): void;
    use?(resource: Resource, next?: (...args: any[]) => void): void;
}

export declare interface ILoaderResource extends GlobalMixins.ILoaderResource, Resource {
    texture?: Texture;
    spritesheet?: Spritesheet;
    textures?: Dict<Texture>;
    metadata: IResourceMetadata;
}

export declare interface IResourceMetadata extends GlobalMixins.IResourceMetadata, Resource.IMetadata {
    imageMetadata?: any;
}

/**
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
 * @memberof PIXI
 * @param {string} [baseUrl=''] - The base url for all resources loaded by this loader.
 * @param {number} [concurrency=10] - The number of resources to load concurrently.
 */
export declare class Loader extends Loader_2
{
    /**
     * Collection of all installed `use` middleware for Loader.
     *
     * @static
     * @member {Array<PIXI.ILoaderPlugin>} _plugins
     * @memberof PIXI.Loader
     * @private
     */
    private static _plugins;
    private static _shared;
    private _protected;
    constructor(baseUrl?: string, concurrency?: number);
    /**
     * Destroy the loader, removes references.
     * @memberof PIXI.Loader#
     * @method destroy
     * @public
     */
    destroy(): void;
    /**
     * A premade instance of the loader that can be used to load resources.
     * @name shared
     * @type {PIXI.Loader}
     * @static
     * @memberof PIXI.Loader
     */
    static get shared(): Loader;
    /**
     * Adds a Loader plugin for the global shared loader and all
     * new Loader instances created.
     *
     * @static
     * @method registerPlugin
     * @memberof PIXI.Loader
     * @param {PIXI.ILoaderPlugin} plugin - The plugin to add
     * @return {PIXI.Loader} Reference to PIXI.Loader for chaining
     */
    static registerPlugin(plugin: ILoaderPlugin): typeof Loader;
}

/**
* Reference to **{@link https://github.com/englercj/resource-loader
* resource-loader}**'s Resource class.
* @see http://englercj.github.io/resource-loader/Resource.html
* @class LoaderResource
* @memberof PIXI
*/
export declare const LoaderResource: TLoaderResource;

/**
 * Loader plugin for handling Texture resources.
 * @class
 * @memberof PIXI
 * @implements PIXI.ILoaderPlugin
 */
export declare class TextureLoader
{
    /**
     * Called after a resource is loaded.
     * @see PIXI.Loader.loaderMiddleware
     * @param {PIXI.LoaderResource} resource
     * @param {function} next
     */
    static use(resource: ILoaderResource, next: (...args: any[]) => void): void;
}

declare type TLoaderResource = {
    new (...args: any[]): ILoaderResource;
} & typeof Resource;

export { };
