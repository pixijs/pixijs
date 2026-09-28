import { TextureSource } from '../../../shared/texture/sources/TextureSource';
import { Texture } from '../../../shared/texture/Texture';
import { describeLocalOnly, getWebGPURenderer } from '@test-utils';

import type { WebGPURenderer } from '../../WebGPURenderer';

let renderer: WebGPURenderer;

afterEach(() =>
{
    renderer?.destroy();
    renderer = null;
});

describeLocalOnly('GpuTextureSystem', () =>
{
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
