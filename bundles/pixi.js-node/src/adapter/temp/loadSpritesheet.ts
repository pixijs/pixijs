import type { ISpritesheetData } from '@pixi/spritesheet';
import { Spritesheet } from '@pixi/spritesheet';
import { TextureCache } from '@pixi/utils';
import { loadNodeTexture } from '../loadNodeTexture';
import path from 'path';

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
    testParse(asset: SpriteSheetJson, options: any): boolean
    {
        const tempUrl = new URL(options.src);
        const extension = path.extname(tempUrl.pathname);

        return (extension.includes('.json') && !!asset.frames);
    },

    async parse(asset: SpriteSheetJson, options: any): Promise<Spritesheet>
    {
        let basePath = path.dirname(options.src);

        if (basePath && basePath.lastIndexOf('/') !== (basePath.length - 1))
        {
            basePath += '/';
        }

        const imagePath = basePath + asset.meta.image;

        const texture = await loadNodeTexture.load(imagePath, options);

        const spritesheet = new Spritesheet(
            texture.baseTexture,
            asset,
            options.src,
        );

        await new Promise((r) =>
        {
            spritesheet.parse(r as () => void);
        });

        Object.keys(spritesheet.textures).forEach((key) =>
        {
            TextureCache[key] = spritesheet.textures[key];
        });

        return spritesheet;
    },

};

export { loadSpritesheet };

