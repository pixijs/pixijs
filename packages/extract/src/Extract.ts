import { extensions, ExtensionType, FORMATS, Rectangle, RenderTexture, utils } from '@pixi/core';

import type { ExtensionMetadata, ICanvas, ISystem, Renderer } from '@pixi/core';
import type { DisplayObject } from '@pixi/display';

const TEMP_RECT = new Rectangle();
const BYTES_PER_PIXEL = 4;

export interface IExtract
{
    image(target?: DisplayObject | RenderTexture, format?: string, quality?: number,
        frame?: Rectangle): Promise<HTMLImageElement>;
    base64(target?: DisplayObject | RenderTexture, format?: string, quality?: number,
        frame?: Rectangle): Promise<string>;
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

    /** Does the renderer have alpha and are its color channels stored premultipled by the alpha channel? */
    private _rendererPremultipliedAlpha: boolean;

    /**
     * @param renderer - A reference to the current renderer
     */
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
        this._rendererPremultipliedAlpha = false;
    }

    protected contextChange(): void
    {
        const attributes = this.renderer?.gl.getContextAttributes();

        this._rendererPremultipliedAlpha = !!(attributes && attributes.alpha && attributes.premultipliedAlpha);
    }

    /**
     * Will return a HTML Image of the target
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param format - Image format, e.g. "image/jpeg" or "image/webp".
     * @param quality - JPEG or Webp compression from 0 to 1. Default is 0.92.
     * @param frame - The frame the extraction is restricted to.
     * @returns - HTML Image of the target
     */
    public async image(target?: DisplayObject | RenderTexture, format?: string, quality?: number,
        frame?: Rectangle): Promise<HTMLImageElement>
    {
        const image = new Image();

        image.src = await this.base64(target, format, quality, frame);

        return image;
    }

    /**
     * Will return a base64 encoded string of this target. It works by calling
     *  `Extract.canvas` and then running toDataURL on that.
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param format - Image format, e.g. "image/jpeg" or "image/webp".
     * @param quality - JPEG or Webp compression from 0 to 1. Default is 0.92.
     * @param frame - The frame the extraction is restricted to.
     * @returns - A base64 encoded string of the texture.
     */
    public async base64(target?: DisplayObject | RenderTexture, format?: string, quality?: number,
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

    /**
     * Creates a Canvas element, renders this target to it and then returns it.
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param frame - The frame the extraction is restricted to.
     * @returns - A Canvas element with the texture rendered on.
     */
    public canvas(target?: DisplayObject | RenderTexture, frame?: Rectangle): ICanvas
    {
        const { pixels, width, height, flipY, premultipliedAlpha } = this._rawPixels(target, frame);

        // Flipping pixels
        if (flipY)
        {
            Extract._flipY(pixels, width, height);
        }

        if (premultipliedAlpha)
        {
            Extract._unpremultiplyAlpha(pixels);
        }

        const canvasBuffer = new utils.CanvasRenderTarget(width, height, 1);

        // Add the pixels to the canvas
        const imageData = new ImageData(new Uint8ClampedArray(pixels.buffer), width, height);

        canvasBuffer.context.putImageData(imageData, 0, 0);

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
        const { pixels, width, height, flipY, premultipliedAlpha } = this._rawPixels(target, frame);

        if (flipY)
        {
            Extract._flipY(pixels, width, height);
        }

        if (premultipliedAlpha)
        {
            Extract._unpremultiplyAlpha(pixels);
        }

        return pixels;
    }

    private _rawPixels(target?: DisplayObject | RenderTexture, frame?: Rectangle): {
        pixels: Uint8Array, width: number, height: number, flipY: boolean, premultipliedAlpha: boolean
    }
    {
        const renderer = this.renderer;

        if (!renderer)
        {
            throw new Error('The Extract has already been destroyed');
        }

        let resolution;
        let flipY = false;
        let premultipliedAlpha = false;
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
                renderTexture = renderer.generateTexture(target, {
                    region: frame,
                    resolution: renderer.resolution,
                    multisample: renderer.multisample
                });
                generated = true;

                if (frame)
                {
                    TEMP_RECT.width = frame.width;
                    TEMP_RECT.height = frame.height;
                    frame = TEMP_RECT;
                }
            }
        }

        const gl = renderer.gl;

        if (renderTexture)
        {
            resolution = renderTexture.baseTexture.resolution;
            frame = frame ?? renderTexture.frame;
            flipY = false;
            premultipliedAlpha = renderTexture.baseTexture.alphaMode > 0
                && renderTexture.baseTexture.format === FORMATS.RGBA;

            if (!generated)
            {
                renderer.renderTexture.bind(renderTexture);

                const fbo = renderTexture.framebuffer.glFramebuffers[renderer.CONTEXT_UID];

                if (fbo.blitFramebuffer)
                {
                    renderer.framebuffer.bind(fbo.blitFramebuffer);
                }
            }
        }
        else
        {
            resolution = renderer.resolution;

            if (!frame)
            {
                frame = TEMP_RECT;
                frame.width = renderer.width / resolution;
                frame.height = renderer.height / resolution;
            }

            flipY = true;
            premultipliedAlpha = this._rendererPremultipliedAlpha;
            renderer.renderTexture.bind();
        }

        const width = Math.max(Math.round(frame.width * resolution), 1);
        const height = Math.max(Math.round(frame.height * resolution), 1);

        const pixels = new Uint8Array(BYTES_PER_PIXEL * width * height);

        // Read pixels to the array
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

        return { pixels, width, height, flipY, premultipliedAlpha };
    }

    /** Destroys the extract. */
    public destroy(): void
    {
        this.renderer = null;
    }

    private static _flipY(pixels: Uint8Array | Uint8ClampedArray, width: number, height: number): void
    {
        const w = width << 2;
        const h = height >> 1;
        const temp = new Uint8Array(w);

        for (let y = 0; y < h; y++)
        {
            const t = y * w;
            const b = (height - y - 1) * w;

            temp.set(pixels.subarray(t, t + w));
            pixels.copyWithin(t, b, b + w);
            pixels.set(temp, b);
        }
    }

    private static _unpremultiplyAlpha(pixels: Uint8Array | Uint8ClampedArray): void
    {
        if (pixels instanceof Uint8ClampedArray)
        {
            pixels = new Uint8Array(pixels.buffer);
        }

        const n = pixels.length;

        for (let i = 0; i < n; i += 4)
        {
            const alpha = pixels[i + 3];

            if (alpha !== 0)
            {
                const a = 255.001 / alpha;

                pixels[i] = (pixels[i] * a) + 0.5;
                pixels[i + 1] = (pixels[i + 1] * a) + 0.5;
                pixels[i + 2] = (pixels[i + 2] * a) + 0.5;
            }
        }
    }
}

extensions.add(Extract);
