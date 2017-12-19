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
     */
    upload(renderer, baseTexture, glTexture)
    {
        const gl = renderer.gl;

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.premultiplyAlpha);

        // TODO add texSub2d option
        gl.texImage2D(gl.TEXTURE_2D, 0, baseTexture.format, baseTexture.format, baseTexture.type, this.source);

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
