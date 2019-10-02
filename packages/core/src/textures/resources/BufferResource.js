import { Resource } from './Resource';
import { ALPHA_MODES } from '@pixi/constants';

/**
 * @interface SharedArrayBuffer
 */

/**
 * Buffer resource with data of typed array.
 * @class
 * @extends PIXI.resources.Resource
 * @memberof PIXI.resources
 */
export class BufferResource extends Resource
{
    /**
     * @param {Float32Array|Uint8Array|Uint32Array} source - Source buffer
     * @param {object} options - Options
     * @param {number} options.width - Width of the texture
     * @param {number} options.height - Height of the texture
     */
    constructor(source, options)
    {
        const { width, height } = options || {};

        if (!width || !height)
        {
            throw new Error('BufferResource width or height invalid');
        }

        super(width, height);

        /**
         * Source array
         * Cannot be ClampedUint8Array because it cant be uploaded to WebGL
         *
         * @member {Float32Array|Uint8Array|Uint32Array}
         */
        this.data = source;
    }

    /**
     * Upload the texture to the GPU.
     * @param {PIXI.Renderer} renderer Upload to the renderer
     * @param {PIXI.BaseTexture} baseTexture Reference to parent texture
     * @param {PIXI.GLTexture} glTexture glTexture
     * @returns {boolean} true is success
     */
    upload(renderer, baseTexture, glTexture)
    {
        const gl = renderer.gl;

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.alphaMode === ALPHA_MODES.UNPACK);

        if (glTexture.width === baseTexture.width && glTexture.height === baseTexture.height)
        {
            gl.texSubImage2D(
                baseTexture.target,
                0,
                0,
                0,
                baseTexture.width,
                baseTexture.height,
                baseTexture.format,
                baseTexture.type,
                this.data
            );
        }
        else
        {
            glTexture.width = baseTexture.width;
            glTexture.height = baseTexture.height;

            gl.texImage2D(
                baseTexture.target,
                0,
                glTexture.internalFormat,
                baseTexture.width,
                baseTexture.height,
                0,
                baseTexture.format,
                glTexture.type,
                this.data
            );
        }

        return true;
    }

    /**
     * Destroy and don't use after this
     * @override
     */
    dispose()
    {
        this.data = null;
    }

    /**
     * Used to auto-detect the type of resource.
     *
     * @static
     * @param {*} source - The source object
     * @return {boolean} `true` if <canvas>
     */
    static test(source)
    {
        return source instanceof Float32Array
            || source instanceof Uint8Array
            || source instanceof Uint32Array;
    }
}
