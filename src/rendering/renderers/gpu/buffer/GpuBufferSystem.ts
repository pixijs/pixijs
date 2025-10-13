import { ExtensionType } from '../../../../extensions/Extensions';
import { fastCopy } from '../../shared/buffer/utils/fastCopy';
import { type ManagedItem } from '../../shared/texture/RenderableGCSystem';

import type { Buffer } from '../../shared/buffer/Buffer';
import type { System } from '../../shared/system/System';
import type { GPU } from '../GpuDeviceSystem';
import type { WebGPURenderer } from '../WebGPURenderer';

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
    private _gpuBuffers: { [key: number]: GPUBuffer } = Object.create(null);
    private _gpuBufferBinding: ManagedItem;

    private _gpu: GPU;
    private _renderer: WebGPURenderer;

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
        this._gpuBufferBinding = renderer.renderableGC.addManagedHash(this, '_gpuBuffers');
    }

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
        if (!this._gpuBuffers) return null;

        const gpuBuffer = this._gpuBuffers[buffer.uid] || this.createGPUBuffer(buffer);

        const data = buffer.data;

        // TODO this can be better...
        if (buffer._updateID && data)
        {
            buffer._updateID = 0;

            // make sure
            this._gpu.device.queue.writeBuffer(
                gpuBuffer, 0, data.buffer, 0,
                // round to the nearest 4 bytes
                ((buffer._updateSize || data.byteLength) + 3) & ~3
            );
        }

        return gpuBuffer;
    }

    /** dispose all WebGL resources of all managed buffers */
    public destroyAll(): void
    {
        for (const id in this._gpuBuffers)
        {
            if (this._gpuBuffers[id]) this._gpuBuffers[id].destroy();
        }

        this._gpuBuffers = {};
    }

    public createGPUBuffer(buffer: Buffer): GPUBuffer
    {
        if (!this._gpuBuffers[buffer.uid])
        {
            buffer.on('update', this.updateBuffer, this);
            buffer.on('change', this.onBufferChange, this);
            buffer.on('destroy', this.onBufferDestroy, this);
        }

        const gpuBuffer = this._gpu.device.createBuffer(buffer.descriptor);

        buffer._updateID = 0;

        if (buffer.data)
        {
            // TODO if data is static, this can be mapped at creation
            fastCopy(buffer.data.buffer, gpuBuffer.getMappedRange());

            gpuBuffer.unmap();
        }

        this._gpuBuffers[buffer.uid] = gpuBuffer;

        return gpuBuffer;
    }

    protected onBufferChange(buffer: Buffer)
    {
        if (!this._gpuBuffers) return;
        const gpuBuffer = this._gpuBuffers[buffer.uid];

        gpuBuffer.destroy();
        buffer._updateID = 0;
        this._gpuBuffers[buffer.uid] = this.createGPUBuffer(buffer);
    }

    /**
     * Disposes buffer
     * @param buffer - buffer with data
     */
    protected onBufferDestroy(buffer: Buffer): void
    {
        if (!this._gpuBuffers) return;
        this._destroyBuffer(buffer);
    }

    public destroy(): void
    {
        this.destroyAll();
        this._gpuBuffers = null;
        this._gpu = null;
        this._gpuBufferBinding = null;
        this._renderer = null;
    }

    private _destroyBuffer(buffer: Buffer): void
    {
        const gpuBuffer = this._gpuBuffers[buffer.uid];

        gpuBuffer.destroy();

        buffer.off('update', this.updateBuffer, this);
        buffer.off('change', this.onBufferChange, this);
        buffer.off('destroy', this.onBufferDestroy, this);

        this._gpuBuffers[buffer.uid] = null;
        this._renderer.renderableGC.increaseNullCount(this._gpuBufferBinding);
    }
}

