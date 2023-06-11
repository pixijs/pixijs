import { Texture } from '@pixi/core';
import { Cache } from '../../../../cache/Cache';

import type { BaseTexture } from '@pixi/core';
import type { Loader } from '../../../Loader';

export function createTexture(base: BaseTexture, loader: Loader, url: string)
{
    const texture = new Texture(base);

    // remove the promise from the loader and the url from the cache when the texture is destroyed
    texture.baseTexture.once('destroyed', () =>
    {
        delete loader.promiseCache[url];

        if (Cache.has(url))
        {
            Cache.remove(url);
        }
    });

    return texture;
}
