import { utils } from '@pixi/core';
import { convertToList, isSingleItem } from '../utils';
import type { LoaderParser } from './parsers/LoaderParser';
import type { PromiseAndParser, LoadAsset } from './types';

/**
 * The Loader is responsible for loading all assets, such as images, spritesheets, audio files, etc.
 * It does not do anything clever with URLs - it just loads stuff!
 * Behind the scenes all things are cached using promises. This means it's impossible to load an asset more than once.
 * Through the use of LoaderParsers, the loader can understand how to load any kind of file!
 *
 * It is not intended that this class is created by developers - its part of the Asset class
 * This is the second major system of PixiJS' main Assets class
 * @memberof PIXI
 * @class AssetLoader
 */
export class Loader
{
    private _parsers: LoaderParser[] = [];

    /** Cache loading promises that ae currently active */
    public promiseCache: Record<string, PromiseAndParser> = {};

    /** function used for testing */
    public reset(): void
    {
        this.promiseCache = {};
    }

    /**
     * Used internally to generate a promise for the asset to be loaded.
     * @param url - The URL to be loaded
     * @param data - any custom additional information relevant to the asset being loaded
     * @returns - a promise that will resolve to an Asset for example a Texture of a JSON object
     */
    private _getLoadPromiseAndParser(url: string, data?: LoadAsset): PromiseAndParser
    {
        const result: PromiseAndParser = {
            promise: null,
            parser: null
        };

        result.promise = (async () =>
        {
            let asset = null;

            for (let i = 0; i < this.parsers.length; i++)
            {
                const parser = this.parsers[i];

                if (parser.load && parser.test?.(url, data, this))
                {
                    asset = await parser.load(url, data, this);
                    result.parser = parser;

                    break;
                }
            }

            if (!result.parser)
            {
                // #if _DEBUG
                // eslint-disable-next-line max-len
                console.warn(`[Assets] ${url} could not be loaded as we don't know how to parse it, ensure the correct parser has being added`);
                // #endif

                return null;
            }

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
     * Loads an asset(s) using the parsers added to the Loader.
     * @example
     * // single asset:
     * const asset = await Loader.load('cool.png');
     * console.log(asset);
     * @example
     * // multiple assets:
     * const assets = await  Loader.load(['cool.png', 'cooler.png']);
     * console.log(assets);
     * @param assetsToLoadIn - urls that you want to load, or a single one!
     * @param onProgress - a function that gets called when the progress changes
     */
    public async load(
        assetsToLoadIn: string | string[] | LoadAsset | LoadAsset[],
        onProgress?: (progress: number) => void,
    ): Promise<{[key: string]: any} | any>
    {
        let count = 0;

        const assets: Record<string, Promise<any>> = {};

        const singleAsset = isSingleItem(assetsToLoadIn);

        const assetsToLoad = convertToList<LoadAsset>(assetsToLoadIn, (item) => ({
            src: item,
        }));

        const total = assetsToLoad.length;

        const promises: Promise<void>[] = assetsToLoad.map(async (asset: LoadAsset) =>
        {
            const url = utils.path.toAbsolute(asset.src);

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
     * Unloads an asset(s). Any unloaded assets will be destroyed, freeing up memory for your app.
     * The parser that created the asset, will be the one that unloads it.
     * @example
     * // single asset:
     * const asset = await Loader.load('cool.png');
     *
     * await Loader.unload('cool.png');
     *
     * console.log(asset.destroyed); // true
     * @param assetsToUnloadIn - urls that you want to unload, or a single one!
     */
    public async unload(
        assetsToUnloadIn: string | string[] | LoadAsset | LoadAsset[],
    ): Promise<void>
    {
        const assetsToUnload = convertToList<LoadAsset>(assetsToUnloadIn, (item) => ({
            src: item,
        }));

        const promises: Promise<void>[] = assetsToUnload.map(async (asset: LoadAsset) =>
        {
            const url = utils.path.toAbsolute(asset.src);

            const loadPromise = this.promiseCache[url];

            if (loadPromise)
            {
                const loadedAsset = await loadPromise.promise;

                loadPromise.parser?.unload?.(loadedAsset, asset, this);

                delete this.promiseCache[url];
            }
        });

        await Promise.all(promises);
    }

    /** All loader parsers registered */
    public get parsers(): LoaderParser[]
    {
        return this._parsers;
    }
}
