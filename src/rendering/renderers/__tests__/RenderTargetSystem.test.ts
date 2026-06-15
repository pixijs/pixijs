import { CLEAR } from '../gl/const';
import { RenderTarget } from '../shared/renderTarget/RenderTarget';
import { TextureSource } from '../shared/texture/sources/TextureSource';
import { describeLocalOnly, getWebGLRenderer, getWebGPURenderer } from '@test-utils';

import type { WebGLRenderer } from '../gl/WebGLRenderer';
import type { WebGPURenderer } from '../gpu/WebGPURenderer';

function createTarget(options: Partial<ConstructorParameters<typeof TextureSource>[0]> = {})
{
    return new RenderTarget({
        colorTextures: [new TextureSource({ width: 64, height: 64, ...options })],
    });
}

let renderer: WebGLRenderer | WebGPURenderer;

afterEach(() =>
{
    renderer?.destroy();
    renderer = null;
});

describe('RenderTargetSystem', () =>
{
    it('should return a render target for canvas elements', async () =>
    {
        renderer = await getWebGLRenderer({}) as WebGLRenderer;
        const canvas = document.createElement('canvas');

        const target = renderer.renderTarget.getRenderTarget(canvas);

        expect(target).toBeInstanceOf(RenderTarget);
    });
});

describeLocalOnly('RenderTargetSystem idempotent bind (WebGPU)', () =>
{
    it('reuses the open pass when binding the same target with no clear', async () =>
    {
        renderer = await getWebGPURenderer() as WebGPURenderer;

        renderer.encoder.renderStart();

        const target = createTarget();

        const beginSpy = jest.spyOn(renderer.encoder, 'beginRenderPass');
        const viewportSpy = jest.spyOn(renderer.encoder, 'setViewport');

        renderer.renderTarget.bind(target, false);
        renderer.renderTarget.bind(target, false);

        // one real begin, but the viewport moves on every bind
        expect(beginSpy).toHaveBeenCalledTimes(1);
        expect(viewportSpy).toHaveBeenCalledTimes(2);
    });

    it('forces a real begin when a clear is requested', async () =>
    {
        renderer = await getWebGPURenderer() as WebGPURenderer;

        renderer.encoder.renderStart();

        const target = createTarget();

        renderer.renderTarget.bind(target, false);

        const beginSpy = jest.spyOn(renderer.encoder, 'beginRenderPass');

        renderer.renderTarget.bind(target, true);

        expect(beginSpy).toHaveBeenCalledTimes(1);
    });

    it('forces a real begin for a partial clear (cannot flip loadOp mid-pass)', async () =>
    {
        renderer = await getWebGPURenderer() as WebGPURenderer;

        renderer.encoder.renderStart();

        const target = createTarget();

        renderer.renderTarget.bind(target, false);

        const beginSpy = jest.spyOn(renderer.encoder, 'beginRenderPass');

        renderer.renderTarget.bind(target, CLEAR.DEPTH);

        expect(beginSpy).toHaveBeenCalledTimes(1);
    });

    it('forces a real begin when the mip level changes', async () =>
    {
        renderer = await getWebGPURenderer() as WebGPURenderer;

        renderer.encoder.renderStart();

        const target = createTarget({ mipLevelCount: 2 });

        renderer.renderTarget.bind(target, false, null, null, 0);

        const beginSpy = jest.spyOn(renderer.encoder, 'beginRenderPass');

        renderer.renderTarget.bind(target, false, null, null, 1);

        expect(beginSpy).toHaveBeenCalledTimes(1);
    });

    it('forces a real begin when the array layer changes', async () =>
    {
        renderer = await getWebGPURenderer() as WebGPURenderer;

        renderer.encoder.renderStart();

        const target = createTarget({ arrayLayerCount: 2 });

        renderer.renderTarget.bind(target, false, null, null, 0, 0);

        const beginSpy = jest.spyOn(renderer.encoder, 'beginRenderPass');

        renderer.renderTarget.bind(target, false, null, null, 0, 1);

        expect(beginSpy).toHaveBeenCalledTimes(1);
    });

    it('reopens the pass after it has been finished (copy case)', async () =>
    {
        renderer = await getWebGPURenderer() as WebGPURenderer;

        renderer.encoder.renderStart();

        const target = createTarget();

        renderer.renderTarget.bind(target, false);

        const beginSpy = jest.spyOn(renderer.encoder, 'beginRenderPass');

        renderer.renderTarget.finishRenderPass();
        renderer.renderTarget.bind(target, false);

        expect(beginSpy).toHaveBeenCalledTimes(1);
    });

    it('does not flush the encoder state cache on a reused bind', async () =>
    {
        renderer = await getWebGPURenderer() as WebGPURenderer;

        renderer.encoder.renderStart();

        const target = createTarget();

        // a real begin clears the cache, so prime it after the first (real) bind
        renderer.renderTarget.bind(target, false);

        const encoder = renderer.encoder as unknown as { _boundPipeline: unknown };
        const sentinel = {};

        encoder._boundPipeline = sentinel;

        // reused bind: cache must survive so the next draw doesn't re-set pipeline/bind groups
        renderer.renderTarget.bind(target, false);
        expect(encoder._boundPipeline).toBe(sentinel);

        // a real begin must flush the cache
        renderer.renderTarget.bind(target, true);
        expect(encoder._boundPipeline).toBeNull();
    });

    it('minimises begins across push(T); push(T); pop()', async () =>
    {
        renderer = await getWebGPURenderer() as WebGPURenderer;

        renderer.encoder.renderStart();

        const target = createTarget();

        // first push opens the pass with a clear (default CLEAR.ALL) -> real begin
        renderer.renderTarget.push(target);

        const beginSpy = jest.spyOn(renderer.encoder, 'beginRenderPass');

        // pushing the same target again with a clear forces another begin...
        renderer.renderTarget.push(target);
        // ...but popping back to it is a no-clear bind on the still-open pass -> reuse
        renderer.renderTarget.pop();

        expect(beginSpy).toHaveBeenCalledTimes(1);
        expect(renderer.renderTarget.renderTarget).toBe(target);
    });
});

describe('RenderTargetSystem idempotent bind (WebGL)', () =>
{
    it('skips a redundant glBindFramebuffer when re-binding the same target', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const target = createTarget();

        // prime: first bind initialises + binds the framebuffer
        renderer.renderTarget.bind(target, false);

        const bindFramebufferSpy = jest.spyOn(renderer.gl, 'bindFramebuffer');

        renderer.renderTarget.bind(target, false);

        expect(bindFramebufferSpy).not.toHaveBeenCalled();
    });

    it('binds the framebuffer when switching to a different target', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const targetA = createTarget();
        const targetB = createTarget();

        renderer.renderTarget.bind(targetA, false);

        const bindFramebufferSpy = jest.spyOn(renderer.gl, 'bindFramebuffer');

        renderer.renderTarget.bind(targetB, false);

        expect(bindFramebufferSpy).toHaveBeenCalled();
    });
});

describe('copyDepthTexture argument safety', () =>
{
    it('should not mutate the caller-supplied rect objects when clamping', async () =>
    {
        renderer = await getWebGLRenderer({ width: 64, height: 64 });

        const makeTarget = () => new RenderTarget({
            colorTextures: [new TextureSource({ width: 32, height: 32 })],
            depthStencilTexture: new TextureSource({ width: 32, height: 32, format: 'depth24plus-stencil8' }),
        });

        const source = makeTarget();
        const destination = makeTarget();

        // the per-frame reuse pattern: one rect object, used every call —
        // negative origin and oversized extent both force clamping
        const originSrc = { x: -4, y: -4 };
        const size = { width: 64, height: 64 };
        const originDest = { x: 0, y: 0 };

        renderer.renderTarget.copyDepthTexture(source, destination, originSrc, size, originDest);

        expect(originSrc).toEqual({ x: -4, y: -4 });
        expect(size).toEqual({ width: 64, height: 64 });
        expect(originDest).toEqual({ x: 0, y: 0 });
    });
});
