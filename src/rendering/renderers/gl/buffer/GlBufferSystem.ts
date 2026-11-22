import { ExtensionType } from '../../../../extensions/Extensions';
import { GCManagedHash } from '../../../../utils/data/GCManagedHash';
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
 *
 * A buffer is first uploaded whole when a geometry or uniform block that uses it is bound. From then on
 * each `Buffer.update()` is applied as it is called, as on WebGPU, so every ranged update lands. On WebGL2
 * an index buffer's update goes through `COPY_WRITE_BUFFER`, so it changes no vertex array's index buffer.
 * @class
 * @category rendering
 * @advanced
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

    /** @internal */
    public _gl: GlRenderingContext;
    protected _managedBuffers: GCManagedHash<Buffer>;

    /**
     * What each uniform buffer binding slot holds, so an unchanged binding is not sent again.
     * A whole-buffer binding records a size of -1.
     */
    private _boundBuffers: GlBuffer[] = [];
    private _boundOffsets: number[] = [];
    private _boundSizes: number[] = [];

    private _renderer: WebGLRenderer;

    /**
     * @param {Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;
        this._managedBuffers = new GCManagedHash({
            renderer,
            type: 'resource',
            onUnload: this.onBufferUnload.bind(this),
            name: 'glBuffer'
        });
    }

    /** @ignore */
    public destroy(): void
    {
        this._managedBuffers.destroy();
        this._renderer = null;
        this._gl = null;
        this._boundBuffers.length = 0;
    }

    /** Sets up the renderer context and necessary buffers. */
    protected contextChange(): void
    {
        this._gl = this._renderer.gl;

        this.destroyAll(true);
        this._boundBuffers.length = 0;
    }

    public getGlBuffer(buffer: Buffer): GlBuffer
    {
        buffer._gcLastUsed = this._renderer.gc.now;

        return (buffer._gpuData[this._renderer.uid] as GlBuffer) || this.createGLBuffer(buffer);
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
     * Binds a whole uniform buffer to a binding slot.
     *
     * A cache is used so a buffer will not be bound again if already bound.
     * @param glBuffer - the buffer to bind
     * @param index - the binding slot to bind it to.
     */
    public bindBufferBase(glBuffer: GlBuffer, index: number): void
    {
        if (this._boundBuffers[index] === glBuffer && this._boundSizes[index] === -1) return;

        this._boundBuffers[index] = glBuffer;
        this._boundOffsets[index] = 0;
        this._boundSizes[index] = -1;

        this._gl.bindBufferBase(this._gl.UNIFORM_BUFFER, index, glBuffer.buffer);
    }

    /**
     * Binds part of a uniform buffer to a binding slot, so it is read from the offset supplied rather than 0.
     *
     * A cache is used so a range will not be bound again if already bound.
     * @param glBuffer - the buffer to bind, which must have been uploaded
     * @param index - the binding slot to bind it to, defaults to 0
     * @param offset - the byte offset to bind at, defaults to 0. Must be a multiple of
     * `renderer.limits.minUniformBufferOffsetAlignment`.
     * @param size - the number of bytes to bind, defaults to the rest of the buffer after `offset`
     */
    public bindBufferRange(glBuffer: GlBuffer, index = 0, offset = 0, size?: number): void
    {
        size ??= glBuffer.byteLength - offset;

        if (this._boundBuffers[index] === glBuffer
            && this._boundOffsets[index] === offset
            && this._boundSizes[index] === size) return;

        this._boundBuffers[index] = glBuffer;
        this._boundOffsets[index] = offset;
        this._boundSizes[index] = size;

        this._gl.bindBufferRange(this._gl.UNIFORM_BUFFER, index, glBuffer.buffer, offset, size);
    }

    /**
     * Will ensure the data in the buffer is uploaded to the GPU.
     *
     * Runs on each `update` event of a vertex or uniform buffer once it has a `GlBuffer`, and when a geometry
     * or uniform block that uses the buffer is bound. The second call for one update is a no-op.
     * @param {Buffer} buffer - the buffer to update
     */
    public updateBuffer(buffer: Buffer): GlBuffer
    {
        const glBuffer = this.getGlBuffer(buffer);

        this._upload(buffer, glBuffer, glBuffer.type);

        return glBuffer;
    }

    /**
     * Uploads the buffer's latest update through `target`, if it has not been uploaded yet.
     * @param buffer - the buffer to upload
     * @param glBuffer - its `GlBuffer`
     * @param target - the binding point to upload through
     */
    private _upload(buffer: Buffer, glBuffer: GlBuffer, target: number): void
    {
        const { _gl: gl } = this;

        if (buffer._updateID === glBuffer.updateID) return;

        glBuffer.updateID = buffer._updateID;

        gl.bindBuffer(target, glBuffer.buffer);

        const data = buffer.data;

        const drawType = (buffer.descriptor.usage & BufferUsage.STATIC) ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW;

        if (data)
        {
            if (glBuffer.byteLength >= data.byteLength)
            {
                // assuming our buffers are aligned to 4 bits...
                const start = buffer._updateOffset / data.BYTES_PER_ELEMENT;
                const length = (buffer._updateSize || data.byteLength) / data.BYTES_PER_ELEMENT;

                if (this._renderer.context.webGLVersion === 2)
                {
                    gl.bufferSubData(target, buffer._updateOffset, data, start, length);
                }
                else
                {
                    // WebGL1's bufferSubData takes no source range, so it is given a view of just the updated elements
                    gl.bufferSubData(target, buffer._updateOffset,
                        length === data.length ? data : data.subarray(start, start + length));
                }
            }
            else
            {
                glBuffer.byteLength = data.byteLength;
                // assuming our buffers are aligned to 4 bits...
                gl.bufferData(target, data, drawType);
            }
        }
        else
        {
            glBuffer.byteLength = buffer.descriptor.size;
            gl.bufferData(target, glBuffer.byteLength, drawType);
        }
    }

    /**
     * dispose all WebGL resources of all managed buffers
     * @param contextLost
     */
    public destroyAll(contextLost: boolean = false): void
    {
        this._managedBuffers.removeAll(contextLost);
    }

    protected onBufferUnload(buffer: Buffer, contextLost: boolean = false): void
    {
        buffer.off('update', this.updateBuffer, this);
        buffer.off('update', this._updateIndexBuffer, this);

        const glBuffer = buffer._gpuData[this._renderer.uid] as GlBuffer;

        if (!glBuffer) return;
        if (!contextLost) this._gl.deleteBuffer(glBuffer.buffer);
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

        buffer._gpuData[this._renderer.uid] = glBuffer;

        if (this._managedBuffers.add(buffer))
        {
            if (type === BUFFER_TYPE.ELEMENT_ARRAY_BUFFER)
            {
                buffer.on('update', this._updateIndexBuffer, this);
            }
            else
            {
                buffer.on('update', this.updateBuffer, this);
            }
        }

        return glBuffer;
    }

    /**
     * Uploads an index buffer's update without changing any vertex array's index buffer.
     *
     * ELEMENT_ARRAY_BUFFER is vertex array state, so binding an index buffer there to upload it would make it
     * the index buffer of whichever vertex array is bound. WebGL2 uploads through COPY_WRITE_BUFFER instead,
     * which no vertex array reads. WebGL1 has no copy target, so it unbinds the vertex array first, and the
     * next `geometry.bind()` binds its own again.
     * @param buffer - the index buffer that was updated
     */
    private _updateIndexBuffer(buffer: Buffer): void
    {
        const glBuffer = this.getGlBuffer(buffer);

        // the first upload binds the buffer to ELEMENT_ARRAY_BUFFER, which is what makes WebGL2 accept it
        // as an index buffer, so leave a buffer that has never been uploaded to its first bind
        if (glBuffer.byteLength < 0) return;

        if (this._renderer.context.webGLVersion === 2)
        {
            this._upload(buffer, glBuffer, this._gl.COPY_WRITE_BUFFER);

            return;
        }

        if (this._renderer.geometry._activeVao) this._renderer.geometry.resetState();

        this._upload(buffer, glBuffer, glBuffer.type);
    }

    public resetState(): void
    {
        this._boundBuffers.length = 0;
    }
}
