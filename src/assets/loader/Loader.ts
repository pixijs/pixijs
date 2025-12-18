import { warn } from '../../utils/logging/warn';
import { path } from '../../utils/path';
import { type ProgressCallback } from '../Assets';
import { convertToList } from '../utils/convertToList';
import { isSingleItem } from '../utils/isSingleItem';

import type { ResolvedAsset } from '../types';
import type { LoaderParser } from './parsers/LoaderParser';
import type { PromiseAndParser } from './types';

/**
 * Options for loading assets with the Loader
 * @example
 * ```ts
 * await Assets.load(['file1.png', 'file2.png'], {
 *   onProgress: (progress) => console.log(`Progress: ${progress * 100}%`),
 *   onError: (error, url) => console.error(`Error loading ${url}: ${error.message}`),
 *   strategy: 'retry', // 'throw' | 'skip' | 'retry'
 *   retryCount: 5, // Number of retry attempts if strategy is 'retry'
 *   retryDelay: 500, // Delay in ms between retries
 * });
 * ```
 * @category assets
 * @standard
 */
export interface LoadOptions
{
    /**
     * Callback for progress updates during loading
     * @param progress - A number between 0 and 1 indicating the load progress
     * @example
     * ```ts
     * const options: LoadOptions = {
     *   onProgress: (progress) => {
     *     console.log(`Loading progress: ${progress * 100}%`);
     *   },
     * };
     * await Assets.load('image.png', options);
     * ```
     */
    onProgress?: (progress: number) => void;
    /**
     * Callback for handling errors during loading
     * @param error - The error that occurred
     * @param url - The URL of the asset that failed to load
     * @example
     * ```ts
     * const options: LoadOptions = {
     *   onError: (error, url) => {
     *     console.error(`Failed to load ${url}: ${error.message}`);
     *   },
     * };
     * await Assets.load('missing-file.png', options);
     * ```
     */
    onError?: (error: Error, url: string | ResolvedAsset) => void;
    /**
     * Strategy to handle load failures
     * - 'throw': Immediately throw an error and stop loading (default)
     * - 'skip': Skip the failed asset and continue loading others
     * - 'retry': Retry loading the asset a specified number of times
     * @default 'throw'
     * @example
     * ```ts
     * const options: LoadOptions = {
     *   strategy: 'skip',
     * };
     * await Assets.load('sometimes-fails.png', options);
     * ```
     */
    strategy?: 'throw' | 'skip' | 'retry';
    /**
     * Number of retry attempts if strategy is 'retry'
     * @default 3
     * @example
     * ```ts
     * const options: LoadOptions = {
     *   strategy: 'retry',
     *   retryCount: 5, // Retry up to 5 times
     * };
     * await Assets.load('unstable-asset.png', options);
     * ```
     */
    retryCount?: number;
    /**
     * Delay in milliseconds between retry attempts
     * @default 250
     * @example
     * ```ts
     * const options: LoadOptions = {
     *   strategy: 'retry',
     *   retryDelay: 1000, // Wait 1 second between retries
     * };
     * await Assets.load('sometimes-fails.png', options);
     * ```
     */
    retryDelay?: number;
}

/**
 * The Loader is responsible for loading all assets, such as images, spritesheets, audio files, etc.
 * It does not do anything clever with URLs - it just loads stuff!
 * Behind the scenes all things are cached using promises. This means it's impossible to load an asset more than once.
 * Through the use of LoaderParsers, the loader can understand how to load any kind of file!
 *
 * It is not intended that this class is created by developers - its part of the Asset class
 * This is the second major system of PixiJS' main Assets class
 * @category assets
 * @advanced
 */
export class Loader
{
    /**
     * Default options for loading assets
     * @example
     * ```ts
     * // Change default load options globally
     * Loader.defaultOptions = {
     *   strategy: 'skip', // Change default strategy to 'skip'
     *   retryCount: 5,   // Change default retry count to 5
     *   retryDelay: 500, // Change default retry delay to 500ms
     * };
     * ```
     */
    public static defaultOptions: LoadOptions = {
        onProgress: undefined,
        onError: undefined,
        strategy: 'throw',
        retryCount: 3,
        retryDelay: 250,
    };
    /**
     * Options for loading assets with the loader.
     * These options will be used as defaults for all load calls made with this loader instance.
     * They can be overridden by passing options directly to the load method.
     * @example
     * ```ts
     * // Create a loader with custom default options
     * const loader = new Loader();
     * loader.loadOptions = {
     *   strategy: 'skip', // Default strategy to 'skip'
     *   retryCount: 5,   // Default retry count to 5
     *   retryDelay: 500, // Default retry delay to 500ms
     * };
     *
     * // This load call will use the loader's default options
     * await loader.load('image1.png');
     */
    public loadOptions: LoadOptions = { ...Loader.defaultOptions };
    private readonly _parsers: LoaderParser[] = [];
    private _parserHash: Record<string, LoaderParser>;

    private _parsersValidated = false;

    /**
     * All loader parsers registered
     * @type {assets.LoaderParser[]}
     */
    public parsers = new Proxy(this._parsers, {
        set: (target, key, value) =>
        {
            this._parsersValidated = false;

            target[key as any as number] = value;

            return true;
        }
    });

    /** Cache loading promises that ae currently active */
    public promiseCache: Record<string, PromiseAndParser> = {};

    /** function used for testing */
    public reset(): void
    {
        this._parsersValidated = false;
        this.promiseCache = {};
    }

    /**
     * Used internally to generate a promise for the asset to be loaded.
     * @param url - The URL to be loaded
     * @param data - any custom additional information relevant to the asset being loaded
     * @returns - a promise that will resolve to an Asset for example a Texture of a JSON object
     */
    private _getLoadPromiseAndParser(url: string, data?: ResolvedAsset): PromiseAndParser
    {
        const result: PromiseAndParser = {
            promise: null,
            parser: null
        };

        result.promise = (async () =>
        {
            let asset = null;

            let parser: LoaderParser = null;

            // first check to see if the user has specified a parser
            if (data.parser || data.loadParser)
            {
                // they have? lovely, lets use it
                parser = this._parserHash[data.parser || data.loadParser];

                // #if _DEBUG
                if (data.loadParser)
                {
                    warn(
                        `[Assets] "loadParser" is deprecated, use "parser" instead for ${url}`
                    );
                }
                // #endif

                if (!parser)
                {
                    // #if _DEBUG
                    warn(
                        `[Assets] specified load parser "${data.parser || data.loadParser}" not found while loading ${url}`
                    );
                    // #endif
                }
            }

            // no parser specified, so lets try and find one using the tests
            if (!parser)
            {
                for (let i = 0; i < this.parsers.length; i++)
                {
                    const parserX = this.parsers[i];

                    if (parserX.load && parserX.test?.(url, data, this))
                    {
                        parser = parserX;
                        break;
                    }
                }

                if (!parser)
                {
                    // #if _DEBUG
                    // eslint-disable-next-line max-len
                    warn(`[Assets] ${url} could not be loaded as we don't know how to parse it, ensure the correct parser has been added`);
                    // #endif

                    return null;
                }
            }

            asset = await parser.load(url, data, this);
            result.parser = parser;

            for (let i = 0; i < this.parsers.length; i++)
            {
                const parser = this.parsers[i];

                if (parser.parse)
                {
                    if (parser.parse && await parser.testParse?.(asset, data, this))
                    {
                        // transform the asset..
                        asset = await parser.parse(asset, data, this) || asset;

                        result.parser = parser;
                    }
                }
            }

            return asset;
        })();

        return result;
    }

    /**
     * Loads one or more assets using the parsers added to the Loader.
     * @example
     * // Single asset:
     * const asset = await Loader.load('cool.png');
     * console.log(asset);
     *
     * // Multiple assets:
     * const assets = await Loader.load(['cool.png', 'cooler.png']);
     * console.log(assets);
     * @param assetsToLoadIn - urls that you want to load, or a single one!
     * @param onProgress - For multiple asset loading only, an optional function that is called
     * when progress on asset loading is made. The function is passed a single parameter, `progress`,
     * which represents the percentage (0.0 - 1.0) of the assets loaded. Do not use this function
     * to detect when assets are complete and available, instead use the Promise returned by this function.
     */
    public async load<T = any>(
        assetsToLoadIn: string | ResolvedAsset,
        onProgress?: ProgressCallback | LoadOptions,
    ): Promise<T>;
    public async load<T = any>(
        assetsToLoadIn: string[] | ResolvedAsset[],
        onProgress?: ProgressCallback | LoadOptions,
    ): Promise<Record<string, T>>;
    public async load<T = any>(
        assetsToLoadIn: string | string[] | ResolvedAsset | ResolvedAsset[],
        onProgressOrOptions?: ProgressCallback | LoadOptions,
    ): Promise<T | Record<string, T>>
    {
        if (!this._parsersValidated)
        {
            this._validateParsers();
        }

        const options: LoadOptions = typeof onProgressOrOptions === 'function'
            ? { ...Loader.defaultOptions, ...this.loadOptions, onProgress: onProgressOrOptions }
            : { ...Loader.defaultOptions, ...this.loadOptions, ...(onProgressOrOptions || {}) };
        const { onProgress, onError, strategy, retryCount, retryDelay } = options;

        let count = 0;

        const assets: Record<string, Promise<any>> = {};

        const singleAsset = isSingleItem(assetsToLoadIn);

        const assetsToLoad = convertToList<ResolvedAsset>(assetsToLoadIn, (item) => ({
            alias: [item],
            src: item,
            data: {}
        }));

        const total = assetsToLoad.reduce((sum, asset) => sum + (asset.progressSize || 1), 0);

        const promises: Promise<void>[] = assetsToLoad.map(async (asset: ResolvedAsset) =>
        {
            const url = path.toAbsolute(asset.src);

            if (assets[asset.src]) return;

            await this._loadAssetWithRetry(url, asset, { onProgress, onError, strategy, retryCount, retryDelay }, assets);

            count += (asset.progressSize || 1);
            if (onProgress) onProgress(count / total);
        });

        await Promise.all(promises);

        return singleAsset ? assets[assetsToLoad[0].src] : assets;
    }

    /**
     * Unloads one or more assets. Any unloaded assets will be destroyed, freeing up memory for your app.
     * The parser that created the asset, will be the one that unloads it.
     * @example
     * // Single asset:
     * const asset = await Loader.load('cool.png');
     *
     * await Loader.unload('cool.png');
     *
     * console.log(asset.destroyed); // true
     * @param assetsToUnloadIn - urls that you want to unload, or a single one!
     */
    public async unload(
        assetsToUnloadIn: string | string[] | ResolvedAsset | ResolvedAsset[],
    ): Promise<void>
    {
        const assetsToUnload = convertToList<ResolvedAsset>(assetsToUnloadIn, (item) => ({
            alias: [item],
            src: item,
        }));

        const promises: Promise<void>[] = assetsToUnload.map(async (asset: ResolvedAsset) =>
        {
            const url = path.toAbsolute(asset.src);

            const loadPromise = this.promiseCache[url];

            if (loadPromise)
            {
                const loadedAsset = await loadPromise.promise;

                delete this.promiseCache[url];

                await loadPromise.parser?.unload?.(loadedAsset, asset, this);
            }
        });

        await Promise.all(promises);
    }

    /** validates our parsers, right now it only checks for name conflicts but we can add more here as required! */
    private _validateParsers()
    {
        this._parsersValidated = true;

        this._parserHash = this._parsers
            .filter((parser) => parser.name || parser.id)
            .reduce((hash, parser) =>
            {
                if (!parser.name && !parser.id)
                {
                    // #if _DEBUG
                    warn(`[Assets] parser should have an id`);
                    // #endif
                }
                else if (hash[parser.name] || hash[parser.id])
                {
                    // #if _DEBUG
                    warn(`[Assets] parser id conflict "${parser.id}"`);
                    // #endif
                }

                // add both name and id to the hash
                hash[parser.name] = parser;
                if (parser.id) hash[parser.id] = parser;

                return hash;
            }, {} as Record<string, LoaderParser>);
    }

    private async _loadAssetWithRetry(
        url: string,
        asset: ResolvedAsset,
        options: LoadOptions,
        assets: Record<string, Promise<any>>
    )
    {
        let attempt = 0;
        const { onError, strategy, retryCount, retryDelay } = options;
        const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

        while (true)
        {
            try
            {
                if (!this.promiseCache[url])
                {
                    this.promiseCache[url] = this._getLoadPromiseAndParser(url, asset);
                }

                assets[asset.src] = await this.promiseCache[url].promise;

                return;
            }
            catch (e)
            {
                // clear cache for a new attempt
                delete this.promiseCache[url];
                delete assets[asset.src];

                attempt++;

                const isLast = strategy !== 'retry' || attempt > retryCount;

                if (strategy === 'retry' && !isLast)
                {
                    if (onError) onError(e as Error, asset);
                    await wait(retryDelay);
                    continue;
                }

                if (strategy === 'skip')
                {
                    if (onError) onError(e as Error, asset);

                    return;
                }

                // strategy 'throw' or exhausted 'retry'
                if (onError) onError(e as Error, asset);
                const error = new Error(`[Loader.load] Failed to load ${url}.\n${e}`);

                if (e instanceof Error && e.stack)
                {
                    error.stack = e.stack;
                }
                throw error;
            }
        }
    }
}
