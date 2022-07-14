import { extensions, ExtensionType } from '@pixi/core';
import { BackgroundLoader } from './BackgroundLoader';
import { Cache } from './cache/Cache';
import { cacheSpritesheet, cacheTextureArray } from './cache/parsers';
import type { FormatDetectionParser } from './detections';
import { detectAvif, detectWebp } from './detections';
import type {
    LoadAsset,
    LoaderParser
} from './loader';
import {
    loadJson,
    loadSpritesheet,
    loadTextures,
    loadTxt,
    loadWebFont
} from './loader';
import { Loader } from './loader/Loader';
import { loadBitmapFont } from './loader/parsers/loadBitmapFont';
import type { PreferOrder, ResolveAsset, ResolverBundle, ResolverManifest, ResolveURLParser } from './resolver';
import { resolveSpriteSheetUrl, resolveTextureUrl } from './resolver';
import { Resolver } from './resolver/Resolver';
import { convertToList } from './utils/convertToList';
import { isSingleItem } from './utils/isSingleItem';

export type ProgressCallback = (progress: number) => void;

/**
 * Initialization options object for Asset Class.
 * @memberof PIXI
 */
export interface AssetInitOptions
{
    // basic...
    /** a base path for any assets loaded */
    basePath?: string;
    /**
     * a manifest to tell the asset loader upfront what all your assets are
     * this can be the manifest object itself, or a URL to the manifest.
     */
    manifest?: string | ResolverManifest;
    /**
     * optional preferences for which textures preferences you have when resolving assets
     * for example you might set the resolution to 0.5 if the user is on a rubbish old phone
     * or you might set the resolution to 2 if the user is on a retina display
     */
    texturePreference?: {
        /** the resolution order you prefer, can be an array (priority order - first is prefered) or a single resolutions  */
        resolution?: number | number[];
        /** the formats you prefer, by default this will be:  ['avif', 'webp', 'png', 'jpg', 'jpeg'] */
        format?: string | string[];
    };

    // advanced users can add custom parsers and and preferences for how things are resolved
    /** loader options to configure the loader with, currently only parsers! */
    loader?: {
        /** custom parsers can be added here, for example something that could load a sound or a 3D model */
        parsers?: LoaderParser[];
        // more...
    };
    /** resolver specific options */
    resolver?: {
        /**
         * a list of urlParsers, these can read the URL and pick put the various options.
         * for example there is a texture URL parser that picks our resolution and file format.
         * You can add custom ways to read URLs and extract information here.
         */
        urlParsers?: ResolveURLParser[];
        /**
         * a list of preferOrders that let the resolver know which asset to pick.
         * already built-in we have a texture preferOrders that let the resolve know which asset to prefer
         * if it has multiple assets to pick from (resolution/formats etc)
         */
        preferOrders?: PreferOrder[];
    };
}

/**
 * A one stop shop for all Pixi resource management!
 * Super modern and easy to use, with enough flexibility to customize and do what you need!
 * @memberof PIXI
 * @namespace Assets
 *
 * Only one Asset Class exists accessed via the Global Asset object.
 *
 * It has four main responsibilities:
 * 1. Allows users to map URLs to keys and resolve them according to the user's browser capabilities
 * 2. Loads the resources and transforms them into assets that developers understand.
 * 3. Caches the assets and provides a way to access them.
 * 4: Allow developers to unload assets and clear the cache.
 *
 * It also has a few advanced features:
 * 1. Allows developers to provide a manifest upfront of all assets and help manage them via 'bundles'
 * 2. Allows users to background load assets. Shortening (or eliminating) load times and improving UX. With this feature,
 * in-game loading bars can be a thing of the past!
 *
 *
 * Do not be afraid to load things multiple times - under the hood, it will NEVER load anything more than once.
 *
 * for example:
 *
 * ```
 * promise1 = PIXI.Assets.load('bunny.png')
 * promise2 = PIXI.Assets.load('bunny.png')
 *
 * //promise1 === promise2
 * ```
 * here both promises will be the same. Once resolved.. forever resolved! It makes for really easy resource management!
 *
 * Out of the box it supports the following files:
 * * textures (avif, webp, png, jpg, gif)
 * * sprite sheets (json)
 * * bitmap fonts (xml, fnt, txt)
 * * web fonts (ttf, woff, woff2)
 * * json files (json)
 * * text files (txt)
 *
 * More types can be added fairly easily by creating additional loader parsers.
 *
 * ### Textures
 * - Textures are loaded as ImageBitmap on a worker thread where possible.
 * Leading to much less janky load + parse times.
 * - By default, we will prefer to load AVIF and WebP image files if you specify them.
 * But if the browser doesn't support AVIF or WebP we will fall back to png and jpg.
 * - Textures can also be accessed via Texture.from(...) and now use this asset manager under the hood!
 * - Don't worry if you set preferences for textures that don't exist (for example you prefer 2x resolutions images
 *  but only 1x is available for that texture, the Asset manager will pick that up as a fallback automatically)
 * #### Sprite sheets
 * - it's hard to know what resolution a sprite sheet is without loading it first, to address this
 * there is a naming convention we have added that will let Pixi understand the image format and resolution
 * of the spritesheet via its file name:
 *
 * `my-spritesheet{resolution}.{imageFormat}.json`
 *
 * for example:
 *
 * `my-spritesheet@2x.webp.json` // 2x resolution, WebP sprite sheet
 * `my-spritesheet@0.5x.png.json` // 0.5x resolution, png sprite sheet
 *
 * This is optional! you can just load a sprite sheet as normal,
 * This is only useful if you have a bunch of different res / formatted spritesheets
 *
 * ### Fonts
 * * Web fonts will be loaded with all weights.
 * it is possible to load only specific weights by doing the following:
 *
 * ```
 * // load specific weights..
 * await PIXI.Assets.load({
 *    data: {
 *      weights: ['normal'], // only loads the weight
 *    },
 *    src: `outfit.woff2`,
 * });
 *
 * // load everything...
 * await PIXI.Assets.load(`outfit.woff2`);
 * ```
 * ### Background Loading
 * Background loading will load stuff for you passively behind the scenes. To minimize jank,
 * it will only load one asset at a time. As soon as a developer calls `PIXI.Assets.load(...)` the
 * background loader is paused and requested assets are loaded as a priority.
 * Don't worry if something is in there that's already loaded, it will just get skipped!
 *
 * You still need to call `PIXI.Assets.load(...)` to get an asset that has been loaded in the background.
 * It's just that this promise will resolve instantly if the asset
 * has already been loaded.
 *
 * ### Manifest and Bundles
 * - Manifest is a JSON file that contains a list of all assets and their properties.
 * - Bundles are a way to group assets together.
 *
 * ```
 * // manifest example
 * const manifest = {
 *   bundles:[{
 *      name:'load-screen',
 *      assets:[
 *          {
 *             name: 'background',
 *             srcs: 'sunset.png',
 *          },
 *          {
 *             name: 'bar',
 *             srcs: 'load-bar.{png,webp}',
 *          }
 *      ]
 *   },
 *   {
 *      name:'game-screen',
 *      assets:[
 *          {
 *             name: 'character',
 *             srcs: 'robot.png',
 *          },
 *          {
 *             name: 'enemy',
 *             srcs: 'bad-guy.png',
 *          }
 *      ]
 *   }]
 * }}
 *
 * await PIXI.Asset.init({
 *  manifest
 * });
 *
 * // load a bundle..
 * loadScreenAssets = await PIXI.Assets.loadBundle('load-screen');
 * // load another..
 * gameScreenAssets = await PIXI.Assets.loadBundle('game-screen');
 * ```
 * @example
 * const bunny = await PIXI.Assets.load('bunny.png');
 */
export class AssetsClass
{
    /** the resolver to map various urls */
    public resolver: Resolver;
    /**
     * The loader, loads stuff!
     * @type {PIXI.AssetLoader}
     */
    public loader: Loader;
    /**
     * The global cache of all assets within PixiJS
     * @type {PIXI.Cache}
     */
    public cache: typeof Cache;

    /** takes care of loading assets in the background */
    private readonly _backgroundLoader: BackgroundLoader;

    private _detections: FormatDetectionParser[] = [];

    private _initialized = false;

    constructor()
    {
        this.resolver = new Resolver();
        this.loader = new Loader();
        this.cache = Cache;

        this._backgroundLoader = new BackgroundLoader(this.loader);
        this._backgroundLoader.active = true;

        this.reset();
    }

    /**
     * Best practice is to call this function before any loading commences
     * Initiating is the best time to add any customization to the way things are loaded.
     *
     * you do not need to call this for the Asset class to work, only if you want to set any initial properties
     * @param options - options to initialize the Asset manager with
     */
    public async init(options: AssetInitOptions = {}): Promise<void>
    {
        if (this._initialized)
        {
            // #if _DEBUG
            console.warn('[Assets]AssetManager already initialized, did you load before calling this Asset.init()?');
            // #endif

            return;
        }

        this._initialized = true;

        if (options.basePath)
        {
            this.resolver.basePath = options.basePath;
        }

        if (options.manifest)
        {
            let manifest = options.manifest;

            if (typeof manifest === 'string')
            {
                manifest = await this.load<ResolverManifest>(manifest) as ResolverManifest;
            }

            this.resolver.addManifest(manifest);
        }

        const resolutionPref =  options.texturePreference?.resolution ?? 1;
        const resolution = (typeof resolutionPref === 'number') ? [resolutionPref] : resolutionPref;

        let formats: string[];

        if (options.texturePreference?.format)
        {
            const formatPref = options.texturePreference?.format;

            formats = (typeof formatPref === 'string') ? [formatPref] : formatPref;

            // we should remove any formats that are not supported by the browser
            for (const detection of this._detections)
            {
                if (!await detection.test())
                {
                    formats = await detection.remove(formats);
                }
            }
        }
        else
        {
            formats = ['png', 'jpg', 'jpeg'];

            // we should add any formats that are supported by the browser
            for (const detection of this._detections)
            {
                if (await detection.test())
                {
                    formats = await detection.add(formats);
                }
            }
        }

        this.resolver.prefer({
            params: {
                format: formats,
                resolution,
            },
        });
    }

    /**
     * Allows you to specify how to resolve any assets load requests.
     * There are a few ways to add things here as shown below:
     * @example
     * // simple
     * PIXI.Assets.add('bunnyBooBoo', 'bunny.png');
     * const bunny = await PIXI.Assets.load('bunnyBooBoo');
     *
     * // multiple keys:
     * PIXI.Assets.add(['burger', 'chicken'], 'bunny.png');
     *
     * const bunny = await PIXI.Assets.load('burger');
     * const bunny2 = await PIXI.Assets.load('chicken');
     *
     * // passing options to to the object
     * PIXI.Assets.add(
     *     'bunnyBooBooSmooth',
     *     'bunny{png,webp}',
     *     {scaleMode:SCALE_MODES.NEAREST} // base texture options
     * );
     *
     * // multiple assets,
     *
     * // the following all do the same thing:
     *
     * PIXI.Assets.add('bunnyBooBoo', 'bunny{png,webp}');
     *
     * PIXI.Assets.add('bunnyBooBoo', [
     * 'bunny.png',
     * 'bunny.webp'
     * ]);
     *
     * PIXI.Assets.add('bunnyBooBoo', [
     *    {
     *       format:'png',
     *       src:'bunny.png',
     *    },
     *    {
     *       format:'webp',
     *       src:'bunny.webp',
     *    }
     * ]);
     *
     * const bunny = await PIXI.Assets.load('bunnyBooBoo'); // will try to load WebP if available
     * @param keysIn - the key or keys that you will reference when loading this asset
     * @param assetsIn - the asset or assets that will be chosen from when loading via the specified key
     * @param data - asset-specific data that will be passed to the loaders
     * - Useful if you want to initiate loaded objects with specific data
     */
    public add(keysIn: string | string[], assetsIn: string | (ResolveAsset | string)[], data?: unknown): void
    {
        this.resolver.add(keysIn, assetsIn, data);
    }

    /**
     * Loads your assets! You pass in a key or URL and it will return a promise that
     * resolves to the loaded asset. If multiple assets a requested, it will return a hash of assets.
     *
     * Don't worry about loading things multiple times, behind the scenes assets are only ever loaded
     * once and the same promise reused behind the scenes so you can safely call this function multiple
     * times with the same key and it will always return the same asset.
     * @example
     * // load a URL:
     * const myImageTexture = await PIXI.Assets.load('http://some.url.com/image.png'); // => returns a texture
     *
     * PIXI.Assets.add('thumper', 'bunny.png');
     * PIXI.Assets.add('chicko', 'chicken.png');
     *
     * // load multiple assets:
     * const textures = await PIXI.Assets.load(['thumper', 'chicko']); // => {thumper: Texture, chicko: Texture}
     * @param urls - the urls to load
     * @param onProgress - optional function that is called when progress on asset loading is made.
     * The function is passed a single parameter, `progress`, which represents the percentage
     * (0.0 - 1.0) of the assets loaded.
     * @returns - the assets that were loaded, either a single asset or a hash of assets
     */
    public async load<T=any>(
        urls: string | string[] | LoadAsset | LoadAsset[],
        onProgress?: ProgressCallback,
    ): Promise<T | Record<string, T>>
    {
        if (!this._initialized)
        {
            await this.init();
        }

        const singleAsset = isSingleItem(urls);

        const urlArray = convertToList<ResolveAsset>(urls)
            .map((url) =>
            {
                if (typeof url !== 'string')
                {
                    this.resolver.add(url.src as string, url);

                    return url.src;
                }

                return url;
            });

        // check cache first...
        const resolveResults = this.resolver.resolve(urlArray);

        // remap to the keys used..
        const out: Record<string, T> = await this._mapLoadToResolve<T>(resolveResults, onProgress);

        return singleAsset ? out[urlArray[0] as string] : out;
    }

    /**
     * This adds a bundle of assets in one go so that you can load them as a group.
     * For example you could add a bundle for each screen in you pixi app
     * @example
     *  PIXI.Assets.addBundle('animals', {
     *    bunny: 'bunny.png',
     *    chicken: 'chicken.png',
     *    thumper: 'thumper.png',
     *  });
     *
     * const assets = await PIXI.Assets.loadBundle('animals');
     * @param bundleId - the id of the bundle to add
     * @param assets - a record of the asset or assets that will be chosen from when loading via the specified key
     */
    public addBundle(bundleId: string, assets: ResolverBundle['assets']): void
    {
        this.resolver.addBundle(bundleId, assets);
    }

    /**
     * Bundles are a way to load multiple assets at once.
     * If a manifest has been provided to the init function then you can load a bundle, or bundles.
     * you can also add bundles via `addBundle`
     * @example
     * // manifest example
     * const manifest = {
     *   bundles:[{
     *      name:'load-screen',
     *      assets:[
     *          {
     *             name: 'background',
     *             srcs: 'sunset.png',
     *          },
     *          {
     *             name: 'bar',
     *             srcs: 'load-bar.{png,webp}',
     *          }
     *      ]
     *   },
     *   {
     *      name:'game-screen',
     *      assets:[
     *          {
     *             name: 'character',
     *             srcs: 'robot.png',
     *          },
     *          {
     *             name: 'enemy',
     *             srcs: 'bad-guy.png',
     *          }
     *      ]
     *   }]
     * }}
     *
     * await Asset.init({
     *  manifest
     * });
     *
     * // load a bundle..
     * loadScreenAssets = await PIXI.Assets.loadBundle('load-screen');
     * // load another..
     * gameScreenAssets = await PIXI.Assets.loadBundle('game-screen');
     * @param bundleIds - the bundle id or ids to load
     * @param onProgress - optional function that is called when progress on asset loading is made.
     * The function is passed a single parameter, `progress`, which represents the percentage (0.0 - 1.0)
     * of the assets loaded.
     * @returns all the bundles assets or a hash of assets for each bundle specified
     */
    public async loadBundle(bundleIds: string | string[], onProgress?: ProgressCallback): Promise<any>
    {
        if (!this._initialized)
        {
            await this.init();
        }

        let singleAsset = false;

        if (typeof bundleIds === 'string')
        {
            singleAsset = true;
            bundleIds = [bundleIds];
        }

        const resolveResults = this.resolver.resolveBundle(bundleIds);

        const out: Record<string, Record<string, any>> = {};

        const promises = Object.keys(resolveResults).map((bundleId) =>
        {
            const resolveResult = resolveResults[bundleId];

            return this._mapLoadToResolve(resolveResult, onProgress)
                .then((resolveResult) =>
                {
                    out[bundleId] = resolveResult;
                });
        });

        await Promise.all(promises);

        return singleAsset ? out[bundleIds[0]] : out;
    }

    /**
     * Initiate a background load of some assets. it will passively begin to load these assets in the background.
     * So when you actually come to loading them you will get a promise that resolves to the loaded assets immediately
     *
     * An example of this might be that you would background load game assets after your inital load.
     * then when you got to actually load your game screen assets when a player goes to the game - the loading
     * would already have stared or may even be complete, saving you having to show an interim load bar.
     * @example
     * PIXI.Assets.backgroundLoad('bunny.png');
     *
     * // later on in your app...
     * await PIXI.Assets.loadBundle('bunny.png'); // will resolve quicker as loading may have completed!
     * @param urls - the url / urls you want to background load
     */
    public async backgroundLoad(urls: string | string[]): Promise<void>
    {
        if (!this._initialized)
        {
            await this.init();
        }

        if (typeof urls === 'string')
        {
            urls = [urls];
        }

        const resolveResults = this.resolver.resolve(urls);

        this._backgroundLoader.add(Object.values(resolveResults));
    }

    /**
     * Initiate a background of a bundle, works exactly like backgroundLoad but for bundles.
     * this can only be used if the loader has been initiated with a manifest
     * @example
     * await PIXI.Assets.init({
     *    manifest: {
     *       bundles: [
     *       {
     *          name:'load-screen',
     *          assets:[...]
     *       }
     *       ...]
     *   }
     * });
     *
     * PIXI.Assets.backgroundLoadBundle('load-screen');
     *
     * // later on in your app...
     * await PIXI.Assets.loadBundle('load-screen'); // will resolve quicker as loading may have completed!
     * @param bundleIds - the bundleId / bundleIds you want to background load
     */
    public async backgroundLoadBundle(bundleIds: string | string[]): Promise<void>
    {
        if (!this._initialized)
        {
            await this.init();
        }

        if (typeof bundleIds === 'string')
        {
            bundleIds = [bundleIds];
        }

        const resolveResults = this.resolver.resolveBundle(bundleIds);

        Object.values(resolveResults).forEach((resolveResult) =>
        {
            this._backgroundLoader.add(Object.values(resolveResult));
        });
    }

    /**
     * Only intended for development purposes.
     * This will wipe the resolver and caches.
     * You will need to reinitialize the Asset
     */
    public reset(): void
    {
        this.resolver.reset();
        this.loader.reset();
        this.cache.reset();

        this._initialized = false;
    }

    /**
     * Instantly gets an asset already loaded from the cache. If the asset has not yet been loaded,
     * it will return undefined. So it's on you! When in doubt just use `PIXI.Assets.load` instead.
     * (remember, the loader will never load things more than once!)
     * @param keys - The key or keys for the assets that you want to access
     * @returns - The assets or hash of assets requested
     */
    public get<T=any>(keys: string | string[]): T | Record<string, T>
    {
        if (typeof keys === 'string')
        {
            return Cache.get(keys);
        }

        const assets: Record<string, T> = {};

        for (let i = 0; i < keys.length; i++)
        {
            assets[i] = Cache.get(keys[i]);
        }

        return assets;
    }

    /**
     * helper function to map resolved assets back to loaded assets
     * @param resolveResults - the resolve results from the resolver
     * @param onProgress - the progress callback
     */
    private async _mapLoadToResolve<T>(
        resolveResults: ResolveAsset | Record<string, ResolveAsset>,
        onProgress?: ProgressCallback
    ): Promise<Record<string, T>>
    {
        const resolveArray = Object.values(resolveResults);
        const resolveKeys = Object.keys(resolveResults);

        // pause background loader...
        this._backgroundLoader.active = false;

        const loadedAssets = await this.loader.load(resolveArray, onProgress);

        // resume background loader...
        this._backgroundLoader.active = true;

        // remap to the keys used..

        const out: Record<string, T> = {};

        resolveArray.forEach((resolveResult, i) =>
        {
            const asset = loadedAssets[resolveResult.src];

            const keys = [resolveResult.src];

            if (resolveResult.alias)
            {
                keys.push(...resolveResult.alias);
            }

            out[resolveKeys[i]] = asset;

            Cache.set(keys, asset);
        });

        return out;
    }

    /**
     * Unload an asset or assets. As the Assets class is responsible for creating the assets via the `load` function
     * this will make sure to destroy any assets and release them from memory.
     * Once unloaded, you will need to load the asset again.
     *
     * Use this to help manage assets if you find that you have a large app and you want to free up memory.
     *
     * * it's up to you as the developer to make sure that textures are not actively being used when you unload them,
     * Pixi won't break but you will end up with missing assets. Not a good look for the user!
     * @example
     * // load a URL:
     * const myImageTexture = await PIXI.Assets.load('http://some.url.com/image.png'); // => returns a texture
     *
     * await PIXI.Assets.unload('http://some.url.com/image.png')
     *
     * myImageTexture <-- will now be destroyed.
     *
     * // unload multiple assets:
     * const textures = await PIXI.Assets.unload(['thumper', 'chicko']);
     * @param urls - the urls to unload
     */
    public async unload(
        urls: string | string[] | LoadAsset | LoadAsset[]
    ): Promise<void>
    {
        if (!this._initialized)
        {
            await this.init();
        }

        const urlArray = convertToList<string | LoadAsset>(urls)
            .map((url) =>
                ((typeof url !== 'string') ? url.src : url));

        // check cache first...
        const resolveResults = this.resolver.resolve(urlArray);

        await this._unloadFromResolved(resolveResults);
    }

    /**
     * Bundles are a way to manage multiple assets at once.
     * this will unload all files in a bundle.
     *
     * once a bundle has been unloaded, you need to load it again to have access to the assets.
     * @example
     * PIXI.Assets.addBundle({
     *   'thumper': 'http://some.url.com/thumper.png',
     * })
     *
     * const assets = await PIXI.Assets.loadBundle('thumper');
     *
     * // now to unload..
     *
     * await await PIXI.Assets.unloadBundle('thumper');
     *
     * // all assets in the assets object will now have been destroyed and purged from the cache
     * @param bundleIds - the bundle id or ids to unload
     */
    public async unloadBundle(bundleIds: string | string[]): Promise<void>
    {
        if (!this._initialized)
        {
            await this.init();
        }

        bundleIds = convertToList<string>(bundleIds);

        const resolveResults = this.resolver.resolveBundle(bundleIds);

        const promises = Object.keys(resolveResults).map((bundleId) =>
            this._unloadFromResolved(resolveResults[bundleId]));

        await Promise.all(promises);
    }

    private async _unloadFromResolved(resolveResult: ResolveAsset | Record<string, ResolveAsset>)
    {
        const resolveArray = Object.values(resolveResult);

        resolveArray.forEach((resolveResult) =>
        {
            Cache.remove(resolveResult.src);
        });

        await this.loader.unload(resolveArray);
    }

    /** All the detection parsers currently added to the Assets class. */
    public get detections(): FormatDetectionParser[]
    {
        return this._detections;
    }
}

export const Assets = new AssetsClass();

// Handle registration of extensions
extensions
    .handleByList(ExtensionType.LoadParser, Assets.loader.parsers)
    .handleByList(ExtensionType.ResolveParser, Assets.resolver.parsers)
    .handleByList(ExtensionType.CacheParser, Assets.cache.parsers)
    .handleByList(ExtensionType.DetectionParser, Assets.detections);

extensions.add(
    loadTextures,
    loadTxt,
    loadJson,
    loadSpritesheet,
    loadBitmapFont,
    loadWebFont,

    // cache extensions
    cacheSpritesheet,
    cacheTextureArray,

    // resolve extensions
    resolveTextureUrl,
    resolveSpriteSheetUrl,

    // detection extensions
    detectWebp,
    detectAvif
);
