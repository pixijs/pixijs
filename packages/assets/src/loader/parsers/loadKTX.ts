import { BaseTexture, ExtensionType, Texture } from '@pixi/core';
import { parseKTX } from '@pixi/compressed-textures';
import type { Loader } from '../Loader';

import type { LoaderParser } from './LoaderParser';

import { getResolutionOfUrl } from '@pixi/utils';
import type { LoadAsset } from '../types';
import { ALPHA_MODES, MIPMAP_MODES } from '@pixi/constants';
import type { LoadTextureData } from './loadTexture';

const validImages = ['ktx'];

/** Loads KTX textures! */
export const loadKTX = {
    extension: ExtensionType.LoadParser,

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

        const { compressed, uncompressed, kvData } = parseKTX(url, arrayBuffer);

        const resources = compressed ?? uncompressed;

        const options = {
            mipmap: MIPMAP_MODES.OFF,
            alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA,
            resolution: getResolutionOfUrl(url),
            ...asset.data,
        };

        const textures = resources.map((resource) =>
        {
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

} as LoaderParser<Texture | Texture[], LoadTextureData>;

