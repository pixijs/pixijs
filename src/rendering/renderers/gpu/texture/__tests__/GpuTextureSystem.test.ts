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
