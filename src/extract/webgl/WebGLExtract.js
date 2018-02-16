import * as core from '../../core';
import CanvasData from '../CanvasData';

const TEMP_RECT = new core.Rectangle();
const BYTES_PER_PIXEL = 4;

/**
 * The extract manager provides functionality to export content from the renderers.
 *
 * An instance of this class is automatically created by default, and can be found at renderer.plugins.extract
 *
 * All methods use global coordinates of the target. Please assign temporary parent and call updateTransform to use local.
 *
 * @class
 * @memberof PIXI.extract
 */
export class WebGLExtract
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
     * Will return a HTML Image of the target.
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use use the main renderer
     * @param {PIXI.Rectangle} [region] - The region of screen, or part of RenderTexture that has to be extracted.
     * @return {HTMLImageElement} HTML Image of the target
     */
    image(target, region)
    {
        const image = new Image();

        image.src = this.data(target, region).base64();

        return image;
    }

    /**
     * Will return a a base64 encoded string of this target. It works by calling
     *  `WebGLExtract.getCanvas` and then running toDataURL on that.
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture|null} [target=null] - A displayObject or renderTexture
     *  to convert. If left empty will use use the main renderer
     * @param {PIXI.Rectangle} [region] - The region of screen, or part of RenderTexture that has to be extracted.
     * @return {string} A base64 encoded string of the texture.
     */
    base64(target, region)
    {
        return this.data(target, region).base64();
    }

    /**
     * Creates a Canvas element, renders this target to it and then returns it.
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture|null} [target=null] - A displayObject or renderTexture
     *  to convert. If left empty will use use the main renderer
     * @param {PIXI.Rectangle} [region] - The region of screen, or part of RenderTexture that has to be extracted.
     * @return {HTMLCanvasElement} A Canvas element with the texture rendered on.
     */
    canvas(target, region)
    {
        return this.data(target, region).canvas();
    }

    /**
     * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA
     * order, with integer values between 0 and 255 (included).
     *
     * If you want width and height, use `pixelsAndFrame`, it also returns resolution of the object
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture|null} [target=null] - A displayObject or renderTexture
     *  to convert. If left empty will use use the main renderer
     * @param {PIXI.Rectangle} [region] - The region of screen, or part of RenderTexture that has to be extracted.
     * @return {Uint8Array} Array of pixels.
     */
    pixels(target, region)
    {
        return this.data(target, region).pixels;
    }

    /**
     * Returns object that has everything you need to know about pixels region of the target
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture|null} [target=null] - A displayObject or renderTexture
     *  to convert. If left empty will use use the main renderer
     * @param {PIXI.Rectangle} [region] - The region of screen, or part of RenderTexture that has to be extracted.
     * @param {boolean} [normalize=true] - call normalize just after extraction
     * @return {PIXI.extract.CanvasData} Returns everything
     */
    data(target, region, normalize = true)
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
                frame.x = 0;
                frame.y = 0;
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
        }

        if (generated)
        {
            renderTexture.destroy(true);
        }

        const result = new CanvasData(webglPixels, frame, resolution, true, flipY);

        if (normalize)
        {
            result.normalize();
        }

        return result;
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
