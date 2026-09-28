import { BufferImageSource } from '../../../../shared/texture/sources/BufferImageSource';
import { Gpu3dMipmapGenerator } from '../Gpu3dMipmapGenerator';
import { describeLocalOnly, getWebGPURenderer } from '@test-utils';

import type { WebGPURenderer } from '../../../WebGPURenderer';

describeLocalOnly('Gpu3dMipmapGenerator', () =>
{
    let renderer: WebGPURenderer;

    afterEach(() =>
    {
        renderer?.destroy();
    });

    it('should box-filter a 3D texture down one mip', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        // slice 0 is four texels of red 254, slice 1 four of green, so mip 1's one texel averages to 127, 127, 0
        const data = new Uint8Array(2 * 2 * 2 * 4);

        for (let i = 0; i < 8; i++)
        {
            const o = i * 4;

            data[o] = i < 4 ? 254 : 0;
            data[o + 1] = i < 4 ? 0 : 254;
            data[o + 2] = 0;
            data[o + 3] = 255;
        }

        const source = new BufferImageSource({
            resource: data,
            width: 2,
            height: 2,
            depth: 2,
            format: 'rgba8unorm',
            storage: true,
            autoGenerateMipmaps: true,
        });

        const gpuTexture = renderer.texture.initSource(source);

        expect(gpuTexture.mipLevelCount).toBe(2);

        const device = renderer.gpu.device;
        const readBuffer = device.createBuffer({
            size: 256,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });
        const encoder = device.createCommandEncoder();

        encoder.copyTextureToBuffer(
            { texture: gpuTexture, mipLevel: 1 },
            { buffer: readBuffer, bytesPerRow: 256, rowsPerImage: 1 },
            { width: 1, height: 1, depthOrArrayLayers: 1 },
        );
        device.queue.submit([encoder.finish()]);

        await readBuffer.mapAsync(GPUMapMode.READ);

        const pixel = new Uint8Array(readBuffer.getMappedRange()).slice(0, 4);

        readBuffer.destroy();

        expect(Array.from(pixel)).toEqual([127, 127, 0, 255]);
    });

    it('should refuse a 3D texture that is not storage', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

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
