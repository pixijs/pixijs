import type { ISpritesheetData } from '@pixi/spritesheet';
import { Spritesheet } from '@pixi/spritesheet';

import { Cache } from '../../cache/Cache';
import { dirname, extname } from '../../utils/path';
import type { Loader } from '../Loader';
import { LoadAsset } from '../types';
import type { LoaderParser } from './LoaderParser';

export interface SpriteSheetJson extends ISpritesheetData
{
    meta: {
        image: string;
        scale: string;
        // eslint-disable-next-line camelcase
        related_multi_packs: string[];
    };
}

/**
 * loader plugin that parses sprite sheets!
 * once the json has been loaded this checks to see if the json is spritesheet data.
 * if it is, we load the spritesheets image and parse the data into PIXI.Spritesheet
 * All textures in the sprite sheet are then added to the cache
 */
export const loadSpritesheet = {
    testParse(asset: SpriteSheetJson, options: LoadAsset): boolean
    {
        return (extname(options.src).includes('.json') && !!asset.frames);
    },

    async parse(asset: SpriteSheetJson, options: LoadAsset, loader: Loader): Promise<Spritesheet>
    {
        let basePath = dirname(options.src);

        if (basePath && basePath.lastIndexOf('/') !== (basePath.length - 1))
        {
            basePath += '/';
        }

        // Check and add the multi atlas
        // Heavily influenced and based on https://github.com/rocket-ua/pixi-tps-loader/blob/master/src/ResourceLoader.js
        // eslint-disable-next-line camelcase
        const multiPacks = asset?.meta?.related_multi_packs;

        if (Array.isArray(multiPacks))
        {
            const promises = [];

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

            await Promise.all(promises);
        }

        const imagePath = basePath + asset.meta.image;

        const assets = await loader.load([imagePath]);

        const texture = assets[imagePath];

        const spritesheet = new Spritesheet(
            texture.baseTexture,
            asset,
            options.src,
        );

        await spritesheet.parse();

        // TODO.. probably want to move this to be somewhere different, but works ok for now...
        Object.keys(spritesheet.textures).forEach((key) =>
        {
            Cache.set(key, spritesheet.textures[key]);
        });

        return spritesheet;
    },

    unload(spritesheet: Spritesheet)
    {
        // TODO.. probably want to move this to be somewhere different, but works ok for now...
        Object.keys(spritesheet.textures).forEach((key) =>
        {
            Cache.remove(key);
        });

        spritesheet.destroy(true);
    }
} as LoaderParser;
