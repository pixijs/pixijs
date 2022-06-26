import { BaseTexture, Texture } from '@pixi/core';
import { parseKTX } from '@pixi/compressed-textures';
import { LoadAsset, Loader } from '../Loader';

import type { LoaderParser } from './LoaderParser';
import { ALPHA_MODES, MIPMAP_MODES } from 'pixi.js';
import { getResolutionOfUrl } from '@pixi/utils';

const validImages = ['ktx'];

/**
 * loads our textures!
 * this makes use of imageBitmaps where available.
 * We load the ImageBitmap on a different thread using CentralDispatch
 * We can then use the ImageBitmap as a source for a Pixi Texture
 */
export const loadKTX = {
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

        const { compressed, uncompressed, kvData } = parseKTX(url, arrayBuffer);

        if (compressed)
        {
            const textures = compressed.map((resource) =>
            {
                const base = new BaseTexture(resource, Object.assign({
                    mipmap: MIPMAP_MODES.OFF,
                    alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA,
                    resolution: getResolutionOfUrl(url),
                    ...asset.data,
                }));

                base.ktxKeyValueData = kvData;

                const texture = new Texture(base);

                texture.baseTexture.on('dispose', () =>
                {
                    delete loader.promiseCache[url];
                });

                return texture;
            });

            return textures[0];
        }
        else if (uncompressed)
        {
            const textures = uncompressed.map((resource) =>
            {
                const base = new BaseTexture(resource, Object.assign({
                    mipmap: MIPMAP_MODES.OFF,
                    alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA,
                    ...asset.data,
                }));

                base.ktxKeyValueData = kvData;

                const texture = new Texture(base);

                // make sure to nuke the promise if a texture is destroyed..

                texture.baseTexture.on('dispose', () =>
                {
                    delete loader.promiseCache[url];
                });

                return texture;
            });

            return textures[0];
        }

        return null;
    },

    unload(texture: Texture): void
    {
        texture.destroy(true);
    }

} as LoaderParser<Texture, {baseTexture: BaseTexture}>;

