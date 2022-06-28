import { BaseTexture, Texture } from '@pixi/core';
import { getResolutionOfUrl } from '@pixi/utils';
import { parseDDS } from '@pixi/compressed-textures';
import { Loader } from '../Loader';

import type { LoaderParser } from './LoaderParser';
import { LoadAsset } from '../types';
import { ALPHA_MODES, MIPMAP_MODES } from '@pixi/constants';

const validImages = ['dds'];

/**
 * loads our textures!
 * this makes use of imageBitmaps where available.
 * We load the ImageBitmap on a different thread using CentralDispatch
 * We can then use the ImageBitmap as a source for a Pixi Texture
 */
export const loadDDS = {
    test(url: string): boolean
    {
        const tempURL = url.split('?')[0];
        const extension = tempURL.split('.').pop();

        return validImages.includes(extension.toLowerCase());
    },

    async load(url: string, asset: LoadAsset, loader: Loader): Promise<Texture | Texture[]>
    {
        // get an array buffer...
        const response = await fetch(url);

        const arrayBuffer = await response.arrayBuffer();

        const resources = parseDDS(arrayBuffer);

        const textures = resources.map((resource) =>
        {
            const base = new BaseTexture(resource, {
                mipmap: MIPMAP_MODES.OFF,
                alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA,
                resolution: getResolutionOfUrl(url),
                ...asset.data,
            });

            const texture = new Texture(base);

            texture.baseTexture.on('dispose', () =>
            {
                delete loader.promiseCache[url];
            });

            return texture;
        });

        return textures.length === 1 ? textures[0] : textures;
    },

    unload(texture: Texture | Texture[]): void
    {
        if (Array.isArray(texture))
        {
            texture.forEach((t) => t.destroy(true));
        }
        else
        {
            texture.destroy(true);
        }
    }

} as LoaderParser<Texture | Texture[], {baseTexture: BaseTexture}>;

