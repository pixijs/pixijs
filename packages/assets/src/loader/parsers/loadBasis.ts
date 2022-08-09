import { BaseTexture, extensions, ExtensionType, Texture } from '@pixi/core';

import type { LoaderParser } from './LoaderParser';
import { BasisParser, BASIS_FORMATS, BASIS_FORMAT_TO_TYPE,  TranscoderWorker } from '@pixi/basis';
import type { TYPES } from '@pixi/constants';
import { ALPHA_MODES, FORMATS, MIPMAP_MODES } from '@pixi/constants';
import { CompressedTextureResource } from '@pixi/compressed-textures';
import type { LoadAsset } from '../types';
import type { Loader } from '../Loader';
import type { LoadTextureData } from './loadTexture';
import { settings } from '@pixi/settings';

const validImages = ['basis'];

/** Load BASIS textures! */
export const loadBasis = {
    extension: ExtensionType.LoadParser,

    test(url: string): boolean
    {
        const tempURL = url.split('?')[0];
        const extension = tempURL.split('.').pop();

        return validImages.includes(extension.toLowerCase());
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

            const texture =  new Texture(base);

            // make sure to nuke the promise if a texture is destroyed..
            texture.baseTexture.on('dispose', () =>
            {
                delete loader.promiseCache[url];
            });

            return texture;
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

} as LoaderParser<Texture | Texture[], LoadTextureData>;

extensions.add(loadBasis);
