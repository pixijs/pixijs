import { RenderTarget } from '../../../shared/renderTarget/RenderTarget';
import { TextureSource } from '../../../shared/texture/sources/TextureSource';
import { Texture } from '../../../shared/texture/Texture';
import { describeLocalOnly, getWebGPURenderer } from '@test-utils';

import type { WebGPURenderer } from '../../WebGPURenderer';

function makeTarget(): RenderTarget
{
    return new RenderTarget({
        colorTextures: [new TextureSource({ width: 16, height: 16 })],
        depthStencilTexture: new TextureSource({ width: 16, height: 16, format: 'depth24plus-stencil8' }),
    });
}

function makeDepthTexture(): Texture
{
    return new Texture({
        source: new TextureSource({ width: 16, height: 16, format: 'depth24plus-stencil8' }),
    });
}

describeLocalOnly('GpuRenderTargetAdaptor copies', () =>
{
    it('should close an open render pass before recording copyDepthTexture mid-frame', async () =>
    {
        const renderer = (await getWebGPURenderer()) as WebGPURenderer;
        const source = makeTarget();
        const destination = makeDepthTexture();

        const device = renderer.gpu.device;

        device.pushErrorScope('validation');

        // simulate the documented mid-frame use: a frame is underway and a render
        // pass is open when the copy is requested
        renderer.encoder.renderStart();
        renderer.renderTarget.bind({ target: source, clear: true });

        renderer.renderTarget.copyDepthTexture(
            source, destination,
            { x: 0, y: 0 }, { width: 16, height: 16 }, { x: 0, y: 0 },
        );

        renderer.encoder.postrender();

        const error = await device.popErrorScope();

        expect(error).toBeNull();

        renderer.destroy();
    });
});

describeLocalOnly('GpuRenderTargetAdaptor labels', () =>
{
    it('should plumb the RenderTarget label through to the render pass descriptor', async () =>
    {
        const renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const target = new RenderTarget({
            colorTextures: [new TextureSource({ width: 16, height: 16 })],
            label: 'shadow-pass',
        });

        renderer.encoder.renderStart();
        renderer.renderTarget.bind({ target, clear: true });

        const gpuRenderTarget = renderer.renderTarget.getGpuRenderTarget(target);

        expect(gpuRenderTarget.descriptor.label).toBe('shadow-pass');

        renderer.encoder.postrender();
        renderer.destroy();
    });
});

describeLocalOnly('GpuRenderTargetAdaptor msaa textures', () =>
{
    it('should not inherit autoGenerateMipmaps from TextureSource.defaultOptions', async () =>
    {
        const originalAutoGenerateMipmaps = TextureSource.defaultOptions.autoGenerateMipmaps;

        TextureSource.defaultOptions.autoGenerateMipmaps = true;

        const renderer = (await getWebGPURenderer()) as WebGPURenderer;

        try
        {
            const target = new RenderTarget({
                colorTextures: [new TextureSource({ width: 16, height: 16, antialias: true })],
            });

            const device = renderer.gpu.device;

            device.pushErrorScope('validation');

            renderer.encoder.renderStart();
            renderer.renderTarget.bind({ target, clear: true });

            const msaaTexture = renderer.renderTarget.getGpuRenderTarget(target).msaaTextures[0];

            // multisampled textures must have exactly 1 mip level
            expect(msaaTexture.autoGenerateMipmaps).toBe(false);
            expect(msaaTexture.mipLevelCount).toBe(1);

            renderer.encoder.postrender();

            expect(await device.popErrorScope()).toBeNull();
        }
        finally
        {
            TextureSource.defaultOptions.autoGenerateMipmaps = originalAutoGenerateMipmaps;
            renderer.destroy();
        }
    });
});
