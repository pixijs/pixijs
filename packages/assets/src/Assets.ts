// PreferOptions

import { Texture } from '@pixi/core';
import { BackgroundLoader } from './BackgroundLoader';
import { Cache } from './cache/Cache';
import type {
    LoaderParser } from './loader';
import {
    Loader,
    loadJson,
    loadSpritesheet,
    loadTextures,
    loadWebFont,
} from './loader';
import { loadBitmapFont } from './loader/parsers/loadBitmapFont';
import type { PreferOrder, ResolveAsset, ResolverManifest, ResolveURLParser } from './resolver/Resolver';
import { Resolver } from './resolver/Resolver';
import { DetectAvif } from './utils/DetectAvif';
import { DetectWebp } from './utils/DetectWebp';
import { spriteSheetUrlParser } from './utils/spriteSheetUrlParser';
import { textureUrlParser } from './utils/textureUrlParser';

type ProgressCallback = (progress: number) => void;

/** initiation options object for Asset Class. */
export interface AssetInitOptions
{
    // basic...
    /** a base path for any assets loaded */
    basePath?: string;
    /**
     * a manifest to tell the asset loader upfront what all you assets are
     * this can be the manifest object itself, or a url to the manifest.
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
        /**
         * custom parsers can be added here, for example something that could load a sound or a 3D model
         */
        parsers?: LoaderParser[];
        // more...
    };
    /** resolver specific options */
    resolver?: {
        /**
         * a list of urlParsers, these can read the url and pick put the various options.
         * for example there is a texture url parser that picks our resolution and file format.
         * You can add custom ways to read urls and extract information here.
         */
        urlParsers?: ResolveURLParser[];
        /**
         * a list of preferOrders that let the resolver know which asset to pick.
         * already built in we have a texture preferOrders that let the resolve know which asset to prefer
         * if it has multiple assets to pick from (resolution / formats etc)
         */
        preferOrders?: PreferOrder[];
    };
}
/**
 * A one stop shop for all Pixi resource management!
 * Super modern and easy to use (1 line!), with enough flexibility to customize and do what you need!
 *
 * @example
 * ```
 * const bunny = await Asset.load('bunny.png');
 * ```
 *
 * Only one Asset Class exists accessed via the Global Asset object.
 *
 * It has three main responsibilities:
 * 1. to allow users to map urls to keys and (for example) resolve according to the users browser capabilities
 * 2. loads the resources and transforms them into assets that developers understand.
 * 3. caches the assets and provides a way to access them.
 * 4. allow developer to provide a manifest upfront of all assets and help manage them via 'bundles`
 * 5. allow users to background load assets. Shortening (or eliminating) load times and improving UX. With this feature,
 * in game load bars can be a thing of the past!
 *
 *
 * Do not be afraid to load things multiple times - under the hood it will NEVER load anything more than once.
 *
 * for example:
 *
 * ```
 * promise1 = Asset.load('bunny.png)
 * promise2 = Asset.load('bunny.png)
 *
 * //promise1 === promise2
 * ```
 * here both promises will be the same. Once resolved.. forever resolved! It makes for really easy resource management!
 *
 * Out of the box it supports the following files:
 * - textures (avif, webp, png, jpg, gif)
 * - sprite sheets (json)
 * - bitmap fonts (xml)
 * - fonts (woff2, woff2)
 * - json files (json)
 *
 * more can be added fairly easily by creating loader parsers
 *
 * notes:
 *
 * // Textures
 * - Textures are loaded as ImageBitmap on a worker thread where possible.
 * Leading to much less janky load + parse times.
 * - By default we will prefer to load avif and webp image files if you specify them.
 * But if the browser doesn't support avif or webp we will fall back to png and jpg.
 * - Textures can also be accessed via Texture.from(...) and now use this asset manager under th hood!
 * - Don't worry if you set preferences for textures that don't exist (for example you prefer 2x resolutions images
 *  but only 1x is available for that texture, the Asset manager will pick that up as a fallback automatically)
 * // Sprite sheets
 * - its hard to know what resolution a sprite sheet is without loading it first, to address this
 * there is a naming convention we have added that will let pixi understand the image format and resolution
 * of the spritesheet via its file name:
 *
 * `my-spritesheet{resolution}.{imageFormat}.json`
 *
 * for example:
 *
 * `my-spritesheet@2x.webp.json` // 2x resolution, webp sprite sheet
 * `my-spritesheet@0.5x.png.json` // 0.5x resolution, png sprite sheet
 *
 * this is optional! you can just load a sprite sheet as normal,
 * this is only useful if you have a bunch of different res / formatted spritesheets
 *
 * // fonts
 * - Web fonts by can default will load all available weights.
 * it is possible to load only specific weights by doing the following:
 *
 * ```
 * // load specific weights..
 * await loader.load({
 *    data: {
 *      weights: ['normal'], // only loads the weight
 *    },
 *    src: `outfit.woff2`,
 * });
 *
 * // load everything...
 * await loader.load(`outfit.woff2`);
 * ```
 * // Background loading
 * Background loading will load stuff for you passively behind the scenes. To minimse jank,
 * it will only load one asset at a time. As soon as a developer calls 'Assets.load(...)' the
 * back ground loader is paused and requested assets are loaded as a priority.
 * Don't worry if something is in there that's already loaded, it will just get skipped!
 *
 * You still need to call 'Assets.load(...)' to get an asset that has been loaded in the background.
 * Its just that this promise will resolve instantly if the asset
 * has already been loaded.
 *
 * // Manifest and Bundles
 * - Manifest is a json file that contains a list of all assets and their properties.
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
 * ```
 * await Asset.init({
 *  manifest
 * });
 *
 * // load a bundle..
 * loadScreenAssets = await Assets.loadBundle('load-screen');
 * // load another..
 * gameScreenAssets = await Assets.loadBundle('game-screen');
 *
 */
export class AssetsClass
{
    /** the resolver to map various urls */
    public resolver: Resolver;
    /** the loader, loads stuff! */
    public loader: Loader;
    /** the global cache of all assets within PixiJS */
    public cache: typeof Cache;

    /** takes care of loading assets in the background */
    private readonly _backgroundLoader: BackgroundLoader;

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
     *
     * @param options - options to initialize the Asset manager with
     */
    public async init(options: AssetInitOptions = {}): Promise<void>
    {
        if (this._initialized)
        {
            console.warn('[Assets]AssetManager already initialized, did you load before calling this Asset.init()?');

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

        let format: string[];

        if (options.texturePreference?.format)
        {
            const formatPref = options.texturePreference?.format;

            format = (typeof formatPref === 'string') ? [formatPref] : formatPref;
        }
        else
        {
            format = ['avif', 'webp', 'png', 'jpg', 'jpeg'];
        }

        if (!(await DetectWebp()))
        {
            format = format.filter((format) => format !== 'webp');
        }

        if (!(await DetectAvif()))
        {
            format = format.filter((format) => format !== 'avif');
        }

        this.resolver.prefer({
            params: {
                format,
                resolution,
            },
        });
    }

    /**
     * Allows you to specify how to resolve any assets load requests.
     * There are a few ways to add things here as shown below:
     *
     * @example
     *```
     * // simple
     * Assets.add('bunnyBooBoo', 'bunny.png`);
     * const bunny = await Asset.load('bunnyBooBoo');
     *
     * // multiple keys:
     * Assets.add(['burger', 'chicken'], 'bunny.png`);
     *
     * const bunny = await Asset.load('burger');
     * const bunny2 = await Asset.load('chicken');
     *
     * // multiple assets,
     *
     * // the following all do the same thing:
     *
     * Assets.add('bunnyBooBoo', 'bunny{png,webp}`);
     *
     * Assets.add('bunnyBooBoo', [
     * 'bunny.png',
     * 'bunny.webp'
     * ]);
     *
     * Assets.add('bunnyBooBoo', [
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
     * const bunny = await Asset.load('bunnyBooBoo'); // will try to load webp if available
     * ```
     *
     * @param keysIn - the key or keys that you will reference when loading this asset
     * @param assetsIn - the asset or assets that will be chosen from when loading via the specified key
     */
    public add(keysIn: string | string[], assetsIn: string | (ResolveAsset | string)[]): void
    {
        this.resolver.add(keysIn, assetsIn);
    }

    /**
     * The main event, loads stuff! You pass in a key or url and it will return a promise that
     * resolves to the loaded asset. If multiple assets a requested, it will return an hash of assets.
     *
     * Dont worry about loading things multiple times, behind the scenes assets are only ever loaded
     * once and the same promise reused behind the scenes so you can safely call this function multiple
     * times with the same key and it will always return the same asset.
     *
     * @example
     * ```
     *
     * // load a url:
     * const myImageTexture = await Assets.load('http://some.url.com/image.png'); // => returns a texture
     *
     * Assets.add('thumper', 'bunny.png`);
     * Assets.add('chicko', 'chicken.png`);
     *
     * // load multiple assets:
     * const textures = await Assets.load(['thumper', 'chicko']); // => {thumper: Texture, chicko: Texture}
     *
     * // measure progress:
     * await Assets.load(
     * ```
     *
     * @param urls - the urls to load
     * @param onProgress - optional function that is called when progress on asset loading is made.
     * The function is passed a single parameter, `progress`, which represents the percentage
     * (0.0 - 1.0) of the assets loaded.
     * @returns - the assets that were loaded, either a single asset or a hash of assets
     */
    public async load<T=any>(
        urls: string | string[],
        onProgress?: ProgressCallback,
    ): Promise<T | Record<string, T>>
    {
        if (!this._initialized)
        {
            await this.init();
        }

        let singleAsset = false;

        if (typeof urls === 'string')
        {
            singleAsset = true;
            urls = [urls];
        }

        // check cache first...

        const resolveResults = this.resolver.resolve(urls);

        // remap to the keys used..

        const out: Record<string, T> = await this._mapLoadToResolve<T>(resolveResults, onProgress);

        return singleAsset ? out[urls[0]] : out;
    }

    /**
     * If a manifest has been provided to the init function then you can load a bundle, or bundles.
     * Bundles are a way to load multiple assets at once.
     *
     * @example
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
     * await Asset.init({
     *  manifest
     * });
     *
     * // load a bundle..
     * loadScreenAssets = await Assets.loadBundle('load-screen');
     * // load another..
     * gameScreenAssets = await Assets.loadBundle('game-screen');
     * ```
     *
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
     *
     *  @example
     * ```
     * Assets.backgroundLoad('bunny.png');
     *
     * // later on in your app...
     * await Asset.loadBundle('bunny.png'); // will resolve quicker as loading may have completed!
     * ```
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
     *
     * @example
     * ```
     * await Assets.init({
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
     * Assets.backgroundLoadBundle('load-screen');
     *
     * // later on in your app...
     * await Asset.loadBundle('load-screen'); // will resolve quicker as loading may have completed!
     * ```
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
     * really only intended for development purposes.
     * this will wipe the resolver and caches.
     * You will need to reinitialize the Asset
     */
    public reset(): void
    {
        this.resolver.reset();
        this.loader.reset();
        this.cache.reset();

        this.loader.addParser(
            loadTextures,
            loadJson,
            loadSpritesheet,
            loadBitmapFont,
            loadWebFont,
        );

        // allows us to pass resolution based on strings
        this.resolver.addUrlParser(textureUrlParser);
        this.resolver.addUrlParser(spriteSheetUrlParser);

        this._initialized = false;
    }

    /**
     * Instantly gets an asset already loaded from the cache. If the asset has not yet been loaded,
     * it will return undefined. So its on you! When in doubt just use Asset.load instead.
     * (remember, the loader will never load things more than once!)
     *
     * @param keys - the key or keys for the assets that you want to access
     * @returns - the assets or hash off assets requested
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
     * A special function specifically for getting textures. This is a syncroness function
     * so a texture will be returned immediately. It can be used, but wont render until it has fully loaded.
     * If the texture has previously already been loaded, the texture will be ready
     *
     * @param key - the key of the texture that you want get.
     * @returns - the Texture you requested
     */
    public getTextureSync(key: string): Texture
    // TODO @bigtimebuddy - can you help us with a better name pls?
    {
        if (Cache.has(key))
        {
            return Cache.get(key);
        }

        // TODO make sure sprite sheets textures get added to cache!

        // add it to a cache..
        const url = this.resolver.resolveUrl(key) as string;

        const texture = new Texture(Texture.EMPTY.baseTexture);

        this.loader.load(url).then((loadedTexture) =>
        {
            texture.baseTexture = loadedTexture.baseTexture;
        });

        return texture;
    }

    /** helper function to map resolved assets back to loaded assets */
    private async _mapLoadToResolve<T>(
        resolveResults: ResolveAsset | Record<string, ResolveAsset>,
        onProgress?: ProgressCallback
    ): Promise<T | Record<string, T>>
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

            resolveResult.alias?.forEach((key: string) =>
            {
                Cache.set(key, asset);
            });

            Cache.set(resolveResult.src, asset);

            out[resolveKeys[i]] = asset;
        });

        return out;
    }
}

// like the highlander, there can be only one!
export const Assets = new AssetsClass();
