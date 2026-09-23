import { BufferImageSource } from '../sources/BufferImageSource';
import { Texture } from '../Texture';
import { describeLocalOnly, getWebGLRenderer, getWebGPURenderer } from '@test-utils';

import type { WebGPURenderer } from '../../../gpu/WebGPURenderer';
import type { WebGLRenderer } from '~/rendering';

const WIDTH = 4;
const HEIGHT = 4;

// 4x4 rgba8 texture, uploaded as zeros, then filled with 255 on the CPU.
// Only the texels inside the updated range should reach the GPU.
function createSource()
{
    const data = new Uint8Array(WIDTH * HEIGHT * 4);
    const source = new BufferImageSource({ resource: data, width: WIDTH, height: HEIGHT, format: 'rgba8unorm' });

    return { data, source };
}

function uploadedTexels(pixels: ArrayLike<number>, bytesPerRow = WIDTH * 4): number[]
{
    const out: number[] = [];

    for (let i = 0; i < WIDTH * HEIGHT; i++)
    {
        const x = i % WIDTH;
        const y = Math.floor(i / WIDTH);

        if (pixels[(y * bytesPerRow) + (x * 4)] === 255) out.push(i);
    }

    return out;
}

const range = (start: number, end: number) => Array.from({ length: end - start }, (_, i) => start + i);

describe('BufferImageSource', () =>
{
    describe.each([1, 2] as const)('WebGL%i', (preferWebGLVersion) =>
    {
        async function uploadRange(start?: number, end?: number): Promise<number[]>
        {
            const renderer = (await getWebGLRenderer({ preferWebGLVersion })) as WebGLRenderer;
            const { data, source } = createSource();
            const texture = new Texture({ source });

            renderer.texture.initSource(source);

            data.fill(255);
            source.update(start, end);

            const { pixels } = renderer.texture.getPixels(texture);

            renderer.destroy();

            return uploadedTexels(pixels);
        }

        it('should upload the whole buffer when no range is given', async () =>
        {
            expect(await uploadRange()).toEqual(range(0, 16));
        });

        it('should upload only the texels in the range', async () =>
        {
            expect(await uploadRange(5, 11)).toEqual(range(5, 11));
        });

        it('should upload a range spanning partial and whole rows', async () =>
        {
            expect(await uploadRange(3, 14)).toEqual(range(3, 14));
        });
    });

    describeLocalOnly('WebGPU', () =>
    {
        async function uploadRange(start?: number, end?: number): Promise<number[]>
        {
            const renderer = (await getWebGPURenderer()) as WebGPURenderer;
            const device = renderer.gpu.device;
            const { data, source } = createSource();

            const gpuTexture = renderer.texture.initSource(source);

            data.fill(255);
            source.update(start, end);

            const readBuffer = device.createBuffer({
                size: 256 * HEIGHT,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
            });
            const encoder = device.createCommandEncoder();

            encoder.copyTextureToBuffer({ texture: gpuTexture }, { buffer: readBuffer, bytesPerRow: 256 }, [WIDTH, HEIGHT]);
            device.queue.submit([encoder.finish()]);

            await readBuffer.mapAsync(GPUMapMode.READ);
            const pixels = new Uint8Array(readBuffer.getMappedRange().slice(0));

            readBuffer.destroy();
            renderer.destroy();

            return uploadedTexels(pixels, 256);
        }

        it('should upload the whole buffer when no range is given', async () =>
        {
            expect(await uploadRange()).toEqual(range(0, 16));
        });

        it('should upload only the texels in the range', async () =>
        {
            expect(await uploadRange(5, 11)).toEqual(range(5, 11));
        });

        it('should upload a range spanning partial and whole rows', async () =>
        {
            expect(await uploadRange(3, 14)).toEqual(range(3, 14));
        });
    });
});
