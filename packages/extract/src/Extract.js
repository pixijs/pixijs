import { RenderTexture } from '@pixi/core';
import { CanvasRenderTarget } from '@pixi/utils';
import { Rectangle } from '@pixi/math';

const TEMP_RECT = new Rectangle();
const BYTES_PER_PIXEL = 4;

/**
 * The extract manager provides functionality to export content from the renderers.
 *
 * An instance of this class is automatically created by default, and can be found at `renderer.plugins.extract`
 *
 * @class
 * @memberof PIXI.extract
 */
export default class Extract
{
    /**
     * @param {PIXI.Renderer} renderer - A reference to the current renderer
     */
    constructor(renderer)
    {
        this.renderer = renderer;
        /**
         * Collection of methods for extracting data (image, pixels, etc.) from a display object or render texture
         *
         * @member {PIXI.extract.Extract} extract
         * @memberof PIXI.Renderer#
         * @see PIXI.extract.Extract
         */
        renderer.extract = this;
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
    image(target, format, quality)
    {
        const image = new Image();

        image.src = this.base64(target, format, quality);

        return image;
    }

    /**
     * Will return a a base64 encoded string of this target. It works by calling
     *  `Extract.getCanvas` and then running toDataURL on that.
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param {string} [format] - Image format, e.g. "image/jpeg" or "image/webp".
     * @param {number} [quality] - JPEG or Webp compression from 0 to 1. Default is 0.92.
     * @return {string} A base64 encoded string of the texture.
     */
    base64(target, format, quality)
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
    canvas(target)
    {
        const renderer = this.renderer;
        let resolution;
        let frame;
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
                renderTexture = this.renderer.generateTexture(target);
                generated = true;
            }
        }

        if (renderTexture)
        {
            resolution = renderTexture.baseTexture.resolution;
            frame = renderTexture.frame;
            flipY = false;
            renderer.renderTexture.bind(renderTexture);
        }
        else
        {
            resolution = this.renderer.resolution;

            flipY = true;

            frame = TEMP_RECT;
            frame.width = this.renderer.width;
            frame.height = this.renderer.height;

            renderer.renderTexture.bind(null);
        }

        const width = frame.width * resolution;
        const height = frame.height * resolution;

        const canvasBuffer = new CanvasRenderTarget(width, height, 1);

        const webglPixels = new Uint8Array(BYTES_PER_PIXEL * width * height);

        // read pixels to the array
        const gl = renderer.gl;

        gl.readPixels(
            frame.x * resolution,
            frame.y * resolution,
            width,
            height,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            webglPixels
        );

        // add the pixels to the canvas
        const canvasData = canvasBuffer.context.getImageData(0, 0, width, height);

        canvasData.data.set(webglPixels);

        canvasBuffer.context.putImageData(canvasData, 0, 0);

        // pulling pixels
        if (flipY)
        {
            canvasBuffer.context.scale(1, -1);
            canvasBuffer.context.drawImage(canvasBuffer.canvas, 0, -height);
        }

        if (generated)
        {
            renderTexture.destroy(true);
        }

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
    pixels(target)
    {
        const renderer = this.renderer;
        let resolution;
        let frame;
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
                renderTexture = this.renderer.generateTexture(target);
                generated = true;
            }
        }

        if (renderTexture)
        {
            resolution = renderTexture.baseTexture.resolution;
            frame = renderTexture.frame;

            // bind the buffer
            renderer.renderTexture.bind(renderTexture);
        }
        else
        {
            resolution = renderer.resolution;

            frame = TEMP_RECT;
            frame.width = renderer.width;
            frame.height = renderer.height;

            renderer.renderTexture.bind(null);
        }

        const width = frame.width * resolution;
        const height = frame.height * resolution;

        const webglPixels = new Uint8Array(BYTES_PER_PIXEL * width * height);

        // read pixels to the array
        const gl = renderer.gl;

        gl.readPixels(
            frame.x * resolution,
            frame.y * resolution,
            width,
            height,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            webglPixels
        );

        if (generated)
        {
            renderTexture.destroy(true);
        }

        return webglPixels;
    }

    /**
     * Destroys the extract
     *
     */
    destroy()
    {
        this.renderer.extract = null;
        this.renderer = null;
    }
}
