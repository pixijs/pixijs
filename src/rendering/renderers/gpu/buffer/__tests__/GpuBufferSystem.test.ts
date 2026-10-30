import { Buffer } from '../../../shared/buffer/Buffer';
import { BufferUsage } from '../../../shared/buffer/const';
import { GpuBufferSystem } from '../GpuBufferSystem';

import type { WebGPURenderer } from '../../WebGPURenderer';

let nextUid = 1000;

// a GpuBufferSystem backed by a recording fake device, so the upload bookkeeping can be checked without WebGPU
function createSystem()
{
    const writeBuffer = jest.fn();
    const renderer = {
        uid: nextUid++,
        gc: { now: 0, addResourceHash: jest.fn() },
    } as unknown as WebGPURenderer;
    const system = new GpuBufferSystem(renderer);

    (system as any)._gpu = {
        device: {
            createBuffer: jest.fn(({ size }: { size: number }) => ({
                getMappedRange: () => new ArrayBuffer(size),
                unmap: jest.fn(),
                destroy: jest.fn(),
            })),
            queue: { writeBuffer },
        },
    };

    return { system, writeBuffer };
}

function createBuffer()
{
    return new Buffer({
        data: new Float32Array([0, 1, 2, 3]),
        usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
    });
}

describe('GpuBufferSystem', () =>
{
    it('should not upload a buffer that was just created', () =>
    {
        const { system, writeBuffer } = createSystem();
        const buffer = createBuffer();

        system.updateBuffer(buffer);

        expect(writeBuffer).not.toHaveBeenCalled();
    });

    it('should upload a changed buffer once', () =>
    {
        const { system, writeBuffer } = createSystem();
        const buffer = createBuffer();

        system.updateBuffer(buffer);

        buffer.data.set([4, 5, 6, 7]);
        buffer.update();
        system.updateBuffer(buffer);

        expect(writeBuffer).toHaveBeenCalledTimes(1);
    });

    it('should upload an update to every renderer that manages the buffer', () =>
    {
        const first = createSystem();
        const second = createSystem();
        const buffer = createBuffer();

        first.system.updateBuffer(buffer);
        second.system.updateBuffer(buffer);

        buffer.data.set([4, 5, 6, 7]);
        buffer.update();

        // every renderer listens to `update`, so each of them has to see it
        first.system.updateBuffer(buffer);
        second.system.updateBuffer(buffer);

        expect(first.writeBuffer).toHaveBeenCalledTimes(1);
        expect(second.writeBuffer).toHaveBeenCalledTimes(1);

        // and nothing is uploaded twice
        first.system.updateBuffer(buffer);
        second.system.updateBuffer(buffer);

        expect(first.writeBuffer).toHaveBeenCalledTimes(1);
        expect(second.writeBuffer).toHaveBeenCalledTimes(1);
    });

    it('should upload through the update listener of every renderer', () =>
    {
        const first = createSystem();
        const second = createSystem();
        const buffer = createBuffer();

        first.system.getGPUBuffer(buffer);
        second.system.getGPUBuffer(buffer);

        buffer.update();

        expect(first.writeBuffer).toHaveBeenCalledTimes(1);
        expect(second.writeBuffer).toHaveBeenCalledTimes(1);
    });
});
