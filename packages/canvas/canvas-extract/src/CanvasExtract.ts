import { RenderTexture } from '@pixi/core';
import { CanvasRenderTarget } from '@pixi/utils';
import { Rectangle } from '@pixi/math';
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { deprecation } from '@pixi/utils';
import type { DisplayObject } from '@pixi/display';
import type { BaseRenderTexture } from '@pixi/core';

const TEMP_RECT = new Rectangle();

/**
 * The extract manager provides functionality to export content from the renderers.
 *
 * An instance of this class is automatically created by default, and can be found at `renderer.plugins.extract`
 *
 * @class
 * @memberof PIXI
 */
export class CanvasExtract
{
    public renderer: CanvasRenderer;

    /**
     * @param {PIXI.CanvasRenderer} renderer - A reference to the current renderer
     */
    constructor(renderer: CanvasRenderer)
    {
        this.renderer = renderer;
    }

    /**
     * Will return a HTML Image of the target
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param {string} [format] - Image format, e.g. "image/jpeg" or "image/webp".
     * @param {number} [quality] - JPEG or Webp compression from 0 to 1. Default is 0.92.
     * @return {HTMLImageElement} HTML Image of the target
     */
    public image(target: DisplayObject|RenderTexture, format?: string, quality?: number): HTMLImageElement
    {
        const image = new Image();

        image.src = this.base64(target, format, quality);

        return image;
    }

    /**
     * Will return a a base64 encoded string of this target. It works by calling
     *  `CanvasExtract.getCanvas` and then running toDataURL on that.
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param {string} [format] - Image format, e.g. "image/jpeg" or "image/webp".
     * @param {number} [quality] - JPEG or Webp compression from 0 to 1. Default is 0.92.
     * @return {string} A base64 encoded string of the texture.
     */
    public base64(target: DisplayObject|RenderTexture, format?: string, quality?: number): string
    {
        return this.canvas(target).toDataURL(format, quality);
    }

    /**
     * Creates a Canvas element, renders this target to it and then returns it.
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @return {HTMLCanvasElement} A Canvas element with the texture rendered on.
     */
    public canvas(target: DisplayObject|RenderTexture): HTMLCanvasElement
    {
        const renderer = this.renderer;
        let context;
        let resolution;
        let frame;
        let renderTexture;

        if (target)
        {
            if (target instanceof RenderTexture)
            {
                renderTexture = target;
            }
            else
            {
                renderTexture = renderer.generateTexture(target);
            }
        }

        if (renderTexture)
        {
            context = (renderTexture.baseTexture as BaseRenderTexture)._canvasRenderTarget.context;
            resolution = (renderTexture.baseTexture as BaseRenderTexture)._canvasRenderTarget.resolution;
            frame = renderTexture.frame;
        }
        else
        {
            context = renderer.rootContext;
            resolution = renderer.resolution;
            frame = TEMP_RECT;
            frame.width = this.renderer.width;
            frame.height = this.renderer.height;
        }

        const width = Math.floor((frame.width * resolution) + 1e-4);
        const height = Math.floor((frame.height * resolution) + 1e-4);

        const canvasBuffer = new CanvasRenderTarget(width, height, 1);
        const canvasData = context.getImageData(frame.x * resolution, frame.y * resolution, width, height);

        canvasBuffer.context.putImageData(canvasData, 0, 0);

        // send the canvas back..
        return canvasBuffer.canvas;
    }

    /**
     * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA
     * order, with integer values between 0 and 255 (included).
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @return {Uint8ClampedArray} One-dimensional array containing the pixel data of the entire texture
     */
    public pixels(target: DisplayObject|RenderTexture): Uint8ClampedArray
    {
        const renderer = this.renderer;
        let context;
        let resolution;
        let frame;
        let renderTexture;

        if (target)
        {
            if (target instanceof RenderTexture)
            {
                renderTexture = target;
            }
            else
            {
                renderTexture = renderer.generateTexture(target);
            }
        }

        if (renderTexture)
        {
            context = (renderTexture.baseTexture as BaseRenderTexture)._canvasRenderTarget.context;
            resolution = (renderTexture.baseTexture as BaseRenderTexture)._canvasRenderTarget.resolution;
            frame = renderTexture.frame;
        }
        else
        {
            context = renderer.rootContext;

            frame = TEMP_RECT;
            frame.width = renderer.width;
            frame.height = renderer.height;
        }

        return context.getImageData(0, 0, frame.width * resolution, frame.height * resolution).data;
    }

    /**
     * Destroys the extract
     *
     */
    public destroy(): void
    {
        this.renderer = null;
    }
}

/**
 * @name PIXI.CanvasRenderer#extract
 * @type {PIXI.CanvasExtract}
 * @see PIXI.CanvasRenderer#plugins
 * @deprecated since 5.3.0
 */
Object.defineProperty(CanvasRenderer.prototype, 'extract',
    {
        get()
        {
            deprecation('v5.3.0', 'CanvasRenderer#extract is deprecated, use CanvasRenderer#plugins.extract');

            return this.plugins.extract;
        },
    }
);

