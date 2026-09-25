import { BufferImageSource } from '../sources/BufferImageSource';
import { Texture } from '../Texture';
import { describeLocalOnly, getWebGLRenderer, getWebGPURenderer } from '@test-utils';

const WIDTH = 4;
const HEIGHT = 4;

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

function range(start: number, end: number): number[]
{
    return Array.from({ length: end - start }, (_, i) => start + i);
}

type Update = (source: BufferImageSource) => void;

/**
 * Registers the cases shared by every backend.
 * @param readBackAfterUpdate - uploads zeros, fills the buffer with 255, runs `update` against the
 * source and returns the texels that reached the GPU. With `bindFirst` false the helper binds the
 * source only after `update`, so the first upload is the full one.
 */
function itUploadsRanges(readBackAfterUpdate: (update: Update, bindFirst?: boolean) => Promise<number[]>)
{
    it('should upload the whole buffer when no range is given', async () =>
    {
        expect(await readBackAfterUpdate((source) => source.update())).toEqual(range(0, 16));
    });

    it('should upload only the texels in the range', async () =>
    {
        expect(await readBackAfterUpdate((source) => source.update(5, 11))).toEqual(range(5, 11));
    });

    it('should upload a range spanning partial and whole rows', async () =>
    {
        expect(await readBackAfterUpdate((source) => source.update(3, 14))).toEqual(range(3, 14));
    });

    it('should not keep the range for an upload outside update', async () =>
    {
        // a bare 'update' emit is what cube faces and getPo2TextureFromSource send
        expect(await readBackAfterUpdate((source) =>
        {
            source.update(5, 11);
            source.emit('update', source);
        })).toEqual(range(0, 16));
    });

    it('should upload the whole buffer when the source is first bound after a ranged update', async () =>
    {
        expect(await readBackAfterUpdate((source) => source.update(5, 11), false)).toEqual(range(0, 16));
    });
}

describe('BufferImageSource', () =>
{
    describe.each([1, 2] as const)('WebGL%i', (preferWebGLVersion) =>
    {
        async function readBackAfterUpdate(update: Update, bindFirst = true): Promise<number[]>
        {
            const renderer = await getWebGLRenderer({ preferWebGLVersion });
            const { data, source } = createSource();
            const texture = new Texture({ source });

            if (bindFirst) renderer.texture.initSource(source);

            data.fill(255);
            update(source);

            renderer.texture.initSource(source);

            const { pixels } = renderer.texture.getPixels(texture);

            renderer.destroy();

            return uploadedTexels(pixels);
        }

        itUploadsRanges(readBackAfterUpdate);
    });

    describeLocalOnly('WebGPU', () =>
    {
        async function readBackAfterUpdate(update: Update, bindFirst = true): Promise<number[]>
        {
            const renderer = await getWebGPURenderer();
            const device = renderer.gpu.device;
            const { data, source } = createSource();

            if (bindFirst) renderer.texture.initSource(source);

            data.fill(255);
            update(source);

            const gpuTexture = renderer.texture.initSource(source);

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

        itUploadsRanges(readBackAfterUpdate);
    });
});
