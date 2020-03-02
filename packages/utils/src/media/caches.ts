import type { Program, Texture, BaseTexture } from '@pixi/core';

/**
 * @todo Describe property usage
 *
 * @static
 * @name ProgramCache
 * @memberof PIXI.utils
 * @type {Object}
 */
export const ProgramCache: {[key: string]: Program} = {};

/**
 * @todo Describe property usage
 *
 * @static
 * @name TextureCache
 * @memberof PIXI.utils
 * @type {Object}
 */
export const TextureCache: {[key: string]: Texture} = Object.create(null);

/**
 * @todo Describe property usage
 *
 * @static
 * @name BaseTextureCache
 * @memberof PIXI.utils
 * @type {Object}
 */
export const BaseTextureCache: {[key: string]: BaseTexture} = Object.create(null);

/**
 * Destroys all texture in the cache
 *
 * @memberof PIXI.utils
 * @function destroyTextureCache
 */
export function destroyTextureCache(): void
{
    let key;

    for (key in TextureCache)
    {
        TextureCache[key].destroy();
    }
    for (key in BaseTextureCache)
    {
        BaseTextureCache[key].destroy();
    }
}

/**
 * Removes all textures from cache, but does not destroy them
 *
 * @memberof PIXI.utils
 * @function clearTextureCache
 */
export function clearTextureCache(): void
{
    let key;

    for (key in TextureCache)
    {
        delete TextureCache[key];
    }
    for (key in BaseTextureCache)
    {
        delete BaseTextureCache[key];
    }
}
