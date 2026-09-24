import { CLEAR } from '../../../gl/const';
import { RenderTarget } from '../../../shared/renderTarget/RenderTarget';
import { TextureSource } from '../../../shared/texture/sources/TextureSource';
import { Texture } from '../../../shared/texture/Texture';
import { describeLocalOnly, getWebGPURenderer } from '@test-utils';
import { AlphaFilter } from '~/filters';
import { Container, Graphics } from '~/scene';

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

describeLocalOnly('GpuRenderTargetAdaptor transient msaa colour', () =>
{
    function makeMsaaTarget(
        options: { transient?: boolean, colors?: number, depthStencil?: boolean, size?: number } = {}
    ): RenderTarget
    {
        const { transient = false, colors = 1, depthStencil = false, size = 16 } = options;

        return new RenderTarget({
            colorTextures: Array.from({ length: colors }, () =>
                new TextureSource({ width: size, height: size, antialias: true, transient })),
            depthStencilTexture: depthStencil
                ? new TextureSource({ width: size, height: size, format: 'depth24plus-stencil8' })
                : undefined,
        });
    }

    function scratchTextures(createTexture: jest.SpyInstance<GPUTexture, [GPUTextureDescriptor]>): GPUTexture[]
    {
        const { calls, results } = createTexture.mock;

        return results
            .filter((_, i) => calls[i][0].label === 'msaa-restore-scratch')
            .map((result) => result.value);
    }

    it('should clear and discard msaa colour on every pass, restoring it when the pass would load', async () =>
    {
        const renderer = (await getWebGPURenderer()) as WebGPURenderer;
        const target = makeMsaaTarget();
        const other = makeMsaaTarget();
        const device = renderer.gpu.device;

        device.pushErrorScope('validation');
        renderer.encoder.renderStart();

        renderer.renderTarget.bind({ target, clear: true });

        const gpuRenderTarget = renderer.renderTarget.getGpuRenderTarget(target);
        const first = gpuRenderTarget.descriptor.colorAttachments[0];

        expect(gpuRenderTarget.msaaTextures[0].transient).toBe(true);
        expect(first.loadOp).toBe('clear');
        expect(first.storeOp).toBe('discard');
        expect(gpuRenderTarget.msaaRestore).toEqual([]);

        // leave and come back without clearing: the discarded samples are restored, not loaded
        renderer.renderTarget.bind({ target: other, clear: true });
        renderer.renderTarget.bind({ target, clear: false });

        const reopened = gpuRenderTarget.descriptor.colorAttachments[0];

        expect(reopened.loadOp).toBe('clear');
        expect(reopened.storeOp).toBe('discard');
        expect(gpuRenderTarget.msaaRestore).toEqual([0]);

        renderer.encoder.postrender();

        expect(await device.popErrorScope()).toBeNull();

        renderer.destroy();
    });

    it('should keep storing msaa depth/stencil unless the colour texture is marked transient', async () =>
    {
        const renderer = (await getWebGPURenderer()) as WebGPURenderer;
        const kept = makeMsaaTarget({ depthStencil: true });
        const scratch = makeMsaaTarget({ depthStencil: true, transient: true });

        renderer.encoder.renderStart();

        renderer.renderTarget.bind({ target: kept, clear: true });
        expect(renderer.renderTarget.getGpuRenderTarget(kept).descriptor.depthStencilAttachment.stencilStoreOp)
            .toBe('store');

        renderer.renderTarget.bind({ target: scratch, clear: true });
        expect(renderer.renderTarget.getGpuRenderTarget(scratch).descriptor.depthStencilAttachment.stencilStoreOp)
            .toBe('discard');

        renderer.encoder.postrender();
        renderer.destroy();
    });

    it('should restore every colour attachment of a reopened msaa target with depth/stencil', async () =>
    {
        const renderer = (await getWebGPURenderer()) as WebGPURenderer;
        const target = makeMsaaTarget({ colors: 2, depthStencil: true });
        const other = makeMsaaTarget();
        const device = renderer.gpu.device;

        device.pushErrorScope('validation');
        renderer.encoder.renderStart();

        renderer.renderTarget.bind({ target, clear: true });
        renderer.renderTarget.bind({ target: other, clear: true });
        renderer.renderTarget.bind({ target, clear: false });

        expect(renderer.renderTarget.getGpuRenderTarget(target).msaaRestore).toEqual([0, 1]);

        renderer.encoder.postrender();

        expect(await device.popErrorScope()).toBeNull();

        renderer.destroy();
    });

    it('should keep a replaced scratch texture alive until the frame is submitted', async () =>
    {
        const renderer = (await getWebGPURenderer()) as WebGPURenderer;
        const small = makeMsaaTarget();
        const large = makeMsaaTarget({ size: 64 });
        const other = makeMsaaTarget();
        const device = renderer.gpu.device;
        const createTexture = jest.spyOn(device, 'createTexture');

        device.pushErrorScope('validation');
        renderer.encoder.renderStart();

        // the first restore creates a 16x16 scratch texture
        renderer.renderTarget.bind({ target: small, clear: true });
        renderer.renderTarget.bind({ target: other, clear: true });
        renderer.renderTarget.bind({ target: small, clear: false });

        // the second needs 64x64, so the scratch is replaced while the first copy is still unsubmitted
        renderer.renderTarget.bind({ target: large, clear: true });
        renderer.renderTarget.bind({ target: other, clear: true });
        renderer.renderTarget.bind({ target: large, clear: false });

        const destroy = jest.spyOn(scratchTextures(createTexture)[0], 'destroy');

        expect(destroy).not.toHaveBeenCalled();

        renderer.encoder.postrender();

        expect(await device.popErrorScope()).toBeNull();

        await renderer.encoder.commandFinished;
        await Promise.resolve();

        expect(destroy).toHaveBeenCalledTimes(1);

        renderer.destroy();
    });

    it('should destroy the restore scratch textures with the renderer', async () =>
    {
        const renderer = (await getWebGPURenderer()) as WebGPURenderer;
        const target = makeMsaaTarget();
        const other = makeMsaaTarget();
        const createTexture = jest.spyOn(renderer.gpu.device, 'createTexture');

        renderer.encoder.renderStart();
        renderer.renderTarget.bind({ target, clear: true });
        renderer.renderTarget.bind({ target: other, clear: true });
        renderer.renderTarget.bind({ target, clear: false });
        renderer.encoder.postrender();

        const destroys = scratchTextures(createTexture).map((texture) => jest.spyOn(texture, 'destroy'));

        expect(destroys).toHaveLength(1);

        renderer.destroy();

        for (const destroy of destroys)
        {
            expect(destroy).toHaveBeenCalledTimes(1);
        }
    });

    it('should restore msaa colour on a depth-only clear outside a frame', async () =>
    {
        const renderer = (await getWebGPURenderer()) as WebGPURenderer;
        const target = makeMsaaTarget({ depthStencil: true });
        const device = renderer.gpu.device;

        renderer.encoder.renderStart();
        renderer.renderTarget.bind({ target, clear: true });
        renderer.encoder.postrender();

        device.pushErrorScope('validation');

        renderer.renderTarget.clear(target, CLEAR.DEPTH);

        expect(renderer.renderTarget.getGpuRenderTarget(target).msaaRestore).toEqual([0]);
        expect(await device.popErrorScope()).toBeNull();

        renderer.destroy();
    });

    it('should restore an antialiased canvas when a filter reopens it', async () =>
    {
        const renderer = (await getWebGPURenderer({ antialias: true })) as WebGPURenderer;
        const device = renderer.gpu.device;
        const stage = new Container();
        const filtered = new Graphics().rect(10, 10, 50, 50).fill('red');

        filtered.filters = [new AlphaFilter({ alpha: 0.5 })];
        stage.addChild(new Graphics().rect(0, 0, 100, 100).fill('blue'), filtered);

        device.pushErrorScope('validation');

        renderer.render(stage);

        // the filter's pop-back reopened the canvas, so its colour was restored
        expect(renderer.renderTarget.getGpuRenderTarget(renderer.renderTarget.rootRenderTarget).msaaRestore)
            .toEqual([0]);
        expect(await device.popErrorScope()).toBeNull();

        renderer.destroy();
    });

    it('should discard the canvas msaa depth/stencil only when the renderer is created transient', async () =>
    {
        for (const transient of [false, true])
        {
            const renderer = (await getWebGPURenderer({ antialias: true, depth: true, transient })) as WebGPURenderer;

            renderer.render(new Graphics().rect(0, 0, 50, 50).fill('red'));

            const root = renderer.renderTarget.getGpuRenderTarget(renderer.renderTarget.rootRenderTarget);

            expect(renderer.view.texture.source.transient).toBe(transient);
            expect(root.descriptor.depthStencilAttachment.depthStoreOp).toBe(transient ? 'discard' : 'store');

            renderer.destroy();
        }
    });

    it('should store and load msaa colour on a GPU that is not tile-based', async () =>
    {
        const renderer = (await getWebGPURenderer()) as WebGPURenderer;
        const device = renderer.gpu.device;

        // as on Intel/NVIDIA/AMD, where loading MSAA from video memory beats restoring it
        renderer.device.extensions.tileBased = false;

        const target = makeMsaaTarget();
        const other = makeMsaaTarget();

        device.pushErrorScope('validation');
        renderer.encoder.renderStart();

        renderer.renderTarget.bind({ target, clear: true });

        const gpuRenderTarget = renderer.renderTarget.getGpuRenderTarget(target);

        expect(gpuRenderTarget.msaaTextures[0].transient).toBe(false);
        expect(gpuRenderTarget.descriptor.colorAttachments[0].storeOp).toBe('store');

        renderer.renderTarget.bind({ target: other, clear: true });
        renderer.renderTarget.bind({ target, clear: false });

        expect(gpuRenderTarget.descriptor.colorAttachments[0].loadOp).toBe('load');
        expect(gpuRenderTarget.msaaRestore).toEqual([]);

        renderer.encoder.postrender();

        expect(await device.popErrorScope()).toBeNull();

        renderer.destroy();
    });

    it('should discard and restore msaa colour on a GPU that is not tile-based when marked transient', async () =>
    {
        const renderer = (await getWebGPURenderer()) as WebGPURenderer;

        renderer.device.extensions.tileBased = false;

        const target = makeMsaaTarget({ transient: true });
        const other = makeMsaaTarget();

        renderer.encoder.renderStart();

        renderer.renderTarget.bind({ target, clear: true });
        renderer.renderTarget.bind({ target: other, clear: true });
        renderer.renderTarget.bind({ target, clear: false });

        const gpuRenderTarget = renderer.renderTarget.getGpuRenderTarget(target);

        expect(gpuRenderTarget.descriptor.colorAttachments[0].storeOp).toBe('discard');
        expect(gpuRenderTarget.msaaRestore).toEqual([0]);

        renderer.encoder.postrender();
        renderer.destroy();
    });
});
