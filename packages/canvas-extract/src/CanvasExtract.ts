import { extensions, ExtensionType, Rectangle, RenderTexture, utils } from '@pixi/core';

import type { CanvasRenderer } from '@pixi/canvas-renderer';
import type { BaseRenderTexture, ExtensionMetadata, ICanvas, ISystem } from '@pixi/core';
import type { DisplayObject } from '@pixi/display';
import type { IExtract } from '@pixi/extract';

const TEMP_RECT = new Rectangle();

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

        throw new Error('CanvasExtract.base64() requires ICanvas.toDataURL, ICanvas.toBlob, '
            + 'or ICanvas.convertToBlob to be implemented');
    }

    /**
     * Creates a Canvas element, renders this target to it and then returns it.
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param frame - The frame the extraction is restricted to.
     * @returns A Canvas element with the texture rendered on.
     */
    public canvas(target?: DisplayObject | RenderTexture, frame?: Rectangle): ICanvas
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
                    region: frame,
                    resolution: renderer.resolution
                });

                if (frame)
                {
                    TEMP_RECT.width = frame.width;
                    TEMP_RECT.height = frame.height;
                    frame = TEMP_RECT;
                }
            }
        }

        if (renderTexture)
        {
            context = (renderTexture.baseTexture as BaseRenderTexture)._canvasRenderTarget.context;
            resolution = (renderTexture.baseTexture as BaseRenderTexture)._canvasRenderTarget.resolution;
            frame = frame ?? renderTexture.frame;
        }
        else
        {
            context = renderer.canvasContext.rootContext;
            resolution = renderer._view.resolution;

            if (!frame)
            {
                frame = TEMP_RECT;
                frame.width = renderer.width / resolution;
                frame.height = renderer.height / resolution;
            }
        }

        const x = Math.round(frame.x * resolution);
        const y = Math.round(frame.y * resolution);
        const width = Math.max(Math.round(frame.width * resolution), 1);
        const height = Math.max(Math.round(frame.height * resolution), 1);

        const canvasBuffer = new utils.CanvasRenderTarget(width, height, 1);
        const canvasData = context.getImageData(x, y, width, height);

        canvasBuffer.context.putImageData(canvasData, 0, 0);

        // send the canvas back..
        return canvasBuffer.canvas;
    }

    /**
     * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA
     * order, with integer values between 0 and 255 (included).
     * @param target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param frame - The frame the extraction is restricted to.
     * @returns One-dimensional array containing the pixel data of the entire texture
     */
    public pixels(target?: DisplayObject | RenderTexture, frame?: Rectangle): Uint8ClampedArray
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
                    region: frame,
                    resolution: renderer.resolution
                });

                if (frame)
                {
                    TEMP_RECT.width = frame.width;
                    TEMP_RECT.height = frame.height;
                    frame = TEMP_RECT;
                }
            }
        }

        if (renderTexture)
        {
            context = (renderTexture.baseTexture as BaseRenderTexture)._canvasRenderTarget.context;
            resolution = (renderTexture.baseTexture as BaseRenderTexture)._canvasRenderTarget.resolution;
            frame = frame ?? renderTexture.frame;
        }
        else
        {
            context = renderer.canvasContext.rootContext;
            resolution = renderer.resolution;

            if (!frame)
            {
                frame = TEMP_RECT;
                frame.width = renderer.width / resolution;
                frame.height = renderer.height / resolution;
            }
        }

        const x = Math.round(frame.x * resolution);
        const y = Math.round(frame.y * resolution);
        const width = Math.max(Math.round(frame.width * resolution), 1);
        const height = Math.max(Math.round(frame.height * resolution), 1);

        return context.getImageData(x, y, width, height).data;
    }

    /** Destroys the extract */
    public destroy(): void
    {
        this.renderer = null;
    }
}

extensions.add(CanvasExtract);
