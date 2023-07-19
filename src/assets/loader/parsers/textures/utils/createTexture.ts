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

    // TODO: make sure to nuke the promise if a texture is destroyed..
    texture.source.on('destroy', () =>
    {
        delete loader.promiseCache[url];

        if (Cache.has(url))
        {
            Cache.remove(url);
        }
    });

    return texture;
}
