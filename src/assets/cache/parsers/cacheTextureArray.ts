import { ExtensionType } from '../../../extensions/Extensions';
import { Texture } from '../../../rendering/renderers/shared/texture/Texture';

import type { CacheParser } from '../CacheParser';

/**
 * Returns an object of textures from an array of textures to be cached
 *
 * This will be added automatically if `pixi.js/assets` is imported
 * @memberof assets
 */
export const cacheTextureArray: CacheParser<Texture[]> = {
    extension: ExtensionType.CacheParser,

    test: (asset: any[]) => Array.isArray(asset) && asset.every((t) => t instanceof Texture),

    getCacheableAssets: (keys: string[], asset: Texture[]) =>
    {
        const out: Record<string, Texture> = {};

        keys.forEach((key: string) =>
        {
            asset.forEach((item: Texture, i: number) =>
            {
                out[key + (i === 0 ? '' : i + 1)] = item;
            });
        });

        return out;
    }
};
