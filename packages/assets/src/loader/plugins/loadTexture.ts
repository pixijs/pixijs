import { BaseTexture, Texture } from '@pixi/core';

import { getResolutionOfUrl } from '@pixi/utils';
import { getExtension } from '../getExtension';
import { LoadPlugin } from './LoadPlugin';

const validImages = ['jpg', 'png', 'jpeg', 'avif', 'webp'];

/**
 * loads our textures!
 * this makes use of imageBitmaps where available.
 * We load the ImageBitmap on a different thread using CentralDispatch
 * We can then use the ImageBitmap as a source for a Pixi Texture
 */
const loadTexture = {
    test(url: string): boolean
    {
        const tempURL = url.split('?')[0];

        return (validImages.includes(getExtension(tempURL)));
    },

    async load(url: string): Promise<Texture>
    {
        let src: any = null;

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

        const base = new BaseTexture(src, {
            resolution: getResolutionOfUrl(url),
        });

        const texture = new Texture(base);

        // add it to a cache...

        return texture;
    },
} as LoadPlugin;

export { loadTexture };

