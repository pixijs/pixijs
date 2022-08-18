import type { Texture } from '@pixi/core';
import { ExtensionType } from '@pixi/core';
import type { ISpritesheetData } from '@pixi/spritesheet';
import { Spritesheet } from '@pixi/spritesheet';
import { path } from '@pixi/utils';
import type { Loader } from '../Loader';
import type { LoadAsset } from '../types';
import type { LoaderParser } from './LoaderParser';

interface SpriteSheetJson extends ISpritesheetData
{
    meta: {
        image: string;
        scale: string;
        // eslint-disable-next-line camelcase
        related_multi_packs?: string[];
    };
}

/**
 * Loader plugin that parses sprite sheets!
 * once the JSON has been loaded this checks to see if the JSON is spritesheet data.
 * If it is, we load the spritesheets image and parse the data into PIXI.Spritesheet
 * All textures in the sprite sheet are then added to the cache
 */
export const loadSpritesheet = {
    extension: ExtensionType.LoadParser,

    async testParse(asset: SpriteSheetJson, options: LoadAsset): Promise<boolean>
    {
        return (path.extname(options.src).includes('.json') && !!asset.frames);
    },

    async parse(asset: SpriteSheetJson, options: LoadAsset, loader: Loader): Promise<Spritesheet>
    {
        let basePath = path.dirname(options.src);

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
            options.src,
        );

        await spritesheet.parse();

        // Check and add the multi atlas
        // Heavily influenced and based on https://github.com/rocket-ua/pixi-tps-loader/blob/master/src/ResourceLoader.js
        // eslint-disable-next-line camelcase
        const multiPacks = asset?.meta?.related_multi_packs;

        if (Array.isArray(multiPacks))
        {
            const promises: Promise<Spritesheet>[] = [];

            for (const item of multiPacks)
            {
                if (typeof item !== 'string')
                {
                    continue;
                }

                const itemUrl = basePath + item;

                // Check if the file wasn't already added as multipack
                if (options.data?.ignoreMultiPack)
                {
                    continue;
                }

                promises.push(loader.load({
                    src: itemUrl,
                    data: {
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

    unload(spritesheet: Spritesheet)
    {
        spritesheet.destroy(true);
    },

} as LoaderParser;
