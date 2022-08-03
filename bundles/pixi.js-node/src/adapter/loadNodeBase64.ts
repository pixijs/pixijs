import type { LoadAsset, LoaderParser } from '@pixi/assets';
import { extensions, ExtensionType, Texture } from '@pixi/core';
import { getResolutionOfUrl } from '@pixi/utils';
import type { CanvasRenderingContext2D } from 'canvas';
import { loadImage } from 'canvas';
import { NodeCanvasElement } from './NodeCanvasElement';

const validMimes = ['image/png', 'image/jpg', 'image/jpeg', 'image/svg'];

function isSupportedDataURL(url: string): boolean
{
    const match = url.match(/^data:([^;]+);base64,/);

    if (!match) return false;

    const mimeType = match[1];

    return validMimes.includes(mimeType);
}

/** loads our textures into a node canvas */
export const loadNodeBase64 = {
    extension: ExtensionType.LoadParser,

    test(url: string): boolean
    {
        return isSupportedDataURL(url);
    },

    async load(url: string, asset: LoadAsset): Promise<Texture>
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

    unload(texture: Texture): void
    {
        texture.destroy(true);
    }
} as LoaderParser<Texture>;

extensions.add(loadNodeBase64);
