import { parseKTX } from '@pixi/compressed-textures';
import type { IBaseTextureOptions, Texture } from '@pixi/core';
import { BaseTexture, ExtensionType, extensions } from '@pixi/core';
import type { Loader } from '../../Loader';

import type { LoaderParser } from '../LoaderParser';

import { ALPHA_MODES, MIPMAP_MODES } from '@pixi/constants';
import { settings } from '@pixi/settings';
import { getResolutionOfUrl } from '@pixi/utils';
import type { LoadAsset } from '../../types';
import { checkExtension } from './utils/checkExtension';
import { createTexture } from './utils/createTexture';

/** Loads KTX textures! */
export const loadKTX = {
    extension: ExtensionType.LoadParser,

    test(url: string): boolean
    {
        return checkExtension(url, 'ktx');
    },

    async load(url: string, asset: LoadAsset, loader: Loader): Promise<Texture | Texture[]>
    {
        // get an array buffer...
        const response = await settings.ADAPTER.fetch(url);

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

            return createTexture(base, loader, url);
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

} as LoaderParser<Texture | Texture[], IBaseTextureOptions>;

extensions.add(loadKTX);
