import { ExtensionType } from '../../../../extensions/Extensions';
import { fastCopy } from '../../shared/buffer/utils/fastCopy';
import { generateUID } from '../../shared/texture/utils/generateUID';

import type { ExtensionMetadata } from '../../../../extensions/Extensions';
import type { Buffer } from '../../shared/buffer/Buffer';
import type { ISystem } from '../../shared/system/ISystem';
import type { GPU } from '../GpuDeviceSystem';
import type { WebGPURenderer } from '../WebGPURenderer';

export class BufferSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGPURendererSystem,
        ],
        name: 'buffer',
    };

    readonly renderer: WebGPURenderer;
    protected CONTEXT_UID: number;
    private readonly _gpuBuffers: { [key: number]: GPUBuffer } = {};

    private gpu: GPU;

    protected contextChange(gpu: GPU): void
    {
        this.gpu = gpu;
    }

    getGPUBuffer(buffer: Buffer): GPUBuffer
    {
        return this._gpuBuffers[buffer.uid] || this.createGPUBuffer(buffer);
    }

    updateBuffer(buffer: Buffer): GPUBuffer
    {
        let gpuBuffer = this._gpuBuffers[buffer.uid] || this.createGPUBuffer(buffer);

        // TODO this can be better...
        if (buffer._updateID && buffer.data)
        {
            if (gpuBuffer.size !== buffer.data.byteLength)
            {
                gpuBuffer.destroy();
                gpuBuffer = this.createGPUBuffer(buffer);
                buffer.resourceId = generateUID();
                console.warn('Buffer recreated as it was resized, watch out for side effects');
            }
            else
            {
                buffer._updateID = 0;

                this.gpu.device.queue.writeBuffer(gpuBuffer, 0, buffer.data.buffer, 0, buffer._updateSize);// , 0);
            }
        }

        return gpuBuffer;
    }

    createGPUBuffer(buffer: Buffer): GPUBuffer
    {
        const gpuBuffer = this.gpu.device.createBuffer(buffer.descriptor);

        buffer._updateID = 0;

        if (buffer.data)
        {
            // TODO if data is static, this can be mapped at creation
            fastCopy(buffer.data.buffer, gpuBuffer.getMappedRange());

            gpuBuffer.unmap();
        }

        this._gpuBuffers[buffer.uid] = gpuBuffer;

        buffer.onUpdate.add(this);

        return gpuBuffer;
    }

    protected onBufferUpdate(buffer: Buffer)
    {
        // just upload that...
        this.updateBuffer(buffer);
    }

    destroy(): void
    {
        throw new Error('Method not implemented.');
    }
}

