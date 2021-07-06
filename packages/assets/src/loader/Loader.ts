import { LoadPlugin } from './plugins/LoadPlugin';

/** All loader plugins registered */
export const loaderPlugins: LoadPlugin[] = [];

/** Stores all data loaded by the plugins */
export const cache: Record<string, any> = {};

/** Cache loading promises that ae currently active */
const promiseCache: Record<string, Promise<any>> = {};

/**
 * Use this to add any plugins to the loadAssets function to use
 *
 * @param newPlugins - a array of plugins to add to the loader, or just a single one
 */
export function addLoaderPlugins(newPlugins: LoadPlugin | LoadPlugin[]): void
{
    // TODO validate plugins...

    if (newPlugins instanceof Array)
    {
        loaderPlugins.push(...newPlugins);
    }
    else
    {
        loaderPlugins.push(newPlugins);
    }
}

/**
 * For exceptional situations where a loader plugin might be causing some trouble,
 * like loadAtlas plugin broken with the latest version of pixi-spine
 *
 * @param pluginsToRemove - a array of plugins to remove from loader, or just a single one
 */
export function removeLoaderPlugins(...pluginsToRemove: LoadPlugin[]): void
{
    for (const plugin of pluginsToRemove)
    {
        const index = loaderPlugins.indexOf(plugin);

        if (index >= 0) loaderPlugins.splice(index, 1);
    }
}

async function getLoadPromise(url: string): Promise<any>
{
    let asset = null;

    for (let i = 0; i < loaderPlugins.length; i++)
    {
        const plugin = loaderPlugins[i];

        if (plugin.load && plugin.test && plugin.test(url))
        {
            asset = await plugin.load(url);
        }
    }

    for (let i = 0; i < loaderPlugins.length; i++)
    {
        const plugin = loaderPlugins[i];

        if (plugin.parse)
        {
            if (!plugin.testParse || plugin.testParse(asset, url))
            {
                // transform the asset..
                asset = await plugin.parse(asset, url) || asset;
            }
        }
    }

    cache[url] = asset;

    return asset;
}

/**
 * The only function you need! will load your assets :D
 * Add plugins to make this thing understand how to actually load stuff!
 *
 * @example
 *
 * single asset:
 *
 * ```
 * const asset = await loadAssets('cool.png');
 *
 * console.log(asset);
 * ```
 * multiple assets:
 * ```
 * const assets = await loadAssets(['cool.png', 'cooler.png']);
 *
 * console.log(assets);
 * ```
 *
 * @param assetUrls - a bunch of urls that you want to load, or a single one!
 * @param onProgress - a progress function that gets called when progress happens
 */
export async function loadAssets(
    assetUrls: string | string[], onProgress?: (progress: number) => void,
): Promise<{[key: string]: any} | any>
{
    let count = 0;
    const total = assetUrls.length;
    const assets: Record<string, Promise<any>> = {};

    let singleAsset = false;

    if (!(assetUrls instanceof Array))
    {
        singleAsset = true;
        assetUrls = [assetUrls];
    }

    const promises: Promise<void>[] = assetUrls.map(async (url: string) =>
    {
        // added as normalizing path if its a url removes the double /

        if (!assets[url])
        {
            try
            {
                if (!promiseCache[url])
                {
                    promiseCache[url] = getLoadPromise(url);
                }

                assets[url] = await promiseCache[url];

                // Only progress if nothing goes wrong
                if (onProgress) onProgress(++count / total);
            }
            catch (e)
            {
                // Delete eventually registered file and promises from internal cache
                // so they can be elegible for another loading attempt
                delete promiseCache[url];
                delete assets[url];

                // Stop further exectution
                throw new Error(`[loadAssets] Failed to load ${url}.\n${e}`);
            }
        }
    });

    await Promise.all(promises);

    return singleAsset ? assets[assetUrls[0]] : assets;
}
