import { System } from '../System';
import { GLBuffer } from './GLBuffer';

import type { Renderer } from '../Renderer';
import type { IRenderingContext } from '../IRenderingContext';
import type { Buffer } from './Buffer';

/**
 * System plugin to the renderer to manage buffers.
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
export class BufferSystem extends System
{
    CONTEXT_UID: number;
    gl: IRenderingContext;

    readonly managedBuffers: {[key: number]: Buffer};
    readonly boundBufferBases: {[key: number]: Buffer};

    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        super(renderer);

        /**
         * Cache for all buffers by id, used in case renderer gets destroyed or for profiling
         * @member {object}
         * @readonly
         */
        this.managedBuffers = {};

        /**
         * a cache keeping track of the base bound buffer bases
         */
        this.boundBufferBases = {};
    }

    /**
     * Sets up the renderer context and necessary buffers.
     */
    protected contextChange(): void
    {
        this.gl = this.renderer.gl;

        // TODO fill out...
        this.CONTEXT_UID = this.renderer.CONTEXT_UID;
    }

    /**
     * this binds specified buffer. OOn first run, it will create the webGL buffers for the context too
     *
     * @param {PIXI.Buffer} buffer the buffer to bind to the renderer
     */
    bind(buffer: Buffer): void
    {
        const { gl, CONTEXT_UID } = this;

        const glBuffer = buffer._glBuffers[CONTEXT_UID] || this.createGLBuffer(buffer);

        gl.bindBuffer(buffer.type, glBuffer.buffer);
    }

    /**
     * binds a buffer to a base. A cache is used so a buffer will not be bound again if already bound.
     * Only used by the uniform buffers
     *
     * @param buffer - the buffer to bind
     * @param index - the base index to bind it to.
     */
    bindBufferBase(buffer: Buffer, index: number): void
    {
        const { gl, CONTEXT_UID } = this;

        if (this.boundBufferBases[index] !== buffer)
        {
            const glBuffer = buffer._glBuffers[CONTEXT_UID] || this.createGLBuffer(buffer);

            this.boundBufferBases[index] = buffer;

            gl.bindBufferBase(gl.UNIFORM_BUFFER, index, glBuffer.buffer);
        }
    }

    /**
     * Binds a buffer whilst also binding its range.
     * This will make the buffer start from the offset supplied rather than 0 when it is read.
     *
     * @param buffer - the buffer to bind
     * @param offset - the offset to bind at (this is blocks of 256). 0 = 0, 1 = 256, 2 = 512 etc
     * @param index - the base index to bind at, defaults to 0
     */
    bindBufferRange(buffer: Buffer, offset?: number, index?: number): void
    {
        const { gl, CONTEXT_UID } = this;

        offset = offset || 0;

        const glBuffer = buffer._glBuffers[CONTEXT_UID] || this.createGLBuffer(buffer);

        gl.bindBufferRange(gl.UNIFORM_BUFFER, index || 0, glBuffer.buffer, offset * 256, 256);
    }

    /**
     * Will ensure sure the the data in the buffer is uploaded to the GPU.
     *
     * @param {PIXI.Buffer} buffer - the buffer to update
     */
    update(buffer: Buffer): void
    {
        const { gl, CONTEXT_UID } = this;

        const glBuffer = buffer._glBuffers[CONTEXT_UID];

        if (buffer._updateID !== glBuffer.updateID)
        {
            glBuffer.updateID = buffer._updateID;

            gl.bindBuffer(buffer.type, glBuffer.buffer);

            if (glBuffer.byteLength >= buffer.data.byteLength)
            {
                // offset is always zero for now!
                gl.bufferSubData(buffer.type, 0, buffer.data);
            }
            else
            {
                const drawType = buffer.static ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW;

                glBuffer.byteLength = buffer.data.byteLength;
                gl.bufferData(buffer.type, buffer.data, drawType);
            }
        }
    }

    /**
     * Disposes buffer
     * @param {PIXI.Buffer} buffer - buffer with data
     * @param {boolean} [contextLost=false] - If context was lost, we suppress deleteVertexArray
     */
    dispose(buffer: Buffer, contextLost?: boolean): void
    {
        if (!this.managedBuffers[buffer.id])
        {
            return;
        }

        delete this.managedBuffers[buffer.id];

        const glBuffer = buffer._glBuffers[this.CONTEXT_UID];
        const gl = this.gl;

        buffer.disposeRunner.remove(this);

        if (!glBuffer)
        {
            return;
        }

        if (!contextLost)
        {
            gl.deleteBuffer(glBuffer.buffer);
        }

        delete buffer._glBuffers[this.CONTEXT_UID];
    }

    /**
     * creates and attaches a GLBuffer object tied to the current context.
     * @protected
     */
    protected createGLBuffer(buffer: Buffer): GLBuffer
    {
        const { CONTEXT_UID, gl } = this;

        buffer._glBuffers[CONTEXT_UID] = new GLBuffer(gl.createBuffer());

        this.managedBuffers[buffer.id] = buffer;

        buffer.disposeRunner.add(this);

        return buffer._glBuffers[CONTEXT_UID];
    }
}
