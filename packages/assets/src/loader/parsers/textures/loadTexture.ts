import { BaseTexture, extensions, ExtensionType, settings, utils } from '@pixi/core';
import { LoaderParserPriority } from '../LoaderParser';
import { WorkerManager } from '../WorkerManager';
import { checkExtension } from './utils/checkExtension';
import { createTexture } from './utils/createTexture';

import type { IBaseTextureOptions, Texture } from '@pixi/core';
import type { Loader } from '../../Loader';
import type { LoadAsset } from '../../types';
import type { LoaderParser } from '../LoaderParser';

const validImages = ['.jpg', '.png', '.jpeg', '.avif', '.webp'];

/**
 * Returns a promise that resolves an ImageBitmaps.
 * This function is designed to be used by a worker.
 * Part of WorkerManager!
 * @param url - The image to load an image bitmap for
 */
export async function loadImageBitmap(url: string): Promise<ImageBitmap>
{
    const response = await settings.ADAPTER.fetch(url);

    if (!response.ok)
    {
        throw new Error(`[loadImageBitmap] Failed to fetch ${url}: `
            + `${response.status} ${response.statusText}`);
    }

    const imageBlob = await response.blob();
    const imageBitmap = await createImageBitmap(imageBlob);

    return imageBitmap;
}

/**
 * Loads our textures!
 * this makes use of imageBitmaps where available.
 * We load the ImageBitmap on a different thread using the WorkerManager
 * We can then use the ImageBitmap as a source for a Pixi Texture
 */
export const loadTextures = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.High,
    },

    config: {
        preferWorkers: true,
    },

    test(url: string): boolean
    {
        let isValidBase64Suffix = false;

        for (let i = 0; i < validImages.length; i++)
        {
            if (url.startsWith(`data:image/${validImages[i].slice(1)}`))
            {
                isValidBase64Suffix = true;
                break;
            }
        }

        return isValidBase64Suffix || checkExtension(url, validImages);
    },

    async load(url: string, asset: LoadAsset<IBaseTextureOptions>, loader: Loader): Promise<Texture>
    {
        let src: any = null;

        if (globalThis.createImageBitmap)
        {
            if (this.config.preferWorkers && await WorkerManager.isImageBitmapSupported())
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
            resolution: utils.getResolutionOfUrl(url),
            ...asset.data,
        });

        base.resource.src = url;

        return createTexture(base, loader, url);
    },

    unload(texture: Texture): void
    {
        texture.destroy(true);
    }
} as LoaderParser<Texture, IBaseTextureOptions>;

extensions.add(loadTextures);
