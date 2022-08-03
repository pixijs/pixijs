import { BaseTexture, extensions, ExtensionType, Texture } from '@pixi/core';
import { settings } from '@pixi/settings';
import { getResolutionOfUrl } from '@pixi/utils';
import type { Loader } from '../Loader';
import type { LoadAsset } from '../types';

import type { LoaderParser } from './LoaderParser';
import { WorkerManager } from './WorkerManager';

const validImages = ['jpg', 'png', 'jpeg', 'avif', 'webp'];

/**
 * Returns a promise that resolves an ImageBitmaps.
 * This function is designed to be used by a worker.
 * Part of WorkerManager!
 * @param url - The image to load an image bitmap for
 */
export async function loadImageBitmap(url: string): Promise<ImageBitmap>
{
    const response = await settings.ADAPTER.fetch(url);
    const imageBlob =  await response.blob();
    const imageBitmap = await createImageBitmap(imageBlob);

    return imageBitmap;
}

export type LoadTextureData = {
    baseTexture: BaseTexture;
};

/**
 * Loads our textures!
 * this makes use of imageBitmaps where available.
 * We load the ImageBitmap on a different thread using the WorkerManager
 * We can then use the ImageBitmap as a source for a Pixi Texture
 */
export const loadTextures = {
    extension: ExtensionType.LoadParser,

    config: {
        preferWorkers: true,
    },

    test(url: string): boolean
    {
        const tempURL = url.split('?')[0];
        const extension = tempURL.split('.').pop();

        return validImages.includes(extension);
    },

    async load(url: string, asset: LoadAsset<LoadTextureData>, loader: Loader): Promise<Texture>
    {
        let src: any = null;

        if (window.createImageBitmap)
        {
            src = this.config.preferWorkers ? await WorkerManager.loadImageBitmap(url) : await loadImageBitmap(url);
        }
        else
        {
            src = await new Promise((resolve) =>
            {
                src = new Image();
                src.crossOrigin = 'anonymous';

                src.src = url;
                if (src.complete)
                {
                    resolve(src);
                }
                else
                {
                    src.onload = (): void =>
                    {
                        resolve(src);
                    };
                }
            });
        }

        const base = new BaseTexture(src, {
            resolution: getResolutionOfUrl(url),
            ...asset.data,
        });

        base.resource.src = url;

        const texture = new Texture(base);

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

} as LoaderParser<Texture, LoadTextureData>;

extensions.add(loadTextures);
