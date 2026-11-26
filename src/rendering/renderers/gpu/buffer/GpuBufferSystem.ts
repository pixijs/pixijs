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
    /** The buffer's `_updateID` when this GPU buffer was last written */
    public updateID: number;

    constructor(gpuBuffer: GPUBuffer, updateID: number)
    {
        this.gpuBuffer = gpuBuffer;
        this.updateID = updateID;
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
        const gpuData = buffer._gpuData[this._renderer.uid] as GpuBufferData;

        const data = buffer.data;

        // renderers can share a buffer, so resetting its `_updateID` would let only the first renderer
        // to see a change upload it
        if (gpuData.updateID !== buffer._updateID && data)
        {
            gpuData.updateID = buffer._updateID;

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

        buffer._gpuData[this._renderer.uid] = new GpuBufferData(gpuBuffer, buffer._updateID);
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
        this.createGPUBuffer(buffer);
    }

    public destroy(): void
    {
        this._managedBuffers.destroy();
        (this._renderer as null) = null;
        this._gpu = null;
    }
}

