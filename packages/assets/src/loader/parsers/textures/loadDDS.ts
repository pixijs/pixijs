import { parseDDS } from '@pixi/compressed-textures';
import type { IBaseTextureOptions, Texture } from '@pixi/core';
import { BaseTexture, ExtensionType, extensions } from '@pixi/core';
import { getResolutionOfUrl } from '@pixi/utils';
import type { Loader } from '../../Loader';

import { ALPHA_MODES, MIPMAP_MODES } from '@pixi/constants';
import { settings } from '@pixi/settings';
import type { LoadAsset } from '../../types';
import type { LoaderParser } from '../LoaderParser';
import { checkExtension } from './utils/checkExtension';
import { createTexture } from './utils/createTexture';

/** Load our DDS textures! */
export const loadDDS: LoaderParser = {
    extension: ExtensionType.LoadParser,

    test(url: string): boolean
    {
        return checkExtension(url, 'dds');
    },

    async load(url: string, asset: LoadAsset, loader: Loader): Promise<Texture | Texture[]>
    {
        // get an array buffer...
        const response = await settings.ADAPTER.fetch(url);

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

extensions.add(loadDDS);
