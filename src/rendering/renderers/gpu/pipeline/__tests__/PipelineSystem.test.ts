import { Geometry } from '../../../shared/geometry/Geometry';
import { RenderTarget } from '../../../shared/renderTarget/RenderTarget';
import { Shader } from '../../../shared/shader/Shader';
import { TextureSource } from '../../../shared/texture/sources/TextureSource';
import { Texture } from '../../../shared/texture/Texture';
import { GpuProgram } from '../../shader/GpuProgram';
import { describeLocalOnly, getWebGPURenderer } from '@test-utils';
import { Mesh } from '~/scene/mesh/shared/Mesh';
import { Sprite } from '~/scene/sprite/Sprite';

import type { TEXTURE_FORMATS } from '../../../shared/texture/const';
import type { WebGPURenderer } from '../../WebGPURenderer';

let renderer: WebGPURenderer;

afterEach(() =>
{
    renderer?.destroy();
    renderer = null;
});

describeLocalOnly('PipelineSystem vertex buffers', () =>
{
    function createGeometryAndProgram(attribute: string, size: 2 | 4)
    {
        const position = size === 2 ? `vec4<f32>(${attribute}, 0.0, 1.0)` : attribute;
        const source = `
            @vertex fn mainVert(@location(0) ${attribute}: vec${size}<f32>) -> @builtin(position) vec4<f32>
            {
                return ${position};
            }
            @fragment fn mainFrag() -> @location(0) vec4<f32>
            {
                return vec4<f32>(1.0);
            }
        `;

        return {
            geometry: new Geometry({
                attributes: { [attribute]: { buffer: new Float32Array(size), format: `float32x${size}` } },
            }),
            program: new GpuProgram({
                vertex: { source, entryPoint: 'mainVert' },
                fragment: { source, entryPoint: 'mainFrag' },
            }),
        };
    }

    it('binds the buffers of each geometry when neither was drawn before', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        // the batchers bind their geometry before they create a pipeline for it
        const first = createGeometryAndProgram('aFirst', 2);
        const second = createGeometryAndProgram('aSecond', 4);

        expect(renderer.pipeline.getBufferNamesToBind(first.geometry, first.program)).toEqual(['aFirst']);
        expect(renderer.pipeline.getBufferNamesToBind(second.geometry, second.program)).toEqual(['aSecond']);
    });
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

        // four color attachments, depthReadOnly = false
        const mrtTarget = new RenderTarget({
            colorTextures: [
                new TextureSource({ width: 16, height: 16, format: 'bgra8unorm' }),
                new TextureSource({ width: 16, height: 16, format: 'bgra8unorm' }),
                new TextureSource({ width: 16, height: 16, format: 'bgra8unorm' }),
                new TextureSource({ width: 16, height: 16, format: 'bgra8unorm' }),
            ],
            depthStencilTexture: new TextureSource({ width: 16, height: 16, format: depthFormat }),
        });

        // no color attachments, depthReadOnly = true. An older layout packed the attachment count into
        // a 2-bit field, where (4 << 1) set the depthReadOnly bit and the two targets shared a key
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

const quadVertex = /* wgsl */`
    @vertex
    fn main(@location(0) aPosition: vec2<f32>) -> @builtin(position) vec4<f32>
    {
        return vec4<f32>(aPosition, 0.0, 1.0);
    }
`;

function quad(fragmentSource: string): Mesh<Geometry, Shader>
{
    return new Mesh({
        geometry: new Geometry({ attributes: { aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1] } }),
        shader: Shader.from({
            gpu: {
                vertex: { entryPoint: 'main', source: quadVertex },
                fragment: { entryPoint: 'main', source: fragmentSource },
            },
        }),
    });
}

function halfToFloat(half: number): number
{
    const exponent = (half >> 10) & 0x1f;
    const mantissa = half & 0x3ff;
    const sign = half & 0x8000 ? -1 : 1;

    if (exponent === 0) return sign * (2 ** -14) * (mantissa / 1024);

    return sign * (2 ** (exponent - 15)) * (1 + (mantissa / 1024));
}

/**
 * Copies the centre texel out of a texture and returns its raw bytes
 * @param r - the renderer
 * @param source - the texture to read
 * @param bytesPerTexel - how many bytes one texel of its format takes
 */
async function readTexel(r: WebGPURenderer, source: TextureSource, bytesPerTexel: number): Promise<DataView>
{
    const device = r.gpu.device;
    const buffer = device.createBuffer({ size: 256, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
    const encoder = device.createCommandEncoder();

    encoder.copyTextureToBuffer(
        { texture: r.texture.getGpuSource(source), origin: { x: 8, y: 8 } },
        { buffer, bytesPerRow: 256 },
        { width: 1, height: 1 },
    );
    device.queue.submit([encoder.finish()]);

    await buffer.mapAsync(GPUMapMode.READ);

    const view = new DataView(buffer.getMappedRange().slice(0, bytesPerTexel));

    buffer.unmap();
    buffer.destroy();

    return view;
}

function source(format: TextureSource['format']): TextureSource
{
    return new TextureSource({ width: 16, height: 16, resolution: 1, format });
}

describeLocalOnly('PipelineSystem color attachments with different formats', () =>
{
    it('builds each target with its own format, writes only what the shader outputs, never blends integers', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const device = renderer.gpu.device;
        const color = source('rgba16float');
        const velocity = source('rg16float');
        const ids = source('r32uint');
        const target = new RenderTarget({ colorTextures: [color, velocity, ids] });

        // the opaque pass writes all three, without blending
        const opaque = quad(/* wgsl */`
            struct Outputs {
                @location(0) color: vec4<f32>,
                @location(1) velocity: vec2<f32>,
                @location(2) id: u32,
            };

            @fragment
            fn main() -> Outputs
            {
                var o: Outputs;
                o.color = vec4<f32>(0.25, 0.5, 0.75, 1.0);
                o.velocity = vec2<f32>(0.5, -0.25);
                o.id = 42u;
                return o;
            }
        `);

        opaque.state.blend = false;

        // a 2D sprite then blends half-transparent white over colour; its shader writes @location(0) only
        const sprite = new Sprite(Texture.WHITE);

        sprite.width = 16;
        sprite.height = 16;
        sprite.alpha = 0.5;

        device.pushErrorScope('validation');

        renderer.render({ target, container: opaque, clear: true, clearColor: [0, 0, 0, 0] });
        renderer.render({ target, container: sprite, clear: false });

        expect(await device.popErrorScope()).toBeNull();

        const colorTexel = await readTexel(renderer, color, 8);
        const velocityTexel = await readTexel(renderer, velocity, 4);
        const idTexel = await readTexel(renderer, ids, 4);

        // premultiplied white at 0.5 over (0.25, 0.5, 0.75, 1): src + dst * (1 - 0.5). The sprite's
        // alpha travels as 8 bits (127 / 255), hence two decimal places
        expect(halfToFloat(colorTexel.getUint16(0, true))).toBeCloseTo(0.625, 2);
        expect(halfToFloat(colorTexel.getUint16(2, true))).toBeCloseTo(0.75, 2);
        expect(halfToFloat(colorTexel.getUint16(4, true))).toBeCloseTo(0.875, 2);
        expect(halfToFloat(colorTexel.getUint16(6, true))).toBeCloseTo(1, 3);

        // the sprite left the other two alone
        expect(halfToFloat(velocityTexel.getUint16(0, true))).toBeCloseTo(0.5, 3);
        expect(halfToFloat(velocityTexel.getUint16(2, true))).toBeCloseTo(-0.25, 3);
        expect(idTexel.getUint32(0, true)).toBe(42);
    });

    it('gives a bundle the format of every attachment', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const target = new RenderTarget({
            colorTextures: [source('rgba16float'), source('rg16float'), source('r32uint')],
        });

        renderer.pipeline.setRenderTarget(target);

        expect(renderer.pipeline.getBundleDescriptor().colorFormats).toEqual(['rgba16float', 'rg16float', 'r32uint']);

        // a bundle recorded against one attachment can't be replayed into two of the same format
        renderer.pipeline.setRenderTarget(new RenderTarget({ colorTextures: [source('rgba8unorm')] }));
        const oneKey = renderer.pipeline.bundleStateKey;

        renderer.pipeline.setRenderTarget(new RenderTarget({ colorTextures: [source('rgba8unorm'), source('rgba8unorm')] }));
        expect(renderer.pipeline.bundleStateKey).not.toBe(oneKey);
    });

    it('gives each format list its own cache bucket, and one attachment its single-format bucket', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const pipeline = renderer.pipeline as unknown as {
            setRenderTarget(rt: RenderTarget): void;
            _pipeCache: unknown;
        };

        pipeline.setRenderTarget(new RenderTarget({ colorTextures: [source('rgba8unorm'), source('rgba16float')] }));
        const mixed = pipeline._pipeCache;

        pipeline.setRenderTarget(new RenderTarget({ colorTextures: [source('rgba8unorm'), source('rgba8unorm')] }));
        const uniform = pipeline._pipeCache;

        expect(mixed).not.toBe(uniform);

        // the key has no attachment-count field: the list's id carries the count
        pipeline.setRenderTarget(new RenderTarget({ colorTextures: [source('rgba8unorm')] }));
        expect(pipeline._pipeCache).not.toBe(uniform);

        // a one-element list joins to its bare format: the same bucket as before attachments had lists
        pipeline.setRenderTarget(new RenderTarget({ colorTextures: [source('rgba16float')] }));
        const single = pipeline._pipeCache;

        pipeline.setRenderTarget(new RenderTarget({ colorTextures: [source('rgba16float')] }));
        expect(pipeline._pipeCache).toBe(single);
    });

    it('keeps flipped and unflipped winding apart however many format lists have been seen', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const pipeline = renderer.pipeline as unknown as {
            setRenderTarget(rt: RenderTarget): void;
            _pipeCache: unknown;
        };

        // more than 16 distinct lists: with a 4-bit format field, id n + 16 spilled into the winding
        // bit, so a flipped target shared its bucket with an unflipped one
        const formats: TextureSource['format'][] = ['rgba8unorm', 'bgra8unorm', 'rgba16float', 'r8unorm', 'rg8unorm'];
        const caches = new Set<unknown>();
        let count = 0;

        for (const a of formats)
        {
            for (const b of formats)
            {
                const target = new RenderTarget({ colorTextures: [source(a), source(b), source(a)] });

                target.flipY = false;
                pipeline.setRenderTarget(target);
                caches.add(pipeline._pipeCache);

                target.flipY = true;
                pipeline.setRenderTarget(target);
                caches.add(pipeline._pipeCache);

                count += 2;
            }
        }

        expect(caches.size).toBe(count);
    });

    it('gives a shader with no color output a zero write mask on a single attachment too', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const device = renderer.gpu.device;
        const target = new RenderTarget({ colorTextures: [source('rgba8unorm')] });
        const depthOnly = quad(/* wgsl */`
            @fragment
            fn main()
            {
            }
        `);

        // a non-zero write mask on a target the shader doesn't write is a pipeline validation error
        device.pushErrorScope('validation');
        renderer.render({ target, container: depthOnly });

        expect(await device.popErrorScope()).toBeNull();
    });
});

describeLocalOnly('PipelineSystem winding cache', () =>
{
    it('keeps flipped and unflipped winding apart however many color formats have been seen', async () =>
    {
        renderer = (await getWebGPURenderer()) as WebGPURenderer;

        const pipeline = renderer.pipeline as unknown as {
            setRenderTarget(rt: RenderTarget): void;
            _pipeCache: unknown;
        };

        // more than 16 distinct formats: with a 4-bit format field, id n + 16 spilled into the winding
        // bit, so a flipped target shared its cache bucket with an unflipped one
        const formats: TEXTURE_FORMATS[] = [
            'r8unorm', 'r8snorm', 'r8uint', 'r8sint', 'r16uint', 'r16sint', 'r16float', 'rg8unorm', 'rg8snorm',
            'rg8uint', 'rg8sint', 'r32uint', 'r32sint', 'r32float', 'rg16uint', 'rg16sint', 'rg16float',
            'rgba8unorm', 'bgra8unorm', 'rgba16float',
        ];
        const caches = new Set<unknown>();

        for (const format of formats)
        {
            const target = new RenderTarget({
                colorTextures: [new TextureSource({ width: 16, height: 16, format })],
            });

            target.flipY = false;
            pipeline.setRenderTarget(target);
            caches.add(pipeline._pipeCache);

            target.flipY = true;
            pipeline.setRenderTarget(target);
            caches.add(pipeline._pipeCache);
        }

        expect(caches.size).toBe(formats.length * 2);
    });
});
