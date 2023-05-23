import { Texture } from '@pixi/core';
import { Cache } from '../../../../cache/Cache';

import type { BaseTexture } from '@pixi/core';
import type { Loader } from '../../../Loader';

export function createTexture(base: BaseTexture, loader: Loader, url: string)
{
    const texture = new Texture(base);

    // make sure to nuke the promise if a texture is destroyed..
    texture.baseTexture.on('destroy', () =>
    {
        delete loader.promiseCache[url];
        Cache.remove(url);
    });

    return texture;
}
