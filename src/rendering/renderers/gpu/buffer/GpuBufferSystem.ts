import { ExtensionType } from '../../../../extensions/Extensions';
import { fastCopy } from '../../shared/buffer/utils/fastCopy';

import type { Buffer } from '../../shared/buffer/Buffer';
import type { System } from '../../shared/system/System';
import type { GPU } from '../GpuDeviceSystem';

export class BufferSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUSystem,
        ],
        name: 'buffer',
    } as const;

    protected CONTEXT_UID: number;
    private _gpuBuffers: { [key: number]: GPUBuffer } = Object.create(null);

    private _gpu: GPU;

    protected contextChange(gpu: GPU): void
    {
        this._gpu = gpu;
    }

    public getGPUBuffer(buffer: Buffer): GPUBuffer
    {
        return this._gpuBuffers[buffer.uid] || this.createGPUBuffer(buffer);
    }

    public updateBuffer(buffer: Buffer): GPUBuffer
    {
        const gpuBuffer = this._gpuBuffers[buffer.uid] || this.createGPUBuffer(buffer);

        // TODO this can be better...
        if (buffer._updateID && buffer.data)
        {
            buffer._updateID = 0;
            this._gpu.device.queue.writeBuffer(gpuBuffer, 0, buffer.data.buffer, 0, buffer._updateSize);// , 0);
        }

        return gpuBuffer;
    }

    /** dispose all WebGL resources of all managed buffers */
    public destroyAll(): void
    {
        for (const id in this._gpuBuffers)
        {
            this._gpuBuffers[id].destroy();
        }

        this._gpuBuffers = {};
    }

    public createGPUBuffer(buffer: Buffer): GPUBuffer
    {
        const gpuBuffer = this._gpu.device.createBuffer(buffer.descriptor);

        buffer._updateID = 0;

        if (buffer.data)
        {
            // TODO if data is static, this can be mapped at creation
            fastCopy(buffer.data.buffer, gpuBuffer.getMappedRange());

            gpuBuffer.unmap();
        }

        this._gpuBuffers[buffer.uid] = gpuBuffer;

        buffer.on('update', this.updateBuffer, this);
        buffer.on('change', this.onBufferChange, this);
        buffer.on('destroy', this.onBufferDestroy, this);

        return gpuBuffer;
    }

    protected onBufferChange(buffer: Buffer)
    {
        let gpuBuffer = this._gpuBuffers[buffer.uid];

        gpuBuffer.destroy();
        gpuBuffer = this.createGPUBuffer(buffer);
        buffer._updateID = 0;
    }

    /**
     * Disposes buffer
     * @param buffer - buffer with data
     */
    protected onBufferDestroy(buffer: Buffer): void
    {
        const gpuBuffer = this._gpuBuffers[buffer.uid];

        gpuBuffer.destroy();

        this._gpuBuffers[buffer.uid] = null;
    }

    public destroy(): void
    {
        for (const k of Object.keys(this._gpuBuffers))
        {
            const key = Number(k);
            const gpuBuffer = this._gpuBuffers[key];

            gpuBuffer.destroy();
            this._gpuBuffers[key] = null;
        }

        this._gpuBuffers = null;
    }
}

