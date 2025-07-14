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
 * Controls the output format and quality of extracted images.
 * @example
 * ```ts
 * // Extract as PNG (default)
 * const pngImage = await renderer.extract.image({
 *     target: sprite,
 *     format: 'png'
 * });
 *
 * // Extract as JPEG with quality setting
 * const jpgImage = await renderer.extract.image({
 *     target: sprite,
 *     format: 'jpg',
 *     quality: 0.8
 * });
 *
 * // Extract as WebP for better compression
 * const webpImage = await renderer.extract.image({
 *     target: sprite,
 *     format: 'webp',
 *     quality: 0.9
 * });
 * ```
 * @category rendering
 * @advanced
 */
export interface ImageOptions
{
    /**
     * The format of the extracted image.
     * - 'png': Lossless format, best for images with text or sharp edges
     * - 'jpg': Lossy format, smaller file size, good for photos
     * - 'webp': Modern format with better compression
     * @example
     * ```ts
     * // Extract as PNG
     * const pngImage = await renderer.extract.image({
     *     target: sprite,
     *     format: 'png'
     * });
     * // Extract as JPEG
     * const jpgImage = await renderer.extract.image({
     *     target: sprite,
     *     format: 'jpg',
     * });
     * ```
     * @default 'png'
     */
    format?: Formats;

    /**
     * The quality of the extracted image, between 0 and 1.
     * Only applies to lossy formats (jpg, webp).
     * - 1: Maximum quality
     * - 0: Maximum compression
     * @example
     * ```ts
     * // Extract as JPEG with 80% quality
     * const jpgImage = await renderer.extract.image({
     *     target: sprite,
     *     format: 'jpg',
     *     quality: 0.8
     * });
     * // Extract as WebP with 90% quality
     * const webpImage = await renderer.extract.image({
     *     target: sprite,
     *     format: 'webp',
     *     quality: 0.9
     * });
     * ```
     * @default 1
     */
    quality?: number;
}

/**
 * Options for extracting content from a renderer.
 * These options control how content is extracted and processed from the renderer.
 * @example
 * ```ts
 * // Basic extraction
 * const pixels = renderer.extract.pixels({
 *     target: sprite,
 * });
 *
 * // Extract with custom region and resolution
 * const canvas = renderer.extract.canvas({
 *     target: container,
 *     frame: new Rectangle(0, 0, 100, 100),
 *     resolution: 2,
 * });
 *
 * // Extract with background color and anti-aliasing
 * const image = await renderer.extract.image({
 *     target: graphics,
 *     clearColor: '#ff0000',
 *     antialias: true
 * });
 * ```
 * @category rendering
 * @advanced
 */
export interface BaseExtractOptions
{
    /**
     * The target to extract. Can be a Container or Texture.
     * @example
     * ```ts
     * // Extract from a sprite
     * const sprite = new Sprite(texture);
     * renderer.extract.pixels({ target: sprite });
     *
     * // Extract from a texture directly
     * renderer.extract.pixels({ target: texture });
     * ```
     */
    target: Container | Texture;

    /**
     * The region of the target to extract. If not specified, extracts the entire target.
     * @example
     * ```ts
     * // Extract a specific region
     * renderer.extract.canvas({
     *     target: sprite,
     *     frame: new Rectangle(10, 10, 100, 100)
     * });
     * ```
     */
    frame?: Rectangle;

    /**
     * The resolution of the extracted content. Higher values create sharper images.
     * @default 1
     * @example
     * ```ts
     * // Extract at 2x resolution for retina displays
     * renderer.extract.image({
     *     target: sprite,
     *     resolution: 2
     * });
     * ```
     */
    resolution?: number;

    /**
     * The color used to clear the extracted content before rendering.
     * Can be a hex number, string, or array of numbers.
     * @example
     * ```ts
     * // Clear with red background
     * renderer.extract.canvas({
     *     target: sprite,
     *     clearColor: '#ff0000'
     * });
     *
     * // Clear with semi-transparent black
     * renderer.extract.canvas({
     *     target: sprite,
     *     clearColor: [0, 0, 0, 0.5]
     * });
     * ```
     */
    clearColor?: ColorSource;

    /**
     * Whether to enable anti-aliasing during extraction.
     * Improves quality but may affect performance.
     * @default false
     * @example
     * ```ts
     * // Enable anti-aliasing for smoother edges
     * renderer.extract.image({
     *     target: graphics,
     *     antialias: true
     * });
     * ```
     */
    antialias?: boolean;
}
/**
 * Options for extracting an HTMLImage from the renderer.
 * Combines base extraction options with image-specific settings.
 * @example
 * ```ts
 * // Basic PNG extraction
 * const image = await renderer.extract.image({
 *     target: sprite,
 *     format: 'png'
 * });
 *
 * // High-quality JPEG with custom region
 * const image = await renderer.extract.image({
 *     target: container,
 *     format: 'jpg',
 *     quality: 0.9,
 *     frame: new Rectangle(0, 0, 100, 100),
 *     resolution: 2
 * });
 *
 * // WebP with background and anti-aliasing
 * const image = await renderer.extract.image({
 *     target: graphics,
 *     format: 'webp',
 *     quality: 0.8,
 *     clearColor: '#ff0000',
 *     antialias: true
 * });
 * ```
 *
 * Combines all options from:
 * - {@link BaseExtractOptions} for basic extraction settings
 * - {@link ImageOptions} for image format and quality settings
 *
 * Common use cases:
 * - Capturing game screenshots
 * - Saving rendered content
 * - Creating image thumbnails
 * - Exporting canvas content
 * @see {@link ExtractSystem.image} For the method that uses these options
 * @see {@link ExtractSystem.base64} For base64 encoding
 * @category rendering
 * @advanced
 * @interface
 */
export type ExtractImageOptions = BaseExtractOptions & ImageOptions;
/**
 * Options for extracting and downloading content from a renderer.
 * Combines base extraction options with download-specific settings.
 * @example
 * ```ts
 * // Basic download with default filename
 * renderer.extract.download({
 *     target: sprite
 * });
 *
 * // Download with custom filename and region
 * renderer.extract.download({
 *     target: container,
 *     filename: 'screenshot.png',
 *     frame: new Rectangle(0, 0, 100, 100)
 * });
 *
 * // Download with high resolution and background
 * renderer.extract.download({
 *     target: stage,
 *     filename: 'hd-capture.png',
 *     resolution: 2,
 *     clearColor: '#ff0000'
 * });
 *
 * // Download with anti-aliasing
 * renderer.extract.download({
 *     target: graphics,
 *     filename: 'smooth.png',
 *     antialias: true
 * });
 * ```
 *
 * Combines all options from:
 * - {@link BaseExtractOptions} for basic extraction settings
 * - Additional download-specific options
 *
 * Common use cases:
 * - Saving game screenshots
 * - Exporting rendered content
 * - Creating downloadable assets
 * - Saving canvas state
 * @see {@link ExtractSystem.download} For the method that uses these options
 * @see {@link ExtractSystem.image} For creating images without download
 * @category rendering
 * @advanced
 * @interface
 */
export type ExtractDownloadOptions = BaseExtractOptions & {
    /**
     * The filename to use when downloading the content.
     * Should include the desired file extension (e.g., .png).
     * @default 'image.png'
     * @example
     * ```ts
     * renderer.extract.download({
     *     target: sprite,
     *     filename: 'my-screenshot.png'
     * });
     * ```
     */
    filename: string;
};
/**
 * Options for extracting content from a renderer. Represents a union of all possible extraction option types.
 * Used by various extraction methods to support different output formats and configurations.
 * @example
 * ```ts
 * // Basic canvas extraction
 * const canvas = renderer.extract.canvas({
 *     target: sprite
 * });
 *
 * // Image extraction with format
 * const image = await renderer.extract.image({
 *     target: sprite,
 *     format: 'png',
 *     quality: 1
 * });
 *
 * // Download with filename
 * renderer.extract.download({
 *     target: sprite,
 *     filename: 'screenshot.png'
 * });
 *
 * // Advanced extraction with multiple options
 * const image = await renderer.extract.image({
 *     target: container,
 *     frame: new Rectangle(0, 0, 100, 100),
 *     resolution: 2,
 *     clearColor: '#ff0000',
 *     antialias: true,
 *     format: 'webp',
 *     quality: 0.8
 * });
 * ```
 *
 * Supports three types of options:
 * - {@link BaseExtractOptions} - Basic extraction settings
 * - {@link ExtractImageOptions} - Image-specific settings with format and quality
 * - {@link ExtractDownloadOptions} - Download settings with filename
 *
 * Common use cases:
 * - Extracting raw pixels
 * - Creating canvas elements
 * - Generating downloadable images
 * - Taking screenshots
 * - Creating thumbnails
 * @see {@link ExtractSystem.canvas} For canvas extraction
 * @see {@link ExtractSystem.image} For image extraction
 * @see {@link ExtractSystem.download} For downloading content
 * @category rendering
 * @advanced
 */
export type ExtractOptions = BaseExtractOptions | ExtractImageOptions | ExtractDownloadOptions;

/**
 * System for exporting content from a renderer. It provides methods to extract content as images,
 * canvases, or raw pixel data. Available through `renderer.extract`.
 * @example
 * ```ts
 * import { Application, Graphics } from 'pixi.js';
 *
 * // Create a new application
 * const app = new Application();
 * await app.init();
 *
 * // Draw something to extract
 * const graphics = new Graphics()
 *     .circle(0, 0, 50)
 *     .fill(0xFF0000);
 *
 * // Basic extraction examples
 * const image = await app.renderer.extract.image(graphics);    // As HTMLImageElement
 * const canvas = app.renderer.extract.canvas(graphics);        // As Canvas
 * const pixels = app.renderer.extract.pixels(graphics);        // As pixel data
 * const base64 = await app.renderer.extract.base64(graphics); // As base64 string
 *
 * // Advanced extraction with options
 * const customImage = await app.renderer.extract.image({
 *     target: graphics,
 *     format: 'png',
 *     resolution: 2,
 *     frame: new Rectangle(0, 0, 100, 100),
 *     clearColor: '#00000000'
 * });
 *
 * // Download content
 * app.renderer.extract.download({
 *     target: graphics,
 *     filename: 'my-image.png'
 * });
 *
 * // Debug visualization
 * app.renderer.extract.log(graphics);
 * ```
 *
 * Features:
 * - Extract as various formats (PNG, JPEG, WebP)
 * - Control output quality and resolution
 * - Extract specific regions
 * - Download extracted content
 * - Debug visualization
 *
 * Common Use Cases:
 * - Creating thumbnails
 * - Saving game screenshots
 * - Processing visual content
 * - Debugging renders
 * - Creating textures from rendered content
 *
 * Performance Considerations:
 * - Extraction operations are relatively expensive
 * - Consider caching results for frequently used content
 * - Be mindful of resolution and format choices
 * - Large extractions may impact performance
 * @category rendering
 * @standard
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

    /**
     * Default options for image extraction.
     * @example
     * ```ts
     * // Customize default options
     * ExtractSystem.defaultImageOptions.format = 'webp';
     * ExtractSystem.defaultImageOptions.quality = 0.8;
     *
     * // Use defaults
     * const image = await renderer.extract.image(sprite);
     * ```
     */
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

    /**
     * Creates an HTMLImageElement from a display object or texture.
     * @param options - Options for creating the image, or the target to extract
     * @returns Promise that resolves with the generated HTMLImageElement
     * @example
     * ```ts
     * // Basic usage with a sprite
     * const sprite = new Sprite(texture);
     * const image = await renderer.extract.image(sprite);
     * document.body.appendChild(image);
     *
     * // Advanced usage with options
     * const image = await renderer.extract.image({
     *     target: container,
     *     format: 'webp',
     *     quality: 0.8,
     *     frame: new Rectangle(0, 0, 100, 100),
     *     resolution: 2,
     *     clearColor: '#ff0000',
     *     antialias: true
     * });
     *
     * // Extract directly from a texture
     * const texture = Texture.from('myTexture.png');
     * const image = await renderer.extract.image(texture);
     * ```
     * @see {@link ExtractImageOptions} For detailed options
     * @see {@link ExtractSystem.base64} For base64 string output
     * @see {@link ExtractSystem.canvas} For canvas output
     * @category rendering
     */
    public async image(options: ExtractImageOptions | Container | Texture): Promise<HTMLImageElement>
    {
        const image = new Image();

        image.src = await this.base64(options);

        return image;
    }

    /**
     * Converts the target into a base64 encoded string.
     *
     * This method works by first creating
     * a canvas using `Extract.canvas` and then converting it to a base64 string.
     * @param options - The options for creating the base64 string, or the target to extract
     * @returns Promise that resolves with the base64 encoded string
     * @example
     * ```ts
     * // Basic usage with a sprite
     * const sprite = new Sprite(texture);
     * const base64 = await renderer.extract.base64(sprite);
     * console.log(base64); // data:image/png;base64,...
     *
     * // Advanced usage with options
     * const base64 = await renderer.extract.base64({
     *     target: container,
     *     format: 'webp',
     *     quality: 0.8,
     *     frame: new Rectangle(0, 0, 100, 100),
     *     resolution: 2
     * });
     * ```
     * @throws Will throw an error if the platform doesn't support any of:
     * - ICanvas.toDataURL
     * - ICanvas.toBlob
     * - ICanvas.convertToBlob
     * @see {@link ExtractImageOptions} For detailed options
     * @see {@link ExtractSystem.canvas} For canvas output
     * @see {@link ExtractSystem.image} For HTMLImage output
     * @category rendering
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
     * Creates a Canvas element, renders the target to it and returns it.
     * This method is useful for creating static images or when you need direct canvas access.
     * @param options - The options for creating the canvas, or the target to extract
     * @returns A Canvas element with the texture rendered on
     * @example
     * ```ts
     * // Basic canvas extraction from a sprite
     * const sprite = new Sprite(texture);
     * const canvas = renderer.extract.canvas(sprite);
     * document.body.appendChild(canvas);
     *
     * // Extract with custom region
     * const canvas = renderer.extract.canvas({
     *     target: container,
     *     frame: new Rectangle(0, 0, 100, 100)
     * });
     *
     * // Extract with high resolution
     * const canvas = renderer.extract.canvas({
     *     target: sprite,
     *     resolution: 2,
     *     clearColor: '#ff0000'
     * });
     *
     * // Extract directly from a texture
     * const texture = Texture.from('myTexture.png');
     * const canvas = renderer.extract.canvas(texture);
     *
     * // Extract with anti-aliasing
     * const canvas = renderer.extract.canvas({
     *     target: graphics,
     *     antialias: true
     * });
     * ```
     * @see {@link ExtractOptions} For detailed options
     * @see {@link ExtractSystem.image} For HTMLImage output
     * @see {@link ExtractSystem.pixels} For raw pixel data
     * @category rendering
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
     * Returns a one-dimensional array containing the pixel data of the entire texture in RGBA order,
     * with integer values between 0 and 255 (inclusive).
     * > [!NOE] The returned array is a flat Uint8Array where every 4 values represent RGBA
     * @param options - The options for extracting the image, or the target to extract
     * @returns One-dimensional Uint8Array containing the pixel data in RGBA format
     * @example
     * ```ts
     * // Basic pixel extraction
     * const sprite = new Sprite(texture);
     * const pixels = renderer.extract.pixels(sprite);
     * console.log(pixels[0], pixels[1], pixels[2], pixels[3]); // R,G,B,A values
     *
     * // Extract with custom region
     * const pixels = renderer.extract.pixels({
     *     target: sprite,
     *     frame: new Rectangle(0, 0, 100, 100)
     * });
     *
     * // Extract with high resolution
     * const pixels = renderer.extract.pixels({
     *     target: sprite,
     *     resolution: 2
     * });
     * ```
     * @see {@link ExtractOptions} For detailed options
     * @see {@link ExtractSystem.canvas} For canvas output
     * @see {@link ExtractSystem.image} For image output
     * @category rendering
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
     * Creates a texture from a display object or existing texture.
     *
     * This is useful for creating
     * reusable textures from rendered content or making copies of existing textures.
     * > [!NOTE] The returned texture should be destroyed when no longer needed
     * @param options - The options for creating the texture, or the target to extract
     * @returns A new texture containing the extracted content
     * @example
     * ```ts
     * // Basic texture extraction from a sprite
     * const sprite = new Sprite(texture);
     * const extractedTexture = renderer.extract.texture(sprite);
     *
     * // Extract with custom region
     * const regionTexture = renderer.extract.texture({
     *     target: container,
     *     frame: new Rectangle(0, 0, 100, 100)
     * });
     *
     * // Extract with high resolution
     * const hiResTexture = renderer.extract.texture({
     *     target: sprite,
     *     resolution: 2,
     *     clearColor: '#ff0000'
     * });
     *
     * // Create a new sprite from extracted texture
     * const newSprite = new Sprite(
     *     renderer.extract.texture({
     *         target: graphics,
     *         antialias: true
     *     })
     * );
     *
     * // Clean up when done
     * extractedTexture.destroy(true);
     * ```
     * @see {@link ExtractOptions} For detailed options
     * @see {@link Texture} For texture management
     * @see {@link GenerateTextureSystem} For texture generation
     * @category rendering
     */
    public texture(options: ExtractOptions | Container | Texture): Texture
    {
        options = this._normalizeOptions(options);

        if (options.target instanceof Texture) return options.target;

        return this._renderer.textureGenerator.generateTexture(options as GenerateTextureOptions);
    }

    /**
     * Extracts and downloads content from the renderer as an image file.
     * This is a convenient way to save screenshots or export rendered content.
     * > [!NOTE] The download will use PNG format regardless of the filename extension
     * @param options - The options for downloading and extracting the image, or the target to extract
     * @example
     * ```ts
     * // Basic download with default filename
     * const sprite = new Sprite(texture);
     * renderer.extract.download(sprite); // Downloads as 'image.png'
     *
     * // Download with custom filename
     * renderer.extract.download({
     *     target: sprite,
     *     filename: 'screenshot.png'
     * });
     *
     * // Download with custom region
     * renderer.extract.download({
     *     target: container,
     *     filename: 'region.png',
     *     frame: new Rectangle(0, 0, 100, 100)
     * });
     *
     * // Download with high resolution and background
     * renderer.extract.download({
     *     target: stage,
     *     filename: 'hd-screenshot.png',
     *     resolution: 2,
     *     clearColor: '#ff0000'
     * });
     *
     * // Download with anti-aliasing
     * renderer.extract.download({
     *     target: graphics,
     *     filename: 'smooth.png',
     *     antialias: true
     * });
     * ```
     * @see {@link ExtractDownloadOptions} For detailed options
     * @see {@link ExtractSystem.image} For creating images without download
     * @see {@link ExtractSystem.canvas} For canvas output
     * @category rendering
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
     * The image will be displayed in the browser's console using CSS background images.
     * @param options - The options for logging the image, or the target to log
     * @param options.width - The width of the logged image preview in the console (in pixels)
     * @example
     * ```ts
     * // Basic usage
     * const sprite = new Sprite(texture);
     * renderer.extract.log(sprite);
     * ```
     * @see {@link ExtractSystem.canvas} For getting raw canvas output
     * @see {@link ExtractSystem.pixels} For raw pixel data
     * @category rendering
     * @advanced
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
