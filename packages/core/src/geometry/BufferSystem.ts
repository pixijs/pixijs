import { System } from '../System';
import { GLBuffer } from './GLBuffer';

import type { Renderer } from '../Renderer';
import type { IRenderingContext } from '../IRenderingContext';
import type { Buffer } from './Buffer';

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
 * the PIXI.Buffer class.
 *
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI
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
        this.disposeAll(true);

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
     * Will ensure sure the the data in the buffer is uploaded to the GPU.
     *
     * @param {PIXI.Buffer} buffer the buffer to update
     */
    update(buffer: Buffer): void
    {
        const { gl, CONTEXT_UID } = this;

        const glBuffer = buffer._glBuffers[CONTEXT_UID];

        if (buffer._updateID === glBuffer.updateID)
        {
            return;
        }

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
     * dispose all WebGL resources of all managed buffers
     * @param {boolean} [contextLost=false] - If context was lost, we suppress `gl.delete` calls
     */
    disposeAll(contextLost?: boolean): void
    {
        const all: Array<any> = Object.keys(this.managedBuffers);

        for (let i = 0; i < all.length; i++)
        {
            this.dispose(this.managedBuffers[all[i]], contextLost);
        }
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
