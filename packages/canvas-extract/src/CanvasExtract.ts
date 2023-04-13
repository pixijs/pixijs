import { extensions, ExtensionType, RenderTexture, utils } from '@pixi/core';

import type { CanvasRenderer } from '@pixi/canvas-renderer';
import type { ExtensionMetadata, ICanvas, ICanvasRenderingContext2D, ISystem, Rectangle } from '@pixi/core';
import type { DisplayObject } from '@pixi/display';
import type { IExtract } from '@pixi/extract';

/**
 * The extract manager provides functionality to export content from the renderers.
 *
 * An instance of this class is automatically created by default, and can be found at `renderer.extract`
 * @class
 * @memberof PIXI
 */
export class CanvasExtract implements ISystem, IExtract
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        name: 'extract',
        type: ExtensionType.CanvasRendererSystem,
    };

    /** A reference to the current renderer */
    public renderer: CanvasRenderer | null;

    /**
     * @param renderer - A reference to the current renderer
     */
    constructor(renderer: CanvasRenderer)
    {
        this.renderer = renderer;
    }

    /**
     * Will return a HTML Image of the target
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param format - Image format, e.g. "image/jpeg" or "image/webp".
     * @param quality - JPEG or Webp compression from 0 to 1. Default is 0.92.
     * @param frame - The frame the extraction is restricted to.
     * @returns HTML Image of the target
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
     *  `CanvasExtract.getCanvas` and then running toDataURL on that.
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param format - Image format, e.g. "image/jpeg" or "image/webp".
     * @param quality - JPEG or Webp compression from 0 to 1. Default is 0.92.
     * @param frame - The frame the extraction is restricted to.
     * @returns A base64 encoded string of the texture.
     */
    public async base64(target?: DisplayObject | RenderTexture, format?: string, quality?: number,
        frame?: Rectangle): Promise<string>
    {
        const { canvas: c, context, sx, sy, sw, sh } = this._canvas(target, frame);
        let canvas = c;

        if (!(sx === 0 && sy === 0 && sw === c.width && sh === c.height))
        {
            const imageData = context.getImageData(sx, sy, sw, sh);
            const canvasBuffer = new utils.CanvasRenderTarget(sw, sh, 1);

            canvasBuffer.context.putImageData(imageData, 0, 0);
            canvas = canvasBuffer.canvas;
        }

        if (canvas.toBlob !== undefined)
        {
            return new Promise<string>((resolve, reject) =>
            {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                canvas.toBlob!((blob) =>
                {
                    if (!blob)
                    {
                        reject(new Error('ICanvas.toBlob failed'));

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

        throw new Error('CanvasExtract.base64() requires ICanvas.toDataURL, ICanvas.toBlob, '
            + 'or ICanvas.convertToBlob to be implemented');
    }

    /**
     * Creates an ImageBitmap from the target.
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param frame - The frame the extraction is restricted to.
     * @returns - One-dimensional array containing the pixel data of the entire texture
     */
    public async bitmap(target?: DisplayObject | RenderTexture, frame?: Rectangle): Promise<ImageBitmap>
    {
        const { canvas, context, sx, sy, sw, sh } = this._canvas(target, frame);

        if (typeof createImageBitmap === 'undefined')
        {
            throw new Error('createImageBitmap is not supported');
        }

        if (canvas instanceof HTMLCanvasElement || canvas instanceof OffscreenCanvas)
        {
            return createImageBitmap(canvas, sx, sy, sw, sh);
        }

        const imageData = context.getImageData(sx, sy, sw, sh);
        let bitmap: ImageBitmap;

        try
        {
            bitmap = await createImageBitmap(imageData);
        }
        catch (e)
        {
            const canvasBuffer = new utils.CanvasRenderTarget(sw, sh, 1);

            canvasBuffer.context.putImageData(imageData, 0, 0);

            bitmap = await createImageBitmap(canvasBuffer.canvas as ImageBitmapSource);
        }

        return bitmap;
    }

    /**
     * Creates a Canvas element, renders this target to it and then returns it.
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param frame - The frame the extraction is restricted to.
     * @param {boolean} [async=false] - Perform the extraction asynchronously?
     * @returns {ICanvas | Promise<ICanvas>} A Canvas element with the texture rendered on.
     */
    public canvas<T extends boolean = false>(target?: DisplayObject | RenderTexture, frame?: Rectangle, async?: T):
    T extends true ? Promise<ICanvas> : ICanvas
    {
        const imageData = this._imageData(target, frame);
        const canvasBuffer = new utils.CanvasRenderTarget(imageData.width, imageData.height, 1);

        canvasBuffer.context.putImageData(imageData, 0, 0);

        const canvas = canvasBuffer.canvas;

        if (async)
        {
            return Promise.resolve(canvas) as any;
        }

        return canvas as any;
    }

    /**
     * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA
     * order, with integer values between 0 and 255 (included).
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param frame - The frame the extraction is restricted to.
     * @param {boolean} [async=false] - Perform the extraction asynchronously?
     * @returns {Uint8ClampedArray | Promise<Uint8ClampedArray>}
     *      One-dimensional array containing the pixel data of the entire texture
     */
    public pixels<T extends boolean = false>(target?: DisplayObject | RenderTexture, frame?: Rectangle, async?: T):
    T extends true ? Promise<Uint8ClampedArray> : Uint8ClampedArray
    {
        const pixels = this._imageData(target, frame).data;

        if (async)
        {
            return Promise.resolve(pixels) as any;
        }

        return pixels as any;
    }

    private _canvas(target?: DisplayObject | RenderTexture, frame?: Rectangle):
    { canvas: ICanvas, context: ICanvasRenderingContext2D, sx: number, sy: number, sw: number, sh: number }
    {
        const renderer = this.renderer;

        if (!renderer)
        {
            throw new Error('The CanvasExtract has already been destroyed');
        }

        let canvas;
        let context;
        let resolution;
        let renderTexture;

        if (target)
        {
            if (target instanceof RenderTexture)
            {
                renderTexture = target;
            }
            else
            {
                renderTexture = renderer.generateTexture(target, {
                    resolution: renderer.resolution
                });
            }
        }

        if (renderTexture)
        {
            canvas = renderTexture.baseTexture._canvasRenderTarget.canvas;
            context = renderTexture.baseTexture._canvasRenderTarget.context;
            resolution = renderTexture.baseTexture._canvasRenderTarget.resolution;
            frame ??= renderTexture.frame;
        }
        else
        {
            canvas = renderer.view;
            context = renderer.canvasContext.rootContext;
            resolution = renderer.resolution;
            frame ??= renderer.screen;
        }

        const sx = Math.round(frame.x * resolution);
        const sy = Math.round(frame.y * resolution);
        const sw = Math.round(frame.width * resolution);
        const sh = Math.round(frame.height * resolution);

        return { canvas, context, sx, sy, sw, sh };
    }

    private _imageData(target?: DisplayObject | RenderTexture, frame?: Rectangle): ImageData
    {
        const { context, sx, sy, sw, sh } = this._canvas(target, frame);

        return context.getImageData(sx, sy, sw, sh);
    }

    /** Destroys the extract */
    public destroy(): void
    {
        this.renderer = null;
    }
}

extensions.add(CanvasExtract);
