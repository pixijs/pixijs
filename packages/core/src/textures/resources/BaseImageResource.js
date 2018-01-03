import Resource from './Resource';
import { determineCrossOrigin } from '@pixi/utils';

/**
 * Base for all the image/canvas resources
 * @class
 * @extends PIXI.resources.Resource
 * @memberof PIXI.resources
 */
export default class BaseImageResource extends Resource
{
    /**
     * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|SVGElement} source
     */
    constructor(source)
    {
        super(source.width, source.height);

        /**
         * The source element
         * @member {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|SVGElement}
         * @readonly
         */
        this.source = source;
    }

    /**
     * Set cross origin based detecting the url and the crossorigin
     * @protected
     * @param {HTMLElement} element - Element to apply crossOrigin
     * @param {string} url - URL to check
     * @param {boolean|string} [crossorigin=true] - Cross origin value to use
     */
    static crossOrigin(element, url, crossorigin)
    {
        if (crossorigin === undefined && url.indexOf('data:') !== 0)
        {
            element.crossOrigin = determineCrossOrigin(url);
        }
        else if (crossorigin !== false)
        {
            element.crossOrigin = typeof crossorigin === 'string' ? crossorigin : 'anonymous';
        }
    }

    /**
     * Upload the texture to the GPU.
     * @param {PIXI.Renderer} renderer Upload to the renderer
     * @param {PIXI.BaseTexture} baseTexture Reference to parent texture
     * @param {PIXI.glCore.GLTexture} glTexture Reference
     * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|SVGElement} source (optional)
     */
    upload(renderer, baseTexture, glTexture, source)
    {
        const gl = renderer.gl;
        const width = baseTexture.realWidth;
        const height = baseTexture.realHeight;

        source = source || this.source;

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.premultiplyAlpha);

        if (glTexture.width === width && glTexture.height === height)
        {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, baseTexture.format, baseTexture.type, source);
        }
        else
        {
            glTexture.width = width;
            glTexture.height = height;

            gl.texImage2D(gl.TEXTURE_2D, 0, baseTexture.format, baseTexture.format, baseTexture.type, source);
        }

        return true;
    }

    /**
     * Destroy this BaseImageResource
     * @override
     * @param {PIXI.BaseTexture} [fromTexture] Optional base texture
     * @return {boolean} Destroy was successful
     */
    dispose()
    {
        this.source = null;
    }
}
