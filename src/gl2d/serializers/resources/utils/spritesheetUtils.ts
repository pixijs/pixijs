import { Cache } from '../../../../assets/cache/Cache';
import { type TextureSource } from '../../../../rendering/renderers/shared/texture/sources/TextureSource';
import { type Texture } from '../../../../rendering/renderers/shared/texture/Texture';
import { type Spritesheet } from '../../../../spritesheet/Spritesheet';

/**
 * Finds a Spritesheet for a given TextureSource in the Cache.
 * @param source - The TextureSource to find a Spritesheet for
 * @returns The Spritesheet and the cache key if found, otherwise null
 * @category gl2d
 * @internal
 */
export function findSpritesheetForSource(source: TextureSource): { spritesheet: Spritesheet; cacheKey: string } | null
{
    // eslint-disable-next-line dot-notation
    const cache = Cache['_cache'];

    for (const [key, value] of cache.entries())
    {
        if (value && typeof value === 'object' && 'parse' in value && typeof value.parse === 'function')
        {
            if ((value as Spritesheet).textureSource === source)
            {
                return { spritesheet: value as Spritesheet, cacheKey: key };
            }
        }
    }

    return null;
}

/**
 * Finds the frame name for a given Texture in a Spritesheet.
 * @param spritesheet - The Spritesheet to find the frame name for
 * @param texture - The Texture to find the frame name for
 * @returns The frame name if found, otherwise undefined
 * @category gl2d
 * @internal
 */
export function findFrameName(spritesheet: Spritesheet, texture: Texture): string | undefined
{
    const textures = spritesheet.textures;

    for (const name in textures)
    {
        if (textures[name] === texture)
        {
            return name;
        }
    }

    return undefined;
}
