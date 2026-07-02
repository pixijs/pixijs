import { CLEAR } from '../gl/const';
import { RenderTarget } from '../shared/renderTarget/RenderTarget';
import { TextureSource } from '../shared/texture/sources/TextureSource';
import { Texture } from '../shared/texture/Texture';
import { describeLocalOnly, getWebGLRenderer, getWebGPURenderer } from '@test-utils';
import { AlphaFilter } from '~/filters/defaults/alpha/AlphaFilter';
import { Rectangle } from '~/maths/shapes/Rectangle';
import { Container } from '~/scene/container/Container';
import { Graphics } from '~/scene/graphics/shared/Graphics';

import type { WebGLRenderer } from '../gl/WebGLRenderer';
import type { WebGPURenderer } from '../gpu/WebGPURenderer';
import type { BindOptions } from '../shared/renderTarget/RenderTargetSystem';

function createTarget(options: Partial<ConstructorParameters<typeof TextureSource>[0]> = {})
{
    return new RenderTarget({
        colorTextures: [new TextureSource({ width: 64, height: 64, ...options })],
    });
}

/**
 * collects the bind-deprecation messages captured by the console spies
 * @param warnSpy - spy on console.warn
 * @param groupSpy - spy on console.groupCollapsed
 */
function findBindDeprecations(warnSpy: jest.SpyInstance, groupSpy: jest.SpyInstance): string[]
{
    const allCalls = warnSpy.mock.calls.concat(groupSpy.mock.calls);
    const found: string[] = [];

    for (const call of allCalls)
    {
        for (const arg of call)
        {
            if (typeof arg === 'string' && arg.includes('positional arguments'))
            {
                found.push(arg);
            }
        }
    }

    return found;
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

        renderer.renderTarget.bind({ target, clear: false });
        renderer.renderTarget.bind({ target, clear: false });

        // one real begin, but the viewport moves on every bind
        expect(beginSpy).toHaveBeenCalledTimes(1);
        expect(viewportSpy).toHaveBeenCalledTimes(2);
    });

    it('forces a real begin when a clear is requested', async () =>
    {
        renderer = await getWebGPURenderer() as WebGPURenderer;

        renderer.encoder.renderStart();

        const target = createTarget();

        renderer.renderTarget.bind({ target, clear: false });

        const beginSpy = jest.spyOn(renderer.encoder, 'beginRenderPass');

        renderer.renderTarget.bind({ target, clear: true });

        expect(beginSpy).toHaveBeenCalledTimes(1);
    });

    it('forces a real begin for a partial clear (cannot flip loadOp mid-pass)', async () =>
    {
        renderer = await getWebGPURenderer() as WebGPURenderer;

        renderer.encoder.renderStart();

        const target = createTarget();

        renderer.renderTarget.bind({ target, clear: false });

        const beginSpy = jest.spyOn(renderer.encoder, 'beginRenderPass');

        renderer.renderTarget.bind({ target, clear: CLEAR.DEPTH });

        expect(beginSpy).toHaveBeenCalledTimes(1);
    });

    it('forces a real begin when the mip level changes', async () =>
    {
        renderer = await getWebGPURenderer() as WebGPURenderer;

        renderer.encoder.renderStart();

        const target = createTarget({ mipLevelCount: 2 });

        renderer.renderTarget.bind({ target, clear: false, mipLevel: 0 });

        const beginSpy = jest.spyOn(renderer.encoder, 'beginRenderPass');

        renderer.renderTarget.bind({ target, clear: false, mipLevel: 1 });

        expect(beginSpy).toHaveBeenCalledTimes(1);
    });

    it('forces a real begin when the array layer changes', async () =>
    {
        renderer = await getWebGPURenderer() as WebGPURenderer;

        renderer.encoder.renderStart();

        const target = createTarget({ arrayLayerCount: 2 });

        renderer.renderTarget.bind({ target, clear: false, layer: 0 });

        const beginSpy = jest.spyOn(renderer.encoder, 'beginRenderPass');

        renderer.renderTarget.bind({ target, clear: false, layer: 1 });

        expect(beginSpy).toHaveBeenCalledTimes(1);
    });

    it('reopens the pass after it has been finished (copy case)', async () =>
    {
        renderer = await getWebGPURenderer() as WebGPURenderer;

        renderer.encoder.renderStart();

        const target = createTarget();

        renderer.renderTarget.bind({ target, clear: false });

        const beginSpy = jest.spyOn(renderer.encoder, 'beginRenderPass');

        renderer.renderTarget.finishRenderPass();
        renderer.renderTarget.bind({ target, clear: false });

        expect(beginSpy).toHaveBeenCalledTimes(1);
    });

    it('does not flush the encoder state cache on a reused bind', async () =>
    {
        renderer = await getWebGPURenderer() as WebGPURenderer;

        renderer.encoder.renderStart();

        const target = createTarget();

        // a real begin clears the cache, so prime it after the first (real) bind
        renderer.renderTarget.bind({ target, clear: false });

        const encoder = renderer.encoder as unknown as { _boundPipeline: unknown };
        const sentinel = {};

        encoder._boundPipeline = sentinel;

        // reused bind: cache must survive so the next draw doesn't re-set pipeline/bind groups
        renderer.renderTarget.bind({ target, clear: false });
        expect(encoder._boundPipeline).toBe(sentinel);

        // a real begin must flush the cache
        renderer.renderTarget.bind({ target, clear: true });
        expect(encoder._boundPipeline).toBeNull();
    });

    it('minimises begins across push(T); push(T); pop()', async () =>
    {
        renderer = await getWebGPURenderer() as WebGPURenderer;

        renderer.encoder.renderStart();

        const target = createTarget();

        // first push opens the pass with a clear (default CLEAR.ALL) -> real begin
        renderer.renderTarget.push({ target });

        const beginSpy = jest.spyOn(renderer.encoder, 'beginRenderPass');

        // pushing the same target again with a clear forces another begin...
        renderer.renderTarget.push({ target });
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
        renderer.renderTarget.bind({ target, clear: false });

        const bindFramebufferSpy = jest.spyOn(renderer.gl, 'bindFramebuffer');

        renderer.renderTarget.bind({ target, clear: false });

        expect(bindFramebufferSpy).not.toHaveBeenCalled();
    });

    it('binds the framebuffer when switching to a different target', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const targetA = createTarget();
        const targetB = createTarget();

        renderer.renderTarget.bind({ target: targetA, clear: false });

        const bindFramebufferSpy = jest.spyOn(renderer.gl, 'bindFramebuffer');

        renderer.renderTarget.bind({ target: targetB, clear: false });

        expect(bindFramebufferSpy).toHaveBeenCalled();
    });
});

describe('RenderTargetSystem flipY orientation toggle (WebGL)', () =>
{
    it('is a no-op by default / when false, and toggles the projection only when true', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const target = createTarget();
        const { renderTarget } = renderer;

        // default (toggle off): a texture target flips as it always has -> positive Y scale (matrix.d)
        renderTarget.bind({ target });
        expect(target.flipY).toBeUndefined();
        expect(renderTarget.projectionMatrix.d).toBeGreaterThan(0);

        // flipY:false is inert -> identical to the default
        renderTarget.bind({ target, clear: true, flipY: false });
        expect(target.flipY).toBe(false);
        expect(renderTarget.projectionMatrix.d).toBeGreaterThan(0);

        // flipY:true inverts the orientation -> screen-oriented -> negative Y scale
        renderTarget.bind({ target, clear: true, flipY: true });
        expect(target.flipY).toBe(true);
        expect(renderTarget.projectionMatrix.d).toBeLessThan(0);

        // omitting flipY again resets the (pooled) target back to the default
        renderTarget.bind({ target });
        expect(target.flipY).toBeUndefined();
        expect(renderTarget.projectionMatrix.d).toBeGreaterThan(0);
    });

    it('inverts the WebGL front face only when flipY is true (welded to the projection flip)', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const { renderTarget } = renderer;
        const state = (renderer as WebGLRenderer).state as unknown as { _invertFrontFace: boolean };
        const a = createTarget();
        const b = createTarget();

        // default texture: inverted as it always has been (welded to its automatic flip)
        renderTarget.bind({ target: a });
        expect(state._invertFrontFace).toBe(true);

        // flipY:false is inert -> still inverted (switch target to force the change to re-emit)
        renderTarget.bind({ target: b, clear: true, flipY: false });
        expect(state._invertFrontFace).toBe(true);

        // flipY:true toggles the winding the other way, in lockstep with the projection
        renderTarget.bind({ target: a, clear: true, flipY: true });
        expect(state._invertFrontFace).toBe(false);
    });

    it('exposes frontFaceInverted matching the baked winding inversion (welded to flipY and isRoot)', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const { renderTarget } = renderer;
        const state = (renderer as WebGLRenderer).state as unknown as { _invertFrontFace: boolean };
        const a = createTarget();
        const b = createTarget();

        // non-root texture, default: WebGL's inherent flip inverts the winding
        renderTarget.bind({ target: a });
        expect(renderTarget.frontFaceInverted).toBe(true);
        expect(renderTarget.frontFaceInverted).toBe(state._invertFrontFace);

        // flipY:false is inert -> still inverted (switch target to force the change to re-emit)
        renderTarget.bind({ target: b, clear: true, flipY: false });
        expect(renderTarget.frontFaceInverted).toBe(true);
        expect(renderTarget.frontFaceInverted).toBe(state._invertFrontFace);

        // flipY:true cancels the inherent flip -> not inverted
        renderTarget.bind({ target: a, clear: true, flipY: true });
        expect(renderTarget.frontFaceInverted).toBe(false);
        expect(renderTarget.frontFaceInverted).toBe(state._invertFrontFace);
    });

    it('restores flipY when popping back to a target pushed with flipY:true', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const { renderTarget } = renderer;
        const state = (renderer as WebGLRenderer).state as unknown as { _invertFrontFace: boolean };
        const outer = createTarget();
        const inner = createTarget();

        // capture into `outer` toggled to screen orientation (the ContainerSource case): flipY:true
        renderTarget.push({ target: outer, clear: true, flipY: true });
        expect(outer.flipY).toBe(true);
        expect(renderTarget.projectionMatrix.d).toBeLessThan(0);
        expect(state._invertFrontFace).toBe(false);

        // a nested render group / mask pushes its own target with the default orientation
        renderTarget.push({ target: inner });
        expect(renderTarget.projectionMatrix.d).toBeGreaterThan(0);
        expect(state._invertFrontFace).toBe(true);

        // popping back must restore flipY:true, not leave `outer` reset to the default
        renderTarget.pop();
        expect(renderTarget.renderTarget).toBe(outer);
        expect(outer.flipY).toBe(true);
        expect(renderTarget.projectionMatrix.d).toBeLessThan(0);
        expect(state._invertFrontFace).toBe(false);
    });
});

describeLocalOnly('RenderTargetSystem flipY orientation toggle (WebGPU)', () =>
{
    it('bakes an inverted front face into the pipeline only when flipY is true', async () =>
    {
        renderer = await getWebGPURenderer() as WebGPURenderer;

        const target = createTarget();
        const graphics = new Graphics().rect(0, 0, 32, 32).fill(0xff0000);

        const spy = jest.spyOn((renderer as WebGPURenderer).gpu.device, 'createRenderPipeline');

        // default render: nothing inverts -> every pipeline keeps WebGPU's natural ccw winding
        renderer.render({ container: graphics, target, clear: true });
        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls.every(([d]) => d.primitive?.frontFace !== 'cw')).toBe(true);

        spy.mockClear();

        // flipY:true render: the winding inverts, so a distinct pipeline is baked with frontFace 'cw'
        renderer.render({ container: graphics, target, clear: true, flipY: true });
        expect(spy.mock.calls.some(([d]) => d.primitive?.frontFace === 'cw')).toBe(true);
    });

    it('exposes frontFaceInverted as the raw flipY (WebGPU has no inherent Y-flip)', async () =>
    {
        renderer = await getWebGPURenderer() as WebGPURenderer;

        renderer.encoder.renderStart();

        const { renderTarget } = renderer;
        const target = createTarget();

        // no inherent flip on WebGPU: isRoot never enters the equation, so it tracks flipY directly
        renderTarget.bind({ target, clear: true, flipY: false });
        expect(renderTarget.frontFaceInverted).toBe(false);

        renderTarget.bind({ target, clear: true, flipY: true });
        expect(renderTarget.frontFaceInverted).toBe(true);
    });
});

describe('RenderTargetSystem object-form bind', () =>
{
    it('deprecates the positional form: warns once and matches the object form exactly', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const { renderTarget } = renderer;
        const target = createTarget();
        const other = createTarget();
        const frame = new Rectangle(4, 8, 16, 12);

        const startSpy = jest.spyOn(renderTarget.adaptor, 'startRenderPass');

        // reference run: object form
        const boundObject = renderTarget.bind({ target, clear: CLEAR.COLOR, frame, flipY: true });
        const objectArgs = startSpy.mock.calls.at(-1);
        const objectViewport = renderTarget.viewport.clone();
        const objectProjection = renderTarget.projectionMatrix.clone();

        // move away so replaying the same bind is a real rebind, not a reuse
        renderTarget.bind({ target: other });

        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        const groupSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation(() => undefined);
        const deprecationCount = () => findBindDeprecations(warnSpy, groupSpy).length;

        // the same bind through the deprecated positional form
        const boundPositional = renderTarget.bind(target, CLEAR.COLOR, undefined, frame, 0, 0, true);

        expect(deprecationCount()).toBe(1);
        expect(boundPositional).toBe(boundObject);
        expect(renderTarget.viewport).toEqual(objectViewport);
        expect(renderTarget.projectionMatrix).toEqual(objectProjection);

        // startRenderPass(renderTarget, clear, clearColor, viewport, mipLevel, layer) receives
        // identical arguments from both forms (the shared viewport rect is compared above)
        const positionalArgs = startSpy.mock.calls.at(-1);

        expect(positionalArgs[0]).toBe(objectArgs[0]);
        expect(positionalArgs[1]).toBe(objectArgs[1]);
        expect(positionalArgs[2]).toBe(objectArgs[2]);
        expect(positionalArgs[4]).toBe(objectArgs[4]);
        expect(positionalArgs[5]).toBe(objectArgs[5]);

        // the deprecation only fires once per process
        renderTarget.bind(target, CLEAR.COLOR, undefined, frame, 0, 0, true);
        expect(deprecationCount()).toBe(1);

        // positional push carries its own (distinct) deprecation, also once per process
        renderTarget.push(target, CLEAR.COLOR);
        expect(deprecationCount()).toBe(2);
        renderTarget.push(target, CLEAR.COLOR);
        expect(deprecationCount()).toBe(2);

        warnSpy.mockRestore();
        groupSpy.mockRestore();
    });

    it('defaults clear to true when omitted (parity with the positional default)', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const { renderTarget } = renderer;
        const target = createTarget();

        const startSpy = jest.spyOn(renderTarget.adaptor, 'startRenderPass');

        renderTarget.bind({ target });

        expect(startSpy.mock.calls.at(-1)[1]).toBe(true);
    });

    it('applies the Texture frame fallback when no frame is given', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const { renderTarget } = renderer;
        const texture = new Texture({
            source: new TextureSource({ width: 64, height: 64 }),
            frame: new Rectangle(0, 0, 20, 10),
        });

        renderTarget.bind({ target: texture, clear: true });

        expect(renderTarget.viewport.width).toBe(20);
        expect(renderTarget.viewport.height).toBe(10);
    });
});

describe('RenderTargetSystem push/pop replay', () =>
{
    it('re-applies a pushed Texture frame fallback when popping back to it', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const { renderTarget } = renderer;
        const texture = new Texture({
            source: new TextureSource({ width: 64, height: 64 }),
            frame: new Rectangle(0, 0, 20, 10),
        });
        const inner = createTarget();

        // pushed without an explicit frame: the texture's own frame defines the viewport
        renderTarget.push({ target: texture, clear: true });
        expect(renderTarget.viewport.width).toBe(20);

        renderTarget.push({ target: inner, clear: true });
        expect(renderTarget.viewport.width).toBe(64);

        // popping back must restore the texture's frame viewport, not the full 64x64 source
        renderTarget.pop();
        expect(renderTarget.renderTarget).toBe(renderTarget.getRenderTarget(texture));
        expect(renderTarget.viewport.width).toBe(20);
        expect(renderTarget.viewport.height).toBe(10);
    });

    it('snapshots the pushed frame so caller rect reuse cannot leak into pop', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const { renderTarget } = renderer;
        const outer = createTarget();
        const inner = createTarget();
        const frame = new Rectangle(0, 0, 16, 8);

        renderTarget.push({ target: outer, clear: true, frame });
        expect(renderTarget.viewport.width).toBe(16);

        // the caller reuses its rect (the per-frame pattern) while `outer` is still on the stack
        frame.width = 32;
        frame.height = 32;

        renderTarget.push({ target: inner, clear: true });
        renderTarget.pop();

        expect(renderTarget.viewport.width).toBe(16);
        expect(renderTarget.viewport.height).toBe(8);
    });

    it('throws on an unbalanced pop', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const { renderTarget } = renderer;

        renderTarget.push({ target: createTarget() });

        // popping the only entry leaves nothing to restore
        expect(() => renderTarget.pop()).toThrow(/unbalanced pop/);
    });

    it('never hits the deprecated positional path from internal engine code', async () =>
    {
        renderer = await getWebGLRenderer({ width: 64, height: 64, useBackBuffer: true }) as WebGLRenderer;

        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        const groupSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation(() => undefined);

        const scene = new Container();
        const filtered = new Graphics().rect(0, 0, 32, 32).fill(0xff0000);

        filtered.filters = [new AlphaFilter()];

        const cached = new Container();

        cached.addChild(new Graphics().rect(0, 0, 16, 16).fill(0x00ff00));
        cached.cacheAsTexture(true);
        scene.addChild(filtered, cached);

        // exercises renderStart->push, FilterSystem binds, RenderGroupPipe push/pop and the
        // back-buffer present bind
        renderer.render({ container: scene });

        const deprecations = findBindDeprecations(warnSpy, groupSpy);

        warnSpy.mockRestore();
        groupSpy.mockRestore();

        expect(deprecations).toEqual([]);
    });
});

describe('RenderTargetSystem getBindState', () =>
{
    it('round-trips: bind(getBindState()) exactly reproduces the captured binding', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const { renderTarget } = renderer;
        const target = createTarget();
        const other = createTarget();
        const frame = new Rectangle(4, 8, 16, 12);

        const bound = renderTarget.bind({ target, clear: true, frame, flipY: true });
        const viewport = renderTarget.viewport.clone();
        const projection = renderTarget.projectionMatrix.clone();
        const inverted = renderTarget.frontFaceInverted;

        const saved = renderTarget.getBindState();

        expect(saved.target).toBe(target);
        expect(saved.clear).toBe(CLEAR.NONE);
        expect(saved.flipY).toBe(true);
        expect(saved.frame).not.toBe(frame);
        expect(saved.frame).toEqual(frame);

        // move away: different target, default orientation
        renderTarget.bind({ target: other, clear: true });
        expect(renderTarget.renderTarget).not.toBe(bound);

        renderTarget.bind(saved);

        expect(renderTarget.renderTarget).toBe(bound);
        expect(renderTarget.renderSurface).toBe(target);
        expect(renderTarget.viewport).toEqual(viewport);
        expect(renderTarget.projectionMatrix).toEqual(projection);
        expect(renderTarget.mipLevel).toBe(0);
        expect(renderTarget.layer).toBe(0);
        expect(renderTarget.frontFaceInverted).toBe(inverted);
    });

    it('restores without clearing (the captured clear is NONE, passed through to the adaptor)', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const { renderTarget } = renderer;
        const target = createTarget();
        const other = createTarget();

        renderTarget.bind({ target, clear: true });

        const saved = renderTarget.getBindState();

        renderTarget.bind({ target: other, clear: true });

        const startSpy = jest.spyOn(renderTarget.adaptor, 'startRenderPass');

        renderTarget.bind(saved);

        expect(startSpy.mock.calls.at(-1)[1]).toBe(CLEAR.NONE);
    });

    it('deep-copies the frame: captures are independent of the caller, each other, and later binds', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const { renderTarget } = renderer;
        const target = createTarget();
        const frame = new Rectangle(0, 0, 16, 8);

        renderTarget.bind({ target, clear: true, frame });

        const savedA = renderTarget.getBindState();
        const savedB = renderTarget.getBindState();

        expect(savedA.frame).not.toBe(frame);
        expect(savedA.frame).not.toBe(savedB.frame);

        // mutating one capture affects neither the other capture nor the live binding
        savedA.frame.width = 1;
        renderTarget.bind(savedB);
        expect(renderTarget.viewport.width).toBe(16);

        // a later bind with a different frame cannot reach into an existing capture
        renderTarget.bind({ target, clear: false, frame: new Rectangle(0, 0, 2, 2) });
        expect(savedB.frame.width).toBe(16);
    });

    it('fills and returns the provided out object, overwriting every stale field', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const { renderTarget } = renderer;
        const target = createTarget();

        renderTarget.bind({ target, clear: true });

        // poison every field with stale values from a previous (imaginary) capture
        const out: BindOptions = {
            target: createTarget(),
            clear: true,
            clearColor: [1, 0, 0, 1],
            frame: new Rectangle(1, 2, 3, 4),
            mipLevel: 3,
            layer: 2,
            flipY: true,
        };

        const result = renderTarget.getBindState(out);

        expect(result).toBe(out);
        expect(out.target).toBe(target);
        expect(out.clear).toBe(CLEAR.NONE);
        expect(out.clearColor).toBeUndefined();
        expect(out.frame).toBeUndefined();
        expect(out.mipLevel).toBe(0);
        expect(out.layer).toBe(0);
        expect(out.flipY).toBe(false);
    });

    it('reuses the out frame rectangle across captures that carry frames', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const { renderTarget } = renderer;
        const target = createTarget();

        renderTarget.bind({ target, clear: true, frame: new Rectangle(0, 0, 8, 8) });

        const out = renderTarget.getBindState();
        const rect = out.frame;

        renderTarget.bind({ target, clear: false, frame: new Rectangle(0, 0, 24, 24) });
        renderTarget.getBindState(out);

        // the out object's rect is reused in place, not reallocated
        expect(out.frame).toBe(rect);
        expect(out.frame.width).toBe(24);
    });

    it('captures an omitted frame as undefined so restore re-derives the Texture fallback', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        const { renderTarget } = renderer;
        const texture = new Texture({
            source: new TextureSource({ width: 64, height: 64 }),
            frame: new Rectangle(0, 0, 20, 10),
        });
        const other = createTarget();

        renderTarget.bind({ target: texture, clear: true });

        const saved = renderTarget.getBindState();

        // the surface as passed (not the resolved render target), no baked frame
        expect(saved.target).toBe(texture);
        expect(saved.frame).toBeUndefined();

        renderTarget.bind({ target: other, clear: true });
        renderTarget.bind(saved);

        expect(renderTarget.viewport.width).toBe(20);
        expect(renderTarget.viewport.height).toBe(10);
    });

    it('throws when nothing is bound yet', async () =>
    {
        renderer = await getWebGLRenderer() as WebGLRenderer;

        expect(() => renderer.renderTarget.getBindState())
            .toThrow(/only valid while a render surface is bound/);
    });
});

describeLocalOnly('RenderTargetSystem getBindState (WebGPU)', () =>
{
    it('round-trips mip level and array layer', async () =>
    {
        renderer = await getWebGPURenderer() as WebGPURenderer;

        renderer.encoder.renderStart();

        const { renderTarget } = renderer;
        const target = createTarget({ mipLevelCount: 2, arrayLayerCount: 2 });
        const other = createTarget();

        renderTarget.bind({ target, clear: true, mipLevel: 1, layer: 1 });

        const viewport = renderTarget.viewport.clone();
        const saved = renderTarget.getBindState();

        expect(saved.mipLevel).toBe(1);
        expect(saved.layer).toBe(1);

        renderTarget.bind({ target: other, clear: true });
        renderTarget.bind(saved);

        expect(renderTarget.mipLevel).toBe(1);
        expect(renderTarget.layer).toBe(1);
        expect(renderTarget.viewport).toEqual(viewport);
    });
});

describe('copyDepthTexture argument safety', () =>
{
    it('should not mutate the caller-supplied rect objects when clamping', async () =>
    {
        renderer = await getWebGLRenderer({ width: 64, height: 64 });

        const source = new RenderTarget({
            colorTextures: [new TextureSource({ width: 32, height: 32 })],
            depthStencilTexture: new TextureSource({ width: 32, height: 32, format: 'depth24plus-stencil8' }),
        });

        const destination = new Texture({
            source: new TextureSource({ width: 32, height: 32, format: 'depth24plus-stencil8' }),
        });

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
