import { warn } from '../../utils/logging/warn';
import { path } from '../../utils/path';
import { convertToList } from '../utils/convertToList';
import { isSingleItem } from '../utils/isSingleItem';

import type { ResolvedAsset } from '../types';
import type { LoaderParser } from './parsers/LoaderParser';
import type { PromiseAndParser } from './types';

/**
 * The Loader is responsible for loading all assets, such as images, spritesheets, audio files, etc.
 * It does not do anything clever with URLs - it just loads stuff!
 * Behind the scenes all things are cached using promises. This means it's impossible to load an asset more than once.
 * Through the use of LoaderParsers, the loader can understand how to load any kind of file!
 *
 * It is not intended that this class is created by developers - its part of the Asset class
 * This is the second major system of PixiJS' main Assets class
 * @memberof assets
 */
export class Loader
{
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
            if (data.loadParser)
            {
                // they have? lovely, lets use it
                parser = this._parserHash[data.loadParser];

                if (!parser)
                {
                    // #if _DEBUG

                    warn(`[Assets] specified load parser "${data.loadParser}" not found while loading ${url}`);
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
        onProgress?: (progress: number) => void,
    ): Promise<T>;
    public async load<T = any>(
        assetsToLoadIn: string[] | ResolvedAsset[],
        onProgress?: (progress: number) => void,
    ): Promise<Record<string, T>>;
    public async load<T = any>(
        assetsToLoadIn: string | string[] | ResolvedAsset | ResolvedAsset[],
        onProgress?: (progress: number) => void,
    ): Promise<T | Record<string, T>>
    {
        if (!this._parsersValidated)
        {
            this._validateParsers();
        }

        let count = 0;

        const assets: Record<string, Promise<any>> = {};

        const singleAsset = isSingleItem(assetsToLoadIn);

        const assetsToLoad = convertToList<ResolvedAsset>(assetsToLoadIn, (item) => ({
            alias: [item],
            src: item,
            data: {}
        }));

        const total = assetsToLoad.length;

        const promises: Promise<void>[] = assetsToLoad.map(async (asset: ResolvedAsset) =>
        {
            const url = path.toAbsolute(asset.src);

            if (!assets[asset.src])
            {
                try
                {
                    if (!this.promiseCache[url])
                    {
                        this.promiseCache[url] = this._getLoadPromiseAndParser(url, asset);
                    }

                    assets[asset.src] = await this.promiseCache[url].promise;

                    // Only progress if nothing goes wrong
                    if (onProgress) onProgress(++count / total);
                }
                catch (e)
                {
                    // Delete eventually registered file and promises from internal cache
                    // so they can be eligible for another loading attempt
                    delete this.promiseCache[url];
                    delete assets[asset.src];

                    // Stop further execution
                    throw new Error(`[Loader.load] Failed to load ${url}.\n${e}`);
                }
            }
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
            .filter((parser) => parser.name)
            .reduce((hash, parser) =>
            {
                if (!parser.name)
                {
                    // #if _DEBUG
                    warn(`[Assets] loadParser should have a name`);
                    // #endif
                }
                else if (hash[parser.name])
                {
                    // #if _DEBUG
                    warn(`[Assets] loadParser name conflict "${parser.name}"`);
                    // #endif
                }

                return { ...hash, [parser.name]: parser };
            }, {} as Record<string, LoaderParser>);
    }
}
