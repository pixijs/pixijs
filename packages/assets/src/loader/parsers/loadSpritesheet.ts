import type { ISpritesheetData } from '@pixi/spritesheet';
import { Spritesheet } from '@pixi/spritesheet';

import { dirname, extname } from '../../utils/path';

import type { Loader } from '../Loader';
import { LoadAsset } from '../types';
import type { LoaderParser } from './LoaderParser';

export interface SpriteSheetJson extends ISpritesheetData
{
    meta: {image: string; scale: string};
}

/**
 * loader plugin that parses sprite sheets!
 * once the json has been loaded this checks to see if the json is spritesheet data.
 * if it is, we load the spritesheets image and parse the data into PIXI.Spritesheet
 * All textures in the sprite sheet are then added to the cache
 */
const loadSpritesheet = {
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

        const imagePath = basePath + asset.meta.image;

        const assets = await loader.load([imagePath]);

        const texture = assets[imagePath];

        const spritesheet = new Spritesheet(
            texture.baseTexture,
            asset,
            options.src,
        );

        await new Promise((r) =>
        {
            spritesheet.parse(r as () => void);
        });

        return spritesheet;
    },

    unload(spritesheet: Spritesheet)
    {
        spritesheet.destroy(true);
    },

} as LoaderParser;

export { loadSpritesheet };

