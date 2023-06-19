import { checkExtension, createTexture, LoaderParserPriority } from '@pixi/assets';
import { CompressedTextureResource } from '@pixi/compressed-textures';
import { ALPHA_MODES, BaseTexture, extensions, ExtensionType, FORMATS, MIPMAP_MODES, settings } from '@pixi/core';
import { BASIS_FORMAT_TO_TYPE, BASIS_FORMATS } from '../Basis';
import { TranscoderWorker } from '../TranscoderWorker';
import { BasisParser } from './BasisParser';

import type { Loader, LoaderParser, ResolvedAsset } from '@pixi/assets';
import type { IBaseTextureOptions, Texture, TYPES } from '@pixi/core';

/** Load BASIS textures! */
export const loadBasis = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.High,
    },

    name: 'loadBasis',

    test(url: string): boolean
    {
        return checkExtension(url, '.basis');
    },

    async load(url: string, asset: ResolvedAsset, loader: Loader): Promise<Texture | Texture[]>
    {
        await TranscoderWorker.onTranscoderInitialized;

        // get an array buffer...
        const response = await settings.ADAPTER.fetch(url);

        const arrayBuffer = await response.arrayBuffer();

        const resources = await BasisParser.transcode(arrayBuffer);

        const type: TYPES = BASIS_FORMAT_TO_TYPE[resources.basisFormat];
        const format: FORMATS = resources.basisFormat !== BASIS_FORMATS.cTFRGBA32 ? FORMATS.RGB : FORMATS.RGBA;

        const textures = resources.map((resource) =>
        {
            const base = new BaseTexture(resource, {
                mipmap: resource instanceof CompressedTextureResource && resource.levels > 1
                    ? MIPMAP_MODES.ON_MANUAL
                    : MIPMAP_MODES.OFF,
                alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA,
                type,
                format,
                ...asset.data,
            });

            return createTexture(base, loader, url);
        });

        return textures.length === 1 ? textures[0] : textures;
    },

    unload(texture): void
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

extensions.add(loadBasis);
