import { ExtensionType } from '../../../../extensions/Extensions';
import { BufferUsage } from '../../shared/buffer/const';
import { BUFFER_TYPE } from './const';
import { GlBuffer } from './GlBuffer';

import type { ExtensionMetadata } from '../../../../extensions/Extensions';
import type { Buffer } from '../../shared/buffer/Buffer';
import type { ISystem } from '../../shared/system/ISystem';
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
 * the PIXI.Buffer class.
 * @class
 * @memberof PIXI
 */
export class GlBufferSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGLRendererSystem,
        ],
        name: 'buffer',
    };

    private gl: GlRenderingContext;

    private readonly _glBuffers: {[key: number]: GlBuffer} = {};

    // TODO make sure to manage these! also for the GPU stuff
    /** Cache for all buffers by id, used in case renderer gets destroyed or for profiling */
    readonly managedBuffers: {[key: number]: Buffer};

    /** Cache keeping track of the base bound buffer bases */
    private readonly boundBufferBases: {[key: number]: Buffer};

    private renderer: WebGLRenderer;

    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: WebGLRenderer)
    {
        this.renderer = renderer;
        this.managedBuffers = {};
        this.boundBufferBases = {};
    }

    /**
     * @ignore
     */
    destroy(): void
    {
        this.renderer = null;
    }

    /** Sets up the renderer context and necessary buffers. */
    protected contextChange(): void
    {
        this.disposeAll(true);

        this.gl = this.renderer.gl;
    }

    getGlBuffer(buffer: Buffer): GlBuffer
    {
        return this._glBuffers[buffer.uid] || this.createGLBuffer(buffer);
    }

    /**
     * This binds specified buffer. On first run, it will create the webGL buffers for the context too
     * @param buffer - the buffer to bind to the renderer
     */
    bind(buffer: Buffer): void
    {
        const { gl } = this;

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
    bindBufferBase(buffer: Buffer, index: number): void
    {
        const { gl } = this;

        if (this.boundBufferBases[index] !== buffer)
        {
            const glBuffer = this.getGlBuffer(buffer);

            this.boundBufferBases[index] = buffer;

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
    bindBufferRange(buffer: Buffer, index?: number, offset?: number): void
    {
        const { gl } = this;

        offset = offset || 0;

        const glBuffer = this.getGlBuffer(buffer);

        gl.bindBufferRange(gl.UNIFORM_BUFFER, index || 0, glBuffer.buffer, offset * 256, 256);
    }

    /**
     * Will ensure the data in the buffer is uploaded to the GPU.
     * @param {PIXI.Buffer} buffer - the buffer to update
     */
    updateBuffer(buffer: Buffer): GlBuffer
    {
        const { gl } = this;

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
     * Disposes buffer
     * @param {PIXI.Buffer} _buffer - buffer with data
     * @param {boolean} [_contextLost=false] - If context was lost, we suppress deleteVertexArray
     */
    dispose(_buffer: Buffer, _contextLost?: boolean): void
    {
        // if (!this.managedBuffers[buffer.id])
        // {
        //     return;
        // }

        // delete this.managedBuffers[buffer.id];

        // const glBuffer = this.getGlBuffer(buffer);
        // const gl = this.gl;

        // // buffer.disposeRunner.remove(this);

        // if (!glBuffer)
        // {
        //     return;
        // }

        // if (!contextLost)
        // {
        //     gl.deleteBuffer(glBuffer.buffer);
        // }

        // delete this._glBuffers[buffer.UID];
    }

    /**
     * dispose all WebGL resources of all managed buffers
     * @param {boolean} [_contextLost=false] - If context was lost, we suppress `gl.delete` calls
     */
    disposeAll(_contextLost?: boolean): void
    {
        // const all: any[] = Object.keys(this.managedBuffers);

        // for (let i = 0; i < all.length; i++)
        // {
        //     this.dispose(this.managedBuffers[all[i]], contextLost);
        // }
    }

    /**
     * creates and attaches a GLBuffer object tied to the current context.
     * @param buffer
     * @protected
     */
    protected createGLBuffer(buffer: Buffer): GlBuffer
    {
        const { gl } = this;

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

        this._glBuffers[buffer.uid] = glBuffer;

        // TODO dispose runners!
        //  buffer.disposeRunner.add(this);

        return glBuffer;
    }
}
