import { ExtensionType } from '../../../../extensions/Extensions';
import { Container } from '../../../../scene/container/Container';
import { Texture } from '../texture/Texture';

import type { ColorSource } from '../../../../color/Color';
import type { ICanvas } from '../../../../environment/canvas/ICanvas';
import type { Rectangle } from '../../../../maths/shapes/Rectangle';
import type { Renderer } from '../../types';
import type { System } from '../system/System';
import type { GetPixelsOutput } from '../texture/GenerateCanvas';
import type { GenerateTextureOptions } from './GenerateTextureSystem';

type Formats = 'png' | 'jpg'; // Add other formats if needed

interface ImageOptions
{
    format?: Formats;
    quality?: number;
}
// define types for extract options
export interface BaseExtractOptions
{
    target: Container | Texture;
    frame?: Rectangle;
    resolution?: number;
    clearColor?: ColorSource;
}
export type ExtractImageOptions = BaseExtractOptions & ImageOptions;
export type ExtractDownloadOptions = BaseExtractOptions & {
    filename: string;
};
export type ExtractOptions = BaseExtractOptions | ExtractImageOptions | ExtractDownloadOptions;

/**
 * System plugin to the renderer to manage texture garbage collection on the GPU,
 * ensuring that it does not get clogged up with textures that are no longer being used.
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

    public static defaultImageOptions: ImageOptions = {
        format: 'png' as Formats,
        quality: 1,
    };

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
        options = this._normalizeOptions<ExtractImageOptions>(
            options,
            ExtractSystem.defaultImageOptions
        );

        const { format, quality } = options;

        const canvas = this.canvas(options);

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
        options = this._normalizeOptions(options);

        const target = options.target;

        const renderer = this._renderer;
        const texture = target instanceof Texture
            ? target
            : renderer.textureGenerator.generateTexture(options as GenerateTextureOptions);

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
        options = this._normalizeOptions(options);

        const target = options.target;

        const renderer = this._renderer;
        const texture = target instanceof Texture
            ? target
            : renderer.textureGenerator.generateTexture(options as GenerateTextureOptions);

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
        options = this._normalizeOptions(options);

        if (options.target instanceof Texture) return options.target;

        return this._renderer.textureGenerator.generateTexture(options as GenerateTextureOptions);
    }

    public download(options: ExtractDownloadOptions | Container | Texture)
    {
        options = this._normalizeOptions<ExtractDownloadOptions>(options);

        const canvas = this.canvas(options);

        const link = document.createElement('a');

        link.download = options.filename ?? 'image.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    public log(options: (ExtractOptions & {width?: number}) | Container | Texture)
    {
        const width = options.width ?? 200;

        options = this._normalizeOptions(options);

        const canvas = this.canvas(options);

        const base64 = canvas.toDataURL();

        // eslint-disable-next-line no-console
        console.log(`[Pixi Texture] ${canvas.width}px ${canvas.height}px`);

        const style = [
            'font-size: 1px;',
            `padding: ${width}px ${300}px;`,
            `background: url(${base64}) no-repeat;`,
            'background-size: contain;',
        ].join(' ');

        // eslint-disable-next-line no-console
        console.log('%c ', style);
    }

    public destroy(): void
    {
        this._renderer = null as any as Renderer;
    }
}
