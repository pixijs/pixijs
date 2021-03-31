import { MIPMAP_MODES, ALPHA_MODES } from '@pixi/constants';
import { BaseTexture, Texture } from '@pixi/core';

import type { ILoaderResource, IResourceMetadata } from '@pixi/loaders';
import type { CompressedTextureResource } from '../resources/CompressedTextureResource';

/**
 * Result when calling registerCompressedTextures.
 * @ignore
 */
type CompressedTexturesResult = Pick<ILoaderResource, 'textures' | 'texture'>;

/**
 * Creates base-textures and textures for each compressed-texture resource and adds them into the global
 * texture cache. The first texture has two IDs - `${url}`, `${url}-1`; while the rest have an ID of the
 * form `${url}-i`.
 *
 * @param url - the original address of the resources
 * @param resources - the resources backing texture data
 * @ignore
 */
export function registerCompressedTextures(url: string,
    resources: CompressedTextureResource[],
    metadata: IResourceMetadata): CompressedTexturesResult
{
    const result: CompressedTexturesResult = {
        textures: {},
        texture: null,
    };

    if (!resources)
    {
        return result;
    }

    const textures = resources.map((resource) =>
        (
            new Texture(new BaseTexture(resource, Object.assign({
                mipmap: MIPMAP_MODES.OFF,
                alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA
            }, metadata)))
        ));

    textures.forEach((texture, i) =>
    {
        const { baseTexture } = texture;
        const cacheID = `${url}-${i + 1}`;

        BaseTexture.addToCache(baseTexture, cacheID);
        Texture.addToCache(texture, cacheID);

        if (i === 0)
        {
            BaseTexture.addToCache(baseTexture, url);
            Texture.addToCache(texture, url);
            result.texture = texture;
        }

        result.textures[cacheID] = texture;
    });

    return result;
}
