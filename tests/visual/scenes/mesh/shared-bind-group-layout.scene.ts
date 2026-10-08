import { Assets } from '~/assets';
import { BindGroup, Geometry, GlProgram, GpuProgram, Shader, UniformGroup } from '~/rendering';
import { Mesh } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

// pixi's projection puts both backends the right way up in a render texture; a shader that writes
// clip space directly comes out inverted on WebGL (bottom-left origin) relative to WebGPU
const vertex = {
    wgsl: /* wgsl */`
        struct GlobalUniforms {
            uProjectionMatrix: mat3x3<f32>,
            uWorldTransformMatrix: mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        struct LocalUniforms {
            uTransformMatrix: mat3x3<f32>,
            uColor: vec4<f32>,
            uRound: f32,
        }

        @group(0) @binding(0) var<uniform> globalUniforms: GlobalUniforms;
        @group(1) @binding(0) var<uniform> localUniforms: LocalUniforms;

        struct VertexOutput {
            @builtin(position) position: vec4<f32>,
            @location(0) vUV: vec2<f32>,
        };

        @vertex
        fn main(
            @location(0) aPosition: vec2<f32>,
            @location(1) aUV: vec2<f32>,
        ) -> VertexOutput {
            var mvp = globalUniforms.uProjectionMatrix
                * globalUniforms.uWorldTransformMatrix
                * localUniforms.uTransformMatrix;

            var output: VertexOutput;

            output.position = vec4<f32>(mvp * vec3<f32>(aPosition, 1.0), 1.0);
            output.vUV = aUV;

            return output;
        }
    `,
    // uniform blocks need GLSL ES 3.00, which pixi only sets up when the source asks for it
    glsl: /* glsl */`#version 300 es
        in vec2 aPosition;
        in vec2 aUV;

        out vec2 vUV;

        uniform mat3 uProjectionMatrix;
        uniform mat3 uWorldTransformMatrix;
        uniform mat3 uTransformMatrix;

        void main() {
            mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;

            gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
            vUV = aUV;
        }
    `,
};

/**
 * One bind group, keyed by name, feeds two shaders that number its bindings differently: a main pass
 * that declares every binding in the group's order, and a shadow pass that declares only what it
 * needs, texture first and tint last, so none of its numbers agree with the group's.
 */
export const scene: TestScene = {
    it: 'should draw two differently numbered shaders from one bind group keyed by name',
    renderers: { webgpu: true, webgl2: true, webgl1: false, canvas: false },
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');

        const bindGroup = new BindGroup({
            tintUniforms: new UniformGroup({ uTint: { value: [1, 0.5, 0.5, 1], type: 'vec4<f32>' } }, { ubo: true }),
            uTexture: texture.source,
            uSampler: texture.source.style,
            offsetUniforms: new UniformGroup({ uOffset: { value: [0.25, 0], type: 'vec2<f32>' } }, { ubo: true }),
        });

        const mainPass = new Shader({
            gpuProgram: new GpuProgram({
                vertex: { source: vertex.wgsl, entryPoint: 'main' },
                fragment: {
                    entryPoint: 'main',
                    source: /* wgsl */`
                        struct Tint { uTint: vec4<f32> }
                        struct Offset { uOffset: vec2<f32> }

                        @group(2) @binding(0) var<uniform> tintUniforms: Tint;
                        @group(2) @binding(1) var uTexture: texture_2d<f32>;
                        @group(2) @binding(2) var uSampler: sampler;
                        @group(2) @binding(3) var<uniform> offsetUniforms: Offset;

                        @fragment
                        fn main(@location(0) vUV: vec2<f32>) -> @location(0) vec4<f32> {
                            return textureSample(uTexture, uSampler, vUV + offsetUniforms.uOffset) * tintUniforms.uTint;
                        }
                    `,
                },
            }),
            glProgram: new GlProgram({
                vertex: vertex.glsl,
                fragment: /* glsl */`#version 300 es
                    precision mediump float;

                    in vec2 vUV;
                    out vec4 finalColor;

                    uniform tintUniforms { vec4 uTint; };
                    uniform sampler2D uTexture;
                    uniform offsetUniforms { vec2 uOffset; };

                    void main() {
                        finalColor = texture(uTexture, vUV + uOffset) * uTint;
                    }
                `,
            }),
            groups: { 2: bindGroup },
        });

        const shadowPass = new Shader({
            gpuProgram: new GpuProgram({
                vertex: { source: vertex.wgsl, entryPoint: 'main' },
                fragment: {
                    entryPoint: 'main',
                    source: /* wgsl */`
                        struct Tint { uTint: vec4<f32> }

                        @group(2) @binding(0) var uTexture: texture_2d<f32>;
                        @group(2) @binding(1) var uSampler: sampler;
                        @group(2) @binding(2) var<uniform> tintUniforms: Tint;

                        @fragment
                        fn main(@location(0) vUV: vec2<f32>) -> @location(0) vec4<f32> {
                            return textureSample(uTexture, uSampler, vUV) * tintUniforms.uTint;
                        }
                    `,
                },
            }),
            glProgram: new GlProgram({
                vertex: vertex.glsl,
                fragment: /* glsl */`#version 300 es
                    precision mediump float;

                    in vec2 vUV;
                    out vec4 finalColor;

                    uniform sampler2D uTexture;
                    uniform tintUniforms { vec4 uTint; };

                    void main() {
                        finalColor = texture(uTexture, vUV) * uTint;
                    }
                `,
            }),
            groups: { 2: bindGroup },
        });

        // pixel coordinates, v = 0 at the top edge
        const quad = (x0: number, x1: number) => new Geometry({
            attributes: {
                aPosition: [x0, 16, x1, 16, x1, 112, x0, 112],
                aUV: [0, 0, 1, 0, 1, 1, 0, 1],
            },
            indexBuffer: [0, 1, 2, 0, 2, 3],
        });

        scene.addChild(new Mesh({ geometry: quad(8, 56), shader: mainPass }));
        scene.addChild(new Mesh({ geometry: quad(72, 120), shader: shadowPass }));
    },
};
