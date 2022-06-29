import { Spritesheet } from '@pixi/spritesheet';
import { CacheParser } from '../CacheParser';

export const cacheSpritesheet: CacheParser<Spritesheet> = {

    test: (asset: Spritesheet) => asset instanceof Spritesheet,

    getCacheableAssets: (keys: string[], asset: Spritesheet) =>
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

        return out;
    }
};
