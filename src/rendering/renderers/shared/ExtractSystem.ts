import { ExtensionType } from '../../../extensions/Extensions';
import { Container } from '../../scene/Container';
import { Texture } from './texture/Texture';

import type { Rectangle } from '../../../maths/shapes/Rectangle';
import type { ICanvas } from '../../../settings/adapter/ICanvas';
import type { Renderer } from '../types';
import type { GenerateTextureOptions } from './GenerateTextureSystem';
import type { System } from './system/System';
import type { GetPixelsOutput } from './texture/GenerateCanvas';

type Formats = 'png' | 'jpg'; // Add other formats if needed

interface ImageOptions
{
    format?: Formats;
    quality?: number;
}

const defaultImageOptions: ImageOptions = {
    format: 'png' as Formats,
    quality: 1,
};

// define types for extract options
export interface BaseExtractOptions
{
    target: Container | Texture;
    frame?: Rectangle;
}
export type ExtractImageOptions = BaseExtractOptions & ImageOptions;
export type ExtractDownloadOptions = BaseExtractOptions & {
    resolution?: number;
    filename: string;
};
export type ExtractOptions = BaseExtractOptions | ExtractImageOptions | ExtractDownloadOptions;

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

    private _normalizeOptions<T extends ExtractOptions>(
        options: ExtractImageOptions | Container | Texture,
        defaults: Partial<T> = {},
    ): T
    {
        if (options instanceof Container || options instanceof Texture)
        {
            return {
                target: options,
                ...defaults
            } as T;
        }

        return {
            ...defaults,
            ...options,
        } as T;
    }

    public async image(options: ExtractImageOptions | Container | Texture): Promise<HTMLImageElement>
    {
        const image = new Image();

        image.src = await this.base64(options);

        return image;
    }

    public async base64(options: ExtractImageOptions | Container | Texture): Promise<string>
    {
        const { target, format, quality, frame } = this._normalizeOptions<ExtractImageOptions>(options, defaultImageOptions);
        const canvas = this.canvas({ target, frame });

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

    public canvas(options: ExtractOptions | Container | Texture): ICanvas
    {
        const { target, frame } = this._normalizeOptions(options);
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

    public pixels(options: ExtractOptions | Container | Texture): GetPixelsOutput
    {
        const { target, frame } = this._normalizeOptions(options);
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

    public texture(options: ExtractOptions | Container | Texture): Texture
    {
        const { target, frame } = this._normalizeOptions(options);

        return this._renderer.textureGenerator.generateTexture({
            container: target,
            region: frame,
        } as GenerateTextureOptions);
    }

    public download(options: ExtractDownloadOptions | Container | Texture)
    {
        const {
            filename,
        } = this._normalizeOptions<ExtractDownloadOptions>(options);
        const canvas = this.canvas(options);

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
