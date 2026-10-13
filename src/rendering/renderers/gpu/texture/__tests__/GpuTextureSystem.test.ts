import { RenderTexture } from '../../../shared/texture/RenderTexture';
import { TextureSource } from '../../../shared/texture/sources/TextureSource';
import { Texture } from '../../../shared/texture/Texture';
import { describeLocalOnly, getWebGPURenderer } from '@test-utils';
import { Graphics } from '~/scene';

import type { WebGPURenderer } from '../../WebGPURenderer';

let renderer: WebGPURenderer;

afterEach(() =>
{
    renderer?.destroy();
    renderer = null;
});

describeLocalOnly('GpuTextureSystem', () =>
{
    it.each(['bgra8unorm', 'rgba8unorm', 'bgra8unorm-srgb', 'rgba8unorm-srgb', 'rgba16float'] as const)(
        'should extract a %s render texture regardless of the preferred canvas format',
        async (format) =>
        {
            renderer = (await getWebGPURenderer({ width: 2, height: 2 })) as WebGPURenderer;

            const texture = RenderTexture.create({ width: 2, height: 2, format });
            const square = new Graphics().rect(0, 0, 2, 2).fill(0xff0000);
            const device = renderer.gpu.device;

            renderer.render({ container: square, target: texture, clear: true });

            device.pushErrorScope('validation');

            const { pixels } = renderer.extract.pixels(texture);
            const canvas = renderer.extract.canvas(texture);
            const error = await device.popErrorScope();

            expect(error).toBeNull();
            expect(Array.from(pixels.slice(0, 4))).toEqual([255, 0, 0, 255]);

            const sampleCanvas = document.createElement('canvas');

            sampleCanvas.width = 2;
            sampleCanvas.height = 2;

            const context = sampleCanvas.getContext('2d');

            context.drawImage(canvas as HTMLCanvasElement, 0, 0);

            expect(Array.from(context.getImageData(0, 0, 1, 1).data)).toEqual([255, 0, 0, 255]);

            square.destroy();
            texture.destroy(true);
        }
    );

    it('should reject a texture format that cannot be copied into a WebGPU canvas', async () =>
    {
        renderer = (await getWebGPURenderer({ width: 2, height: 2 })) as WebGPURenderer;

        const texture = new Texture({ source: new TextureSource({ width: 2, height: 2, format: 'r8unorm' }) });

        expect(() => renderer.extract.canvas(texture)).toThrow(/Cannot copy texture format 'r8unorm'/);

        texture.destroy(true);
    });

    it('should cache texture views correctly', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;
        const texture = Texture.WHITE;

        // Ensure source is initialized
        renderer.texture.initSource(texture.source);

        const view1 = renderer.texture.getTextureRenderTargetView(texture, 0, 0);
        const view2 = renderer.texture.getTextureRenderTargetView(texture, 0, 0);

        expect(view1).toBe(view2);

        const view3 = renderer.texture.getTextureRenderTargetView(texture, 1, 0);

        expect(view3).not.toBe(view1);

        const view4 = renderer.texture.getTextureRenderTargetView(texture, 1, 0);

        expect(view4).toBe(view3);
    });

    it('should generate different keys for different layers', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        // Create a texture that pretends to have layers (e.g. 2D array or Cube)
        // For testing key generation, we just need to pass the params.
        // However, the system checks `gpuData` which is created from the source.
        // We might need to ensure the GPU texture created actually supports layers if the mock validates it.
        // Assuming the mock is permissive or we just check the caching logic.

        const texture = Texture.WHITE;

        renderer.texture.initSource(texture.source);

        // Mocking arrayLayerCount on source to ensure key calculation uses it?
        // The code uses `source.arrayLayerCount || 1`.
        // If we want to test layers, we should probably mock a source with arrayLayerCount > 1.

        const view1 = renderer.texture.getTextureRenderTargetView(texture, 0, 0);
        const view2 = renderer.texture.getTextureRenderTargetView(texture, 0, 1); // Layer 1

        expect(view1).not.toBe(view2);
    });
});

describeLocalOnly('GpuTextureSystem texture view cache key', () =>
{
    it('should return distinct views for descriptors differing only in mip/layer fields', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const source = new TextureSource({
            width: 16, height: 16, mipLevelCount: 2, autoGenerateMipmaps: false,
        });

        const mip0 = renderer.texture.getTextureView(source, { baseMipLevel: 0, mipLevelCount: 1 });
        const mip1 = renderer.texture.getTextureView(source, { baseMipLevel: 1, mipLevelCount: 1 });
        const defaultView = renderer.texture.getTextureView(source);

        // distinct subresources must not share a cached GPUTextureView — aliasing
        // means silently sampling the wrong mip/layer with no error anywhere
        expect(mip0).not.toBe(mip1);
        expect(mip0).not.toBe(defaultView);

        // identical descriptors must still hit the cache
        const mip0Again = renderer.texture.getTextureView(source, { baseMipLevel: 0, mipLevelCount: 1 });

        expect(mip0Again).toBe(mip0);
    });
});

describeLocalOnly('GpuTextureSystem sRGB view format', () =>
{
    it('should let any texture with an sRGB version be viewed as sRGB', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const createTexture = jest.spyOn(renderer.gpu.device, 'createTexture');
        const source = new TextureSource({ width: 4, height: 4, format: 'rgba8unorm' });

        renderer.texture.initSource(source);

        expect(createTexture.mock.calls[0][0].viewFormats).toEqual(['rgba8unorm-srgb']);

        const plainView = renderer.texture.getTextureView(source);
        const srgbView = renderer.texture.getTextureView(source, { format: 'rgba8unorm-srgb' });

        expect(srgbView).not.toBe(plainView);
        expect(renderer.texture.getTextureView(source, { format: 'rgba8unorm-srgb' })).toBe(srgbView);
    });

    it('should leave viewFormats unset for formats without an sRGB version and for MSAA', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const createTexture = jest.spyOn(renderer.gpu.device, 'createTexture');

        renderer.texture.initSource(new TextureSource({ width: 4, height: 4, format: 'r8unorm' }));
        renderer.texture.initSource(new TextureSource({ width: 4, height: 4, format: 'rgba16float' }));
        // multisampled: never sampled, so no sRGB view either
        renderer.texture.initSource(new TextureSource({ width: 4, height: 4, format: 'rgba8unorm', sampleCount: 4 }));

        expect(createTexture.mock.calls[0][0].viewFormats).toBeUndefined();
        expect(createTexture.mock.calls[1][0].viewFormats).toBeUndefined();
        expect(createTexture.mock.calls[2][0].viewFormats).toBeUndefined();
    });
});

describeLocalOnly('GpuTextureSystem 3D textures', () =>
{
    it('should drop the 3D mipmap generator when the device changes', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        renderer.texture.initSource(new TextureSource({
            width: 2, height: 2, depth: 2, format: 'rgba8unorm', storage: true, autoGenerateMipmaps: true,
        }));

        expect(renderer.texture['_mipmap3dGenerator']).toBeTruthy();

        // its pipeline and sampler belong to the old device
        renderer.texture['contextChange'](renderer.gpu);

        expect(renderer.texture['_mipmap3dGenerator']).toBeNull();
    });

    it('should refuse 3D mipmaps it cannot generate before creating the texture', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const notStorage = new TextureSource({
            width: 2, height: 2, depth: 2, format: 'rgba8unorm', autoGenerateMipmaps: true,
        });
        const notFilterable = new TextureSource({
            width: 2, height: 2, depth: 2, format: 'rgba32float', storage: true, autoGenerateMipmaps: true,
        });

        expect(() => renderer.texture.initSource(notStorage)).toThrow('needs storage: true');
        expect(() => renderer.texture.initSource(notFilterable)).toThrow('\'rgba32float\' can\'t be downsampled');
        expect(notStorage._gpuData[renderer.uid]).toBeUndefined();
        expect(notFilterable._gpuData[renderer.uid]).toBeUndefined();
    });

    it('should generate 3D mipmaps for every format it accepts', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const device = renderer.gpu.device;

        for (const format of ['rgba8unorm', 'rgba16float'] as const)
        {
            device.pushErrorScope('validation');

            renderer.texture.initSource(new TextureSource({
                width: 4, height: 4, depth: 4, format, storage: true, autoGenerateMipmaps: true,
            }));

            expect(await device.popErrorScope()).toBeNull();
        }
    });

    it('should count the mip levels of a 3D texture along its depth', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const gpuTexture = renderer.texture.initSource(new TextureSource({
            width: 2, height: 2, depth: 8, format: 'rgba8unorm', storage: true, autoGenerateMipmaps: true,
        }));

        expect(gpuTexture.mipLevelCount).toBe(4);
    });

    describe('storage', () =>
    {
        it('should add STORAGE_BINDING only to textures marked storage', async () =>
        {
            renderer = (await getWebGPURenderer()) as WebGPURenderer;

            const storage = renderer.texture.initSource(new TextureSource({
                width: 4, height: 4, depth: 4, format: 'rgba8unorm', storage: true,
            }));
            const plain = renderer.texture.initSource(new TextureSource({ width: 4, height: 4, format: 'rgba8unorm' }));

            expect(storage.usage & GPUTextureUsage.STORAGE_BINDING).toBeTruthy();
            expect(storage.dimension).toBe('3d');
            expect(plain.usage & GPUTextureUsage.STORAGE_BINDING).toBe(0);
        });
    });
});
