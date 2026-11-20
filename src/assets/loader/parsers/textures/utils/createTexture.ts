import { Texture } from '../../../../../rendering/renderers/shared/texture/Texture';
import { warn } from '../../../../../utils/logging/warn';
import { Cache } from '../../../../cache/Cache';

import type { Rectangle } from '../../../../../maths/shapes/Rectangle';
import type { TextureSource } from '../../../../../rendering/renderers/shared/texture/sources/TextureSource';
import type { Loader } from '../../../Loader';

/**
 * Creates a texture from a source and adds it to the cache.
 * @param source - source of the texture
 * @param loader - loader
 * @param url - url of the texture
 * @param frame - the area of the source the texture shows, if not all of it
 * @ignore
 */
export function createTexture(source: TextureSource, loader: Loader, url: string, frame?: Rectangle)
{
    source.label = url;
    source._sourceOrigin = url;

    const texture = new Texture({
        source,
        label: url,
        frame,
    });

    const unload = () =>
    {
        delete loader.promiseCache[url];

        if (Cache.has(url))
        {
            Cache.remove(url);
        }
    };

    // remove the promise from the loader and the url from the cache when the texture is destroyed
    texture.source.once('destroy', () =>
    {
        if (loader.promiseCache[url])
        {
            // #if _DEBUG
            warn('[Assets] A TextureSource managed by Assets was destroyed instead of unloaded! '
           + 'Use Assets.unload() instead of destroying the TextureSource.');
            // #endif

            unload();
        }
    });

    texture.once('destroy', () =>
    {
        if (!source.destroyed)
        {
            // #if _DEBUG
            warn('[Assets] A Texture managed by Assets was destroyed instead of unloaded! '
             + 'Use Assets.unload() instead of destroying the Texture.');
            // #endif

            unload();
        }
    });

    return texture;
}
