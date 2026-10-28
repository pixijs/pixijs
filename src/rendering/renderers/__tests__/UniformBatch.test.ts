import { GpuUniformBatchPipe } from '../gpu/GpuUniformBatchPipe';
import { SchedulerSystem } from '../shared/SchedulerSystem';
import { SystemRunner } from '../shared/system/SystemRunner';
import { RenderableGCSystem } from '../shared/texture/RenderableGCSystem';

import type { WebGPURenderer } from '../gpu/WebGPURenderer';

describe('UniformBatch', () =>
{
    it('should get a bind group correctly', () =>
    {
        const scheduler = new SchedulerSystem();

        const uniformBatchPipe = new GpuUniformBatchPipe({
            scheduler,
            renderableGC: new RenderableGCSystem({} as WebGPURenderer),
            runners: {
                destroy: new SystemRunner('destroy'),
            },
        } as WebGPURenderer);

        const bufferResource = uniformBatchPipe.getArrayBufferResource(new Float32Array(32));

        expect(bufferResource.buffer).toBe(uniformBatchPipe['_buffers'][0]);
        expect(bufferResource.offset).toBe(0);

        const bufferResource2 = uniformBatchPipe.getArrayBufferResource(new Float32Array(32));

        expect(bufferResource2.buffer).toBe(uniformBatchPipe['_buffers'][1]);
        expect(bufferResource2.offset).toBe(0);

        const bufferResource3 = uniformBatchPipe.getArrayBufferResource(new Float32Array(32));

        expect(bufferResource3.buffer).toBe(uniformBatchPipe['_buffers'][0]);
        expect(bufferResource3.offset).toBe(256);

        scheduler.destroy();
    });

    it('should write the shifted buffer with writeBuffer and submit no command buffer of its own', () =>
    {
        const scheduler = new SchedulerSystem();
        const writeBuffer = jest.fn();
        const submit = jest.fn();
        const createCommandEncoder = jest.fn();
        const gpuBuffers = new Map<unknown, object>();

        const uniformBatchPipe = new GpuUniformBatchPipe({
            scheduler,
            renderableGC: new RenderableGCSystem({} as WebGPURenderer),
            runners: {
                destroy: new SystemRunner('destroy'),
            },
            gpu: { device: { queue: { writeBuffer, submit }, createCommandEncoder } },
            buffer: {
                updateBuffer: jest.fn(),
                getGPUBuffer: (buffer: unknown) =>
                {
                    if (!gpuBuffers.has(buffer)) gpuBuffers.set(buffer, {});

                    return gpuBuffers.get(buffer);
                },
            },
        } as unknown as WebGPURenderer);

        uniformBatchPipe.getArrayBufferResource(new Float32Array(32));
        uniformBatchPipe.getArrayBufferResource(new Float32Array(32));

        uniformBatchPipe.renderEnd();

        const data = uniformBatchPipe['_batchBuffer'].data;

        // the second buffer holds the batch shifted by 128 bytes, written from the CPU copy
        expect(writeBuffer).toHaveBeenCalledTimes(1);
        expect(writeBuffer).toHaveBeenCalledWith(
            gpuBuffers.get(uniformBatchPipe['_buffers'][1]), 0, data.buffer, data.byteOffset + 128, 256
        );
        expect(createCommandEncoder).not.toHaveBeenCalled();
        expect(submit).not.toHaveBeenCalled();

        scheduler.destroy();
    });
});
