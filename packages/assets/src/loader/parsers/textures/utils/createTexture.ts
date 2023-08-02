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
    texture.baseTexture.once('destroyed', unload);
    texture.once('destroyed', () =>
    {
        if (!base.destroyed)
        {
            unload();
            console.warn('[Assets] A Texture managed by Assets was destroyed but its BaseTexture was not!');
        }
    });

    return texture;
}
