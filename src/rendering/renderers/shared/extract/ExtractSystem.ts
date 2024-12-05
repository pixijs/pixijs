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

const imageTypes = {
    png: 'image/png',
    jpg: 'image/jpeg',
    webp: 'image/webp',
};

type Formats = keyof typeof imageTypes;

/**
 * Options for creating an image from a renderer.
 * @memberof rendering
 */
export interface ImageOptions
{
    /** The format of the image. */
    format?: Formats;
    /** The quality of the image. */
    quality?: number;
}

/**
 * Options for extracting content from a renderer.
 * @memberof rendering
 */
export interface BaseExtractOptions
{
    /** The target to extract. */
    target: Container | Texture;
    /** The region of the target to extract. */
    frame?: Rectangle;
    /** The resolution of the extracted content. */
    resolution?: number;
    /** The color used to clear the extracted content. */
    clearColor?: ColorSource;
    /** Whether to enable anti-aliasing. This may affect performance. */
    antialias?: boolean;
}
/**
 * Options for extracting an HTMLImage from the renderer.
 * @memberof rendering
 */
export type ExtractImageOptions = BaseExtractOptions & ImageOptions;
/**
 * Options for extracting and downloading content from a renderer.
 * @memberof rendering
 */
export type ExtractDownloadOptions = BaseExtractOptions & {
    /** The filename to use when downloading the content. */
    filename: string;
};
/**
 * Options for extracting content from a renderer.
 * @memberof rendering
 */
export type ExtractOptions = BaseExtractOptions | ExtractImageOptions | ExtractDownloadOptions;

/**
 * This class provides renderer-specific plugins for exporting content from a renderer.
 * For instance, these plugins can be used for saving an Image, Canvas element or for exporting the raw image data (pixels).
 *
 * Do not instantiate these plugins directly. It is available from the `renderer.extract` property.
 * @example
 * import { Application, Graphics } from 'pixi.js';
 *
 * // Create a new application (extract will be auto-added to renderer)
 * const app = new Application();
 * await app.init();
 *
 * // Draw a red circle
 * const graphics = new Graphics()
 *     .circle(0, 0, 50);
 *     .fill(0xFF0000)
 *
 * // Render the graphics as an HTMLImageElement
 * const image = await app.renderer.extract.image(graphics);
 * document.body.appendChild(image);
 * @memberof rendering
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

    /** Default options for creating an image. */
    public static defaultImageOptions: ImageOptions = {
        /** The format of the image. */
        format: 'png' as Formats,
        /** The quality of the image. */
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

    /**
     * Will return a HTML Image of the target
     * @param options - The options for creating the image, or the target to extract
     * @returns - HTML Image of the target
     */
    public async image(options: ExtractImageOptions | Container | Texture): Promise<HTMLImageElement>
    {
        const image = new Image();

        image.src = await this.base64(options);

        return image;
    }

    /**
     * Will return a base64 encoded string of this target. It works by calling
     * `Extract.canvas` and then running toDataURL on that.
     * @param options - The options for creating the image, or the target to extract
     */
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
                }, imageTypes[format], quality);
            });
        }
        if (canvas.toDataURL !== undefined)
        {
            return canvas.toDataURL(imageTypes[format], quality);
        }
        if (canvas.convertToBlob !== undefined)
        {
            const blob = await canvas.convertToBlob({ type: imageTypes[format], quality });

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

    /**
     * Creates a Canvas element, renders this target to it and then returns it.
     * @param options - The options for creating the canvas, or the target to extract
     * @returns - A Canvas element with the texture rendered on.
     */
    public canvas(options: ExtractOptions | Container | Texture): ICanvas
    {
        options = this._normalizeOptions(options);

        const target = options.target;

        const renderer = this._renderer;

        if (target instanceof Texture)
        {
            return renderer.texture.generateCanvas(target);
        }

        const texture = renderer.textureGenerator.generateTexture(options as GenerateTextureOptions);

        const canvas = renderer.texture.generateCanvas(texture);

        texture.destroy(true);

        return canvas;
    }

    /**
     * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA
     * order, with integer values between 0 and 255 (included).
     * @param options - The options for extracting the image, or the target to extract
     * @returns - One-dimensional array containing the pixel data of the entire texture
     */
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
            texture.destroy(true);
        }

        return pixelInfo;
    }

    /**
     * Will return a texture of the target
     * @param options - The options for creating the texture, or the target to extract
     * @returns - A texture of the target
     */
    public texture(options: ExtractOptions | Container | Texture): Texture
    {
        options = this._normalizeOptions(options);

        if (options.target instanceof Texture) return options.target;

        return this._renderer.textureGenerator.generateTexture(options as GenerateTextureOptions);
    }

    /**
     * Will extract a HTMLImage of the target and download it
     * @param options - The options for downloading and extracting the image, or the target to extract
     */
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

    /**
     * Logs the target to the console as an image. This is a useful way to debug what's happening in the renderer.
     * @param options - The options for logging the image, or the target to log
     */
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
