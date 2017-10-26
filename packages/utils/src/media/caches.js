/**
 * @todo Describe property usage
 *
 * @memberof PIXI.utils
 * @private
 */
export const ProgramCache = {};

/**
 * @todo Describe property usage
 *
 * @memberof PIXI.utils
 * @private
 */
export const TextureCache = Object.create(null);

/**
 * @todo Describe property usage
 *
 * @memberof PIXI.utils
 * @private
 */

export const BaseTextureCache = Object.create(null);
/**
 * Destroys all texture in the cache
 *
 * @memberof PIXI.utils
 * @function destroyTextureCache
 */
export function destroyTextureCache()
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
export function clearTextureCache()
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
