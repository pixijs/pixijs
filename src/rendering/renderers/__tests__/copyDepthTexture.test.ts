import { CLEAR } from '../gl/const';
import { Geometry } from '../shared/geometry/Geometry';
import { RenderTarget } from '../shared/renderTarget/RenderTarget';
import { Shader } from '../shared/shader/Shader';
import { State } from '../shared/state/State';
import { TextureSource } from '../shared/texture/sources/TextureSource';
import { Texture } from '../shared/texture/Texture';
import { describeLocalOnly, getWebGPURenderer } from '@test-utils';
import { Mesh } from '~/scene';

import type { WebGPURenderer } from '../gpu/WebGPURenderer';

const wgsl = /* wgsl */`
    struct Uniforms { uTestColor: vec4<f32>, uDepth: f32, }
    @group(0) @binding(0) var<uniform> uniforms: Uniforms;
    @vertex fn vsMain(@location(0) aPosition: vec2<f32>) -> @builtin(position) vec4<f32> {
        return vec4<f32>(aPosition, uniforms.uDepth, 1.0);
    }
    @fragment fn fsMain() -> @location(0) vec4<f32> { return uniforms.uTestColor; }
`;

const BLACK = [0, 0, 0, 255];
const RED = [255, 0, 0, 255];

const expected = {
    copyError: null as string | null,
    copied: BLACK,
    copiedOverOldDepth: RED,
    copyAfterResizeError: null as string | null,
};

/**
 * A quad from NDC (x0, y0) to (x1, y1) that depth tests and writes depth.
 * @param x0 - its left edge, in NDC
 * @param y0 - its bottom edge, in NDC
 * @param x1 - its right edge, in NDC
 * @param y1 - its top edge, in NDC
 * @param color - its colour
 * @param depth - its depth
 */
function quad(x0: number, y0: number, x1: number, y1: number, color: number[], depth: number): Mesh<Geometry, Shader>
{
    const state = new State();

    state.depthTest = true;
    state.depthMask = true;
    state.blendMode = 'none';

    return new Mesh({
        geometry: new Geometry({ attributes: { aPosition: [x0, y0, x1, y0, x1, y1, x0, y0, x1, y1, x0, y1] } }),
        shader: Shader.from({
            gpu: {
                vertex: { source: wgsl, entryPoint: 'vsMain' },
                fragment: { source: wgsl, entryPoint: 'fsMain' },
            },
            resources: {
                uniforms: {
                    uTestColor: { value: color, type: 'vec4<f32>' },
                    uDepth: { value: depth, type: 'f32' },
                },
            },
        }),
        state,
    });
}

function textureSource(depth = false): TextureSource
{
    return new TextureSource({
        width: 128, height: 128, resolution: 1, autoGenerateMipmaps: false,
        ...(depth && { format: 'depth24plus-stencil8' }),
    });
}

/**
 * Runs `fn` and resolves to the first WebGPU validation error it raised, or null.
 * @param renderer - the renderer to watch
 * @param fn - what to run
 */
async function errorOf(renderer: WebGPURenderer, fn: () => void): Promise<string | null>
{
    renderer.gpu.device.pushErrorScope('validation');
    fn();

    return (await renderer.gpu.device.popErrorScope())?.message ?? null;
}

/**
 * Copies a view rect at a positive origin to (0, 0) of a depth texture that still holds nearer depth from the
 * last frame, as pixi-3d's CopyDepthPass does each frame. Reports what a depth-tested draw into the destination
 * shows, and whether the copy raises an error before and after the source resizes.
 * @param renderer - the renderer to copy with
 * @param antialias - whether the source is antialiased
 */
async function copyViewRect(renderer: WebGPURenderer, antialias: boolean): Promise<typeof expected>
{
    // source depth 0.3 at x 32-64 and y 32-64, and the cleared 1 elsewhere
    const source = new RenderTarget({ width: 128, height: 128, antialias, depthStencilTexture: true });
    const destinationColor = textureSource();
    const destinationDepth = textureSource(true);
    const destination = new RenderTarget({
        colorAttachments: [{ texture: destinationColor, loadOp: 'clear', storeOp: 'store', clearValue: [0, 0, 0, 1] }],
        depthStencilAttachment: {
            texture: destinationDepth, depthLoadOp: 'load', depthStoreOp: 'store', depthClearValue: 1,
        },
    });
    const viewOrigin = { x: 16, y: 16 };
    const viewSize = { width: 64, height: 64 };

    renderer.render({ target: source, container: quad(-0.5, 0, 0, 0.5, [0, 1, 0, 1], 0.3), clear: true });
    // last frame's depth, 0.2 everywhere
    renderer.render({ target: destination, container: quad(-1, -1, 1, 1, [0, 0, 1, 1], 0.2), clear: true });

    const copyError = await errorOf(renderer, () => renderer.renderTarget.copyDepthTexture(
        source, new Texture({ source: destinationDepth }), viewOrigin, viewSize, { x: 0, y: 0 },
    ));

    // red at depth 0.5 shows only where the destination's depth is now 1
    renderer.render({
        target: destination, container: quad(-1, -1, 1, 1, [1, 0, 0, 1], 0.5), clear: CLEAR.COLOR, clearColor: [0, 0, 0, 1],
    });

    const { pixels } = renderer.extract.pixels(new Texture({ source: destinationColor }));
    const pixelAt = (x: number, y: number) => Array.from(pixels.slice(((y * 128) + x) * 4, ((y * 128) + x + 1) * 4));

    const result = {
        copyError,
        copied: pixelAt(24, 24), // 0.3 from source (40, 40); an offset missing its x or y half reads 1
        copiedOverOldDepth: pixelAt(8, 24), // the source's 1 from (24, 40), over the old 0.2
        copyAfterResizeError: null as string | null,
    };

    // a resize replaces the source's GPU textures, as resizeTo: window does
    source.resize(96, 96);

    result.copyAfterResizeError = await errorOf(renderer, () =>
    {
        renderer.render({ target: source, container: quad(-1, -1, 1, 1, [0, 1, 0, 1], 0.3), clear: true });
        renderer.renderTarget.copyDepthTexture(
            source, new Texture({ source: destinationDepth }), viewOrigin, viewSize, { x: 0, y: 0 },
        );
    });

    return result;
}

describeLocalOnly('copyDepthTexture on WebGPU', () =>
{
    for (const antialias of [false, true])
    {
        it(`should copy a view rect over last frame's depth, and again after the source resizes, antialias ${antialias}`,
            async () =>
            {
                const renderer = await getWebGPURenderer({ width: 128, height: 128 });

                const result = await copyViewRect(renderer, antialias);

                renderer.destroy();
                expect(result).toEqual(expected);
            });
    }
});
