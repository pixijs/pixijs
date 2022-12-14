import canvasModule from 'canvas';
import { extensions, ExtensionType, settings, Texture, utils } from '@pixi/core';
import { NodeCanvasElement } from './NodeCanvasElement';

import type { LoadAsset, LoaderParser } from '@pixi/assets';

const { loadImage } = canvasModule;
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
        return validImages.includes(utils.path.extname(url).toLocaleLowerCase()) || isSupportedDataURL(url);
    },

    async load(url: string, asset: LoadAsset): Promise<Texture>
    {
        const data = await settings.ADAPTER.fetch(url);
        const image = await loadImage(Buffer.from(await data.arrayBuffer()));
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

extensions.add(loadNodeTexture);
