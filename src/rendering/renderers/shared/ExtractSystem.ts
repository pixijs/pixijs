import { extensions, ExtensionType } from '../../../extensions/Extensions';
import { Container } from '../../scene/Container';
import { Texture } from './texture/Texture';

import type { Rectangle } from '../../../maths/shapes/Rectangle';
import type { ICanvas } from '../../../settings/adapter/ICanvas';
import type { Renderer } from '../types';
import type { GenerateTextureOptions } from './GenerateTextureSystem';
import type { System } from './system/System';
import type { GetPixelsOutput } from './texture/GenerateCanvas';

/**
 * System plugin to the renderer to manage texture garbage collection on the GPU,
 * ensuring that it does not get clogged up with textures that are no longer being used.
 * @memberof PIXI
 */
export class ExtractSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
        ],
        name: 'extract',
    } as const;

    private _renderer: Renderer;

    /** @param renderer - The renderer this System works for. */
    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public async image(target?: Container | Texture, format?: string, quality?: number,
        frame?: Rectangle): Promise<HTMLImageElement>
    {
        const image = new Image();

        image.src = await this.base64(target, format, quality, frame);

        return image;
    }

    public async base64(target?: Container | Texture, format?: string, quality?: number,
        frame?: Rectangle): Promise<string>
    {
        const canvas = this.canvas(target, frame);

        if (canvas.toBlob !== undefined)
        {
            return new Promise<string>((resolve, reject) =>
            {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                canvas.toBlob!((blob) =>
                {
                    if (!blob)
                    {
                        reject(new Error('ICanvas.toBlob failed!'));

                        return;
                    }

                    const reader = new FileReader();

                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                }, format, quality);
            });
        }
        if (canvas.toDataURL !== undefined)
        {
            return canvas.toDataURL(format, quality);
        }
        if (canvas.convertToBlob !== undefined)
        {
            const blob = await canvas.convertToBlob({ type: format, quality });

            return new Promise<string>((resolve, reject) =>
            {
                const reader = new FileReader();

                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }

        throw new Error('Extract.base64() requires ICanvas.toDataURL, ICanvas.toBlob, '
            + 'or ICanvas.convertToBlob to be implemented');
    }

    public canvas(target?: Container | Texture, frame?: Rectangle): ICanvas
    {
        const renderer = this._renderer;
        const texture = target instanceof Texture
            ? target
            : renderer.textureGenerator.generateTexture({
                container: target,
                region: frame,
            } as GenerateTextureOptions);

        const canvas = renderer.texture.generateCanvas(texture);

        if (target instanceof Container)
        {
            // destroy generated texture
            texture.destroy();
        }

        return canvas;
    }

    public pixels(target?: Container | Texture, frame?: Rectangle): GetPixelsOutput
    {
        const renderer = this._renderer;
        const texture = target instanceof Texture
            ? target
            : renderer.textureGenerator.generateTexture({
                container: target,
                region: frame,
            } as GenerateTextureOptions);

        const pixelInfo = renderer.texture.getPixels(texture);

        if (target instanceof Container)
        {
            // destroy generated texture
            texture.destroy();
        }

        return pixelInfo;
    }

    public texture(target?: Container, frame?: Rectangle): Texture
    {
        return this._renderer.textureGenerator.generateTexture({
            container: target,
            region: frame,
        } as GenerateTextureOptions);
    }

    public download({ target, region, filename }: {
        target?: Container | Texture,
        resolution?: number,
        region?: Rectangle,
        filename?: string
    })
    {
        const canvas = this.canvas(target, region);

        const link = document.createElement('a');

        link.download = filename ?? 'image.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    public destroy(): void
    {
        this._renderer = null as any as Renderer;
    }
}

extensions.add(ExtractSystem);
