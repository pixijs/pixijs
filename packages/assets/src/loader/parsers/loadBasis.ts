import { BaseTexture, Texture } from '@pixi/core';
import { LoadAsset, Loader } from '../Loader';

import type { LoaderParser } from './LoaderParser';
import { BasisParser, BASIS_FORMATS, BASIS_FORMAT_TO_TYPE,  TranscoderWorker } from '@pixi/basis';
import { ALPHA_MODES, FORMATS, MIPMAP_MODES, TYPES } from '@pixi/constants';
import { CompressedTextureResource } from '@pixi/compressed-textures';

const validImages = ['basis'];

/**
 * loads our textures!
 * this makes use of imageBitmaps where available.
 * We load the ImageBitmap on a different thread using CentralDispatch
 * We can then use the ImageBitmap as a source for a Pixi Texture
 */
export const loadBasis = {
    test(url: string): boolean
    {
        const tempURL = url.split('?')[0];
        const extension = tempURL.split('.').pop();

        return validImages.includes(extension.toLowerCase());
    },

    async load(url: string, asset: LoadAsset, loader: Loader): Promise<Texture>
    {
        await TranscoderWorker.onTranscoderInitialized;

        // get an array buffer...
        const response = await fetch(url);

        const arrayBuffer = await response.arrayBuffer();

        const resources = await BasisParser.transcode(arrayBuffer);

        const type: TYPES = BASIS_FORMAT_TO_TYPE[resources.basisFormat];
        const format: FORMATS = resources.basisFormat !== BASIS_FORMATS.cTFRGBA32 ? FORMATS.RGB : FORMATS.RGBA;

        if (resources.length > 1)
        {
            console.warn('[PixiJS - loadBasis] Basis contains more than one image. Only the first one will be loaded.');
        }

        const resource = resources[0];

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
    },

    unload(texture: Texture): void
    {
        texture.destroy(true);
    }

} as LoaderParser<Texture, {baseTexture: BaseTexture}>;

