import { MIPMAP_MODES, ALPHA_MODES } from '@pixi/constants';
import { BaseTexture, Texture } from '@pixi/core';

import type { CompressedTextureResource } from '../resources/CompressedTextureResource';

/**
 * Creates base-textures and textures for each compressed-texture resource and adds them into the global
 * texture cache. The first texture has two IDs - `${url}`, `${url}-1`; while the rest have an ID of the
 * form `${url}-i`.
 *
 * @param url - the original address of the resources
 * @param resources - the resources backing texture data
 * @ignore
 */
export function registerCompressedTextures(url: string, resources: CompressedTextureResource[]): void
{
    if (!resources)
    {
        return;
    }

    resources.forEach((resource, i) =>
    {
        const baseTexture = new BaseTexture(resource, {
            mipmap: MIPMAP_MODES.OFF,
            alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA
        });
        const cacheID = `${url}-${i + 1}`;

        BaseTexture.addToCache(baseTexture, cacheID);
        Texture.addToCache(new Texture(baseTexture), cacheID);

        if (i === 0)
        {
            BaseTexture.addToCache(baseTexture, url);
            Texture.addToCache(new Texture(baseTexture), url);
        }
    });
}
