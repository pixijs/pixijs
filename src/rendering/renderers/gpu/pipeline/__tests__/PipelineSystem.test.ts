import { RenderTarget } from '../../../shared/renderTarget/RenderTarget';
import { TextureSource } from '../../../shared/texture/sources/TextureSource';
import { describeLocalOnly, getWebGPURenderer } from '@test-utils';

import type { TEXTURE_FORMATS } from '../../../shared/texture/const';
import type { WebGPURenderer } from '../../WebGPURenderer';

let renderer: WebGPURenderer;

afterEach(() =>
{
    renderer?.destroy();
    renderer = null;
});

describeLocalOnly('PipelineSystem color format cache', () =>
{
    it('switches to a separate pipeline cache bucket when the color format changes', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const rgba8Target = new RenderTarget({
            colorTextures: [new TextureSource({ width: 16, height: 16, format: 'rgba8unorm' })],
        });
        const bgra8Target = new RenderTarget({
            colorTextures: [new TextureSource({ width: 16, height: 16, format: 'bgra8unorm' })],
        });

        const pipeline = renderer.pipeline as unknown as {
            setRenderTarget(rt: RenderTarget): void;
            _pipeCache: Record<number, unknown>;
            _pipeStateCaches: Record<number, Record<number, unknown>>;
        };

        pipeline.setRenderTarget(rgba8Target);
        const rgba8Cache = pipeline._pipeCache;

        pipeline.setRenderTarget(bgra8Target);
        const bgra8Cache = pipeline._pipeCache;

        // Different formats must resolve to different cache sub-objects so identical
        // geometry/program/state still gets a distinct GPURenderPipeline per format.
        expect(rgba8Cache).not.toBe(bgra8Cache);

        // Switching back to the first format should reuse the original sub-object.
        pipeline.setRenderTarget(rgba8Target);
        expect(pipeline._pipeCache).toBe(rgba8Cache);
    });
});

describeLocalOnly('PipelineSystem depth-stencil format cache', () =>
{
    it('switches to a separate pipeline cache bucket when a depth-stencil attachment is present', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        // Identical color format on both targets so the depth-stencil attachment is the
        // only thing that differs between them.
        const colorOnlyTarget = new RenderTarget({
            colorTextures: [new TextureSource({ width: 16, height: 16, format: 'bgra8unorm' })],
        });
        const depthTarget = new RenderTarget({
            colorTextures: [new TextureSource({ width: 16, height: 16, format: 'bgra8unorm' })],
            stencil: true,
        });

        // in the real flow GpuRenderTargetAdaptor.startRenderPass materialises the internal
        // depth-stencil texture before calling setRenderTarget — mirror that precondition here
        depthTarget.ensureDepthStencilTexture();

        const pipeline = renderer.pipeline as unknown as {
            setRenderTarget(rt: RenderTarget): void;
            _pipeCache: Record<number, unknown>;
            _pipeStateCaches: Record<number, Record<number, unknown>>;
        };

        pipeline.setRenderTarget(colorOnlyTarget);
        const colorOnlyCache = pipeline._pipeCache;

        pipeline.setRenderTarget(depthTarget);
        const depthCache = pipeline._pipeCache;

        // A depth-less target and a depth24plus-stencil8 target must resolve to different
        // cache sub-objects. If they share one, a pipeline built without a depthStencil
        // block gets handed to a pass that has a depth attachment (or vice versa), which
        // WebGPU rejects at setPipeline time as an incompatible attachment state.
        expect(colorOnlyCache).not.toBe(depthCache);

        // Switching back to the depth-less target should reuse the original sub-object.
        pipeline.setRenderTarget(colorOnlyTarget);
        expect(pipeline._pipeCache).toBe(colorOnlyCache);
    });
});

describeLocalOnly('PipelineSystem depth-read-only cache', () =>
{
    it('switches to a separate pipeline cache bucket when the depth attachment is read-only', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        // Identical color + depth-stencil formats on both targets so the only thing that
        // differs is whether the depth attachment is bound read-only.
        const depthSource = () => new TextureSource({
            width: 16,
            height: 16,
            format: 'depth24plus-stencil8',
        });

        const writableTarget = new RenderTarget({
            colorTextures: [new TextureSource({ width: 16, height: 16, format: 'bgra8unorm' })],
            depthStencilTexture: depthSource(),
        });
        const readOnlyTarget = new RenderTarget({
            colorTextures: [new TextureSource({ width: 16, height: 16, format: 'bgra8unorm' })],
            depthStencilTexture: depthSource(),
        });

        readOnlyTarget.depthStencilAttachment.depthReadOnly = true;

        const pipeline = renderer.pipeline as unknown as {
            setRenderTarget(rt: RenderTarget): void;
            _pipeCache: Record<number, unknown>;
            _pipeStateCaches: Record<number, Record<number, unknown>>;
        };

        pipeline.setRenderTarget(writableTarget);
        const writableCache = pipeline._pipeCache;

        pipeline.setRenderTarget(readOnlyTarget);
        const readOnlyCache = pipeline._pipeCache;

        // A writable-depth pass bakes depthWriteEnabled from state.depthMask, while a
        // read-only-depth pass must force depthWriteEnabled false. They must therefore
        // resolve to different cache sub-objects; sharing one would hand a depth-writing
        // pipeline to a depthReadOnly pass, which WebGPU rejects and invalidates the
        // command buffer.
        expect(writableCache).not.toBe(readOnlyCache);

        // Switching back to the writable target should reuse the original sub-object.
        pipeline.setRenderTarget(writableTarget);
        expect(pipeline._pipeCache).toBe(writableCache);
    });
});

describeLocalOnly('PipelineSystem color target count cache', () =>
{
    it('must not alias a 4-attachment MRT target with a depth-only read-only target', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const depthFormat = 'depth24plus-stencil8';

        // colorTargetCount = 4, depthReadOnly = false
        const mrtTarget = new RenderTarget({
            colorTextures: [
                new TextureSource({ width: 16, height: 16, format: 'bgra8unorm' }),
                new TextureSource({ width: 16, height: 16, format: 'bgra8unorm' }),
                new TextureSource({ width: 16, height: 16, format: 'bgra8unorm' }),
                new TextureSource({ width: 16, height: 16, format: 'bgra8unorm' }),
            ],
            depthStencilTexture: new TextureSource({ width: 16, height: 16, format: depthFormat }),
        });

        // colorTargetCount = 0, depthReadOnly = true — with a 2-bit count field both targets
        // pack to the same key: (4 << 1) sets bit 3, which is the depthReadOnly bit
        const depthOnlyTarget = new RenderTarget({
            colorTextures: 0,
            depthStencilTexture: new TextureSource({ width: 16, height: 16, format: depthFormat }),
        });

        depthOnlyTarget.depthStencilAttachment.depthReadOnly = true;

        const pipeline = renderer.pipeline as unknown as {
            setRenderTarget(rt: RenderTarget): void;
            _pipeCache: Record<number, unknown>;
        };

        pipeline.setRenderTarget(mrtTarget);
        const mrtCache = pipeline._pipeCache;

        pipeline.setRenderTarget(depthOnlyTarget);
        const depthOnlyCache = pipeline._pipeCache;

        // sharing a bucket would hand one pass a GPURenderPipeline built for the
        // other's attachment layout -> WebGPU 'incompatible render pipeline' error
        expect(mrtCache).not.toBe(depthOnlyCache);
    });
});

describeLocalOnly('PipelineSystem bundle descriptor', () =>
{
    const colorTexture = () => new TextureSource({ width: 16, height: 16, format: 'bgra8unorm' });
    const depthStencilTarget = (format: TEXTURE_FORMATS) => new RenderTarget({
        colorTextures: [colorTexture()],
        depthStencilTexture: new TextureSource({ width: 16, height: 16, format }),
    });

    it('mirrors a read-only depth attachment onto the bundle descriptor', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const writableTarget = depthStencilTarget('depth24plus-stencil8');
        const readOnlyTarget = depthStencilTarget('depth24plus-stencil8');

        readOnlyTarget.depthStencilAttachment.depthReadOnly = true;

        renderer.pipeline.setRenderTarget(writableTarget);
        const writableDescriptor = renderer.pipeline.getBundleDescriptor();
        const writableKey = renderer.pipeline.bundleStateKey;

        expect(writableDescriptor.depthReadOnly).toBeFalsy();
        expect(writableDescriptor.stencilReadOnly).toBeFalsy();

        renderer.pipeline.setRenderTarget(readOnlyTarget);
        const readOnlyDescriptor = renderer.pipeline.getBundleDescriptor();

        // WebGPU rejects a bundle executed in a read-only pass unless the bundle promised the same,
        // so the descriptor has to carry the flag the pass will be built with
        expect(readOnlyDescriptor.depthReadOnly).toBe(true);
        // ...and the stencil aspect follows depth by default, exactly as the pass derives it
        expect(readOnlyDescriptor.stencilReadOnly).toBe(true);

        // the two are not interchangeable: their pipelines bake different depth writes
        expect(renderer.pipeline.bundleStateKey).not.toBe(writableKey);
    });

    it('keeps stencil writable when the target asks for a read-only depth aspect only', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const target = depthStencilTarget('depth24plus-stencil8');

        target.depthStencilAttachment.depthReadOnly = true;
        target.depthStencilAttachment.stencilReadOnly = false;

        renderer.pipeline.setRenderTarget(target);
        const descriptor = renderer.pipeline.getBundleDescriptor();

        expect(descriptor.depthReadOnly).toBe(true);
        expect(descriptor.stencilReadOnly).toBeFalsy();
    });

    it('tracks a read-only stencil aspect independently of depth', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const target = depthStencilTarget('depth24plus-stencil8');

        // the attachment lets stencil go read-only on its own, and GpuRenderTargetAdaptor builds
        // the pass that way — so a bundle that inherited the flag from depth instead would be
        // recorded without the promise, and every executeBundles into that pass would fail
        target.depthStencilAttachment.stencilReadOnly = true;

        renderer.pipeline.setRenderTarget(target);
        const descriptor = renderer.pipeline.getBundleDescriptor();

        expect(descriptor.stencilReadOnly).toBe(true);
        expect(descriptor.depthReadOnly).toBeFalsy();
    });

    it('never marks an aspect the format does not have as read-only', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const depthOnlyTarget = depthStencilTarget('depth24plus');

        depthOnlyTarget.depthStencilAttachment.depthReadOnly = true;

        renderer.pipeline.setRenderTarget(depthOnlyTarget);
        const depthOnlyDescriptor = renderer.pipeline.getBundleDescriptor();

        expect(depthOnlyDescriptor.depthStencilFormat).toBe('depth24plus');
        expect(depthOnlyDescriptor.depthReadOnly).toBe(true);
        // the stencil default follows depth, but this format has no stencil aspect to promise
        expect(depthOnlyDescriptor.stencilReadOnly).toBeFalsy();

        const colorOnlyTarget = new RenderTarget({ colorTextures: [colorTexture()] });

        renderer.pipeline.setRenderTarget(colorOnlyTarget);
        const colorOnlyDescriptor = renderer.pipeline.getBundleDescriptor();

        expect(colorOnlyDescriptor.depthStencilFormat).toBeUndefined();
        expect(colorOnlyDescriptor.depthReadOnly).toBeFalsy();
        expect(colorOnlyDescriptor.stencilReadOnly).toBeFalsy();
    });
});
