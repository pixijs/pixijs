import { dirname, extname } from 'path';
import { BaseTexture, ISpritesheetData, Spritesheet, Texture } from 'pixi.js';

import { loadAssets } from '../Loader';
import { LoadPlugin } from './LoadPlugin';

export interface SpriteSheetJson extends ISpritesheetData
{
    meta: {image: string, scale: string};
}

/**
 * loader plugin that parses sprite sheets!
 * once the json has been loaded this checks to see if the json is spritesheet data.
 * if it is, we load the spritesheets image and parse the data into PIXI.Spritesheet
 * All textures in the sprite sheet are then added to the cache
 */
const loadSpritesheet = {
    testParse(asset: SpriteSheetJson, url: string): boolean
    {
        return (extname(url).includes('.json') && !!asset.frames);
    },

    async parse(asset: SpriteSheetJson, url: string): Promise<Spritesheet>
    {
        let basePath = dirname(url);

        if (basePath && basePath.lastIndexOf('/') !== (basePath.length - 1))
        {
            basePath += '/';
        }

        const imagePath = basePath + asset.meta.image;

        const assets = await loadAssets([imagePath]);

        const texture = assets[imagePath];

        const cacheId = url.split('.')[0];

        BaseTexture.addToCache(texture.baseTexture, cacheId);
        Texture.addToCache(texture, cacheId);

        const spritesheet =  new Spritesheet(
            texture.baseTexture,
            asset,
            url,
        );

        await new Promise((r) =>
        {
            spritesheet.parse(r as () => void);
        });

        return spritesheet;
    },
} as LoadPlugin;

export { loadSpritesheet };

