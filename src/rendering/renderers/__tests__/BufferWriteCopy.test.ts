import '~/rendering/init';
import { Buffer } from '../shared/buffer/Buffer';
import { BufferUsage } from '../shared/buffer/const';
import { describeLocalOnly, getGlProgram, getWebGLRenderer, getWebGPURenderer } from '@test-utils';
import { Geometry } from '~/rendering';

import type { WebGLRenderer } from '../gl/WebGLRenderer';
import type { WebGPURenderer } from '../gpu/WebGPURenderer';

// the canvas renderer has no buffer system
type GpuRenderer = WebGLRenderer | WebGPURenderer;

const SIZE = 32;
const USAGE = BufferUsage.VERTEX | BufferUsage.COPY_SRC | BufferUsage.COPY_DST;

function describeWriteAndCopy<R extends GpuRenderer>(
    createRenderer: () => Promise<R>,
    readBack: (renderer: R, buffer: Buffer) => Promise<number[]>,
): void
{
    let renderer: R;

    beforeEach(async () =>
    {
        renderer = await createRenderer();
    });

    afterEach(() =>
    {
        renderer.destroy();
        renderer = null;
    });

    it('should write bytes that start partway into their ArrayBuffer into a size-only buffer', async () =>
    {
        const buffer = new Buffer({ size: SIZE, usage: USAGE });
        // the three values to write start 8 bytes into their ArrayBuffer
        const values = new Uint32Array([0xdead, 0xbeef, 1, 2, 3, 0xcafe]).subarray(2, 5);

        renderer.buffer.write(buffer, values, 8);

        expect(await readBack(renderer, buffer)).toEqual([0, 0, 1, 2, 3, 0, 0, 0]);
        expect(buffer.data).toBeUndefined();
    });

    it('should copy a range of one buffer into another', async () =>
    {
        const from = new Buffer({ size: SIZE, usage: USAGE });
        const to = new Buffer({ size: SIZE, usage: USAGE });

        renderer.buffer.write(from, new Uint32Array([1, 2, 3, 4, 5, 6, 7, 8]));
        renderer.buffer.copy(from, to, 12, 8, 16);

        expect(await readBack(renderer, to)).toEqual([0, 0, 0, 0, 3, 4, 5, 0]);
        expect(from.data).toBeUndefined();
        expect(to.data).toBeUndefined();
    });

    it('should not garbage collect a buffer with no data', async () =>
    {
        const sizeOnly = new Buffer({ size: SIZE, usage: USAGE });
        const withData = new Buffer({ data: new Uint32Array(SIZE / 4), usage: USAGE });

        renderer.buffer.write(sizeOnly, new Uint32Array([1, 2, 3, 4]));
        renderer.buffer.updateBuffer(withData);

        const stale = performance.now() - renderer.gc.maxUnusedTime - 1;

        sizeOnly._gcLastUsed = stale;
        withData._gcLastUsed = stale;

        renderer.gc.run();

        expect(withData._gpuData[renderer.uid]).toBeUndefined();
        expect(sizeOnly._gpuData[renderer.uid]).toBeDefined();
        expect(await readBack(renderer, sizeOnly)).toEqual([1, 2, 3, 4, 0, 0, 0, 0]);
    });
}

describe('Buffer write and copy on WebGL', () =>
{
    describeWriteAndCopy(() => getWebGLRenderer(), async (renderer, buffer) =>
    {
        const gl = renderer.gl;
        const values = new Uint32Array(SIZE / 4);

        gl.bindBuffer(gl.COPY_READ_BUFFER, renderer.buffer.getGlBuffer(buffer).buffer);
        gl.getBufferSubData(gl.COPY_READ_BUFFER, 0, values);

        return Array.from(values);
    });

    it('should leave the bound vertex array\'s index buffer alone when writing an index buffer', async () =>
    {
        const renderer = await getWebGLRenderer();
        const gl = renderer.gl;
        const program = getGlProgram();
        const geometry = new Geometry({
            attributes: { aPosition: new Float32Array([0, 0, 1, 0, 1, 1]) },
            indexBuffer: new Uint32Array([0, 1, 2]),
        });
        const indexBuffer = new Buffer({ size: 12, usage: BufferUsage.INDEX | BufferUsage.COPY_DST });

        renderer.geometry.bind(geometry, program);

        // the first write gives the buffer its storage, later ones only write
        renderer.buffer.write(indexBuffer, new Uint32Array([0, 1, 2]));
        renderer.buffer.write(indexBuffer, new Uint32Array([2, 1, 0]));

        renderer.geometry.bind(geometry, program);

        expect(gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING))
            .toBe(renderer.buffer.getGlBuffer(geometry.indexBuffer).buffer);

        renderer.destroy();
    });

    it('should throw when copying on WebGL1', async () =>
    {
        const renderer = await getWebGLRenderer({ preferWebGLVersion: 1 });
        const from = new Buffer({ size: SIZE, usage: USAGE });
        const to = new Buffer({ size: SIZE, usage: USAGE });

        expect(renderer.context.webGLVersion).toBe(1);
        expect(() => renderer.buffer.copy(from, to, SIZE)).toThrow('requires WebGL2');

        renderer.destroy();
    });
});

describeLocalOnly('Buffer write and copy on WebGPU', () =>
{
    describeWriteAndCopy(() => getWebGPURenderer(), async (renderer, buffer) =>
    {
        const device = renderer.gpu.device;
        const readBuffer = device.createBuffer({
            size: SIZE,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });
        const encoder = device.createCommandEncoder();

        encoder.copyBufferToBuffer(renderer.buffer.getGPUBuffer(buffer), 0, readBuffer, 0, SIZE);
        device.queue.submit([encoder.finish()]);

        await readBuffer.mapAsync(GPUMapMode.READ);

        const values = Array.from(new Uint32Array(readBuffer.getMappedRange()));

        readBuffer.destroy();

        return values;
    });
});
