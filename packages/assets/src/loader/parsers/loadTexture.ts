import { BaseTexture, Texture } from '@pixi/core';
import { getResolutionOfUrl } from '@pixi/utils';

import type { LoaderParser } from './LoaderParser';
import { WorkerManager } from './WorkerManager';

const validImages = ['jpg', 'png', 'jpeg', 'avif', 'webp'];

const preferWorkers = true;

/**
 * Returns a promise that resolves an ImageBitmaps.
 * This function is designed to be used in a worker.
 * Part of CentralDispatch!
 * @param url - the image to load an image bitmap for
 */
export async function loadImageBitmap(url: string): Promise<ImageBitmap>
{
    const response = await fetch(url);

    const imageBlob =  await response.blob();

    const imageBitmap = await createImageBitmap(imageBlob);

    return imageBitmap;
}

/**
 * loads our textures!
 * this makes use of imageBitmaps where available.
 * We load the ImageBitmap on a different thread using CentralDispatch
 * We can then use the ImageBitmap as a source for a Pixi Texture
 */
export const loadTextures = {
    test(url: string): boolean
    {
        const tempURL = url.split('?')[0];
        const extension = tempURL.split('.').pop();

        return validImages.includes(extension);
    },

    async load(url: string): Promise<Texture>
    {
        let src: any = null;

        if (window.createImageBitmap)
        {
            if (preferWorkers)
            {
                src = await WorkerManager.loadImageBitmap(url);
            }
            else
            {
                src = await loadImageBitmap(url);
            }
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
            // TODO - use the parsed resolution if it exists!
            resolution: getResolutionOfUrl(url),
        });

        base.resource.src = url;

        const texture = new Texture(base);

        return texture;
    },
} as LoaderParser<Texture, {baseTexture: BaseTexture}>;

