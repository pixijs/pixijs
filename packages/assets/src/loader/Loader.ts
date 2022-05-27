import { makeAbsoluteUrl } from '../utils/makeAbsoluteUrl';
import type { LoaderParser } from './parsers/LoaderParser';

export interface LoadAsset<T=any>
{
    src: string;
    data?: T;
}

/**
 * The Loader is responsible for loading all assets, such as images, spritesheets, audio files, etc.
 * It does not do anything clever with urls - it just loads stuff!
 * Behind the scenes all things are cached using promises. This means its impossible to load an asset more than once.
 * Through the use of LoaderParsers, the loader can understand how to load any kind of file!
 *
 * It is not intended that this class is created by developers - its part of the Asset class
 * This is the second major system of PixiJS' main Assets class
 */
class Loader
{
    /** All loader parsers registered */
    public parsers: LoaderParser[] = [];

    /** Stores all data loaded by the parsers */
    public cache: Record<string, any> = {};

    /** Cache loading promises that ae currently active */
    public promiseCache: Record<string, Promise<any>> = {};

    /** function used for testing */
    public reset(): void
    {
        this.promiseCache = {};
        this.cache = {};

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
    private async _getLoadPromise(url: string, data?: any): Promise<any>
    {
        let asset = null;

        for (let i = 0; i < this.parsers.length; i++)
        {
            const parser = this.parsers[i];

            if (parser.load && parser.test?.(url, data, this))
            {
                asset = await parser?.load(url, data, this);
            }
        }

        for (let i = 0; i < this.parsers.length; i++)
        {
            const parser = this.parsers[i];

            if (parser.parse)
            {
                if (!parser.testParse || parser.testParse(asset, data, this))
                {
                // transform the asset..
                    asset = await parser.parse(asset, data, this) || asset;
                }
            }
        }

        this.cache[url] = asset;

        return asset;
    }

    /**
     * The only function you need! will load your assets :D
     * Add parsers to make this thing understand how to actually load stuff!
     * @example
     *
     * single asset:
     *
     * ```
     * const asset = await Loader.load('cool.png');
     *
     * console.log(asset);
     * ```
     * multiple assets:
     * ```
     * const assets = await  Loader.load(['cool.png', 'cooler.png']);
     *
     * console.log(assets);
     * ```
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

        let singleAsset = false;

        if (!Array.isArray(assetsToLoadIn))
        {
            singleAsset = true;
            assetsToLoadIn = [assetsToLoadIn as LoadAsset];
        }

        const assetsToLoad: LoadAsset[] = (assetsToLoadIn as (string | LoadAsset)[]).map((assetUrl): LoadAsset =>
            ((typeof assetUrl === 'string') ? {
                src: assetUrl,
            } : assetUrl));

        const total = assetsToLoad.length;

        const promises: Promise<void>[] = assetsToLoad.map(async (asset: LoadAsset) =>
        {
            const url = makeAbsoluteUrl(asset.src);

            if (!assets[url])
            {
                try
                {
                    if (!this.promiseCache[url])
                    {
                        this.promiseCache[url] = this._getLoadPromise(url, asset);
                    }

                    assets[url] = await this.promiseCache[url];

                    // Only progress if nothing goes wrong
                    if (onProgress) onProgress(++count / total);
                }
                catch (e)
                {
                    // Delete eventually registered file and promises from internal cache
                    // so they can be eligible for another loading attempt
                    delete this.promiseCache[url];
                    delete assets[url];

                    // Stop further execution
                    throw new Error(`[Loader.load] Failed to load ${url}.\n${e}`);
                }
            }
        });

        await Promise.all(promises);

        return singleAsset ? assets[assetsToLoad[0].src] : assets;
    }
}

export { Loader };
