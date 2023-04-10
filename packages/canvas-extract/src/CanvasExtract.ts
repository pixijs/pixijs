import { extensions, ExtensionType, RenderTexture, utils } from '@pixi/core';
import { ExtractWorker } from '../../extract/src/Extract';

import type { CanvasRenderer } from '@pixi/canvas-renderer';
import type { ExtensionMetadata, ICanvas, ISystem, Rectangle } from '@pixi/core';
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

    private _worker: ExtractWorker | undefined;

    private get worker(): ExtractWorker
    {
        this._worker ??= new ExtractWorker();

        return this._worker;
    }

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
        const imageData = this._imageData(target, frame);
        const pixels = imageData.data;
        const { width, height } = imageData;

        return this.worker.base64({ pixels, width, height }, format, quality);
    }

    /**
     * Creates an ImageBitmap from the target.
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param frame - The frame the extraction is restricted to.
     * @returns - One-dimensional array containing the pixel data of the entire texture
     */
    public bitmap(target?: DisplayObject | RenderTexture, frame?: Rectangle): Promise<ImageBitmap>
    {
        const imageData = this._imageData(target, frame);
        const pixels = imageData.data;
        const { width, height } = imageData;

        return this.worker.bitmap({ pixels, width, height });
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

    private _imageData(target?: DisplayObject | RenderTexture, frame?: Rectangle): ImageData
    {
        const renderer = this.renderer;

        if (!renderer)
        {
            throw new Error('The CanvasExtract has already been destroyed');
        }

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
            context = renderTexture.baseTexture._canvasRenderTarget.context;
            resolution = renderTexture.baseTexture._canvasRenderTarget.resolution;
            frame ??= renderTexture.frame;
        }
        else
        {
            context = renderer.canvasContext.rootContext;
            resolution = renderer.resolution;
            frame ??= renderer.screen;
        }

        const x = Math.round(frame.x * resolution);
        const y = Math.round(frame.y * resolution);
        const width = Math.round(frame.width * resolution);
        const height = Math.round(frame.height * resolution);

        return context.getImageData(x, y, width, height);
    }

    /** Destroys the extract */
    public destroy(): void
    {
        this._worker?.terminate();
        this._worker = undefined;
        this.renderer = null;
    }
}

extensions.add(CanvasExtract);
