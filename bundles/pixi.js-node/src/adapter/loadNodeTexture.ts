import type { LoadAsset, LoaderParser } from '@pixi/assets';
import { ExtensionType, Texture } from '@pixi/core';
import { settings } from '@pixi/settings';
import { getResolutionOfUrl } from '@pixi/utils';
import type { CanvasRenderingContext2D } from 'canvas';
import { loadImage } from 'canvas';
import path from 'path';
import { NodeCanvasElement } from './NodeCanvasElement';

const validImages = ['.jpg', '.png', '.jpeg', '.svg'];
const validMimes = ['image/png', 'image/jpg', 'image/jpeg', 'image/svg'];

function isSupportedDataURL(url: string): boolean
{
    const match = url.match(/^data:([^;]+);base64,/);

    if (!match) return false;

    const mimeType = match[1];

    return validMimes.includes(mimeType);
}

/** loads our textures into a node canvas */
export const loadNodeTexture = {
    extension: ExtensionType.LoadParser,

    test(url: string): boolean
    {
        return validImages.includes(path.extname(url)) || isSupportedDataURL(url);
    },

    async load(url: string, asset: LoadAsset): Promise<Texture>
    {
        const data = await settings.ADAPTER.fetch(url);
        const image = await loadImage(Buffer.from(await data.arrayBuffer()));
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
