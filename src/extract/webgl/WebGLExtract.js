import * as core from '../../core';

const TEMP_RECT = new core.Rectangle();
const BYTES_PER_PIXEL = 4;

/**
 * The extract manager provides functionality to export content from the renderers.
 *
 * An instance of this class is automatically created by default, and can be found at renderer.plugins.extract
 *
 * @class
 * @memberof PIXI.extract
 */
export default class WebGLExtract
{
    /**
     * @param {PIXI.WebGLRenderer} renderer - A reference to the current renderer
     */
    constructor(renderer)
    {
        this.renderer = renderer;
        /**
         * Collection of methods for extracting data (image, pixels, etc.) from a display object or render texture
         *
         * @member {PIXI.extract.WebGLExtract} extract
         * @memberof PIXI.WebGLRenderer#
         * @see PIXI.extract.WebGLExtract
         */
        renderer.extract = this;
    }

    /**
     * Will return a HTML Image of the target
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use use the main renderer
     * @param {PIXI.Rectangle} [region] - The region of screen, or part of RenderTexture that has to be extracted.
     * @param {boolean} [premultipliedAlpha=false] Neutralizes pre-multiplied alpha.
     * @return {HTMLImageElement} HTML Image of the target
     */
    image(target, region, premultipliedAlpha)
    {
        const image = new Image();

        image.src = this.base64(target, region, premultipliedAlpha);

        return image;
    }

    /**
     * Will return a a base64 encoded string of this target. It works by calling
     *  `WebGLExtract.getCanvas` and then running toDataURL on that.
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use use the main renderer
     * @param {PIXI.Rectangle} [region] - The region of screen, or part of RenderTexture that has to be extracted.
     * @param {boolean} [premultipliedAlpha=false] Neutralizes pre-multiplied alpha.
     * @return {string} A base64 encoded string of the texture.
     */
    base64(target, region, premultipliedAlpha)
    {
        return this.canvas(target, region, premultipliedAlpha).toDataURL();
    }

    /**
     * Creates a Canvas element, renders this target to it and then returns it.
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture|null} target - A displayObject or renderTexture
     *  to convert. If left empty will use use the main renderer
     * @param {PIXI.Rectangle} [region] - The region of screen, or part of RenderTexture that has to be extracted.
     * @param {boolean} [premultipliedAlpha=false] Neutralizes pre-multiplied alpha.
     * @return {HTMLCanvasElement} A Canvas element with the texture rendered on.
     */
    canvas(target, region, premultipliedAlpha = false)
    {
        const renderer = this.renderer;
        let textureBuffer;
        let resolution;
        let frame;
        let flipY = false;
        let renderTexture;
        let generated = false;

        if (target)
        {
            if (target instanceof core.RenderTexture)
            {
                renderTexture = target;
            }
            else
            {
                renderTexture = this.renderer.generateTexture(target, region);
                generated = true;
            }
        }

        if (renderTexture)
        {
            textureBuffer = renderTexture.baseTexture._glRenderTargets[this.renderer.CONTEXT_UID];
            resolution = textureBuffer.resolution;
            frame = region || renderTexture.frame;
            flipY = false;
        }
        else
        {
            textureBuffer = this.renderer.rootRenderTarget;
            resolution = textureBuffer.resolution;
            flipY = true;

            frame = TEMP_RECT;

            if (region)
            {
                frame.copy(region);
                frame.y = textureBuffer.size.height - frame.y - frame.height;
            }
            else
            {
                frame.width = textureBuffer.size.width;
                frame.height = textureBuffer.size.height;
            }
        }

        const width = frame.width * resolution;
        const height = frame.height * resolution;

        const canvasBuffer = new core.CanvasRenderTarget(width, height);

        if (textureBuffer)
        {
            // bind the buffer
            renderer.bindRenderTarget(textureBuffer);

            // set up an array of pixels
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

            if (premultipliedAlpha)
            {
                WebGLExtract.postDivide(webglPixels);
            }

            // add the pixels to the canvas
            const canvasData = canvasBuffer.context.getImageData(0, 0, width, height);

            canvasData.data.set(webglPixels);

            canvasBuffer.context.putImageData(canvasData, 0, 0);

            // pulling pixels
            if (flipY)
            {
                canvasBuffer.context.scale(1, -1);
                canvasBuffer.context.drawImage(canvasBuffer.canvas, 0, -height);
                canvasBuffer.context.scale(1, -1);
            }
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
     *  to convert. If left empty will use use the main renderer
     * @param {PIXI.Rectangle} [region] - The region of screen, or part of RenderTexture that has to be extracted.
     * @param {boolean} [premultipliedAlpha=false] Neutralizes pre-multiplied alpha.
     * @return {Uint8ClampedArray} One-dimensional array containing the pixel data of the entire texture
     */
    pixels(target, region, premultipliedAlpha = false)
    {
        const renderer = this.renderer;
        let textureBuffer;
        let resolution;
        let frame;
        let flipY = false;
        let renderTexture;
        let generated = false;

        if (target)
        {
            if (target instanceof core.RenderTexture)
            {
                renderTexture = target;
            }
            else
            {
                renderTexture = this.renderer.generateTexture(target, region);
                generated = true;
            }
        }

        if (renderTexture)
        {
            textureBuffer = renderTexture.baseTexture._glRenderTargets[this.renderer.CONTEXT_UID];
            resolution = textureBuffer.resolution;
            frame = region || renderTexture.frame;
            flipY = false;
        }
        else
        {
            textureBuffer = this.renderer.rootRenderTarget;
            resolution = textureBuffer.resolution;
            flipY = true;

            frame = TEMP_RECT;

            if (region)
            {
                frame.copy(region);
                frame.y = textureBuffer.size.height - frame.y - frame.height;
            }
            else
            {
                frame.width = textureBuffer.size.width;
                frame.height = textureBuffer.size.height;
            }
        }

        const width = frame.width * resolution;
        const height = frame.height * resolution;

        const webglPixels = new Uint8Array(BYTES_PER_PIXEL * width * height);

        if (textureBuffer)
        {
            // bind the buffer
            renderer.bindRenderTarget(textureBuffer);
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

            if (flipY)
            {
                this.flipY(webglPixels, width);
            }

            if (premultipliedAlpha)
            {
                WebGLExtract.postDivide(webglPixels);
            }
        }

        if (generated)
        {
            renderTexture.destroy(true);
        }

        return webglPixels;
    }

    /**
     * Neutralizes pre-multiplied alpha in pixels array
     * @param {Uint8Array} pixels input
     */
    static postDivide(pixels)
    {
        for (let i = 0; i < pixels.length; i += 4)
        {
            const alpha = pixels[i + 3];

            if (alpha)
            {
                pixels[i] = Math.round(pixels[i] * 255.0 / alpha);
                pixels[i + 1] = Math.round(pixels[i + 1] * 255.0 / alpha);
                pixels[i + 2] = Math.round(pixels[i + 2] * 255.0 / alpha);
            }
        }
    }

    /**
     * Flips Y in pixels array
     * @param {Uint8Array} pixels input
     * @param {number} width number of pixels in a row
     */
    static flipY(pixels, width)
    {
        const w4 = width * 4;

        for (let pos = 0; pos * 2 < pixels.length; pos += w4)
        {
            let pos1 = pos;
            let pos2 = pixels.length - pos - w4;
            let t = 0;

            for (let x = 0; x < w4; x++)
            {
                pos1++;
                pos2++;

                t = pixels[pos1];
                pixels[pos1] = pixels[pos2];
                pixels[pos2] = t;
            }
        }
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

core.WebGLRenderer.registerPlugin('extract', WebGLExtract);
