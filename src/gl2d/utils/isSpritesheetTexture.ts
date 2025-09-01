import { Cache } from '../../assets/cache/Cache';
import { type TextureSource } from '../../rendering/renderers/shared/texture/sources/TextureSource';
import { type Texture } from '../../rendering/renderers/shared/texture/Texture';

import type { Spritesheet } from '../../spritesheet/Spritesheet';

/**
 * Checks if a texture is part of a spritesheet.
 * @param texture - The texture to check.
 * @returns The spritesheet if the texture is part of one, otherwise false.
 * @internal
 */
export function isSpritesheetTexture(texture: Texture | TextureSource)
{
    const source = 'isTexture' in texture && texture.isTexture ? texture : texture.source;

    // eslint-disable-next-line dot-notation
    for (const value of Cache['_cache'].values())
    {
        if ('parse' in value && value.parse instanceof Function)
        {
            // now check if the texture is the same as this source
            const isSource = (value as Spritesheet).textureSource === source;
            const val = value as Spritesheet;

            if (isSource)
            {
                return val;
            }
        }
    }

    return false;
}
