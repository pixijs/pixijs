import { GpuUniformBatchPipe } from '../../src/rendering/renderers/gpu/GpuUniformBatchPipe';

import type { WebGPURenderer } from '../../src/rendering/renderers/gpu/WebGPURenderer';

describe('UniformBatch', () =>
{
    it('should get a bind group correctly', () =>
    {
        const uniformBatchPipe = new GpuUniformBatchPipe({} as WebGPURenderer);

        const bufferResource = uniformBatchPipe.getArrayBufferResource(new Float32Array(32));

        expect(bufferResource.buffer).toBe(uniformBatchPipe['_buffers'][0]);
        expect(bufferResource.offset).toBe(0);

        const bufferResource2 = uniformBatchPipe.getArrayBufferResource(new Float32Array(32));

        expect(bufferResource2.buffer).toBe(uniformBatchPipe['_buffers'][1]);
        expect(bufferResource2.offset).toBe(0);

        const bufferResource3 = uniformBatchPipe.getArrayBufferResource(new Float32Array(32));

        expect(bufferResource3.buffer).toBe(uniformBatchPipe['_buffers'][0]);
        expect(bufferResource3.offset).toBe(256);
    });
});
