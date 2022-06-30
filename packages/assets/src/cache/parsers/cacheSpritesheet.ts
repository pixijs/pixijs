import { Spritesheet } from '@pixi/spritesheet';
import { dirname } from '../../utils';
import { CacheParser } from '../CacheParser';

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
        const basePath = dirname(keys[0]);

        asset.linkedSheets.forEach((item: Spritesheet, i) =>
        {
            const out2 = getCacheableAssets([`${basePath}/${asset.data.meta.related_multi_packs[i]}`], item, true);

            Object.assign(out, out2);
        });
    }

    return out;
}

export const cacheSpritesheet: CacheParser<Spritesheet> = {

    test: (asset: Spritesheet) => asset instanceof Spritesheet,

    getCacheableAssets: (keys: string[], asset: Spritesheet) => getCacheableAssets(keys, asset, false)
};
