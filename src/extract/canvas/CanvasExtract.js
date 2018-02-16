import * as core from '../../core';
import CanvasData from '../CanvasData';

const TEMP_RECT = new core.Rectangle();

/**
 * The extract manager provides functionality to export content from the renderers.
 *
 * An instance of this class is automatically created by default, and can be found at renderer.plugins.extract
 *
 * @class
 * @memberof PIXI.extract
 */
export default class CanvasExtract
{
    /**
     * @param {PIXI.CanvasRenderer} renderer - A reference to the current renderer
     */
    constructor(renderer)
    {
        this.renderer = renderer;
        /**
         * Collection of methods for extracting data (image, pixels, etc.) from a display object or render texture
         *
         * @member {PIXI.extract.CanvasExtract} extract
         * @memberof PIXI.CanvasRenderer#
         * @see PIXI.extract.CanvasExtract
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
     * @return {PIXI.extract.CanvasData} Returns everything
     */
    data(target, region)
    {
        const renderer = this.renderer;
        let context;
        let resolution;
        let frame;
        let renderTexture;

        if (target)
        {
            if (target instanceof core.RenderTexture)
            {
                renderTexture = target;
            }
            else
            {
                renderTexture = renderer.generateTexture(target, region);
            }
        }

        if (renderTexture)
        {
            context = renderTexture.baseTexture._canvasRenderTarget.context;
            resolution = renderTexture.baseTexture._canvasRenderTarget.resolution;
            frame = region || renderTexture.frame;
        }
        else
        {
            context = renderer.rootContext;
            resolution = renderer.resolution;

            frame = TEMP_RECT;
            if (region)
            {
                frame.copy(region);
            }
            else
            {
                frame.x = 0;
                frame.y = 0;
                frame.width = renderer.width;
                frame.height = renderer.height;
            }
        }

        const pixels = context.getImageData(0, 0, frame.width * resolution, frame.height * resolution).data;

        return new CanvasData(pixels, frame, resolution);
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

core.CanvasRenderer.registerPlugin('extract', CanvasExtract);
