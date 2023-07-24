import { Buffer } from '../../shared/buffer/Buffer';
import { BufferUsage } from '../../shared/buffer/const';

import type { WebGPURenderer } from '../WebGPURenderer';

export function GpuReadBuffer(buffer: Buffer, renderer: WebGPURenderer)
{
    const bufferSize = buffer.descriptor.size;

    const device = renderer.gpu.device;

    const stagingBuffer = new Buffer({
        data: new Float32Array(2400000),
        usage: BufferUsage.MAP_READ | BufferUsage.COPY_DST,
    });

    const stagingGPUBuffer = renderer.buffer.createGPUBuffer(stagingBuffer);

    const commandEncoder = device.createCommandEncoder();

    commandEncoder.copyBufferToBuffer(
        renderer.buffer.getGPUBuffer(buffer),
        0, // Source offset
        stagingGPUBuffer,
        0, // Destination offset
        bufferSize,
    );

    device.queue.submit([commandEncoder.finish()]);

    void stagingGPUBuffer.mapAsync(
        GPUMapMode.READ,
        0, // Offset
        bufferSize, // Length
    ).then(() =>
    {
        stagingGPUBuffer.getMappedRange(0, bufferSize);
        stagingGPUBuffer.unmap();
    });
}
