import { Texture } from '../../../../../rendering/renderers/shared/texture/Texture';

import type { TextureSource } from '../../../../../rendering/renderers/shared/texture/sources/TextureSource';
import type { Loader } from '../../../Loader';

export function createTexture(source: TextureSource, _loader: Loader, _url: string)
{
    const texture = new Texture({
        source,
        label: _url,
    });

    // TODO: make sure to nuke the promise if a texture is destroyed..
    // texture.baseTexture.on('dispose', () =>
    // {
    //     delete loader.promiseCache[url];
    // });

    return texture;
}
