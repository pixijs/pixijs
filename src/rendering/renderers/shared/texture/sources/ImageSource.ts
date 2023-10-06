import { DOMAdapter } from '../../../../../settings/adapter/adapter';
import { NOOP } from '../../../../../utils/NOOP';
import { Texture } from '../Texture';
import { TextureSource } from './TextureSource';

import type { ICanvas } from '../../../../../settings/adapter/ICanvas';

type ImageResource = ImageBitmap | HTMLCanvasElement | OffscreenCanvas | ICanvas | VideoFrame;

export class ImageSource extends TextureSource<ImageResource>
{
    public uploadMethodId = 'image';
}

// create a white canvas
const canvas = DOMAdapter.get().createCanvas();

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
