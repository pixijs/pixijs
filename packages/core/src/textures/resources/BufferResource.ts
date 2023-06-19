import { ALPHA_MODES } from '@pixi/constants';
import { Resource } from './Resource';

import type { ISize } from '@pixi/math';
import type { Renderer } from '../../Renderer';
import type { BaseTexture } from '../BaseTexture';
import type { GLTexture } from '../GLTexture';

export type BufferType = null | Int8Array | Uint8Array | Uint8ClampedArray
| Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array;

/**
 * Constructor options for BufferResource.
 * @memberof PIXI
 */
export interface IBufferResourceOptions extends ISize
{
    unpackAlignment?: 1 | 2 | 4 | 8
}

/**
 * Buffer resource with data of typed array.
 * @memberof PIXI
 */
export class BufferResource extends Resource
{
    /** The data of this resource. */
    public data: BufferType;

    /** The alignment of the rows in the data. */
    public unpackAlignment: 1 | 2 | 4 | 8;

    /**
     * @param source - Source buffer
     * @param options - Options
     * @param {number} options.width - Width of the texture
     * @param {number} options.height - Height of the texture
     * @param {1|2|4|8} [options.unpackAlignment=4] - The alignment of the pixel rows.
     */
    constructor(source: BufferType, options: IBufferResourceOptions)
    {
        const { width, height } = options || {};

        if (!width || !height)
        {
            throw new Error('BufferResource width or height invalid');
        }

        super(width, height);

        this.data = source;
        this.unpackAlignment = options.unpackAlignment ?? 4;
    }

    /**
     * Upload the texture to the GPU.
     * @param renderer - Upload to the renderer
     * @param baseTexture - Reference to parent texture
     * @param glTexture - glTexture
     * @returns - true is success
     */
    upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture): boolean
    {
        const gl = renderer.gl;

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, this.unpackAlignment);
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
     * @param {*} source - The source object
     * @returns {boolean} `true` if buffer source
     */
    static test(source: unknown): source is BufferType
    {
        return source === null
            || source instanceof Int8Array
            || source instanceof Uint8Array
            || source instanceof Uint8ClampedArray
            || source instanceof Int16Array
            || source instanceof Uint16Array
            || source instanceof Int32Array
            || source instanceof Uint32Array
            || source instanceof Float32Array;
    }
}
