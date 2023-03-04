import { extensions, ExtensionType, MSAA_QUALITY, Rectangle, RenderTexture, utils } from '@pixi/core';

import type { ExtensionMetadata, ICanvas, ISystem, Renderer } from '@pixi/core';
import type { DisplayObject } from '@pixi/display';

const TEMP_RECT = new Rectangle();
const BYTES_PER_PIXEL = 4;

export interface IExtract
{
    image(target?: DisplayObject | RenderTexture, format?: string, quality?: number): Promise<HTMLImageElement>;
    base64(target?: DisplayObject | RenderTexture, format?: string, quality?: number): Promise<string>;
    canvas(target?: DisplayObject | RenderTexture, frame?: Rectangle): ICanvas;
    pixels(target?: DisplayObject | RenderTexture, frame?: Rectangle): Uint8Array | Uint8ClampedArray;
}

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
 *
 * // Draw a red circle
 * const graphics = new Graphics()
 *     .beginFill(0xFF0000)
 *     .drawCircle(0, 0, 50);
 *
 * // Render the graphics as an HTMLImageElement
 * const image = await app.renderer.extract.image(graphics);
 * document.body.appendChild(image);
 * @memberof PIXI
 */

export class Extract implements ISystem, IExtract
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        name: 'extract',
        type: ExtensionType.RendererSystem,
    };

    private renderer: Renderer | null;

    /**
     * @param renderer - A reference to the current renderer
     */
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
    }

    /**
     * Will return a HTML Image of the target
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param format - Image format, e.g. "image/jpeg" or "image/webp".
     * @param quality - JPEG or Webp compression from 0 to 1. Default is 0.92.
     * @returns - HTML Image of the target
     */
    public async image(target?: DisplayObject | RenderTexture, format?: string, quality?: number): Promise<HTMLImageElement>
    {
        const image = new Image();

        image.src = await this.base64(target, format, quality);

        return image;
    }

    /**
     * Will return a base64 encoded string of this target. It works by calling
     *  `Extract.getCanvas` and then running toDataURL on that.
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param format - Image format, e.g. "image/jpeg" or "image/webp".
     * @param quality - JPEG or Webp compression from 0 to 1. Default is 0.92.
     * @returns - A base64 encoded string of the texture.
     */
    public async base64(target?: DisplayObject | RenderTexture, format?: string, quality?: number): Promise<string>
    {
        const canvas = this.canvas(target);

        if (canvas.toDataURL !== undefined)
        {
            return canvas.toDataURL(format, quality);
        }
        if (canvas.convertToBlob !== undefined)
        {
            const blob = await canvas.convertToBlob({ type: format, quality });

            return await new Promise<string>((resolve) =>
            {
                const reader = new FileReader();

                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        }

        throw new Error('Extract.base64() requires ICanvas.toDataURL or ICanvas.convertToBlob to be implemented');
    }

    /**
     * Creates a Canvas element, renders this target to it and then returns it.
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param frame - The frame the extraction is restricted to.
     * @returns - A Canvas element with the texture rendered on.
     */
    public canvas(target?: DisplayObject | RenderTexture, frame?: Rectangle): ICanvas
    {
        const { pixels, width, height, flipY } = this._rawPixels(target, frame);

        let canvasBuffer = new utils.CanvasRenderTarget(width, height, 1);

        // Add the pixels to the canvas
        const canvasData = canvasBuffer.context.getImageData(0, 0, width, height);

        Extract.arrayPostDivide(pixels, canvasData.data);

        canvasBuffer.context.putImageData(canvasData, 0, 0);

        // Flipping pixels
        if (flipY)
        {
            const target = new utils.CanvasRenderTarget(canvasBuffer.width, canvasBuffer.height, 1);

            target.context.scale(1, -1);

            // We can't render to itself because we should be empty before render.
            target.context.drawImage(canvasBuffer.canvas, 0, -height);

            canvasBuffer.destroy();
            canvasBuffer = target;
        }

        // Send the canvas back
        return canvasBuffer.canvas;
    }

    /**
     * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA
     * order, with integer values between 0 and 255 (included).
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param frame - The frame the extraction is restricted to.
     * @returns - One-dimensional array containing the pixel data of the entire texture
     */
    public pixels(target?: DisplayObject | RenderTexture, frame?: Rectangle): Uint8Array
    {
        const { pixels } = this._rawPixels(target, frame);

        Extract.arrayPostDivide(pixels, pixels);

        return pixels;
    }

    private _rawPixels(target?: DisplayObject | RenderTexture, frame?: Rectangle): {
        pixels: Uint8Array, width: number, height: number, flipY: boolean,
    }
    {
        const renderer = this.renderer;

        if (!renderer)
        {
            throw new Error('The Extract has already been destroyed');
        }

        let resolution;
        let flipY = false;
        let renderTexture;
        let generated = false;

        if (target)
        {
            if (target instanceof RenderTexture)
            {
                renderTexture = target;
            }
            else
            {
                const multisample = renderer.context.webGLVersion >= 2 ? renderer.multisample : MSAA_QUALITY.NONE;

                renderTexture = renderer.generateTexture(target, { multisample });

                if (multisample !== MSAA_QUALITY.NONE)
                {
                    // Resolve the multisampled texture to a non-multisampled texture
                    const resolvedTexture = RenderTexture.create({
                        width: renderTexture.width,
                        height: renderTexture.height,
                    });

                    renderer.framebuffer.bind(renderTexture.framebuffer);
                    renderer.framebuffer.blit(resolvedTexture.framebuffer);
                    renderer.framebuffer.bind();

                    renderTexture.destroy(true);
                    renderTexture = resolvedTexture;
                }

                generated = true;
            }
        }

        if (renderTexture)
        {
            resolution = renderTexture.baseTexture.resolution;
            frame = frame ?? renderTexture.frame;
            flipY = false;
            renderer.renderTexture.bind(renderTexture);
        }
        else
        {
            resolution = renderer.resolution;

            if (!frame)
            {
                frame = TEMP_RECT;
                frame.width = renderer.width;
                frame.height = renderer.height;
            }

            flipY = true;
            renderer.renderTexture.bind();
        }

        const width = Math.round(frame.width * resolution);
        const height = Math.round(frame.height * resolution);

        const pixels = new Uint8Array(BYTES_PER_PIXEL * width * height);

        // Read pixels to the array
        const gl = renderer.gl;

        gl.readPixels(
            Math.round(frame.x * resolution),
            Math.round(frame.y * resolution),
            width,
            height,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixels
        );

        if (generated)
        {
            renderTexture?.destroy(true);
        }

        return { pixels, width, height, flipY };
    }

    /** Destroys the extract. */
    public destroy(): void
    {
        this.renderer = null;
    }

    /**
     * Takes premultiplied pixel data and produces regular pixel data
     * @private
     * @param pixels - array of pixel data
     * @param out - output array
     */
    static arrayPostDivide(
        pixels: number[] | Uint8Array | Uint8ClampedArray, out: number[] | Uint8Array | Uint8ClampedArray
    ): void
    {
        for (let i = 0; i < pixels.length; i += 4)
        {
            const alpha = out[i + 3] = pixels[i + 3];

            if (alpha !== 0)
            {
                out[i] = Math.round(Math.min(pixels[i] * 255.0 / alpha, 255.0));
                out[i + 1] = Math.round(Math.min(pixels[i + 1] * 255.0 / alpha, 255.0));
                out[i + 2] = Math.round(Math.min(pixels[i + 2] * 255.0 / alpha, 255.0));
            }
            else
            {
                out[i] = pixels[i];
                out[i + 1] = pixels[i + 1];
                out[i + 2] = pixels[i + 2];
            }
        }
    }
}

extensions.add(Extract);
