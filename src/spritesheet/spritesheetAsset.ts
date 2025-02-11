import { LoaderParserPriority } from '../assets/loader/parsers/LoaderParser';
import { Resolver } from '../assets/resolver/Resolver';
import { copySearchParams } from '../assets/utils/copySearchParams';
import { ExtensionType } from '../extensions/Extensions';
import { Texture } from '../rendering/renderers/shared/texture/Texture';
import { path } from '../utils/path';
import { Spritesheet } from './Spritesheet';

import type { AssetExtensionAdvanced } from '../assets/AssetExtension';
import type { Loader } from '../assets/loader/Loader';
import type { ResolvedAsset } from '../assets/types';
import type { TextureSourceOptions } from '../rendering/renderers/shared/texture/sources/TextureSource';
import type { SpritesheetData } from './Spritesheet';

export interface SpriteSheetJson extends SpritesheetData
{
    meta: {
        image: string;
        scale: string;
        related_multi_packs?: string[];
    };
}

const validImages = ['jpg', 'png', 'jpeg', 'avif', 'webp',
    'basis', 'etc2', 'bc7', 'bc6h', 'bc5', 'bc4', 'bc3', 'bc2', 'bc1', 'eac', 'astc'];

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
        const basePath = path.dirname(keys[0]);

        asset.linkedSheets.forEach((item: Spritesheet, i) =>
        {
            const out2 = getCacheableAssets([`${basePath}/${asset.data.meta.related_multi_packs[i]}`], item, true);

            Object.assign(out, out2);
        });
    }

    return out;
}

/**
 * Asset extension for loading spritesheets
 * @example
 * import { Assets } from 'pixi.js';
 *
 * Assets.load({
 *     alias: 'spritesheet',
 *     src: 'path/to/spritesheet.json',
 *     data: {
 *         ignoreMultiPack: true,
 *         textureOptions: {
 *             scaleMode: "nearest"
 *         }
 *     }
 * })
 * @type {AssetExtension}
 * @memberof assets
 */
export const spritesheetAsset = {
    extension: ExtensionType.Asset,
    /** Handle the caching of the related Spritesheet Textures */
    cache: {
        test: (asset: Spritesheet) => asset instanceof Spritesheet,
        getCacheableAssets: (keys: string[], asset: Spritesheet) => getCacheableAssets(keys, asset, false),
    },
    /** Resolve the resolution of the asset. */
    resolver: {
        extension: {
            type: ExtensionType.ResolveParser,
            name: 'resolveSpritesheet',
        },
        test: (value: string): boolean =>
        {
            const tempURL = value.split('?')[0];
            const split = tempURL.split('.');
            const extension = split.pop();
            const format = split.pop();

            return extension === 'json' && validImages.includes(format);
        },
        parse: (value: string) =>
        {
            const split = value.split('.');

            return {
                resolution: parseFloat(Resolver.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
                format: split[split.length - 2],
                src: value,
            };
        },
    },
    /**
     * Loader plugin that parses sprite sheets!
     * once the JSON has been loaded this checks to see if the JSON is spritesheet data.
     * If it is, we load the spritesheets image and parse the data into Spritesheet
     * All textures in the sprite sheet are then added to the cache
     */
    loader: {
        name: 'spritesheetLoader',

        extension: {
            type: ExtensionType.LoadParser,
            priority: LoaderParserPriority.Normal,
            name: 'spritesheetLoader',
        },

        async testParse(asset: SpriteSheetJson, options: ResolvedAsset): Promise<boolean>
        {
            return (path.extname(options.src).toLowerCase() === '.json' && !!asset.frames);
        },

        async parse(
            asset: SpriteSheetJson,
            options: ResolvedAsset<{
                texture?: Texture,
                imageFilename?: string,
                ignoreMultiPack?: boolean,
                textureOptions?: TextureSourceOptions
            }>,
            loader?: Loader
        ): Promise<Spritesheet>
        {
            const {
                texture: imageTexture, // if user need to use preloaded texture
                imageFilename, // if user need to use custom filename (not from jsonFile.meta.image)
                textureOptions // if user need to set texture options on texture
            } = options?.data ?? {};

            let basePath = path.dirname(options.src);

            if (basePath && basePath.lastIndexOf('/') !== (basePath.length - 1))
            {
                basePath += '/';
            }

            let texture: Texture;

            if (imageTexture instanceof Texture)
            {
                texture = imageTexture;
            }
            else
            {
                const imagePath = copySearchParams(basePath + (imageFilename ?? asset.meta.image), options.src);

                const assets = await loader.load<Texture>([{ src: imagePath, data: textureOptions }]);

                texture = assets[imagePath];
            }

            const spritesheet = new Spritesheet(
                texture.source,
                asset,
            );

            await spritesheet.parse();

            // Check and add the multi atlas
            // Heavily influenced and based on https://github.com/rocket-ua/pixi-tps-loader/blob/master/src/ResourceLoader.js
            const multiPacks = asset?.meta?.related_multi_packs;

            if (Array.isArray(multiPacks))
            {
                const promises: Promise<Spritesheet<SpriteSheetJson>>[] = [];

                for (const item of multiPacks)
                {
                    if (typeof item !== 'string')
                    {
                        continue;
                    }

                    let itemUrl = basePath + item;

                    // Check if the file wasn't already added as multipack
                    if (options.data?.ignoreMultiPack)
                    {
                        continue;
                    }

                    itemUrl = copySearchParams(itemUrl, options.src);

                    promises.push(loader.load<Spritesheet<SpriteSheetJson>>({
                        src: itemUrl,
                        data: {
                            textureOptions,
                            ignoreMultiPack: true,
                        }
                    }));
                }

                const res = await Promise.all(promises);

                spritesheet.linkedSheets = res;
                res.forEach((item) =>
                {
                    item.linkedSheets = [spritesheet].concat(spritesheet.linkedSheets.filter((sp) => (sp !== item)));
                });
            }

            return spritesheet;
        },

        async unload(spritesheet: Spritesheet, _resolvedAsset, loader)
        {
            await loader.unload(spritesheet.textureSource._sourceOrigin);

            spritesheet.destroy(false);
        },
    }
} satisfies AssetExtensionAdvanced<SpriteSheetJson, Spritesheet, Spritesheet, Spritesheet>;
