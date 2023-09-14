import { Texture } from '../../../../../rendering/renderers/shared/texture/Texture';
import { Cache } from '../../../../cache/Cache';

import type { TextureSource } from '../../../../../rendering/renderers/shared/texture/sources/TextureSource';
import type { Loader } from '../../../Loader';

export function createTexture(source: TextureSource, loader: Loader, url: string)
{
    const texture = new Texture({
        source,
        label: url,
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
    texture.once('destroy', () =>
    {
        if (url in loader.promiseCache)
        {
            console.warn('[Assets] A BaseTexture managed by Assets was destroyed instead of unloaded! '
                + 'Use Assets.unload() instead of destroying the BaseTexture.');
            unload();
        }
    });
    texture.source.once('destroy', () =>
    {
        if (!source.destroyed)
        {
            console.warn('[Assets] A Texture managed by Assets was destroyed instead of unloaded! '
                + 'Use Assets.unload() instead of destroying the Texture.');
            unload();
        }
    });

    return texture;
}
