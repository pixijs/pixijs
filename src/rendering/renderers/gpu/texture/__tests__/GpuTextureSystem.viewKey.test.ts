import { TextureSource } from '../../../shared/texture/sources/TextureSource';
import { describeLocalOnly, getWebGPURenderer } from '@test-utils';

import type { WebGPURenderer } from '../../WebGPURenderer';

describeLocalOnly('GpuTextureSystem texture view cache key', () =>
{
    it('should return distinct views for descriptors differing only in mip/layer fields', async () =>
    {
        const renderer = (await getWebGPURenderer()) as WebGPURenderer;

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

        renderer.destroy();
    });
});
