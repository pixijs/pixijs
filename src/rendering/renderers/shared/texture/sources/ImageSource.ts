import { DOMAdapter } from '../../../../../environment/adapter';
import { ExtensionType } from '../../../../../extensions/Extensions';
import { warn } from '../../../../../utils/logging/warn';
import { NOOP } from '../../../../../utils/misc/NOOP';
import { Texture } from '../Texture';
import { TextureSource } from './TextureSource';

import type { ICanvas } from '../../../../../environment/canvas/ICanvas';
import type { ExtensionMetadata } from '../../../../../extensions/Extensions';
import type { TextureSourceOptions } from './TextureSource';

export type ImageResource =
ImageBitmap
| HTMLCanvasElement
| OffscreenCanvas
| ICanvas
| VideoFrame
| HTMLImageElement
| HTMLVideoElement;

export class ImageSource extends TextureSource<ImageResource>
{
    public static extension: ExtensionMetadata = ExtensionType.TextureSource;
    public uploadMethodId = 'image';

    constructor(options: TextureSourceOptions<ImageResource>)
    {
        if (options.resource && options.resource instanceof HTMLImageElement)
        {
            const canvas = DOMAdapter.get().createCanvas(options.resource.width, options.resource.height);
            const context = canvas.getContext('2d');

            context.drawImage(options.resource, 0, 0);
            options.resource = canvas;

            warn('ImageSource: Image element passed, converting to canvas. Use CanvasSource instead.');
        }

        super(options);
    }

    public static test(resource: any): resource is ImageResource
    {
        return (typeof HTMLImageElement !== 'undefined' && resource instanceof HTMLImageElement)
        || (typeof ImageBitmap !== 'undefined' && resource instanceof ImageBitmap);
    }
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
        alphaMode: 'premultiply-alpha-on-upload'
    }),
});

Texture.WHITE.label = 'WHITE';
Texture.WHITE.destroy = NOOP;
