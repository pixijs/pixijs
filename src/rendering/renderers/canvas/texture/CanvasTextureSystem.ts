import { DOMAdapter } from '../../../../environment/adapter';
import { ExtensionType } from '../../../../extensions/Extensions';

import type { ICanvas } from '../../../../environment/canvas/ICanvas';
import type { System } from '../../shared/system/System';
import type { CanvasGenerator, GetPixelsOutput } from '../../shared/texture/GenerateCanvas';
import type { Texture } from '../../shared/texture/Texture';
import type { TextureSource } from '../../shared/texture/sources/TextureSource';
import type { CanvasRenderer } from '../CanvasRenderer';

export class CanvasTextureSystem implements System, CanvasGenerator
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.CanvasSystem,
        ],
        name: 'texture',
    } as const;

    constructor(renderer: CanvasRenderer)
    {
        void renderer;
    }

    public init(): void
    {
        // no-op
    }

    public initSource(_source: TextureSource): void
    {
        // no-op for canvas
    }

    public generateCanvas(texture: Texture): ICanvas
    {
        const canvas = DOMAdapter.get().createCanvas();
        const context = canvas.getContext('2d');
        const source = texture.source.resource as CanvasImageSource;

        if (!source)
        {
            return canvas;
        }

        const frame = texture.frame;
        const resolution = texture.source._resolution ?? texture.source.resolution ?? 1;

        const sx = frame.x * resolution;
        const sy = frame.y * resolution;
        const sw = frame.width * resolution;
        const sh = frame.height * resolution;

        canvas.width = Math.ceil(sw);
        canvas.height = Math.ceil(sh);

        context.drawImage(
            source,
            sx,
            sy,
            Math.floor(sw),
            Math.floor(sh),
            0,
            0,
            Math.floor(sw),
            Math.floor(sh)
        );

        return canvas;
    }

    public getPixels(texture: Texture): GetPixelsOutput
    {
        const canvas = this.generateCanvas(texture);
        const context = canvas.getContext('2d', { willReadFrequently: true });
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        return {
            pixels: imageData.data,
            width: canvas.width,
            height: canvas.height,
        };
    }

    public destroy(): void
    {
        // no-op
    }
}
