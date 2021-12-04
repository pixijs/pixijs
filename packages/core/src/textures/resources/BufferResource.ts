import { Resource } from './Resource';
import { ALPHA_MODES } from '@pixi/constants';

import type { ISize } from '@pixi/math';
import type { BaseTexture } from '../BaseTexture';
import type { Renderer } from '../../Renderer';
import type { GLTexture } from '../GLTexture';
/**
 * @interface SharedArrayBuffer
 */

/**
 * Buffer resource with data of typed array.
 *
 * @memberof PIXI
 */
export class BufferResource extends Resource
{
    /**
     * Source array
     * Cannot be {@code ClampedUint8Array} because it cant be uploaded to WebGL
     */
    data: Float32Array|Uint8Array|Uint16Array|Int32Array|Uint32Array;

    /**
     * @param source - Source buffer
     * @param options - Options
     * @param {number} options.width - Width of the texture
     * @param {number} options.height - Height of the texture
     */
    constructor(source: Float32Array|Uint8Array|Uint16Array|Int32Array|Uint32Array, options: ISize)
    {
        const { width, height } = options || {};

        if (!width || !height)
        {
            throw new Error('BufferResource width or height invalid');
        }

        super(width, height);

        this.data = source;
    }

    /**
     * Upload the texture to the GPU.
     *
     * @param renderer - Upload to the renderer
     * @param baseTexture - Reference to parent texture
     * @param glTexture - glTexture
     * @returns - true is success
     */
    upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture): boolean
    {
        const gl = renderer.gl;

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.alphaMode === ALPHA_MODES.UNPACK);

        const width = baseTexture.realWidth;
        const height = baseTexture.realHeight;

        if (glTexture.width === width && glTexture.height === height)
        {
            gl.texSubImage2D(
                baseTexture.target,
                0,
                0,
                0,
                width,
                height,
                baseTexture.format,
                glTexture.type,
                this.data
            );
        }
        else
        {
            glTexture.width = width;
            glTexture.height = height;

            gl.texImage2D(
                baseTexture.target,
                0,
                glTexture.internalFormat,
                width,
                height,
                0,
                baseTexture.format,
                glTexture.type,
                this.data
            );
        }

        return true;
    }

    /** Destroy and don't use after this. */
    dispose(): void
    {
        this.data = null;
    }

    /**
     * Used to auto-detect the type of resource.
     *
     * @param {*} source - The source object
     * @return {boolean} `true` if <canvas>
     */
    static test(source: unknown): source is Float32Array|Uint8Array|Uint32Array
    {
        return source instanceof Float32Array
            || source instanceof Uint8Array
            || source instanceof Uint32Array;
    }
}
