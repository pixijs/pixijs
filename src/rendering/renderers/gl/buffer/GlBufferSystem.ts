import { ExtensionType } from '../../../../extensions/Extensions';
import { BufferUsage } from '../../shared/buffer/const';
import { BUFFER_TYPE } from './const';
import { GlBuffer } from './GlBuffer';

import type { Buffer } from '../../shared/buffer/Buffer';
import type { System } from '../../shared/system/System';
// @ts-expect-error - used for jsdoc typedefs
import type { Renderer } from '../../types';
import type { GlRenderingContext } from '../context/GlRenderingContext';
import type { WebGLRenderer } from '../WebGLRenderer';

/**
 * System plugin to the renderer to manage buffers.
 *
 * WebGL uses Buffers as a way to store objects to the GPU.
 * This system makes working with them a lot easier.
 *
 * Buffers are used in three main places in WebGL
 * - geometry information
 * - Uniform information (via uniform buffer objects - a WebGL 2 only feature)
 * - Transform feedback information. (WebGL 2 only feature)
 *
 * This system will handle the binding of buffers to the GPU as well as uploading
 * them. With this system, you never need to work directly with GPU buffers, but instead work with
 * the Buffer class.
 * @class
 */
export class GlBufferSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
        ],
        name: 'buffer',
    } as const;

    private _gl: GlRenderingContext;
    private _gpuBuffers: {[key: number]: GlBuffer} = Object.create(null);

    /** Cache keeping track of the base bound buffer bases */
    private readonly _boundBufferBases: {[key: number]: Buffer} = Object.create(null);

    private _renderer: WebGLRenderer;

    /**
     * @param {Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;
    }

    /**
     * @ignore
     */
    public destroy(): void
    {
        this.destroyAll(true);
        this._renderer = null;
        this._gl = null;
        this._gpuBuffers = null;
        (this._boundBufferBases as null) = null;
    }

    /** Sets up the renderer context and necessary buffers. */
    protected contextChange(): void
    {
        this.destroyAll(true);

        this._gl = this._renderer.gl;
    }

    public getGlBuffer(buffer: Buffer): GlBuffer
    {
        return this._gpuBuffers[buffer.uid] || this.createGLBuffer(buffer);
    }

    /**
     * This binds specified buffer. On first run, it will create the webGL buffers for the context too
     * @param buffer - the buffer to bind to the renderer
     */
    public bind(buffer: Buffer): void
    {
        const { _gl: gl } = this;

        const glBuffer = this.getGlBuffer(buffer);

        gl.bindBuffer(glBuffer.type, glBuffer.buffer);
    }

    /**
     * Binds an uniform buffer to at the given index.
     *
     * A cache is used so a buffer will not be bound again if already bound.
     * @param buffer - the buffer to bind
     * @param index - the base index to bind it to.
     */
    public bindBufferBase(buffer: Buffer, index: number): void
    {
        const { _gl: gl } = this;

        if (this._boundBufferBases[index] !== buffer)
        {
            const glBuffer = this.getGlBuffer(buffer);

            this._boundBufferBases[index] = buffer;

            gl.bindBufferBase(gl.UNIFORM_BUFFER, index, glBuffer.buffer);
        }
    }

    /**
     * Binds a buffer whilst also binding its range.
     * This will make the buffer start from the offset supplied rather than 0 when it is read.
     * @param buffer - the buffer to bind
     * @param index - the base index to bind at, defaults to 0
     * @param offset - the offset to bind at (this is blocks of 256). 0 = 0, 1 = 256, 2 = 512 etc
     */
    public bindBufferRange(buffer: Buffer, index?: number, offset?: number): void
    {
        const { _gl: gl } = this;

        offset = offset || 0;

        const glBuffer = this.getGlBuffer(buffer);

        gl.bindBufferRange(gl.UNIFORM_BUFFER, index || 0, glBuffer.buffer, offset * 256, 256);
    }

    /**
     * Will ensure the data in the buffer is uploaded to the GPU.
     * @param {Buffer} buffer - the buffer to update
     */
    public updateBuffer(buffer: Buffer): GlBuffer
    {
        const { _gl: gl } = this;

        const glBuffer = this.getGlBuffer(buffer);

        if (buffer._updateID === glBuffer.updateID)
        {
            return glBuffer;
        }

        glBuffer.updateID = buffer._updateID;

        gl.bindBuffer(glBuffer.type, glBuffer.buffer);

        if (glBuffer.byteLength >= buffer.data.byteLength)
        {
            // assuming our buffers are aligned to 4 bits...
            // offset is always zero for now!
            gl.bufferSubData(glBuffer.type, 0, buffer.data, 0, buffer._updateSize / 4);
        }
        else
        {
            const drawType = (buffer.descriptor.usage & BufferUsage.STATIC) ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW;

            glBuffer.byteLength = buffer.data.byteLength;

            // assuming our buffers are aligned to 4 bits...
            gl.bufferData(glBuffer.type, buffer.data, drawType);
        }

        return glBuffer;
    }

    /**
     * dispose all WebGL resources of all managed buffers
     * @param {boolean} [contextLost=false] - If context was lost, we suppress `gl.delete` calls
     */
    public destroyAll(contextLost?: boolean): void
    {
        const gl = this._gl;

        if (!contextLost)
        {
            for (const id in this._gpuBuffers)
            {
                gl.deleteBuffer(this._gpuBuffers[id].buffer);
            }
        }

        this._gpuBuffers = {};
    }

    /**
     * Disposes buffer
     * @param {Buffer} buffer - buffer with data
     * @param {boolean} [contextLost=false] - If context was lost, we suppress deleteVertexArray
     */
    protected onBufferDestroy(buffer: Buffer, contextLost?: boolean): void
    {
        const glBuffer = this._gpuBuffers[buffer.uid];

        const gl = this._gl;

        if (!contextLost)
        {
            gl.deleteBuffer(glBuffer.buffer);
        }

        this._gpuBuffers[buffer.uid] = null;
    }

    /**
     * creates and attaches a GLBuffer object tied to the current context.
     * @param buffer
     * @protected
     */
    protected createGLBuffer(buffer: Buffer): GlBuffer
    {
        const { _gl: gl } = this;

        let type = BUFFER_TYPE.ARRAY_BUFFER;

        if ((buffer.descriptor.usage & BufferUsage.INDEX))
        {
            type = BUFFER_TYPE.ELEMENT_ARRAY_BUFFER;
        }
        else if ((buffer.descriptor.usage & BufferUsage.UNIFORM))
        {
            type = BUFFER_TYPE.UNIFORM_BUFFER;
        }

        const glBuffer = new GlBuffer(gl.createBuffer(), type);

        this._gpuBuffers[buffer.uid] = glBuffer;

        buffer.on('destroy', this.onBufferDestroy, this);

        return glBuffer;
    }
}
