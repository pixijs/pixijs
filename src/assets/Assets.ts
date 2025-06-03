/* eslint-disable max-len */
import { extensions, ExtensionType } from '../extensions/Extensions';
import { bitmapFontCachePlugin, loadBitmapFont } from '../scene/text-bitmap/asset/loadBitmapFont';
import { warn } from '../utils/logging/warn';
import { BackgroundLoader } from './BackgroundLoader';
import { Cache } from './cache/Cache';
import { cacheTextureArray } from './cache/parsers/cacheTextureArray';
import { detectAvif } from './detections/parsers/detectAvif';
import { detectDefaults } from './detections/parsers/detectDefaults';
import { detectMp4 } from './detections/parsers/detectMp4';
import { detectOgv } from './detections/parsers/detectOgv';
import { detectWebm } from './detections/parsers/detectWebm';
import { detectWebp } from './detections/parsers/detectWebp';
import { Loader } from './loader/Loader';
import { loadJson } from './loader/parsers/loadJson';
import { loadTxt } from './loader/parsers/loadTxt';
import { loadWebFont } from './loader/parsers/loadWebFont';
import { loadSvg } from './loader/parsers/textures/loadSVG';
import { type LoadTextureConfig, loadTextures } from './loader/parsers/textures/loadTextures';
import { loadVideoTextures } from './loader/parsers/textures/loadVideoTextures';
import { resolveJsonUrl } from './resolver/parsers/resolveJsonUrl';
import { resolveTextureUrl } from './resolver/parsers/resolveTextureUrl';
import { Resolver } from './resolver/Resolver';
import { convertToList } from './utils/convertToList';
import { isSingleItem } from './utils/isSingleItem';

import type { AssetExtension } from './AssetExtension';
import type { FormatDetectionParser } from './detections/types';
import type { LoadSVGConfig } from './loader/parsers/textures/loadSVG';
import type { BundleIdentifierOptions } from './resolver/Resolver';
import type { ArrayOr, AssetsBundle, AssetsManifest, ResolvedAsset, UnresolvedAsset } from './types';

/**
 * Callback function for tracking asset loading progress. The function is called repeatedly
 * during the loading process with a progress value between 0.0 and 1.0.
 * @param progress - The loading progress from 0.0 (started) to 1.0 (complete)
 * @returns void
 * @example
 * ```ts
 * // Basic progress logging
 * const onProgress = (progress: number) => {
 *     console.log(`Loading: ${Math.round(progress * 100)}%`);
 * };
 *
 * // Update loading bar
 * const onProgress = (progress: number) => {
 *     loadingBar.width = progress * 100;
 *     loadingText.text = `${Math.round(progress * 100)}%`;
 * };
 *
 * // Load assets with progress tracking
 * await Assets.load(['sprite1.png', 'sprite2.png'], onProgress);
 *
 * // Load bundle with progress tracking
 * await Assets.loadBundle('levelAssets', (progress) => {
 *     // Progress is normalized (0.0 - 1.0)
 *     updateLoadingScreen(progress);
 * });
 * ```
 * > [!IMPORTANT] Do not rely on the progress callback to determine when all assets are loaded.
 * > Use the returned promise from `Assets.load()` or `Assets.loadBundle()` to know when loading is complete.
 * @category assets
 * @standard
 */
export type ProgressCallback = (progress: number) => void;

/**
 * Extensible preferences that can be used, for instance, when configuring loaders.
 * @since 7.2.0
 * @advanced
 * @category assets
 */
export interface AssetsPreferences extends LoadTextureConfig, LoadSVGConfig, PixiMixins.AssetsPreferences {}

/**
 * Options for initializing the Assets class. These options configure how assets are loaded,
 * resolved, and managed in your PixiJS application.
 * @category assets
 * @standard
 */
export interface AssetInitOptions
{
    /**
     * Base path prepended to all asset URLs. Useful for CDN hosting.
     * @example
     * ```ts
     * await Assets.init({
     *     basePath: 'https://my-cdn.com/assets/'
     * });
     *
     * // Now you can load assets like this:
     * // Will load from: https://my-cdn.com/assets/images/sprite.png
     * const texture = await Assets.load('images/sprite.png');
     * ```
     */
    basePath?: string;

    /**
     * URL parameters to append to all asset URLs.
     * Useful for cache-busting or version control.
     * @example
     * ```ts
     * // As a string
     * await Assets.init({
     *     defaultSearchParams: 'version=1.0.0'
     * });
     *
     * // As an object
     * await Assets.init({
     *     defaultSearchParams: {
     *         version: '1.0.0',
     *         t: Date.now()
     *     }
     * });
     * ```
     * @advanced
     */
    defaultSearchParams?: string | Record<string, any>;

    /**
     * A manifest defining all your application's assets.
     * Can be a URL to a JSON file or a manifest object.
     * @example
     * ```ts
     * // Using a manifest object
     * await Assets.init({
     *     manifest: {
     *         bundles: [{
     *             name: 'game-screen',
     *             assets: [
     *                 {
     *                     alias: 'hero',
     *                     src: 'hero.{png,webp}'
     *                 },
     *                 {
     *                     alias: 'map',
     *                     src: 'map.json'
     *                 }
     *             ]
     *         }]
     *     }
     * });
     *
     * // Using a URL to manifest
     * await Assets.init({
     *     manifest: 'assets/manifest.json'
     * });
     *
     * // loading a bundle from the manifest
     * await Assets.loadBundle('game-screen');
     *
     * // load individual assets from the manifest
     * const heroTexture = await Assets.load('hero');
     * ```
     */
    manifest?: string | AssetsManifest;
    /**
     * Configure texture loading preferences.
     * Useful for optimizing asset delivery based on device capabilities.
     * @example
     * ```ts
     * await Assets.init({
     *     texturePreference: {
     *         // Prefer high-res textures on retina displays
     *         resolution: window.devicePixelRatio,
     *
     *         // Prefer modern formats, fallback to traditional
     *         format: ['avif', 'webp', 'png']
     *     }
     * });
     * ```
     */
    texturePreference?: {
        /** Preferred texture resolution(s). Can be a single number or array of resolutions in order of preference. */
        resolution?: number | number[];

        /** Preferred texture formats in order of preference. Default: ['avif', 'webp', 'png', 'jpg', 'jpeg'] */
        format?: ArrayOr<string>;
    };

    /**
     * Skip browser format detection for faster initialization.
     * Only use if you know exactly what formats your target browsers support.
     * @example
     * ```ts
     * await Assets.init({
     *     skipDetections: true,
     *     texturePreference: {
     *         format: ['webp', 'png'] // Must explicitly set formats
     *     }
     * });
     * ```
     * @advanced
     */
    skipDetections?: boolean;

    /**
     * Override how bundle IDs are generated and resolved.
     *
     * This allows you to customize how assets are grouped and accessed via bundles and allow for
     * multiple bundles to share the same asset keys.
     * @advanced
     * @example
     * ```ts
     * const manifest = {
     *     bundles: [
     *         {
     *             name: 'bunny1',
     *             assets: [
     *                 {
     *                     alias: ['character', 'character2'],
     *                     src: 'textures/bunny.png',
     *                 },
     *             ],
     *         },
     *         {
     *             name: 'bunny2',
     *             assets: [
     *                 {
     *                     alias: ['character', 'character2'],
     *                     src: 'textures/bunny-2.png',
     *                 },
     *             ],
     *         },
     *     ]
     * };
     *
     * const bundleIdentifier: BundleIdentifierOptions = {
     *     connector: ':',
     * };
     *
     * await Assets.init({ manifest, basePath, bundleIdentifier });
     *
     * const resources = await Assets.loadBundle('bunny1');
     * const resources2 = await Assets.loadBundle('bunny2');
     *
     * console.log(resources.character === resources2.character); // false
     * ```
     */
    bundleIdentifier?: BundleIdentifierOptions;

    /**
     * Optional preferences for asset loading behavior.
     * @example
     * ```ts
     * await Assets.init({
     *     preferences: {
     *         crossOrigin: 'anonymous',
     *         parseAsGraphicsContext: false
     *     }
     * });
     * ```
     */
    preferences?: Partial<AssetsPreferences>;
}

/** @internal */
export class AssetsClass
{
    /**
     * The URL resolver for assets. Maps various asset keys and URLs to their final loadable form.
     * @advanced
     */
    public resolver: Resolver;
    /**
     *  The loader responsible for loading all assets. Handles different file types
     * and transformations.
     * @advanced
     */
    public loader: Loader;
    /**
     * The global cache for all loaded assets. Manages storage and retrieval of
     * processed assets.
     * @example
     * ```ts
     * // Check if an asset is cached
     * if (Assets.cache.has('myTexture')) {
     *     const texture = Assets.cache.get('myTexture');
     * }
     * ```
     * @see {@link Cache} For detailed cache documentation
     */
    public cache: typeof Cache;

    /** takes care of loading assets in the background */
    private readonly _backgroundLoader: BackgroundLoader;

    private readonly _detections: FormatDetectionParser[] = [];

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
     * Initializes the Assets class with configuration options. While not required,
     * calling this before loading assets is recommended to set up default behaviors.
     * @param options - Configuration options for the Assets system
     * @example
     * ```ts
     * // Basic initialization (optional as Assets.load will call this automatically)
     * await Assets.init();
     *
     * // With CDN configuration
     * await Assets.init({
     *     basePath: 'https://my-cdn.com/assets/',
     *     defaultSearchParams: { version: '1.0.0' }
     * });
     *
     * // With manifest and preferences
     * await Assets.init({
     *     manifest: {
     *         bundles: [{
     *             name: 'game-screen',
     *             assets: [
     *                 {
     *                     alias: 'hero',
     *                     src: 'hero.{png,webp}',
     *                     data: { scaleMode: SCALE_MODES.NEAREST }
     *                 },
     *                 {
     *                     alias: 'map',
     *                     src: 'map.json'
     *                 }
     *             ]
     *         }]
     *     },
     *     // Optimize for device capabilities
     *     texturePreference: {
     *         resolution: window.devicePixelRatio,
     *         format: ['webp', 'png']
     *     },
     *     // Set global preferences
     *     preferences: {
     *         crossOrigin: 'anonymous',
     *     }
     * });
     *
     * // Load assets after initialization
     * const heroTexture = await Assets.load('hero');
     * ```
     * @remarks
     * - Can be called only once; subsequent calls will be ignored with a warning
     * - Format detection runs automatically unless `skipDetections` is true
     * - The manifest can be a URL to a JSON file or an inline object
     * @see {@link AssetInitOptions} For all available initialization options
     * @see {@link AssetsManifest} For manifest format details
     */
    public async init(options: AssetInitOptions = {}): Promise<void>
    {
        if (this._initialized)
        {
            // #if _DEBUG
            warn('[Assets]AssetManager already initialized, did you load before calling this Assets.init()?');
            // #endif

            return;
        }

        this._initialized = true;

        if (options.defaultSearchParams)
        {
            this.resolver.setDefaultSearchParams(options.defaultSearchParams);
        }

        if (options.basePath)
        {
            this.resolver.basePath = options.basePath;
        }

        if (options.bundleIdentifier)
        {
            this.resolver.setBundleIdentifier(options.bundleIdentifier);
        }

        if (options.manifest)
        {
            let manifest = options.manifest;

            if (typeof manifest === 'string')
            {
                manifest = await this.load<AssetsManifest>(manifest);
            }

            this.resolver.addManifest(manifest);
        }

        const resolutionPref = options.texturePreference?.resolution ?? 1;
        const resolution = (typeof resolutionPref === 'number') ? [resolutionPref] : resolutionPref;

        const formats = await this._detectFormats({
            preferredFormats: options.texturePreference?.format,
            skipDetections: options.skipDetections,
            detections: this._detections
        });

        this.resolver.prefer({
            params: {
                format: formats,
                resolution,
            },
        });

        if (options.preferences)
        {
            this.setPreferences(options.preferences);
        }
    }

    /**
     * Registers assets with the Assets resolver. This method maps keys (aliases) to asset sources,
     * allowing you to load assets using friendly names instead of direct URLs.
     * @param assets - The unresolved assets to add to the resolver
     * @example
     * ```ts
     * // Basic usage - single asset
     * Assets.add({
     *     alias: 'myTexture',
     *     src: 'assets/texture.png'
     * });
     * const texture = await Assets.load('myTexture');
     *
     * // Multiple aliases for the same asset
     * Assets.add({
     *     alias: ['hero', 'player'],
     *     src: 'hero.png'
     * });
     * const hero1 = await Assets.load('hero');
     * const hero2 = await Assets.load('player'); // Same texture
     *
     * // Multiple format support
     * Assets.add({
     *     alias: 'character',
     *     src: 'character.{webp,png}' // Will choose best format
     * });
     * Assets.add({
     *     alias: 'character',
     *     src: ['character.webp', 'character.png'], // Explicitly specify formats
     * });
     *
     * // With texture options
     * Assets.add({
     *     alias: 'sprite',
     *     src: 'sprite.png',
     *     data: { scaleMode: 'nearest' }
     * });
     *
     * // Multiple assets at once
     * Assets.add([
     *     { alias: 'bg', src: 'background.png' },
     *     { alias: 'music', src: 'music.mp3' },
     *     { alias: 'spritesheet', src: 'sheet.json', data: { ignoreMultiPack: false } }
     * ]);
     * ```
     * @remarks
     * - Assets are resolved when loaded, not when added
     * - Multiple formats use the best available format for the browser
     * - Adding with same alias overwrites previous definition
     * - The `data` property is passed to the asset loader
     * @see {@link Resolver} For details on asset resolution
     * @see {@link LoaderParser} For asset-specific data options
     * @advanced
     */
    public add(assets: (ArrayOr<UnresolvedAsset>)): void
    {
        this.resolver.add(assets);
    }

    /**
     * Loads one or more assets and returns a promise that resolves with the loaded content.
     * Assets are cached, so subsequent loads will return the same instance of the asset without re-fetching.
     * @param urls - Single URL/alias or array of URLs/aliases to load
     * @param onProgress - Optional callback for load progress (0.0 to 1.0)
     * @returns Promise that resolves with loaded asset(s)
     * @example
     * ```ts
     * // Load a single asset
     * const texture = await Assets.load('images/sprite.png');
     *
     * // Load using an alias
     * const heroTexture = await Assets.load({ alias: 'hero', src: 'images/hero.png' });
     *
     * // Load multiple assets
     * const assets = await Assets.load([
     *     'images/background.png',
     *     'images/character.png',
     *     'fonts/game.fnt'
     * ]);
     * console.log(assets['images/background.png']); // Access by URL
     *
     * // Load with progress tracking
     * const textures = await Assets.load(['sprite1.png', 'sprite2.png'],
     *     (progress) => console.log(`Loading: ${Math.round(progress * 100)}%`)
     * );
     *
     * // Load with format preference
     * const characterTexture = await Assets.load({
     *     alias: 'character',
     *     src: 'character.{webp,png}' // Will choose best format
     * });
     *
     * // Load with custom options
     * const spriteTexture = await Assets.load({
     *     alias: 'sprite',
     *     src: 'sprite.png',
     *     data: {
     *         scaleMode: SCALE_MODES.NEAREST,
     *         mipmap: MIPMAP_MODES.ON
     *     }
     * });
     *
     * // Load with a specific loader, can be useful if your asset does not have an extension
     * const image = await Assets.load({
     *    alias: 'imageWithoutExtension',
     *    src: 'images/imageWithoutExtension',
     *    loadParser: 'loadTextures' // Use the JSON loader
     * });
     * ```
     * @remarks
     * - Assets are cached automatically to prevent duplicate loading
     * - URLs are resolved to the best format for the current browser
     * - Asset types are detected automatically based on file extension
     * - Progress callback receives values from 0.0 to 1.0
     * - You can define with loader to use for an asset by specifying the `loadParser` property, which is useful for assets that do not have a file extension.
     * @throws {Error} If the asset cannot be loaded or parsed
     * @see {@link Assets.add} For registering assets with aliases
     * @see {@link Assets.backgroundLoad} For loading assets in the background
     * @see {@link Assets.unload} For releasing loaded assets
     */
    public async load<T = any>(
        urls: string | UnresolvedAsset,
        onProgress?: ProgressCallback,
    ): Promise<T>;
    public async load<T = any>(
        urls: string[] | UnresolvedAsset[],
        onProgress?: ProgressCallback,
    ): Promise<Record<string, T>>;
    public async load<T = any>(
        urls: ArrayOr<string> | ArrayOr<UnresolvedAsset>,
        onProgress?: ProgressCallback
    ): Promise<T | Record<string, T>>
    {
        if (!this._initialized)
        {
            await this.init();
        }

        const singleAsset = isSingleItem(urls);

        const urlArray: string[] = convertToList<UnresolvedAsset | string>(urls)
            .map((url) =>
            {
                if (typeof url !== 'string')
                {
                    const aliases = this.resolver.getAlias(url);

                    if (aliases.some((alias) => !this.resolver.hasKey(alias)))
                    {
                        this.add(url);
                    }

                    return Array.isArray(aliases) ? aliases[0] : aliases;
                }

                // if it hasn't been added, add it now
                if (!this.resolver.hasKey(url)) this.add({ alias: url, src: url });

                return url;
            }) as string[];

        // check cache first...
        const resolveResults = this.resolver.resolve(urlArray);

        // remap to the keys used..
        const out: Record<string, T> = await this._mapLoadToResolve<T>(resolveResults, onProgress);

        return singleAsset ? out[urlArray[0] as string] : out;
    }

    /**
     * Registers a bundle of assets that can be loaded as a group. Bundles are useful for organizing
     * assets into logical groups, such as game levels or UI screens.
     * @param bundleId - Unique identifier for the bundle
     * @param assets - Assets to include in the bundle
     * @example
     * ```ts
     * // Add a bundle using array format
     * Assets.addBundle('animals', [
     *     { alias: 'bunny', src: 'bunny.png' },
     *     { alias: 'chicken', src: 'chicken.png' },
     *     { alias: 'thumper', src: 'thumper.png' },
     * ]);
     *
     * // Add a bundle using object format
     * Assets.addBundle('animals', {
     *     bunny: 'bunny.png',
     *     chicken: 'chicken.png',
     *     thumper: 'thumper.png',
     * });
     *
     * // Add a bundle with advanced options
     * Assets.addBundle('ui', [
     *     {
     *         alias: 'button',
     *         src: 'button.{webp,png}',
     *         data: { scaleMode: 'nearest' }
     *     },
     *     {
     *         alias: ['logo', 'brand'],  // Multiple aliases
     *         src: 'logo.svg',
     *         data: { resolution: 2 }
     *     }
     * ]);
     *
     * // Load the bundle
     * await Assets.loadBundle('animals');
     *
     * // Use the loaded assets
     * const bunny = Sprite.from('bunny');
     * const chicken = Sprite.from('chicken');
     * ```
     * @remarks
     * - Bundle IDs must be unique
     * - Assets in bundles are not loaded until `loadBundle` is called
     * - Bundles can be background loaded using `backgroundLoadBundle`
     * - Assets in bundles can be loaded individually using their aliases
     * @see {@link Assets.loadBundle} For loading bundles
     * @see {@link Assets.backgroundLoadBundle} For background loading bundles
     * @see {@link Assets.unloadBundle} For unloading bundles
     * @see {@link AssetsManifest} For manifest format details
     */
    public addBundle(bundleId: string, assets: AssetsBundle['assets']): void
    {
        this.resolver.addBundle(bundleId, assets);
    }

    /**
     * Loads a bundle or multiple bundles of assets. Bundles are collections of related assets
     * that can be loaded together.
     * @param bundleIds - Single bundle ID or array of bundle IDs to load
     * @param onProgress - Optional callback for load progress (0.0 to 1.0)
     * @returns Promise that resolves with the loaded bundle assets
     * @example
     * ```ts
     * // Define bundles in your manifest
     * const manifest = {
     *     bundles: [
     *         {
     *             name: 'load-screen',
     *             assets: [
     *                 {
     *                     alias: 'background',
     *                     src: 'sunset.png',
     *                 },
     *                 {
     *                     alias: 'bar',
     *                     src: 'load-bar.{png,webp}', // use an array of individual assets
     *                 },
     *             ],
     *         },
     *         {
     *             name: 'game-screen',
     *             assets: [
     *                 {
     *                     alias: 'character',
     *                     src: 'robot.png',
     *                 },
     *                 {
     *                     alias: 'enemy',
     *                     src: 'bad-guy.png',
     *                 },
     *             ],
     *         },
     *     ]
     * };
     *
     * // Initialize with manifest
     * await Assets.init({ manifest });
     *
     * // Or add bundles programmatically
     * Assets.addBundle('load-screen', [...]);
     * Assets.loadBundle('load-screen');
     *
     * // Load a single bundle
     * await Assets.loadBundle('load-screen');
     * const bg = Sprite.from('background'); // Uses alias from bundle
     *
     * // Load multiple bundles
     * await Assets.loadBundle([
     *     'load-screen',
     *     'game-screen'
     * ]);
     *
     * // Load with progress tracking
     * await Assets.loadBundle('game-screen', (progress) => {
     *     console.log(`Loading: ${Math.round(progress * 100)}%`);
     * });
     * ```
     * @remarks
     * - Bundle assets are cached automatically
     * - Bundles can be pre-loaded using `backgroundLoadBundle`
     * - Assets in bundles can be accessed by their aliases
     * - Progress callback receives values from 0.0 to 1.0
     * @throws {Error} If the bundle ID doesn't exist in the manifest
     * @see {@link Assets.addBundle} For adding bundles programmatically
     * @see {@link Assets.backgroundLoadBundle} For background loading bundles
     * @see {@link Assets.unloadBundle} For unloading bundles
     * @see {@link AssetsManifest} For manifest format details
     */
    public async loadBundle(bundleIds: ArrayOr<string>, onProgress?: ProgressCallback): Promise<any>
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

        const keys = Object.keys(resolveResults);
        let count = 0;
        let total = 0;
        const _onProgress = () =>
        {
            onProgress?.(++count / total);
        };
        const promises = keys.map((bundleId) =>
        {
            const resolveResult = resolveResults[bundleId];

            total += Object.keys(resolveResult).length;

            return this._mapLoadToResolve(resolveResult, _onProgress)
                .then((resolveResult) =>
                {
                    out[bundleId] = resolveResult;
                });
        });

        await Promise.all(promises);

        return singleAsset ? out[bundleIds[0]] : out;
    }

    /**
     * Initiates background loading of assets. This allows assets to be loaded passively while other operations
     * continue, making them instantly available when needed later.
     *
     * Background loading is useful for:
     * - Preloading game levels while in a menu
     * - Loading non-critical assets during gameplay
     * - Reducing visible loading screens
     * @param urls - Single URL/alias or array of URLs/aliases to load in the background
     * @example
     * ```ts
     * // Basic background loading
     * Assets.backgroundLoad('images/level2-assets.png');
     *
     * // Background load multiple assets
     * Assets.backgroundLoad([
     *     'images/sprite1.png',
     *     'images/sprite2.png',
     *     'images/background.png'
     * ]);
     *
     * // Later, when you need the assets
     * const textures = await Assets.load([
     *     'images/sprite1.png',
     *     'images/sprite2.png'
     * ]); // Resolves immediately if background loading completed
     * ```
     * @remarks
     * - Background loading happens one asset at a time to avoid blocking the main thread
     * - Loading can be interrupted safely by calling `Assets.load()`
     * - Assets are cached as they complete loading
     * - No progress tracking is available for background loading
     */
    public async backgroundLoad(urls: ArrayOr<string>): Promise<void>
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
     * Initiates background loading of asset bundles. Similar to backgroundLoad but works with
     * predefined bundles of assets.
     *
     * Perfect for:
     * - Preloading level bundles during gameplay
     * - Loading UI assets during splash screens
     * - Preparing assets for upcoming game states
     * @param bundleIds - Single bundle ID or array of bundle IDs to load in the background
     * @example
     * ```ts
     * // Define bundles in your manifest
     * await Assets.init({
     *     manifest: {
     *         bundles: [
     *             {
     *               name: 'home',
     *               assets: [
     *                 {
     *                     alias: 'background',
     *                     src: 'images/home-bg.png',
     *                 },
     *                 {
     *                     alias: 'logo',
     *                     src: 'images/logo.png',
     *                 }
     *              ]
     *            },
     *            {
     *             name: 'level-1',
     *             assets: [
     *                 {
     *                     alias: 'background',
     *                     src: 'images/level1/bg.png',
     *                 },
     *                 {
     *                     alias: 'sprites',
     *                     src: 'images/level1/sprites.json'
     *                 }
     *             ]
     *         }]
     *     }
     * });
     *
     * // Load the home screen assets right away
     * await Assets.loadBundle('home');
     * showHomeScreen();
     *
     * // Start background loading while showing home screen
     * Assets.backgroundLoadBundle('level-1');
     *
     * // When player starts level, load completes faster
     * await Assets.loadBundle('level-1');
     * hideHomeScreen();
     * startLevel();
     * ```
     * @remarks
     * - Bundle assets are loaded one at a time
     * - Loading can be interrupted safely by calling `Assets.loadBundle()`
     * - Assets are cached as they complete loading
     * - Requires bundles to be registered via manifest or `addBundle`
     * @see {@link Assets.addBundle} For adding bundles programmatically
     * @see {@link Assets.loadBundle} For immediate bundle loading
     * @see {@link AssetsManifest} For manifest format details
     */
    public async backgroundLoadBundle(bundleIds: ArrayOr<string>): Promise<void>
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
     * @internal
     */
    public reset(): void
    {
        this.resolver.reset();
        this.loader.reset();
        this.cache.reset();

        this._initialized = false;
    }

    /**
     * Instantly gets an asset already loaded from the cache. Returns undefined if the asset hasn't been loaded yet.
     * @param keys - The key or keys for the assets to retrieve
     * @returns The cached asset(s) or undefined if not loaded
     * @example
     * ```ts
     * // Get a single cached asset
     * const texture = Assets.get('hero');
     * if (texture) {
     *     const sprite = new Sprite(texture);
     * }
     *
     * // Get multiple cached assets
     * const textures = Assets.get([
     *     'hero',
     *     'background',
     *     'enemy'
     * ]);
     *
     * // Safe pattern with loading fallback
     * let texture = Assets.get('hero');
     * if (!texture) {
     *     texture = await Assets.load('hero');
     * }
     *
     * // Working with bundles
     * await Assets.loadBundle('game-ui');
     * const uiAssets = Assets.get([
     *     'button',
     *     'panel',
     *     'icons'
     * ]);
     * ```
     * @remarks
     * - Returns undefined if asset isn't loaded
     * - No automatic loading - use `Assets.load()` for that
     * - Cached assets are shared instances
     * - Faster than `load()` for already cached assets
     *
     * > [!TIP]
     * > When in doubt, use `Assets.load()` instead. It will return cached
     * > assets instantly if they're already loaded.
     * @see {@link Assets.load} For loading assets that aren't cached
     * @see {@link Assets.cache} For direct cache access
     */
    public get<T = any>(keys: string): T;
    public get<T = any>(keys: string[]): Record<string, T>;
    public get<T = any>(keys: ArrayOr<string>): T | Record<string, T>
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
        resolveResults: ResolvedAsset | Record<string, ResolvedAsset>,
        onProgress?: ProgressCallback
    ): Promise<Record<string, T>>
    {
        const resolveArray = [...new Set(Object.values(resolveResults))] as ResolvedAsset[];

        // pause background loader...
        this._backgroundLoader.active = false;

        const loadedAssets = await this.loader.load<T>(resolveArray, onProgress);

        // resume background loader...
        this._backgroundLoader.active = true;

        // remap to the keys used..

        const out: Record<string, T> = {};

        resolveArray.forEach((resolveResult) =>
        {
            const asset = loadedAssets[resolveResult.src];

            const keys = [resolveResult.src];

            if (resolveResult.alias)
            {
                keys.push(...resolveResult.alias);
            }

            keys.forEach((key) =>
            {
                out[key] = asset;
            });

            Cache.set(keys, asset);
        });

        return out;
    }

    /**
     * Unloads assets and releases them from memory. This method ensures proper cleanup of
     * loaded assets when they're no longer needed.
     * @param urls - Single URL/alias or array of URLs/aliases to unload
     * @example
     * ```ts
     * // Unload a single asset
     * await Assets.unload('images/sprite.png');
     *
     * // Unload using an alias
     * await Assets.unload('hero'); // Unloads the asset registered with 'hero' alias
     *
     * // Unload multiple assets
     * await Assets.unload([
     *     'images/background.png',
     *     'images/character.png',
     *     'hero'
     * ]);
     *
     * // Unload and handle creation of new instances
     * await Assets.unload('hero');
     * const newHero = await Assets.load('hero'); // Will load fresh from source
     * ```
     * @remarks
     * > [!WARNING]
     * > Make sure assets aren't being used before unloading:
     * > - Remove sprites using the texture
     * > - Clear any references to the asset
     * > - Textures will be destroyed and can't be used after unloading
     * @throws {Error} If the asset is not found in cache
     */
    public async unload(
        urls: ArrayOr<string> | ResolvedAsset | ResolvedAsset[]
    ): Promise<void>
    {
        if (!this._initialized)
        {
            await this.init();
        }

        const urlArray = convertToList<string | ResolvedAsset>(urls)
            .map((url) =>
                ((typeof url !== 'string') ? url.src : url));

        // check cache first...
        const resolveResults = this.resolver.resolve(urlArray);

        await this._unloadFromResolved(resolveResults);
    }

    /**
     * Unloads all assets in a bundle. Use this to free memory when a bundle's assets
     * are no longer needed, such as when switching game levels.
     * @param bundleIds - Single bundle ID or array of bundle IDs to unload
     * @example
     * ```ts
     * // Define and load a bundle
     * Assets.addBundle('level-1', {
     *     background: 'level1/bg.png',
     *     sprites: 'level1/sprites.json',
     *     music: 'level1/music.mp3'
     * });
     *
     * // Load the bundle
     * const level1 = await Assets.loadBundle('level-1');
     *
     * // Use the assets
     * const background = Sprite.from(level1.background);
     *
     * // When done with the level, unload everything
     * await Assets.unloadBundle('level-1');
     * // background sprite is now invalid!
     *
     * // Unload multiple bundles
     * await Assets.unloadBundle([
     *     'level-1',
     *     'level-2',
     *     'ui-elements'
     * ]);
     * ```
     * @remarks
     * > [!WARNING]
     * > - All assets in the bundle will be destroyed
     * > - Bundle needs to be reloaded to use assets again
     * > - Make sure no sprites or other objects are using the assets
     * @throws {Error} If the bundle is not found
     * @see {@link Assets.addBundle} For adding bundles
     * @see {@link Assets.loadBundle} For loading bundles
     */
    public async unloadBundle(bundleIds: ArrayOr<string>): Promise<void>
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

    private async _unloadFromResolved(resolveResult: ResolvedAsset | Record<string, ResolvedAsset>)
    {
        const resolveArray = Object.values(resolveResult);

        resolveArray.forEach((resolveResult) =>
        {
            Cache.remove(resolveResult.src);
        });

        await this.loader.unload(resolveArray);
    }

    /**
     * Detects the supported formats for the browser, and returns an array of supported formats, respecting
     * the users preferred formats order.
     * @param options - the options to use when detecting formats
     * @param options.preferredFormats - the preferred formats to use
     * @param options.skipDetections - if we should skip the detections altogether
     * @param options.detections - the detections to use
     * @returns - the detected formats
     */
    private async _detectFormats(options: {
        preferredFormats: string | string[],
        skipDetections: boolean,
        detections: FormatDetectionParser[]
    }): Promise<string[]>
    {
        let formats: string[] = [];

        // set preferred formats
        if (options.preferredFormats)
        {
            formats = Array.isArray(options.preferredFormats)
                ? options.preferredFormats : [options.preferredFormats];
        }

        // we should add any formats that are supported by the browser
        for (const detection of options.detections)
        {
            if (options.skipDetections || await detection.test())
            {
                formats = await detection.add(formats);
            }
            else if (!options.skipDetections)
            {
                formats = await detection.remove(formats);
            }
        }

        // remove any duplicates
        formats = formats.filter((format, index) => formats.indexOf(format) === index);

        return formats;
    }

    /**
     * All the detection parsers currently added to the Assets class.
     * @advanced
     */
    public get detections(): FormatDetectionParser[]
    {
        return this._detections;
    }

    /**
     * Sets global preferences for asset loading behavior. This method configures how assets
     * are loaded and processed across all parsers.
     * @param preferences - Asset loading preferences
     * @example
     * ```ts
     * // Basic preferences
     * Assets.setPreferences({
     *     crossOrigin: 'anonymous',
     *     parseAsGraphicsContext: false
     * });
     * ```
     * @remarks
     * Preferences are applied to all compatible parsers and affect future asset loading.
     * Common preferences include:
     * - `crossOrigin`: CORS setting for loaded assets
     * - `preferWorkers`: Whether to use web workers for loading textures
     * - `preferCreateImageBitmap`: Use `createImageBitmap` for texture creation. Turning this off will use the `Image` constructor instead.
     * @see {@link AssetsPreferences} For all available preferences
     */
    public setPreferences(preferences: Partial<AssetsPreferences>): void
    {
        // Find matching config keys in loaders with preferences
        // and set the values
        this.loader.parsers.forEach((parser) =>
        {
            if (!parser.config) return;

            (Object.keys(parser.config) as (keyof AssetsPreferences)[])
                .filter((key) => key in preferences)
                .forEach((key) =>
                {
                    parser.config[key] = preferences[key];
                });
        });
    }
}

/**
 * The global Assets class is a singleton that manages loading, caching, and unloading of all resources
 * in your PixiJS application.
 *
 * Key responsibilities:
 * - **URL Resolution**: Maps URLs/keys to browser-compatible resources
 * - **Resource Loading**: Handles loading and transformation of assets
 * - **Asset Caching**: Manages a global cache to prevent duplicate loads
 * - **Memory Management**: Provides unloading capabilities to free memory
 *
 * Advanced Features:
 * - **Asset Bundles**: Group and manage related assets together
 * - **Background Loading**: Load assets before they're needed over time
 * - **Format Detection**: Automatically select optimal asset formats
 *
 * Supported Asset Types:
 * | Type                | Extensions                                                       | Loaders                                                               |
 * | ------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------- |
 * | Textures            | `.png`, `.jpg`, `.gif`, `.webp`, `.avif`, `.svg`                 | {@link loadTextures}, {@link loadSvg}                                 |
 * | Video Textures      | `.mp4`, `.m4v`, `.webm`, `.ogg`, `.ogv`, `.h264`, `.avi`, `.mov` | {@link loadVideoTextures}                                             |
 * | Sprite Sheets       | `.json`                                                          | {@link spritesheetAsset}                                              |
 * | Bitmap Fonts        | `.fnt`, `.xml`, `.txt`                                           | {@link loadBitmapFont}                                                |
 * | Web Fonts           | `.ttf`, `.otf`, `.woff`, `.woff2`                                | {@link loadWebFont}                                                   |
 * | JSON                | `.json`                                                          | {@link loadJson}                                                      |
 * | Text                | `.txt`                                                           | {@link loadTxt}                                                       |
 * | Compressed Textures | `.basis`, `.dds`, `.ktx`, `.ktx2`                                | {@link loadBasis}, {@link loadDDS}, {@link loadKTX}, {@link loadKTX2} |
 * > [!NOTE] Some loaders allow for custom configuration, please refer to the specific loader documentation for details.
 * @example
 * ```typescript
 * import { Assets } from 'pixi.js';
 *
 * // Initialize with options (optional). You can call Assets.load directly without init.
 * await Assets.init({
 *     // Base path for all asset URLs
 *     basePath: 'https://my-cdn.com/assets/',
 *     // Manifest object that defines all assets
 *     manifest: {
 *        bundles: [{ name: 'gameAssets', assets: [] }, ...],
 *     }, *
 *     // Preferred texture settings
 *     texturePreference: {
 *         resolution: window.devicePixelRatio,
 *         format: ['avif', 'webp', 'png']
 *     }
 * });
 *
 * // Basic loading
 * const texture = await Assets.load('images/sprite.png');
 *
 * // Load multiple assets
 * const assets = await Assets.load([
 *     'images/bg.png',
 *     'images/character.png',
 *     'fonts/game.fnt'
 * ]);
 *
 * // Using aliases + multiple formats
 * await Assets.load({ alias: 'hero', src: 'images/hero.{webp,png}' });
 * const sprite = Sprite.from('hero'); // Uses the best available format
 *
 * // background loading
 * Assets.backgroundLoad(['images/level1.json', 'images/level2.json']); // Loads in the background one at a time
 *
 * // Load a bundle of assets from the manifest
 * const levelAssets = await Assets.loadBundle('gameAssets');
 * // Background loading of a bundle. This will load assets in the background one at a time.
 * // Can be interrupted at any time by calling Assets.loadBundle('gameAssets') again.
 * Assets.backgroundLoadBundle('resultsAssets');
 *
 * // Memory management
 * await Assets.unload('hero');
 * await Assets.unloadBundle('levelOne');
 * ```
 * @remarks
 * - Assets are cached automatically and only loaded once
 * - Background loading helps eliminate loading screens
 * - Format detection ensures optimal asset delivery
 * - Bundle management simplifies resource organization
 *
 * > [!IMPORTANT]
 * > When unloading assets, ensure they aren't being used elsewhere
 * > in your application to prevent missing texture references.
 * @see {@link AssetInitOptions} For initialization options
 * @see {@link AssetsPreferences} For advanced preferences
 * @see {@link BackgroundLoader} For background loading capabilities
 * @see {@link AssetsManifest} For manifest-based asset management
 * @see {@link Loader} For the underlying loading system
 * @see {@link Cache} For the caching system
 * @see {@link Resolver} For URL resolution details
 * @category assets
 * @class
 * @standard
 */
export const Assets = new AssetsClass();

// Handle registration of extensions
extensions
    .handleByList(ExtensionType.LoadParser, Assets.loader.parsers)
    .handleByList(ExtensionType.ResolveParser, Assets.resolver.parsers)
    .handleByList(ExtensionType.CacheParser, Assets.cache.parsers)
    .handleByList(ExtensionType.DetectionParser, Assets.detections);
extensions.add(
    cacheTextureArray,

    detectDefaults,
    detectAvif,
    detectWebp,
    detectMp4,
    detectOgv,
    detectWebm,

    loadJson,
    loadTxt,
    loadWebFont,
    loadSvg,
    loadTextures,
    loadVideoTextures,
    loadBitmapFont,

    bitmapFontCachePlugin,

    resolveTextureUrl,
    resolveJsonUrl
);

const assetKeyMap = {
    loader: ExtensionType.LoadParser,
    resolver: ExtensionType.ResolveParser,
    cache: ExtensionType.CacheParser,
    detection: ExtensionType.DetectionParser,
};

type AssetType = keyof typeof assetKeyMap;

// Split the Asset extension into it's various parts
// these are handled in the Assets.ts file
extensions.handle(ExtensionType.Asset, (extension) =>
{
    const ref = extension.ref as AssetExtension;

    Object.entries(assetKeyMap)
        .filter(([key]) => !!ref[key as AssetType])
        .forEach(([key, type]) => extensions.add(Object.assign(
            ref[key as AssetType],
            // Allow the function to optionally define it's own
            // ExtensionMetadata, the use cases here is priority for LoaderParsers
            { extension: ref[key as AssetType].extension ?? type },
        )));
}, (extension) =>
{
    const ref = extension.ref as AssetExtension;

    Object.keys(assetKeyMap)
        .filter((key) => !!ref[key as AssetType])
        .forEach((key) => extensions.remove(ref[key as AssetType]));
});
