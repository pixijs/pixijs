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
    bind(buffer:Buffer):void
    {
        const { gl, CONTEXT_UID } = this;

        const glBuffer = buffer._glBuffers[CONTEXT_UID] || this.createGLBuffer(buffer);

        // TODO can cache this on buffer! maybe added a getter / setter?
        const type = buffer.index ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;

        gl.bindBuffer(type, glBuffer.buffer);
    }

    /**
     * Will ensure sure the the data in the buffer is uploaded to the GPU.
     *
     * @param {PIXI.Buffer} buffer the buffer to update
     */
    update(buffer:Buffer): void
    {
        const { gl, CONTEXT_UID } = this;

        const glBuffer = buffer._glBuffers[CONTEXT_UID];

        if (buffer._updateID !== glBuffer.updateID)
        {
            glBuffer.updateID = buffer._updateID;

            // TODO can cache this on buffer! maybe added a getter / setter?
            const type = buffer.index ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;

            // TODO this could change if the VAO changes...
            gl.bindBuffer(type, glBuffer.buffer);

            if (glBuffer.byteLength >= buffer.data.byteLength)
            {
                // offset is always zero for now!
                gl.bufferSubData(type, 0, buffer.data);
            }
            else
            {
                const drawType = buffer.static ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW;

                glBuffer.byteLength = buffer.data.byteLength;
                gl.bufferData(type, buffer.data, drawType);
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
     * Update buffers
     * @protected
     */
    createGLBuffer(buffer:Buffer): GLBuffer
    {
        const { CONTEXT_UID, gl } = this;

        buffer._glBuffers[CONTEXT_UID] = new GLBuffer(gl.createBuffer());

        this.managedBuffers[buffer.id] = buffer;

        buffer.disposeRunner.add(this);

        return buffer._glBuffers[CONTEXT_UID];
    }
}
