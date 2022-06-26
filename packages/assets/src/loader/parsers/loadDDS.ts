import { BaseTexture, Texture } from '@pixi/core';
import { getResolutionOfUrl } from '@pixi/utils';
import { parseDDS } from '@pixi/compressed-textures';
import { LoadAsset, Loader } from '../Loader';

import type { LoaderParser } from './LoaderParser';

import { ALPHA_MODES, MIPMAP_MODES } from 'pixi.js';

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

    async load(url: string, asset: LoadAsset, loader: Loader): Promise<Texture>
    {
        // get an array buffer...
        const response = await fetch(url);

        const arrayBuffer = await response.arrayBuffer();

        const compressed = parseDDS(arrayBuffer);

        // TODO - currently if this is larger than 1, we should be doing parsing the
        // textures as either a textureArray or a cubemap.
        if (compressed.length > 1)
        {
            console.warn('[PixiJS - loadDDS] DDS contains more than one image. Only the first one will be loaded.');
        }

        const resource = compressed[0];

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
    },

    unload(texture: Texture): void
    {
        texture.destroy(true);
    }

} as LoaderParser<Texture, {baseTexture: BaseTexture}>;

