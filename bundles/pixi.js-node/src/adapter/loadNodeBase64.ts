import canvasModule from 'canvas';
import { extensions, ExtensionType, Texture, utils } from '@pixi/core';
import { NodeCanvasElement } from './NodeCanvasElement';

import type { LoadAsset, LoaderParser } from '@pixi/assets';

const { loadImage } = canvasModule;
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
        const ctx = canvas.getContext('2d');

        ctx.drawImage(image, 0, 0);
        const texture = Texture.from(canvas, {
            resolution: utils.getResolutionOfUrl(url),
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
