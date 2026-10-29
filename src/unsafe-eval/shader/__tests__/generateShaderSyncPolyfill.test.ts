import { generateShaderSyncPolyfill } from '../generateShaderSyncPolyfill';
import { getWebGLRenderer } from '@test-utils';
import {
    BindGroup, BufferImageSource, Geometry, GlProgram, GpuProgram, Shader, Texture, UniformGroup
} from '~/rendering';
import { Container, Graphics, Mesh } from '~/scene';

import type { WebGLRenderer } from '~/rendering';

// a 2x2 texture, red on top and blue below, so the sampled colour says which texture is bound
function stripe()
{
    return new Texture({
        source: new BufferImageSource({
            resource: new Uint8Array([255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255]),
            width: 2, height: 2, format: 'rgba8unorm', scaleMode: 'nearest',
        })
    });
}

const names = ['tintUniforms', 'uTexture', 'uSampler', 'offsetUniforms'] as const;
const wgsl: Record<string, string> = {
    tintUniforms: 'var<uniform> tintUniforms: Tint;',
    uTexture: 'var uTexture: texture_2d<f32>;',
    uSampler: 'var uSampler: sampler;',
    offsetUniforms: 'var<uniform> offsetUniforms: Offset;',
};
const glsl: Record<string, string> = {
    tintUniforms: 'uniform tintUniforms { vec4 uTint; };',
    uTexture: 'uniform sampler2D uTexture;',
    uSampler: '',
    offsetUniforms: 'uniform offsetUniforms { vec2 uOffset; };',
};
const useWgsl: Record<string, string> = {
    tintUniforms: 'color *= tintUniforms.uTint;',
    uTexture: 'color *= textureSample(uTexture, uSampler, uv);',
    uSampler: '',
    offsetUniforms: 'uv += offsetUniforms.uOffset;',
};
// the offset must move the uv before the texture is sampled, whatever order the bindings are declared in
const useOrder = ['offsetUniforms', 'uTexture', 'uSampler', 'tintUniforms'] as const;
const useGlsl: Record<string, string> = {
    tintUniforms: 'color *= uTint;',
    uTexture: 'color *= texture(uTexture, uv);',
    uSampler: '',
    offsetUniforms: 'uv += uOffset;',
};

/**
 * A shader whose group 2 declares the given bindings, numbered in the order given, drawing through
 * pixi's projection so the result is the right way up in a render texture.
 * @param bindings - which bindings the shader declares, in binding order
 */
function makePrograms(bindings: (typeof names)[number][])
{
    const gpuProgram = new GpuProgram({
        vertex: {
            entryPoint: 'main', source: /* wgsl */`
            struct GlobalUniforms { uProjectionMatrix: mat3x3<f32>, uWorldTransformMatrix: mat3x3<f32>,
                uWorldColorAlpha: vec4<f32>, uResolution: vec2<f32> }
            struct LocalUniforms { uTransformMatrix: mat3x3<f32>, uColor: vec4<f32>, uRound: f32 }
            @group(0) @binding(0) var<uniform> globalUniforms: GlobalUniforms;
            @group(1) @binding(0) var<uniform> localUniforms: LocalUniforms;
            struct Out { @builtin(position) position: vec4<f32>, @location(0) vUV: vec2<f32> };
            @vertex fn main(@location(0) aPosition: vec2<f32>, @location(1) aUV: vec2<f32>) -> Out {
                var mvp = globalUniforms.uProjectionMatrix * globalUniforms.uWorldTransformMatrix
                    * localUniforms.uTransformMatrix;
                var o: Out;
                o.position = vec4<f32>(mvp * vec3<f32>(aPosition, 1.0), 1.0);
                o.vUV = aUV;
                return o;
            }`
        },
        fragment: {
            entryPoint: 'main', source: /* wgsl */`
            struct Tint { uTint: vec4<f32> }
            struct Offset { uOffset: vec2<f32> }
            ${bindings.map((name, i) => `@group(2) @binding(${i}) ${wgsl[name]}`).join('\n')}
            @fragment fn main(@location(0) vUV: vec2<f32>) -> @location(0) vec4<f32> {
                var uv = vUV;
                var color = vec4<f32>(1.0);
                ${useOrder.filter((name) => bindings.includes(name)).map((name) => useWgsl[name]).join('\n')}
                return color;
            }`
        },
    });
    const glProgram = new GlProgram({
        vertex: /* glsl */`#version 300 es
            in vec2 aPosition; in vec2 aUV; out vec2 vUV;
            uniform mat3 uProjectionMatrix; uniform mat3 uWorldTransformMatrix; uniform mat3 uTransformMatrix;
            void main() {
                mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
                gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
                vUV = aUV;
            }`,
        fragment: /* glsl */`#version 300 es
            precision mediump float;
            in vec2 vUV; out vec4 finalColor;
            ${bindings.map((name) => glsl[name]).join('\n')}
            void main() {
                vec2 uv = vUV;
                vec4 color = vec4(1.0);
                ${useOrder.filter((name) => bindings.includes(name)).map((name) => useGlsl[name]).join('\n')}
                finalColor = color;
            }`,
    });

    return { gpuProgram, glProgram };
}

// the top-left pixel of a 100x100 stage holding one full-size quad drawn by the shader
function topLeftPixel(renderer: WebGLRenderer, shader: Shader): number[]
{
    const geometry = new Geometry({
        attributes: { aPosition: [0, 0, 100, 0, 100, 100, 0, 100], aUV: [0, 0, 1, 0, 1, 1, 0, 1] },
        indexBuffer: [0, 1, 2, 0, 2, 3],
    });
    const stage = new Container();

    stage.addChild(new Graphics().rect(0, 0, 100, 100).fill(0x000000));
    stage.addChild(new Mesh({ geometry, shader }));

    return Array.from(renderer.extract.pixels({ target: stage, resolution: 4 / 100 }).pixels.slice(0, 4));
}

describe('generateShaderSyncPolyfill', () =>
{
    let renderer: WebGLRenderer;

    beforeEach(async () =>
    {
        // uniform blocks need WebGL2
        renderer = await getWebGLRenderer({ preferWebGLVersion: 2 });
        renderer.shader._generateShaderSync = generateShaderSyncPolyfill;
    });

    afterEach(() =>
    {
        renderer.destroy();
        renderer = null;
    });

    it('should bind a layout group by name for shaders that number the bindings differently', () =>
    {
        const texture = stripe();
        const bindGroup = new BindGroup({
            tintUniforms: new UniformGroup({ uTint: { value: [1, 1, 0, 1], type: 'vec4<f32>' } }, { ubo: true }),
            uTexture: texture.source,
            uSampler: texture.source.style,
            offsetUniforms: new UniformGroup({ uOffset: { value: [0, 0], type: 'vec2<f32>' } }, { ubo: true }),
        });

        // numbered as the group is, and numbered differently with the offset block left out
        const full = new Shader({ ...makePrograms([...names]), groups: { 2: bindGroup } });
        const subset = new Shader({ ...makePrograms(['uTexture', 'uSampler', 'tintUniforms']), groups: { 2: bindGroup } });

        // red top row of the stripe, tinted yellow: red survives, green is zeroed by the texture
        // subset first: drawn after the full shader, it would pass on the GL state that draw leaves
        // behind, even with its own bindings never synced
        expect(topLeftPixel(renderer, subset)).toEqual([255, 0, 0, 255]);
        expect(topLeftPixel(renderer, full)).toEqual([255, 0, 0, 255]);
    });

    it('should draw a group keyed by number as before', () =>
    {
        const texture = stripe();
        const shader = new Shader({
            ...makePrograms([...names]),
            resources: {
                tintUniforms: new UniformGroup({ uTint: { value: [0, 0, 1, 1], type: 'vec4<f32>' } }, { ubo: true }),
                uTexture: texture.source,
                uSampler: texture.source.style,
                offsetUniforms: new UniformGroup({ uOffset: { value: [0, 0.5], type: 'vec2<f32>' } }, { ubo: true }),
            },
        });

        // offset down half a texture: the blue row, tinted blue
        expect(topLeftPixel(renderer, shader)).toEqual([0, 0, 255, 255]);
    });
});
