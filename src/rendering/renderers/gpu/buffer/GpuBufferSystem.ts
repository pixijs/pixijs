import { ExtensionType } from '../../../../extensions/Extensions';
import { type GPUData } from '../../../../scene/view/ViewContainer';
import { GCManagedHash } from '../../../../utils/data/GCManagedHash';
import { fastCopy } from '../../shared/buffer/utils/fastCopy';

import type { Buffer } from '../../shared/buffer/Buffer';
import type { System } from '../../shared/system/System';
import type { GPU } from '../GpuDeviceSystem';
import type { WebGPURenderer } from '../WebGPURenderer';

/** @internal */
export class GpuBufferData implements GPUData
{
    public gpuBuffer: GPUBuffer;

    constructor(gpuBuffer: GPUBuffer)
    {
        this.gpuBuffer = gpuBuffer;
    }

    public destroy()
    {
        this.gpuBuffer.destroy();
        this.gpuBuffer = null;
    }
}

/**
 * System plugin to the renderer to manage buffers.
 * @category rendering
 * @advanced
 */
export class GpuBufferSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUSystem,
        ],
        name: 'buffer',
    } as const;

    protected CONTEXT_UID: number;
    private readonly _renderer: WebGPURenderer;
    private readonly _managedBuffers: GCManagedHash<Buffer>;

    private _gpu: GPU;

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
        this._managedBuffers = new GCManagedHash({
            renderer,
            type: 'resource',
            onUnload: this.onBufferUnload.bind(this),
            name: 'gpuBuffer'
        });
    }

    protected contextChange(gpu: GPU): void
    {
        this._gpu = gpu;
        this.destroyAll();
    }

    public getGPUBuffer(buffer: Buffer): GPUBuffer
    {
        buffer._gcLastUsed = this._renderer.gc.now;

        return (buffer._gpuData[this._renderer.uid] as GpuBufferData)?.gpuBuffer || this.createGPUBuffer(buffer);
    }

    public updateBuffer(buffer: Buffer): GPUBuffer
    {
        const gpuBuffer = this.getGPUBuffer(buffer);

        const data = buffer.data;

        // TODO this can be better...
        if (buffer._updateID && data)
        {
            buffer._updateID = 0;

            // make sure
            this._gpu.device.queue.writeBuffer(
                gpuBuffer,
                buffer._updateOffset,
                data.buffer,
                data.byteOffset + buffer._updateOffset,
                // round to the nearest 4 bytes
                ((buffer._updateSize || data.byteLength) + 3) & ~3
            );
        }

        return gpuBuffer;
    }

    /**
     * Writes bytes into a buffer's GPU storage, creating the storage first if the buffer has none yet.
     * `buffer.data` is not changed.
     *
     * Use it on a buffer created size-only (`new Buffer({ size, usage })`), which keeps no CPU copy, or on a
     * region never uploaded from the buffer's `data`: a later `buffer.update()` uploads from `data` and would
     * overwrite the region.
     *
     * - The buffer needs `BufferUsage.COPY_DST`. On WebGPU, `offset` and `data.byteLength` must be multiples of 4.
     * - An index buffer with no `data` is drawn as 32-bit indices, so write `Uint32Array` indices into it.
     * - Contents written this way exist only on the GPU, so they are lost with the context or device.
     *   Write them again on the renderer's `contextChange`.
     * - A buffer with no `data` is never garbage collected, so destroy it when you are done with it. One with
     *   `data` is restored from `data` after a collection, losing these contents, unless `autoGarbageCollect` is off.
     * - On WebGPU the write is queued ahead of the frame, which is submitted at the end of the render, so it
     *   applies to the whole frame, including draws recorded earlier in the same render.
     * @param buffer - the buffer to write into
     * @param data - the bytes to write, `data.byteLength` of them starting at `data.byteOffset`
     * @param offset - the byte offset in the buffer to write at, defaults to 0
     */
    public write(buffer: Buffer, data: ArrayBufferView, offset = 0): void
    {
        // given the ArrayBuffer, writeBuffer takes its source offset and size in bytes rather than elements
        this._gpu.device.queue.writeBuffer(
            this.getGPUBuffer(buffer),
            offset,
            data.buffer,
            data.byteOffset,
            data.byteLength
        );
    }

    /**
     * Copies bytes from one buffer to another on the GPU, creating either buffer's GPU storage first if it has
     * none yet. Use it to move a buffer's contents into a larger one when it grows. Neither buffer's `data` is
     * changed.
     *
     * A later `to.update()` uploads from `to.data` and would overwrite the copied region, so copy into a
     * size-only buffer (`new Buffer({ size, usage })`) or a region never uploaded from `data`.
     *
     * - `from` needs `BufferUsage.COPY_SRC` and `to` needs `BufferUsage.COPY_DST`. On WebGPU, `size` and both
     *   offsets must be multiples of 4.
     * - WebGL1 has no buffer-to-buffer copy, so this throws there.
     * - Contents copied this way exist only on the GPU, so they are lost with the context or device.
     *   Write them again on the renderer's `contextChange`.
     * - A buffer with no `data` is never garbage collected, so destroy it when you are done with it. One with
     *   `data` is restored from `data` after a collection, losing these contents, unless `autoGarbageCollect` is off.
     * - On WebGPU the copy is submitted ahead of the frame, which is submitted at the end of the render, so it
     *   applies to the whole frame, including draws recorded earlier in the same render.
     * @param from - the buffer to copy from
     * @param to - the buffer to copy into
     * @param size - the number of bytes to copy
     * @param fromOffset - the byte offset in `from` to copy from, defaults to 0
     * @param toOffset - the byte offset in `to` to copy to, defaults to 0
     */
    public copy(from: Buffer, to: Buffer, size: number, fromOffset = 0, toOffset = 0): void
    {
        const device = this._gpu.device;

        // a copy can't be recorded inside the frame's render pass, and on the frame's encoder it would run after
        // writes made later in the frame, so it gets its own encoder, submitted now
        const encoder = device.createCommandEncoder({ label: 'GpuBufferSystem.copy' });

        encoder.copyBufferToBuffer(this.getGPUBuffer(from), fromOffset, this.getGPUBuffer(to), toOffset, size);
        device.queue.submit([encoder.finish()]);
    }

    /** dispose all WebGL resources of all managed buffers */
    public destroyAll(): void
    {
        this._managedBuffers.removeAll();
    }

    protected onBufferUnload(buffer: Buffer): void
    {
        buffer.off('update', this.updateBuffer, this);
        buffer.off('change', this.onBufferChange, this);
    }

    public createGPUBuffer(buffer: Buffer): GPUBuffer
    {
        const gpuBuffer = this._gpu.device.createBuffer(buffer.descriptor);

        buffer._updateID = 0;

        if (buffer.data)
        {
            // TODO if data is static, this can be mapped at creation
            fastCopy(
                buffer.data.buffer as ArrayBuffer,
                gpuBuffer.getMappedRange(),
                buffer.data.byteOffset,
                buffer.data.byteLength
            );

            gpuBuffer.unmap();
        }

        buffer._gpuData[this._renderer.uid] = new GpuBufferData(gpuBuffer);
        if (this._managedBuffers.add(buffer))
        {
            buffer.on('update', this.updateBuffer, this);
            buffer.on('change', this.onBufferChange, this);
        }

        return gpuBuffer;
    }

    protected onBufferChange(buffer: Buffer)
    {
        this._managedBuffers.remove(buffer);
        buffer._updateID = 0;
        this.createGPUBuffer(buffer);
    }

    public destroy(): void
    {
        this._managedBuffers.destroy();
        (this._renderer as null) = null;
        this._gpu = null;
    }
}

