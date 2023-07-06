import { Texture } from '@pixi/core';

import type { BaseTexture } from '@pixi/core';
import type { Loader } from '../../../Loader';

export function createTexture(base: BaseTexture, loader: Loader, url: string)
{
    // make sure the resource is destroyed when the base texture is destroyed
    base.resource.internal = true;

    const texture = new Texture(base);

    // make sure to nuke the promise if a texture is destroyed..
    texture.baseTexture.on('dispose', () =>
    {
        delete loader.promiseCache[url];
    });

    return texture;
}
