import { CLEAR } from '../gl/const';
import { Geometry } from '../shared/geometry/Geometry';
import { RenderTarget } from '../shared/renderTarget/RenderTarget';
import { Shader } from '../shared/shader/Shader';
import { State } from '../shared/state/State';
import { TextureSource } from '../shared/texture/sources/TextureSource';
import { Texture } from '../shared/texture/Texture';
import { describeLocalOnly, getWebGLRenderer, getWebGPURenderer } from '@test-utils';
import { Mesh } from '~/scene';

import type { WebGLRenderer } from '../gl/WebGLRenderer';
import type { WebGPURenderer } from '../gpu/WebGPURenderer';

const wgsl = /* wgsl */`
    struct Uniforms { uTestColor: vec4<f32>, uDepth: f32, }
    @group(0) @binding(0) var<uniform> uniforms: Uniforms;
    @vertex fn vsMain(@location(0) aPosition: vec2<f32>) -> @builtin(position) vec4<f32> {
        return vec4<f32>(aPosition, uniforms.uDepth, 1.0);
    }
    @fragment fn fsMain() -> @location(0) vec4<f32> { return uniforms.uTestColor; }
`;

const glsl = {
    vertex: `#version 300 es
        precision highp float;
        in vec2 aPosition;
        uniform float uDepth;
        void main() { gl_Position = vec4(aPosition, (uDepth * 2.0) - 1.0, 1.0); }
    `,
    fragment: `#version 300 es
        precision highp float;
        uniform vec4 uTestColor;
        out vec4 fragColor;
        void main() { fragColor = uTestColor; }
    `,
};

const CLEAR_COLOR = [0, 0, 0, 255];
const RED = [255, 0, 0, 255];
const GREEN = [0, 255, 0, 255];
const BLUE = [0, 0, 255, 255];

type TestRenderer = WebGLRenderer | WebGPURenderer;

/**
 * A full-height quad from NDC x0 to x1 that depth tests and, unless told not to, writes depth. Full height,
 * so it reads the same whichever way up a backend draws raw NDC.
 * @param x0 - its left edge, in NDC
 * @param x1 - its right edge, in NDC
 * @param color - its colour
 * @param depth - its depth, 0 (near) to 1 (far)
 * @param writeDepth - whether it writes depth
 */
function quad(x0: number, x1: number, color: number[], depth: number, writeDepth = true): Mesh<Geometry, Shader>
{
    const state = new State();

    state.depthTest = true;
    state.depthMask = writeDepth;
    state.blendMode = 'none';

    return new Mesh({
        geometry: new Geometry({ attributes: { aPosition: [x0, -1, x1, -1, x1, 1, x0, -1, x1, 1, x0, 1] } }),
        shader: Shader.from({
            gl: glsl,
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

function colorSource(size = 64): TextureSource
{
    return new TextureSource({ width: size, height: size, resolution: 1, antialias: true, autoGenerateMipmaps: false });
}

function depthSource(size = 64): TextureSource
{
    return new TextureSource({
        width: size, height: size, resolution: 1, format: 'depth24plus-stencil8', autoGenerateMipmaps: false,
    });
}

/**
 * Two targets over the same antialiased colour and depth textures, both writing depth.
 * @param color - the shared colour texture
 * @param depth - the shared depth texture
 */
function sharedTargets(color: TextureSource, depth: TextureSource): [RenderTarget, RenderTarget]
{
    return [
        new RenderTarget({ colorTextures: [color], depthStencilTexture: depth }),
        new RenderTarget({ colorTextures: [color], depthStencilTexture: depth }),
    ];
}

/**
 * Reads the pixel in the middle of the left and right halves of a colour texture.
 * @param renderer - the renderer to read with
 * @param color - the texture to read
 */
function halves(renderer: TestRenderer, color: TextureSource): { left: number[], right: number[] }
{
    const { pixels, width, height } = renderer.extract.pixels(new Texture({ source: color }));
    const at = (x: number) =>
    {
        const i = (((height >> 1) * width) + x) * 4;

        return Array.from(pixels.slice(i, i + 4));
    };

    return { left: at(width >> 2), right: at(width - (width >> 2)) };
}

/**
 * Runs `fn` and resolves to the first error the backend raised, or null.
 * @param renderer - the renderer to watch
 * @param fn - what to run
 */
async function errorOf(renderer: TestRenderer, fn: () => void): Promise<string | null>
{
    if ('gpu' in renderer)
    {
        renderer.gpu.device.pushErrorScope('validation');
        fn();

        return (await renderer.gpu.device.popErrorScope())?.message ?? null;
    }

    const gl = renderer.gl;

    // drop anything raised before
    let error = gl.getError();

    while (error !== gl.NO_ERROR) error = gl.getError();

    fn();

    error = gl.getError();

    return error === gl.NO_ERROR ? null : `GL error 0x${error.toString(16)}`;
}

/**
 * Counts the multisample buffers the renderer frees from here on: the colour and depth renderbuffers on
 * WebGL, the multisampled colour texture on WebGPU.
 * @param renderer - the renderer to watch
 * @param color - the colour texture, already drawn into
 */
function countFreed(renderer: TestRenderer, color: TextureSource): () => number
{
    const spy = 'gpu' in renderer
        ? jest.spyOn(renderer.texture.getMsaaTexture(color).texture, 'destroy')
        : jest.spyOn(renderer.gl, 'deleteRenderbuffer');

    return () => spy.mock.calls.length;
}

// `buffers` is how many multisample buffers a colour and depth pair needs: WebGL keeps both in renderbuffers,
// WebGPU only the colour, as its depth texture is itself multisampled
const backends: [name: string, create: () => Promise<TestRenderer>, local: boolean, buffers: number][] = [
    ['WebGL', () => getWebGLRenderer({ width: 64, height: 64 }), false, 2],
    // every MSAA colour buffer is transient, restored from the resolved texture on reopen
    ['WebGPU, tile-based', async () =>
    {
        const renderer = await getWebGPURenderer({ width: 64, height: 64 });

        renderer.device.extensions.tileBased = true;

        return renderer;
    }, true, 1],
    // as on Intel/NVIDIA/AMD, where the MSAA colour buffer is stored and loaded
    ['WebGPU, not tile-based', async () =>
    {
        const renderer = await getWebGPURenderer({ width: 64, height: 64 });

        renderer.device.extensions.tileBased = false;

        return renderer;
    }, true, 1],
];

for (const [name, create, local, buffers] of backends)
{
    const describeBackend = local ? describeLocalOnly : describe;

    describeBackend(`render targets sharing an antialiased texture on ${name}`, () =>
    {
        let renderer: TestRenderer;

        beforeEach(async () =>
        {
            renderer = await create();
        });

        afterEach(() =>
        {
            renderer.destroy();
            renderer = null;
        });

        it('should keep what one target drew when the other draws without clearing', async () =>
        {
            const color = colorSource();
            const [first, second] = sharedTargets(color, depthSource());

            const error = await errorOf(renderer, () =>
            {
                renderer.render({ target: first, container: quad(-1, 0, RED, 0.5), clear: true, clearColor: 'black' });
                renderer.render({ target: second, container: quad(0, 1, BLUE, 0.5), clear: false });
            });

            expect(error).toBeNull();
            expect(halves(renderer, color)).toEqual({ left: RED, right: BLUE });
        });

        it('should depth test one target\'s draws against the depth the other wrote', async () =>
        {
            const color = colorSource();
            const [first, second] = sharedTargets(color, depthSource());

            const error = await errorOf(renderer, () =>
            {
                // near on the left, then far everywhere: far shows only where near isn't
                renderer.render({ target: first, container: quad(-1, 0, GREEN, 0.3), clear: true, clearColor: 'black' });
                renderer.render({ target: second, container: quad(-1, 1, RED, 0.6), clear: false });
                // and back on the first, which must see the far depth the second wrote
                renderer.render({ target: first, container: quad(-1, 1, BLUE, 0.8), clear: false });
            });

            expect(error).toBeNull();
            expect(halves(renderer, color)).toEqual({ left: GREEN, right: RED });
        });

        it('should keep sharing after the textures resize', async () =>
        {
            const color = colorSource();
            const depth = depthSource();
            const [first, second] = sharedTargets(color, depth);

            const error = await errorOf(renderer, () =>
            {
                renderer.render({ target: first, container: quad(-1, 0, GREEN, 0.3), clear: true, clearColor: 'black' });
                renderer.render({ target: second, container: quad(-1, 1, RED, 0.6), clear: false });

                // the first target's colour is the size source, and takes the depth texture with it
                first.resize(96, 96);

                renderer.render({ target: first, container: quad(-1, 0, GREEN, 0.3), clear: true, clearColor: 'black' });
                // the second target meets the new size here, and must not empty what the first just drew
                renderer.render({ target: second, container: quad(-1, 1, RED, 0.6), clear: false });
                renderer.render({ target: first, container: quad(-1, 1, BLUE, 0.8), clear: false });
            });

            expect(error).toBeNull();
            expect(color.pixelWidth).toBe(96);
            expect(depth.pixelWidth).toBe(96);
            expect(halves(renderer, color)).toEqual({ left: GREEN, right: RED });
        });

        it('should keep the samples for one target when the other is destroyed', async () =>
        {
            const color = colorSource();
            const [first, second] = sharedTargets(color, depthSource());

            const error = await errorOf(renderer, () =>
            {
                renderer.render({ target: first, container: quad(-1, 0, GREEN, 0.3), clear: true, clearColor: 'black' });
                renderer.render({ target: second, container: quad(-1, 1, RED, 0.6), clear: false });

                // the one that built the samples goes first
                first.destroy();

                // still reads the samples and depth both targets wrote
                renderer.render({ target: second, container: quad(-1, 1, BLUE, 0.8), clear: false });
            });

            expect(error).toBeNull();
            expect(halves(renderer, color)).toEqual({ left: GREEN, right: RED });

            // and a target built afterwards joins in: it keeps the left, and draws in front of the far depth
            const third = new RenderTarget({ colorTextures: [color], depthStencilTexture: second.depthStencilTexture });

            renderer.render({ target: third, container: quad(0, 1, BLUE, 0.45), clear: false });

            expect(halves(renderer, color)).toEqual({ left: GREEN, right: BLUE });
        });

        it('should let a target that only reads the depth draw against what the other wrote', async () =>
        {
            const color = colorSource();
            const depth = depthSource();
            const writer = new RenderTarget({ colorTextures: [color], depthStencilTexture: depth });
            // as pixi-3d builds for a pass that depth tests against the scene without writing it
            const reader = new RenderTarget({
                colorAttachments: [{ texture: color, loadOp: 'load', storeOp: 'store' }],
                depthStencilAttachment: { texture: depth, depthReadOnly: true },
            });

            const error = await errorOf(renderer, () =>
            {
                renderer.render({ target: writer, container: quad(-1, 0, GREEN, 0.3), clear: true, clearColor: 'black' });
                renderer.render({ target: reader, container: quad(-1, 1, RED, 0.6, false), clear: false });
            });

            expect(error).toBeNull();
            expect(halves(renderer, color)).toEqual({ left: GREEN, right: RED });
        });

        it('should keep the depth a target drew before its depth texture was added, and share it', async () =>
        {
            const color = colorSource();
            const first = new RenderTarget({ colorTextures: [color], depth: true, stencil: true });

            // builds the backend target before it has a depth texture
            renderer.render({ target: first, container: quad(-1, 0, GREEN, 0.3), clear: true, clearColor: 'black' });

            first.ensureDepthStencilTexture();

            const second = new RenderTarget({ colorTextures: [color], depthStencilTexture: first.depthStencilTexture });

            const error = await errorOf(renderer, () =>
            {
                // behind the green it drew before the texture arrived
                renderer.render({ target: first, container: quad(-1, 1, BLUE, 0.8), clear: false });
                renderer.render({ target: second, container: quad(-1, 1, RED, 0.6), clear: false });
            });

            expect(error).toBeNull();
            expect(halves(renderer, color)).toEqual({ left: GREEN, right: RED });
        });

        it('should size a late depth texture to its colour at a fractional resolution', async () =>
        {
            // a target rounds this to 502 pixels wide, and 502 / 1.75 * 1.75 lands just short of 502
            const fractionalColor = () => new TextureSource({
                width: 287, height: 64, resolution: 1.75, antialias: true, autoGenerateMipmaps: false,
            });
            const color = fractionalColor();
            const target = new RenderTarget({ colorTextures: [color] });
            const drawnFirstColor = fractionalColor();
            const drawnFirst = new RenderTarget({ colorTextures: [drawnFirstColor], depth: true, stencil: true });

            target.ensureDepthStencilTexture();
            renderer.render({ target: drawnFirst, container: quad(-1, 0, GREEN, 0.3), clear: true, clearColor: 'black' });
            drawnFirst.ensureDepthStencilTexture();

            const error = await errorOf(renderer, () =>
            {
                renderer.render({ target, container: quad(-1, 0, GREEN, 0.3), clear: true, clearColor: 'black' });
                renderer.render({ target, container: quad(-1, 1, RED, 0.6), clear: false });
                // behind the green it drew before the depth texture arrived
                renderer.render({ target: drawnFirst, container: quad(-1, 1, RED, 0.6), clear: false });
            });

            expect(error).toBeNull();
            expect(halves(renderer, color)).toEqual({ left: GREEN, right: RED });
            expect(halves(renderer, drawnFirstColor)).toEqual({ left: GREEN, right: RED });
        });

        it('should move a target onto a late depth texture\'s samples when another target drew to them first', async () =>
        {
            const color = colorSource();
            const first = new RenderTarget({ colorTextures: [color], depth: true, stencil: true });

            renderer.render({ target: first, container: quad(-1, 1, BLUE, 0.9), clear: true, clearColor: 'black' });

            first.ensureDepthStencilTexture();

            const second = new RenderTarget({ colorTextures: [color], depthStencilTexture: first.depthStencilTexture });

            const error = await errorOf(renderer, () =>
            {
                renderer.render({ target: second, container: quad(-1, 0, GREEN, 0.3), clear: CLEAR.DEPTH });
                // far everywhere: shows only where the second target's near depth isn't
                renderer.render({ target: first, container: quad(-1, 1, RED, 0.6), clear: false });
            });

            expect(error).toBeNull();
            expect(halves(renderer, color)).toEqual({ left: GREEN, right: RED });
        });

        it('should share with the target the renderer builds for the texture itself', async () =>
        {
            const color = colorSource();
            const texture = new Texture({ source: color });
            const target = new RenderTarget({ colorTextures: [color], depthStencilTexture: depthSource() });

            const error = await errorOf(renderer, () =>
            {
                renderer.render({ target: texture, container: quad(-1, 0, RED, 0.5), clear: true, clearColor: 'black' });
                // its depth is new, so that clears; the colour must not
                renderer.render({ target, container: quad(0, 1, BLUE, 0.5), clear: CLEAR.DEPTH });
                // a strip between the two pixels read, so the renderer's target resolves its samples last
                renderer.render({ target: texture, container: quad(-0.1, 0.1, GREEN, 0.5), clear: false });
            });

            expect(error).toBeNull();
            expect(halves(renderer, color)).toEqual({ left: RED, right: BLUE });
        });

        it('should make the depth samples again after the depth texture is unloaded under live targets', async () =>
        {
            const color = colorSource();
            const depth = depthSource();
            const [first, second] = sharedTargets(color, depth);

            renderer.render({ target: first, container: quad(-1, 0, GREEN, 0.3), clear: true, clearColor: 'black' });
            renderer.render({ target: second, container: quad(-1, 1, RED, 0.6), clear: false });

            // as the GC does for an idle texture
            depth.unload();

            const error = await errorOf(renderer, () =>
            {
                renderer.render({ target: first, container: quad(-1, 0, GREEN, 0.3), clear: true, clearColor: 'black' });
                renderer.render({ target: second, container: quad(-1, 1, RED, 0.6), clear: false });
            });

            expect(error).toBeNull();
            expect(halves(renderer, color)).toEqual({ left: GREEN, right: RED });
        });

        it('should keep the samples when every target over the textures is destroyed', async () =>
        {
            const color = colorSource();
            const depth = depthSource();
            const [first, second] = sharedTargets(color, depth);

            renderer.render({ target: first, container: quad(-1, 0, GREEN, 0.3), clear: true, clearColor: 'black' });
            renderer.render({ target: second, container: quad(-1, 1, RED, 0.6), clear: false });

            const freed = countFreed(renderer, color);

            first.destroy();
            second.destroy();

            expect(freed()).toBe(0);

            // the samples belong to the textures, so a new target finds them, colour and depth
            const third = new RenderTarget({ colorTextures: [color], depthStencilTexture: depth });

            const error = await errorOf(renderer, () =>
            {
                renderer.render({ target: third, container: quad(0, 1, BLUE, 0.45), clear: false });
            });

            expect(error).toBeNull();
            expect(halves(renderer, color)).toEqual({ left: GREEN, right: BLUE });
        });

        it('should free the samples with the textures', () =>
        {
            const color = colorSource();
            const depth = depthSource();
            const [first, second] = sharedTargets(color, depth);

            renderer.render({ target: first, container: quad(-1, 0, RED, 0.5), clear: true });
            renderer.render({ target: second, container: quad(0, 1, BLUE, 0.5), clear: false });

            const freed = countFreed(renderer, color);

            first.destroy();
            second.destroy();
            color.destroy();
            depth.destroy();

            expect(freed()).toBe(buffers);
        });

        it('should free the samples when the renderer is destroyed with the textures still alive', async () =>
        {
            const scratch = await create();
            const color = colorSource();
            const [first, second] = sharedTargets(color, depthSource());

            scratch.render({ target: first, container: quad(-1, 0, RED, 0.5), clear: true });
            scratch.render({ target: second, container: quad(0, 1, BLUE, 0.5), clear: false });

            const freed = countFreed(scratch, color);

            scratch.destroy();

            expect(freed()).toBe(buffers);
        });

        it('should clear both targets\' samples when one clears', async () =>
        {
            const color = colorSource();
            const [first, second] = sharedTargets(color, depthSource());

            renderer.render({ target: first, container: quad(-1, 1, RED, 0.3), clear: true, clearColor: 'black' });
            renderer.render({ target: second, container: quad(0, 1, BLUE, 0.6), clear: true, clearColor: 'black' });

            expect(halves(renderer, color)).toEqual({ left: CLEAR_COLOR, right: BLUE });

            // back on the first: the second's clear took its colour and its nearer depth with it
            renderer.render({ target: first, container: quad(-1, 0, GREEN, 0.9), clear: false });

            expect(halves(renderer, color)).toEqual({ left: GREEN, right: BLUE });
        });
    });
}
