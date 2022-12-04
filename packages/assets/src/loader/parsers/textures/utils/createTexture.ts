import { Texture } from '@pixi/core';

import type { BaseTexture } from '@pixi/core';
import type { Loader } from '../../../Loader';

export function createTexture(base: BaseTexture, loader: Loader, url: string)
{
    const texture = new Texture(base);

    // make sure to nuke the promise if a texture is destroyed..
    texture.baseTexture.on('dispose', () =>
    {
        delete loader.promiseCache[url];
    });

    return texture;
}
