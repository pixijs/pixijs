import { Buffer } from '../../shared/buffer/Buffer';
import { BufferResource } from '../../shared/buffer/BufferResource';
import { BufferUsage } from '../../shared/buffer/const';
import { RenderTarget } from '../../shared/renderTarget/RenderTarget';
import { Shader } from '../../shared/shader/Shader';
import { TextureSource } from '../../shared/texture/sources/TextureSource';
import { GpuEncoderSystem } from '../GpuEncoderSystem';
import { RenderBundle } from '../RenderBundle';
import { BindGroup } from '../shader/BindGroup';
import { describeLocalOnly, getWebGPURenderer } from '@test-utils';

import type { Geometry } from '../../shared/geometry/Geometry';
import type { TEXTURE_FORMATS } from '../../shared/texture/const';
import type { GpuProgram } from '../shader/GpuProgram';
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

// --- key-list caching for pixijs#12151 (no WebGPU device needed, so these run in CI) ---
// The `.bench/` scripts quantify the win; these tests pin the behaviour it depends on:
// the null-prototype buffer/group maps are enumerated exactly once per map, not per draw.

function stubRenderer(): { renderer: WebGPURenderer, getBufferNamesToBind: jest.Mock }
{
    const getBufferNamesToBind = jest.fn(() => ({}));

    const renderer = {
        pipeline: {
            getBufferNamesToBind,
            getPipeline: jest.fn(() => ({})),
        },
        buffer: { updateBuffer: (buffer: Buffer) => buffer },
        ubo: { updateUniformGroup: jest.fn() },
        gc: { now: 0 },
        tick: 0,
        bindGroup: { getBindGroup: jest.fn(() => ({})) },
    } as unknown as WebGPURenderer;

    return { renderer, getBufferNamesToBind };
}

describe('GpuEncoderSystem key-list caching', () =>
{
    it('enumerates a buffersToBind map exactly once across repeated draws', () =>
    {
        const { renderer, getBufferNamesToBind } = stubRenderer();
        const encoder = new GpuEncoderSystem(renderer);

        const setVertexBuffer = jest.fn();

        (encoder as unknown as { renderPassEncoder: unknown }).renderPassEncoder = { setVertexBuffer };

        // a null-prototype map with integer bind-location keys, shaped exactly like
        // PipelineSystem.getBufferNamesToBind produces and reuses per (geometry, program)
        let ownKeysCalls = 0;

        const buffersToBind = new Proxy(Object.create(null) as Record<string, string>, {
            ownKeys(target)
            {
                ownKeysCalls++;

                return Reflect.ownKeys(target);
            },
        });

        buffersToBind[0] = 'aPosition';
        buffersToBind[1] = 'aUV';

        getBufferNamesToBind.mockReturnValue(buffersToBind);

        const bufferA = {} as Buffer;
        const bufferB = {} as Buffer;
        const geometry = {
            attributes: { aPosition: { buffer: bufferA }, aUV: { buffer: bufferB } },
            indexBuffer: null,
        } as unknown as Geometry;
        const program = {} as GpuProgram;

        encoder.setGeometry(geometry, program);
        encoder.setGeometry(geometry, program);

        // the whole point of the fix: the cached key list, not the map, is iterated from
        // the second draw on — one enumeration total, not one per draw
        expect(ownKeysCalls).toBe(1);

        // bind locations still resolve, in order, to the right buffers
        expect(setVertexBuffer).toHaveBeenCalledWith(0, bufferA);
        expect(setVertexBuffer).toHaveBeenCalledWith(1, bufferB);
    });

    it('keeps a separate cache entry per buffersToBind map', () =>
    {
        const { renderer, getBufferNamesToBind } = stubRenderer();
        const encoder = new GpuEncoderSystem(renderer);

        const setVertexBuffer = jest.fn();

        (encoder as unknown as { renderPassEncoder: unknown }).renderPassEncoder = { setVertexBuffer };

        const makeMap = () =>
        {
            let ownKeysCalls = 0;

            const map = new Proxy(Object.create(null) as Record<string, string>, {
                ownKeys(target)
                {
                    ownKeysCalls++;

                    return Reflect.ownKeys(target);
                },
            });

            map[0] = 'aPosition';

            return { map, ownKeysCalls: () => ownKeysCalls };
        };

        const first = makeMap();
        const second = makeMap();

        getBufferNamesToBind
            .mockReturnValueOnce(first.map)
            .mockReturnValue(second.map);

        const buffer = {} as Buffer;
        const geometry = {
            attributes: { aPosition: { buffer } },
            indexBuffer: null,
        } as unknown as Geometry;
        const program = {} as GpuProgram;

        encoder.setGeometry(geometry, program);
        encoder.setGeometry(geometry, program); // cache hit on the first map
        encoder.setGeometry(geometry, program); // second map → its own fresh enumeration

        expect(first.ownKeysCalls()).toBe(1);
        expect(second.ownKeysCalls()).toBe(1);
        expect(setVertexBuffer).toHaveBeenCalledWith(0, buffer);
    });

    it('draws safely when a bound bind group has been destroyed (null resources)', () =>
    {
        const { renderer } = stubRenderer();
        const encoder = new GpuEncoderSystem(renderer);

        const setBindGroup = jest.fn();
        const draw = jest.fn();

        (encoder as unknown as { renderPassEncoder: unknown }).renderPassEncoder = {
            setPipeline: jest.fn(),
            setVertexBuffer: jest.fn(),
            setBindGroup,
            draw,
        };

        const buffer = new Buffer({
            data: new Float32Array(64),
            usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
        });
        const bufferResource = new BufferResource({ buffer, offset: 0, size: 128 });

        const bindGroup = new BindGroup({ 0: bufferResource });

        expect(bindGroup._key).toBeTruthy(); // warm the key so _keyValue survives destroy

        bindGroup.destroy();
        expect(bindGroup.resources).toBeNull();

        // build the shader through the groups overload: the destroyed bind group is passed
        // straight through, and the fake gpuProgram's layout drives which groups get synced
        const fakeGpuProgram = { layout: { 0: {} } } as unknown as GpuProgram;
        const shader = new Shader({ groups: { 0: bindGroup }, gpuProgram: fakeGpuProgram, groupMap: {} });

        const geometry = {
            attributes: {},
            indexBuffer: null,
            vertexCount: 3,
            instanceCount: 1,
        } as unknown as Geometry;

        // a stale _resourceKeys cache would index into the now-null resources map and throw here
        expect(() => encoder.draw({ geometry, shader })).not.toThrow();
        expect(draw).toHaveBeenCalled();
        expect(setBindGroup).toHaveBeenCalled();
    });
});
