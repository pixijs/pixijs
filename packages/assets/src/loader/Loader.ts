import { convertToList, isSingleItem, makeAbsoluteUrl } from '../utils';
import type { LoaderParser } from './parsers/LoaderParser';
import { PromiseAndParser, LoadAsset } from './types';

/**
 * The Loader is responsible for loading all assets, such as images, spritesheets, audio files, etc.
 * It does not do anything clever with urls - it just loads stuff!
 * Behind the scenes all things are cached using promises. This means its impossible to load an asset more than once.
 * Through the use of LoaderParsers, the loader can understand how to load any kind of file!
 *
 * It is not intended that this class is created by developers - its part of the Asset class
 * This is the second major system of PixiJS' main Assets class
 * @memberof PIXI
 * @class AssetLoader
 */
export class Loader
{
    /** All loader parsers registered */
    public parsers: LoaderParser[] = [];

    /** Cache loading promises that ae currently active */
    public promiseCache: Record<string, PromiseAndParser> = {};

    /** function used for testing */
    public reset(): void
    {
        this.promiseCache = {};

        this.parsers.length = 0;
    }

    /**
     * Use this to add any parsers to the loadAssets function to use
     * @param newParsers - a array of parsers to add to the loader, or just a single one
     */
    public addParser(...newParsers: LoaderParser[]): void
    {
        this.parsers.push(...newParsers);
    }

    /**
     * For exceptional situations where a loader parser might be causing some trouble,
     * like loadAtlas parser broken with the latest version of pixi-spine
     * @param parsersToRemove - a array of parsers to remove from loader, or just a single one
     */
    public removeParser(...parsersToRemove: LoaderParser[]): void
    {
        for (const parser of parsersToRemove)
        {
            const index = this.parsers.indexOf(parser);

            if (index >= 0) this.parsers.splice(index, 1);
        }
    }

    /**
     * Used internally to generate a promise for the asset to be loaded.
     * @param url - the url to be loaded
     * @param data - any custom additional information relevant to the asset being loaded
     * @returns - a promise the will resolve to a Asset for example a Texture of a JSON object
     */
    private _getLoadPromiseAndParser(url: string, data?: any): PromiseAndParser
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
                // eslint-disable-next-line max-len
                console.warn(`[Assets] ${url} could not be loaded as we don't know how to parse it, ensure the correct parser has being added`);

                return null;
            }

            for (let i = 0; i < this.parsers.length; i++)
            {
                const parser = this.parsers[i];

                if (parser.parse)
                {
                    //

                    if (parser.parse && parser.testParse?.(asset, data, this))
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
     * The only function you need! will load your assets :D
     * Add parsers to make this thing understand how to actually load stuff!
     * @example
     * // single asset:
     * const asset = await Loader.load('cool.png');
     * console.log(asset);
     * @example
     * // multiple assets:
     * const assets = await  Loader.load(['cool.png', 'cooler.png']);
     * console.log(assets);
     * @param assetsToLoadIn - a bunch of urls that you want to load, or a single one!
     * @param onProgress - a progress function that gets called when progress happens
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
            const url = makeAbsoluteUrl(asset.src);

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
     * The opposite of the load function! this will unload your assets!
     * unloaded assets are destroyed. A great way to free up memory for you app.
     * The parser that created the asset, will be the one that unloads it.
     * @example
     * // single asset:
     * const asset = await Loader.load('cool.png');
     *
     * await Loader.unload('cool.png');
     *
     * console.log(asset.destroyed); // true
     * @param assetsToUnloadIn - a bunch of urls that you want to unload, or a single one!
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
            const url = makeAbsoluteUrl(asset.src);

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
}
