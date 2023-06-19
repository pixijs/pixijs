import { extensions, ExtensionType, Texture } from '@pixi/core';

import type { CacheParser } from '../CacheParser';

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

extensions.add(cacheTextureArray);
