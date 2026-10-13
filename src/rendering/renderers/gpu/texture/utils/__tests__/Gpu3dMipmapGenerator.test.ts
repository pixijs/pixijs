import { BufferImageSource } from '../../../../shared/texture/sources/BufferImageSource';
import { Gpu3dMipmapGenerator } from '../Gpu3dMipmapGenerator';
import { describeLocalOnly, getWebGPURenderer } from '@test-utils';

import type { WebGPURenderer } from '../../../WebGPURenderer';

/**
 * A cube of rgba8unorm texels whose front half of slices is red 254 and back half is green 254.
 * @param size - texels along each side
 */
function redThenGreenVolume(size: number): Uint8Array
{
    const texels = size * size * size;
    const data = new Uint8Array(texels * 4);

    for (let i = 0; i < texels; i++)
    {
        data.set(i < texels / 2 ? [254, 0, 0, 255] : [0, 254, 0, 255], i * 4);
    }

    return data;
}

async function readFirstTexel(device: GPUDevice, texture: GPUTexture, mipLevel: number): Promise<number[]>
{
    const readBuffer = device.createBuffer({
        size: 256,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    const encoder = device.createCommandEncoder();

    encoder.copyTextureToBuffer(
        { texture, mipLevel },
        { buffer: readBuffer, bytesPerRow: 256, rowsPerImage: 1 },
        { width: 1, height: 1, depthOrArrayLayers: 1 },
    );
    device.queue.submit([encoder.finish()]);

    await readBuffer.mapAsync(GPUMapMode.READ);

    const pixel = Array.from(new Uint8Array(readBuffer.getMappedRange()).slice(0, 4));

    readBuffer.destroy();

    return pixel;
}

describeLocalOnly('Gpu3dMipmapGenerator', () =>
{
    let renderer: WebGPURenderer;

    afterEach(() =>
    {
        renderer?.destroy();
    });

    it('should box-filter a 3D texture down one mip', async () =>
    {
        renderer = await getWebGPURenderer();

        // slice 0 is red, slice 1 green, so mip 1's one texel averages to 127, 127, 0
        const gpuTexture = renderer.texture.initSource(new BufferImageSource({
            resource: redThenGreenVolume(2),
            width: 2,
            height: 2,
            depth: 2,
            format: 'rgba8unorm',
            storage: true,
            autoGenerateMipmaps: true,
        }));

        expect(gpuTexture.mipLevelCount).toBe(2);
        expect(await readFirstTexel(renderer.gpu.device, gpuTexture, 1)).toEqual([127, 127, 0, 255]);
    });

    it('should build each mip from the one written before it', async () =>
    {
        renderer = await getWebGPURenderer();

        // slices 0-1 are red and 2-3 green: mip 1 keeps a red and a green slice, and mip 2 averages them
        const gpuTexture = renderer.texture.initSource(new BufferImageSource({
            resource: redThenGreenVolume(4),
            width: 4,
            height: 4,
            depth: 4,
            format: 'rgba8unorm',
            storage: true,
            autoGenerateMipmaps: true,
        }));

        expect(gpuTexture.mipLevelCount).toBe(3);
        expect(await readFirstTexel(renderer.gpu.device, gpuTexture, 2)).toEqual([127, 127, 0, 255]);
    });

    it('should refuse a 3D texture that is not storage', async () =>
    {
        renderer = await getWebGPURenderer();

        const source = new BufferImageSource({
            resource: new Uint8Array(2 * 2 * 2 * 4),
            width: 2,
            height: 2,
            depth: 2,
            format: 'rgba8unorm',
            mipLevelCount: 2,
        });
        const gpuTexture = renderer.texture.initSource(source);

        expect(() => new Gpu3dMipmapGenerator(renderer.gpu.device).generateMipmap(gpuTexture))
            .toThrow('storage: true');
    });
});
