import { checkExtension } from './utils/checkExtension';
import { createTexture } from './utils/createTexture';

import type { IBaseTextureOptions, Texture } from '@pixi/core';
import { BaseTexture, ExtensionType, extensions } from '@pixi/core';

import { BasisParser, BASIS_FORMATS, BASIS_FORMAT_TO_TYPE, TranscoderWorker } from '@pixi/basis';
import { CompressedTextureResource } from '@pixi/compressed-textures';
import type { TYPES } from '@pixi/constants';
import { ALPHA_MODES, FORMATS, MIPMAP_MODES } from '@pixi/constants';
import { settings } from '@pixi/settings';
import type { Loader } from '../../Loader';
import type { LoadAsset } from '../../types';
import type { LoaderParser } from '../LoaderParser';
import { LoaderParserPriority } from '../LoaderParser';

/** Load BASIS textures! */
export const loadBasis = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.High,
    },

    test(url: string): boolean
    {
        return checkExtension(url, 'basis');
    },

    async load(url: string, asset: LoadAsset, loader: Loader): Promise<Texture | Texture[]>
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
