import { checkExtension, createTexture, LoaderParserPriority } from '@pixi/assets';
import { ALPHA_MODES, BaseTexture, extensions, ExtensionType, MIPMAP_MODES, settings, utils } from '@pixi/core';
import { parseKTX } from '../parsers';

import type { Loader, LoaderParser, ResolvedAsset } from '@pixi/assets';
import type { IBaseTextureOptions, Texture } from '@pixi/core';

/** Loads KTX textures! */
export const loadKTX = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.High,
    },

    name: 'loadKTX',

    test(url: string): boolean
    {
        return checkExtension(url, '.ktx');
    },

    async load(url: string, asset: ResolvedAsset, loader: Loader): Promise<Texture | Texture[]>
    {
        // get an array buffer...
        const response = await settings.ADAPTER.fetch(url);

        const arrayBuffer = await response.arrayBuffer();

        const { compressed, uncompressed, kvData } = parseKTX(url, arrayBuffer);

        const resources = compressed ?? uncompressed;

        const options = {
            mipmap: MIPMAP_MODES.OFF,
            alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA,
            resolution: utils.getResolutionOfUrl(url),
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

            const res = (resource as typeof uncompressed[0]).resource ?? (resource as typeof compressed[0]);

            const base = new BaseTexture(res, options);

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
