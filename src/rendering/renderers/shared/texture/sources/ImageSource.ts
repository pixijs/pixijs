import { settings } from '../../../../../settings/settings';
import { NOOP } from '../../../../../utils/NOOP';
import { Texture } from '../Texture';
import { TextureSource } from './TextureSource';

import type { ICanvas } from '../../../../../settings/adapter/ICanvas';
import type { ALPHA_MODES } from '../const';
import type { TextureSourceOptions } from './TextureSource';

type ImageResource = ImageBitmap | HTMLCanvasElement | OffscreenCanvas | ICanvas;

export interface ImageSourceOptions extends TextureSourceOptions<ImageResource>
{
    alphaMode?: ALPHA_MODES;
}

export class ImageSource extends TextureSource<ImageResource>
{
    type = 'image';

    alphaMode?: ALPHA_MODES;

    constructor(options: ImageSourceOptions)
    {
        super(options);

        this.alphaMode = options.alphaMode ?? 0;
    }
}

// create a white canvas
const canvas = settings.ADAPTER.createCanvas();

const size = 1;

canvas.width = size;
canvas.height = size;

const ctx = canvas.getContext('2d');

ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, size, size);

// draw red triangle
ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(size, 0);
ctx.lineTo(size, size);
ctx.closePath();
ctx.fillStyle = '#ffffff';
ctx.fill();

Texture.WHITE = new Texture({
    source: new ImageSource({
        resource: canvas,
    }),
});

Texture.WHITE.label = 'WHITE';
Texture.WHITE.destroy = NOOP;
