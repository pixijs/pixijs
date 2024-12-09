import { ExtensionType } from '../../../../extensions/Extensions';
import { BufferUsage } from '../../shared/buffer/const';
import { BUFFER_TYPE } from './const';
import { GlBuffer } from './GlBuffer';

import type { Buffer } from '../../shared/buffer/Buffer';
import type { System } from '../../shared/system/System';
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
 * @memberof rendering
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
    private _boundBufferBases: {[key: number]: GlBuffer} = Object.create(null);

    private _renderer: WebGLRenderer;

    private _minBaseLocation = 0;
    private _maxBindings: number;
    private _nextBindBaseIndex = this._minBaseLocation;
    private _bindCallId = 0;

    /**
     * @param {Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;

        this._renderer.renderableGC.addManagedHash(this, '_gpuBuffers');
    }

    /**
     * @ignore
     */
    public destroy(): void
    {
        this._renderer = null;
        this._gl = null;
        this._gpuBuffers = null;
        (this._boundBufferBases as null) = null;
    }

    /** Sets up the renderer context and necessary buffers. */
    protected contextChange(): void
    {
        const gl = this._gl = this._renderer.gl;

        this._gpuBuffers = Object.create(null);
        this._maxBindings = gl.MAX_UNIFORM_BUFFER_BINDINGS ? gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS) : 0;
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
     * @param glBuffer - the buffer to bind
     * @param index - the base index to bind it to.
     */
    public bindBufferBase(glBuffer: GlBuffer, index: number): void
    {
        const { _gl: gl } = this;

        if (this._boundBufferBases[index] !== glBuffer)
        {
            this._boundBufferBases[index] = glBuffer;
            glBuffer._lastBindBaseLocation = index;

            gl.bindBufferBase(gl.UNIFORM_BUFFER, index, glBuffer.buffer);
        }
    }

    public nextBindBase(hasTransformFeedback: boolean)
    {
        this._bindCallId++;
        this._minBaseLocation = 0;
        if (hasTransformFeedback)
        {
            this._boundBufferBases[0] = null;
            this._minBaseLocation = 1;
            if (this._nextBindBaseIndex < 1)
            {
                this._nextBindBaseIndex = 1;
            }
        }
    }

    public freeLocationForBufferBase(glBuffer: GlBuffer): number
    {
        let freeIndex = this.getLastBindBaseLocation(glBuffer);

        // check if it is already bound..
        if (freeIndex >= this._minBaseLocation)
        {
            glBuffer._lastBindCallId = this._bindCallId;

            return freeIndex;
        }

        let loop = 0;
        let nextIndex = this._nextBindBaseIndex;

        while (loop < 2)
        {
            if (nextIndex >= this._maxBindings)
            {
                nextIndex = this._minBaseLocation;
                loop++;
            }

            const curBuf = this._boundBufferBases[nextIndex];

            if (curBuf && curBuf._lastBindCallId === this._bindCallId)
            {
                nextIndex++;
                continue;
            }
            break;
        }

        freeIndex = nextIndex;
        this._nextBindBaseIndex = nextIndex + 1;

        if (loop >= 2)
        {
            // TODO: error
            return -1;
        }

        glBuffer._lastBindCallId = this._bindCallId;
        this._boundBufferBases[freeIndex] = null;

        return freeIndex;
    }

    public getLastBindBaseLocation(glBuffer: GlBuffer): number
    {
        const index = glBuffer._lastBindBaseLocation;

        if (this._boundBufferBases[index] === glBuffer)
        {
            return index;
        }

        return -1;
    }

    /**
     * Binds a buffer whilst also binding its range.
     * This will make the buffer start from the offset supplied rather than 0 when it is read.
     * @param glBuffer - the buffer to bind
     * @param index - the base index to bind at, defaults to 0
     * @param offset - the offset to bind at (this is blocks of 256). 0 = 0, 1 = 256, 2 = 512 etc
     * @param size - the size to bind at (this is blocks of 256).
     */
    public bindBufferRange(glBuffer: GlBuffer, index?: number, offset?: number, size?: number): void
    {
        const { _gl: gl } = this;

        offset ||= 0;
        index ||= 0;

        this._boundBufferBases[index] = null;

        gl.bindBufferRange(gl.UNIFORM_BUFFER, index || 0, glBuffer.buffer, offset * 256, size || 256);
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

        const data = buffer.data;

        const drawType = (buffer.descriptor.usage & BufferUsage.STATIC) ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW;

        if (data)
        {
            if (glBuffer.byteLength >= data.byteLength)
            {
                // assuming our buffers are aligned to 4 bits...
                // offset is always zero for now!
                gl.bufferSubData(glBuffer.type, 0, data, 0, buffer._updateSize / data.BYTES_PER_ELEMENT);
            }
            else
            {
                glBuffer.byteLength = data.byteLength;
                // assuming our buffers are aligned to 4 bits...
                gl.bufferData(glBuffer.type, data, drawType);
            }
        }
        else
        {
            glBuffer.byteLength = buffer.descriptor.size;
            gl.bufferData(glBuffer.type, glBuffer.byteLength, drawType);
        }

        return glBuffer;
    }

    /** dispose all WebGL resources of all managed buffers */
    public destroyAll(): void
    {
        const gl = this._gl;

        for (const id in this._gpuBuffers)
        {
            gl.deleteBuffer(this._gpuBuffers[id].buffer);
        }

        this._gpuBuffers = Object.create(null);
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

    public resetState(): void
    {
        this._boundBufferBases = Object.create(null);
    }
}
