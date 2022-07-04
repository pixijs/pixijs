import { Texture } from '@pixi/core';
import { getResolutionOfUrl } from '@pixi/utils';
import { CanvasRenderingContext2D, loadImage } from 'canvas';
import { NodeCanvasElement } from './NodeCanvasElement';
import path from 'path';

const validImages = ['jpg', 'png', 'jpeg', 'svg'];

/**
 * loads our textures!
 * this makes use of imageBitmaps where available.
 * We load the ImageBitmap on a different thread using CentralDispatch
 * We can then use the ImageBitmap as a source for a Pixi Texture
 */
export const loadNodeTexture = {
    test(url: string): boolean
    {
        const tempUrl = new URL(url);
        const extension = path.extname(tempUrl.pathname);

        return validImages.includes(extension);
    },

    async load(url: string, asset: any): Promise<Texture>
    {
        const image = await loadImage(url);
        const canvas = new NodeCanvasElement(image.width, image.height);
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        ctx.drawImage(image, 0, 0);
        const texture = Texture.from(canvas as unknown as HTMLCanvasElement, {
            resolution: getResolutionOfUrl(url),
            ...asset.data
        });

        return texture;
    },
};

