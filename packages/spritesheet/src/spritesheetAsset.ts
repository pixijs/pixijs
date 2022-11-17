import { extensions, ExtensionType, settings, utils } from '@pixi/core';
import { LoaderParserPriority } from '@pixi/assets';
import { Spritesheet } from './Spritesheet';

import type { AssetExtension, ResolveAsset, LoadAsset, Loader } from '@pixi/assets';
import type { Texture } from '@pixi/core';
import type { ISpritesheetData } from './Spritesheet';

interface SpriteSheetJson extends ISpritesheetData
{
    meta: {
        image: string;
        scale: string;
        // eslint-disable-next-line camelcase
        related_multi_packs?: string[];
    };
}

const validImages = ['jpg', 'png', 'jpeg', 'avif', 'webp'];

function getCacheableAssets(keys: string[], asset: Spritesheet, ignoreMultiPack: boolean)
{
    const out: Record<string, any> = {};

    keys.forEach((key: string) =>
    {
        out[key] = asset;
    });

    Object.keys(asset.textures).forEach((key) =>
    {
        out[key] = asset.textures[key];
    });

    if (!ignoreMultiPack)
    {
        const basePath = utils.path.dirname(keys[0]);

        asset.linkedSheets.forEach((item: Spritesheet, i) =>
        {
            const out2 = getCacheableAssets([`${basePath}/${asset.data.meta.related_multi_packs[i]}`], item, true);

            Object.assign(out, out2);
        });
    }

    return out;
}

export class SpritesheetAssetCacheEntry
{
    private _promise: Record<number, Promise<Spritesheet>> = {};
    private _resolve: Record<number, (value: Spritesheet) => void> = {};
    private _reject: Record<number, (reason: any) => void> = {};
    private _value: Record<number, Spritesheet> = {};
    private _reason: Record<number, any> = {};
    private _done: Record<number, boolean> = {};

    constructor()
    {
        for (let step = 0; step < 2; ++step)
        {
            this._promise[step] = new Promise((resolve, reject) =>
            {
                if (this._reason[step]) resolve(this._value[step]);
                else if (this._value[step]) resolve(this._value[step]);
                else
                {
                    this._resolve[step] = resolve;
                    this._reject[step] = reject;
                }
            });
            this._done[step] = false;
        }
    }

    getPromise(step: number) { return this._promise[step]; }

    resolve(step: number, value: Spritesheet)
    {
        if (this._done[step]) return;
        this._done[step] = true;
        if (this._resolve[step]) this._resolve[step](value);
        else this._value[step] = value;
    }
    reject(reason: any)
    {
        for (let step = 0; step < 2; ++step)
        {
            if (this._done[step]) continue;
            this._done[step] = true;
            if (this._reject[step]) this._reject[step](reason);
            else this._reason[step] = reason;
        }
    }
}

export class SpritesheetAssetCache
{
    private _cache: Record<string, SpritesheetAssetCacheEntry> = {};

    get(url: string)
    {
        let cache = this._cache[url];

        if (!cache)
        {
            cache = new SpritesheetAssetCacheEntry();
            this._cache[url] = cache;
        }

        return cache;
    }

    remove(url: string)
    {
        delete this._cache[url];
    }

    reset()
    {
        this._cache = {};
    }
}

export const spritesheetAssetCache = new SpritesheetAssetCache();

/**
 * Asset extension for loading spritesheets.
 * @memberof PIXI
 */
export const spritesheetAsset = {
    extension: ExtensionType.Asset,
    /** Handle the caching of the related Spritesheet Textures */
    cache: {
        test: (asset: Spritesheet) => asset instanceof Spritesheet,
        getCacheableAssets: (keys: string[], asset: Spritesheet) => getCacheableAssets(keys, asset, false),
    },
    /** Resolve the the resolution of the asset. */
    resolver: {
        test: (value: string): boolean =>
        {
            const tempURL = value.split('?')[0];
            const split = tempURL.split('.');
            const extension = split.pop();
            const format = split.pop();

            return extension === 'json' && validImages.includes(format);
        },
        parse: (value: string): ResolveAsset =>
        {
            const split = value.split('.');

            return {
                resolution: parseFloat(settings.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
                format: split[split.length - 2],
                src: value,
            };
        },
    },
    /**
     * Loader plugin that parses sprite sheets!
     * once the JSON has been loaded this checks to see if the JSON is spritesheet data.
     * If it is, we load the spritesheets image and parse the data into PIXI.Spritesheet
     * All textures in the sprite sheet are then added to the cache
     * @ignore
     */
    loader: {
        extension: {
            type: ExtensionType.LoadParser,
            priority: LoaderParserPriority.Normal,
        },

        async testParse(asset: SpriteSheetJson, loadAsset: LoadAsset): Promise<boolean>
        {
            return (utils.path.extname(loadAsset.src).includes('.json') && !!asset.frames);
        },

        async parse(asset: SpriteSheetJson, loadAsset: LoadAsset, loader: Loader): Promise<Spritesheet>
        {
            const url = utils.path.toAbsolute(loadAsset.src);
            const entry = spritesheetAssetCache.get(url);

            function invalidRelatedMultiPacks(multiPacks: any)
            {
                throw new TypeError(`[spritesheetAsset] Invalid related_multi_packs: ${JSON.stringify(multiPacks)}`);
            }

            try
            {
                let basePath = utils.path.dirname(url);

                if (basePath && basePath.lastIndexOf('/') !== (basePath.length - 1))
                {
                    basePath += '/';
                }

                const imagePath = basePath + asset.meta.image;
                const assets = await loader.load([imagePath]) as Record<string, Texture>;
                const texture = assets[imagePath];
                const spritesheet = new Spritesheet(
                    texture.baseTexture,
                    asset,
                    url,
                );

                // Wait for the spritesheet itself being loaded (resolving Promise 0)
                await spritesheet.parse();
                entry.resolve(0, spritesheet);

                // Check and add the multi atlas
                // Heavily influenced and based on:
                // https://github.com/rocket-ua/pixi-tps-loader/blob/master/src/ResourceLoader.js
                const multiPacks = asset?.meta?.related_multi_packs;

                const relatedEntries: SpritesheetAssetCacheEntry[] = [];

                if (multiPacks !== undefined)
                {
                    if (!Array.isArray(multiPacks)) invalidRelatedMultiPacks(multiPacks);

                    const relatedURLs: string[] = [];

                    for (const item of multiPacks)
                    {
                        if (typeof item !== 'string') invalidRelatedMultiPacks(multiPacks);
                        relatedURLs.push(utils.path.toAbsolute(basePath + item));
                    }

                    if (relatedURLs.length > 0)
                    {
                        const relatedSpritesheets: Record<string, Spritesheet | null> = {};

                        // Wait for all related multi packs to be loaded, recursively (waiting their Promise 0)
                        await new Promise<void>((resolve, reject) =>
                        {
                            let pending = 0;
                            const load = async (relatedURL: string) =>
                            {
                                try
                                {
                                    relatedURL = utils.path.toAbsolute(relatedURL);
                                    if (relatedSpritesheets[relatedURL] !== undefined) return;
                                    relatedSpritesheets[relatedURL] = null;
                                    ++pending;

                                    const relatedEntry = spritesheetAssetCache.get(relatedURL);

                                    relatedEntries.push(relatedEntry);

                                    // Don't use await here or deadlock may happen
                                    loader.load(relatedURL)
                                        .then((value) =>
                                        {
                                            if (!(value instanceof Spritesheet))
                                            {
                                                throw new TypeError(
                                                    `[spritesheetAsset] ${relatedURL} in related_multi_packs `
                                                    + `is not a Spritesheet`);
                                            }
                                        })
                                        .catch((reason) =>
                                        {
                                            spritesheetAssetCache.remove(relatedURL);
                                            relatedEntry.reject(reason);
                                        });

                                    const relatedSpritesheet = await relatedEntry.getPromise(0);

                                    relatedSpritesheets[relatedURL] = relatedSpritesheet;

                                    const multiPacks = relatedSpritesheet?.data?.meta?.related_multi_packs;

                                    if (multiPacks !== undefined)
                                    {
                                        if (!Array.isArray(multiPacks)) invalidRelatedMultiPacks(multiPacks);

                                        let basePath = utils.path.dirname(relatedURL);

                                        if (basePath && basePath.lastIndexOf('/') !== (basePath.length - 1))
                                        {
                                            basePath += '/';
                                        }

                                        for (const item of multiPacks)
                                        {
                                            if (typeof item !== 'string') invalidRelatedMultiPacks(multiPacks);
                                            load(utils.path.toAbsolute(basePath + item));
                                        }
                                    }

                                    --pending;
                                    if (pending === 0) resolve();
                                }
                                catch (e)
                                {
                                    reject(e);
                                }
                            };

                            for (const relatedURL of relatedURLs)
                            {
                                load(relatedURL);
                            }
                        });

                        // Fill the spritesheet's linkedSheets field (resolving Promise 1)
                        for (const relatedURL of relatedURLs)
                        {
                            spritesheet.linkedSheets.push(relatedSpritesheets[relatedURL]);
                        }
                    }
                }

                entry.resolve(1, spritesheet);

                // Wait for all related multi packs' linkedSheets field being filled (waiting their Promise 1)
                if (relatedEntries.length > 0)
                {
                    Promise.all(relatedEntries.map((entry) => entry.getPromise(1)));
                }

                return spritesheet;
            }
            catch (e)
            {
                spritesheetAssetCache.remove(url);
                entry.reject(e);
                throw e;
            }
        },

        unload(spritesheet: Spritesheet, loadAsset: LoadAsset<Spritesheet>)
        {
            const url = utils.path.toAbsolute(loadAsset.src);

            spritesheetAssetCache.remove(url);
            spritesheet.destroy(true);
        },
    },
} as AssetExtension<Spritesheet | SpriteSheetJson>;

extensions.add(spritesheetAsset);
