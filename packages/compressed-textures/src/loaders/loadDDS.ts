import { checkExtension, createTexture, LoaderParserPriority } from '@pixi/assets';
import { ALPHA_MODES, BaseTexture, extensions, ExtensionType, MIPMAP_MODES, settings, utils } from '@pixi/core';
import { parseDDS } from '../parsers';

import type { Loader, LoaderParser, ResolvedAsset } from '@pixi/assets';
import type { IBaseTextureOptions, Texture } from '@pixi/core';

/** Load our DDS textures! */
export const loadDDS: LoaderParser = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.High,
    },

    name: 'loadDDS',

    test(url: string): boolean
    {
        return checkExtension(url, '.dds');
    },

    async load(url: string, asset: ResolvedAsset, loader: Loader): Promise<Texture | Texture[]>
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
                resolution: utils.getResolutionOfUrl(url),
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
