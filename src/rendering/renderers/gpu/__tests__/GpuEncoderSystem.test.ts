import { RenderTarget } from '../../shared/renderTarget/RenderTarget';
import { TextureSource } from '../../shared/texture/sources/TextureSource';
import { RenderBundle } from '../RenderBundle';
import { describeLocalOnly, getWebGPURenderer } from '@test-utils';

import type { TEXTURE_FORMATS } from '../../shared/texture/const';
import type { WebGPURenderer } from '../WebGPURenderer';

let renderer: WebGPURenderer;

afterEach(() =>
{
    renderer?.destroy();
    renderer = null;
});

function colorTarget(options: { format?: TEXTURE_FORMATS, antialias?: boolean } = {}): RenderTarget
{
    return new RenderTarget({
        colorTextures: [new TextureSource({
            width: 16,
            height: 16,
            format: options.format ?? 'bgra8unorm',
            antialias: options.antialias ?? false,
        })],
    });
}

// records an empty bundle against `target` — the commands inside it are irrelevant here, what is
// being tested is the state stamped onto it as it is recorded
function record(target: RenderTarget, label?: string): RenderBundle
{
    renderer.pipeline.setRenderTarget(target);
    renderer.encoder.beginBundle(label);

    return renderer.encoder.endBundle();
}

describeLocalOnly('GpuEncoderSystem render bundles', () =>
{
    it('wraps the recorded bundle together with the state it baked', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const target = colorTarget();
        const bundle = record(target, 'stamped-bundle');

        expect(bundle).toBeInstanceOf(RenderBundle);
        expect(bundle.gpuBundle).toBeDefined();
        expect(bundle.label).toBe('stamped-bundle');

        // re-recording against the same target has to land on the same stamp, otherwise a cached
        // bundle could never be reused across frames
        const second = record(target);

        expect(second.stateKey).toBe(bundle.stateKey);
        expect(second.label).toBeUndefined();
    });

    it('reports a bundle recorded against the currently bound target as valid', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const bundle = record(colorTarget());

        expect(renderer.encoder.isBundleValid(bundle)).toBe(true);
    });

    it('reports a bundle that has not been recorded yet as invalid', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        renderer.pipeline.setRenderTarget(colorTarget());

        // the first-frame shape of a consumer's cache: nothing recorded, so nothing to replay
        const bundles: RenderBundle[] = [];

        expect(renderer.encoder.isBundleValid(bundles[0])).toBe(false);
    });

    it('invalidates a bundle when the sample count changes', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        // the bug this stamp exists for: bundles recorded into a 1-sample filter texture, then
        // replayed against the 4-sample canvas once the filter was removed. WebGPU rejects the
        // whole command buffer at submit, so there is nothing the consumer can catch after the fact
        const bundle = record(colorTarget());

        renderer.pipeline.setRenderTarget(colorTarget({ antialias: true }));

        expect(renderer.encoder.isBundleValid(bundle)).toBe(false);
    });

    it('invalidates a bundle when the color format changes', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const bundle = record(colorTarget({ format: 'bgra8unorm' }));

        renderer.pipeline.setRenderTarget(colorTarget({ format: 'rgba8unorm' }));

        expect(renderer.encoder.isBundleValid(bundle)).toBe(false);
    });

    it('invalidates a bundle when a depth-stencil attachment appears', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const bundle = record(colorTarget());

        const depthTarget = new RenderTarget({
            colorTextures: [new TextureSource({ width: 16, height: 16, format: 'bgra8unorm' })],
            stencil: true,
        });

        // in the real flow GpuRenderTargetAdaptor.startRenderPass materialises the depth-stencil
        // texture before setRenderTarget sees it — mirror that precondition here
        depthTarget.ensureDepthStencilTexture();
        renderer.pipeline.setRenderTarget(depthTarget);

        expect(renderer.encoder.isBundleValid(bundle)).toBe(false);
    });

    it('invalidates a bundle when the target flipY parity changes', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const target = colorTarget();
        const bundle = record(target);

        // the attachments are untouched here, so WebGPU would happily replay this bundle — with
        // every pipeline inside it wound the wrong way round, and nothing said about it
        target.flipY = true;
        renderer.pipeline.setRenderTarget(target);

        expect(renderer.encoder.isBundleValid(bundle)).toBe(false);

        // ...and it becomes replayable again once the parity matches what it recorded
        target.flipY = false;
        renderer.pipeline.setRenderTarget(target);

        expect(renderer.encoder.isBundleValid(bundle)).toBe(true);
    });

    it('executes a run of bundles in a single call', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const target = colorTarget();
        const first = record(target, 'first');
        const second = record(target, 'second');

        // executeBundle needs a live pass to write into; the real one is covered by the
        // render-bundle visual scene, so stand in for it here to watch what it is handed
        const executeBundles = jest.fn();

        (renderer.encoder as unknown as { _passEncoder: unknown })._passEncoder = { executeBundles };

        renderer.encoder.executeBundle([first, second]);

        // one call for the whole run, not one per bundle — the pass state is reset per call, so
        // splitting them up would cost a cache clear and a binding round trip each for no effect
        expect(executeBundles).toHaveBeenCalledTimes(1);
        expect(executeBundles).toHaveBeenCalledWith([first.gpuBundle, second.gpuBundle]);

        executeBundles.mockClear();

        // a lone bundle takes the same path, wrapped for WebGPU's sequence argument
        renderer.encoder.executeBundle(first);

        expect(executeBundles).toHaveBeenCalledWith([first.gpuBundle]);
    });

    it('invalidates a bundle when the depth attachment becomes read-only', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const depthTexture = () => new TextureSource({ width: 16, height: 16, format: 'depth24plus-stencil8' });
        const writableTarget = new RenderTarget({
            colorTextures: [new TextureSource({ width: 16, height: 16, format: 'bgra8unorm' })],
            depthStencilTexture: depthTexture(),
        });
        const readOnlyTarget = new RenderTarget({
            colorTextures: [new TextureSource({ width: 16, height: 16, format: 'bgra8unorm' })],
            depthStencilTexture: depthTexture(),
        });

        readOnlyTarget.depthStencilAttachment.depthReadOnly = true;

        const bundle = record(writableTarget);

        // a read-only pass rejects any bundle that did not promise to leave depth alone
        renderer.pipeline.setRenderTarget(readOnlyTarget);

        expect(renderer.encoder.isBundleValid(bundle)).toBe(false);
    });
});
