import { Texture } from '@pixi/core';
import { Cache } from '../../../../cache/Cache';

import type { BaseTexture } from '@pixi/core';
import type { Loader } from '../../../Loader';

export function createTexture(base: BaseTexture, loader: Loader, url: string)
{
    // make sure the resource is destroyed when the base texture is destroyed
    base.resource.internal = true;

    const texture = new Texture(base);
    const unload = () =>
    {
        delete loader.promiseCache[url];

        if (Cache.has(url))
        {
            Cache.remove(url);
        }
    };

    // remove the promise from the loader and the url from the cache when the texture is destroyed
    texture.baseTexture.once('destroyed', () =>
    {
        if (url in loader.promiseCache)
        {
            console.warn('[Assets] A BaseTexture managed by Assets was destroyed instead of unloaded! '
                + 'Use Assets.unload() instead of destroying the BaseTexture.');
            unload();
        }
    });
    texture.once('destroyed', () =>
    {
        if (!base.destroyed)
        {
            console.warn('[Assets] A Texture managed by Assets was destroyed instead of unloaded! '
                + 'Use Assets.unload() instead of destroying the Texture.');
            unload();
        }
    });

    return texture;
}
