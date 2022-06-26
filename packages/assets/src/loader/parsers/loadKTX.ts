import { BaseTexture, Texture } from '@pixi/core';
import { parseKTX } from '@pixi/compressed-textures';
import { LoadAsset, Loader } from '../Loader';

import type { LoaderParser } from './LoaderParser';
import { ALPHA_MODES, MIPMAP_MODES } from 'pixi.js';
import { getResolutionOfUrl } from '@pixi/utils';

const validImages = ['ktx'];

/**
 * loads our textures!
 * this makes use of imageBitmaps where available.
 * We load the ImageBitmap on a different thread using CentralDispatch
 * We can then use the ImageBitmap as a source for a Pixi Texture
 */
export const loadKTX = {
    test(url: string): boolean
    {
        const tempURL = url.split('?')[0];
        const extension = tempURL.split('.').pop();

        return validImages.includes(extension.toLowerCase());
    },

    async load(url: string, asset: LoadAsset, loader: Loader): Promise<Texture>
    {
        // get an array buffer...
        const response = await fetch(url);

        const arrayBuffer = await response.arrayBuffer();

        const { compressed, uncompressed, kvData } = parseKTX(url, arrayBuffer);

        const resources = compressed ?? uncompressed;

        const options = {
            mipmap: MIPMAP_MODES.OFF,
            alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA,
            resolution: getResolutionOfUrl(url),
            ...asset.data,
        };

        // TODO - currently if this is larger than 1, we should be doing parsing the
        // textures as either a textureArray or a cubemap.
        if (resources.length > 1)
        {
            console.warn('[PixiJS - loadKTX] KTX contains more than one image. Only the first one will be loaded.');
        }

        const resource = resources[0];

        if (resources === uncompressed)
        {
            Object.assign(options, {
                type: (resource as typeof uncompressed[0]).type,
                format: (resource as typeof uncompressed[0]).format,
            });
        }

        const base = new BaseTexture(resource, options);

        base.ktxKeyValueData = kvData;

        const texture = new Texture(base);

        texture.baseTexture.on('dispose', () =>
        {
            delete loader.promiseCache[url];
        });

        return texture;
    },

    unload(texture: Texture): void
    {
        texture.destroy(true);
    }

} as LoaderParser<Texture, {baseTexture: BaseTexture}>;

