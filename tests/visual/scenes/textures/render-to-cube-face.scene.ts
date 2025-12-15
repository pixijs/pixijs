import { Geometry, RenderTarget, Shader, Texture, TextureSource } from '~/rendering';
import { Mesh } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render to cube faces via layer and sample them back',
    renderers: {
        webgpu: true,
        webgl2: true,
        webgl1: false,
    },
    create: async (scene: Container, renderer: Renderer) =>
    {
        // Empty cube texture (6 layers) rendered to one face at a time via `layer`.
        const cubeSource = new TextureSource({
            width: 64,
            height: 64,
            resolution: 1,
            viewDimension: 'cube',
            arrayLayerCount: 6,
            mipLevelCount: 1,
            autoGenerateMipmaps: false,
        });

        const cubeTexture = new Texture({ source: cubeSource });

        const renderTarget = new RenderTarget({
            colorTextures: [cubeTexture],
        });

        const solidGeometry = new Geometry({
            attributes: {
                aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1],
            },
        });

        const solidGpuShaderSrc = /* wgsl */`
            struct Uniforms {
                uTintColor: vec4<f32>,
            }

            @group(0) @binding(0) var<uniform> uniforms : Uniforms;

            @vertex
            fn vsMain(@location(0) aPosition : vec2<f32>,) -> @builtin(position) vec4<f32> {
                return vec4<f32>(aPosition, 0.0, 1.0);
            }

            @fragment
            fn fsMain() -> @location(0) vec4<f32> {
                return uniforms.uTintColor;
            }
        `;

        const solidGl = {
            vertex: `#version 300 es
                precision highp float;
                in vec2 aPosition;
                void main() {
                    gl_Position = vec4(aPosition, 0.0, 1.0);
                }
            `,
            fragment: `#version 300 es
                precision highp float;
                uniform vec4 uTintColor;
                out vec4 fragColor;
                void main() {
                    fragColor = uTintColor;
                }
            `,
        };

        const solidRed = new Mesh({
            geometry: solidGeometry,
            shader: Shader.from({
                gl: solidGl,
                gpu: {
                    vertex: { source: solidGpuShaderSrc, entryPoint: 'vsMain' },
                    fragment: { source: solidGpuShaderSrc, entryPoint: 'fsMain' },
                },
                resources: {
                    uniforms: {
                        uTintColor: { value: [1, 0, 0, 1], type: 'vec4<f32>' }
                    }
                }
            }),
        });

        const solidGreen = new Mesh({
            geometry: solidGeometry,
            shader: Shader.from({
                gl: solidGl,
                gpu: {
                    vertex: { source: solidGpuShaderSrc, entryPoint: 'vsMain' },
                    fragment: { source: solidGpuShaderSrc, entryPoint: 'fsMain' },
                },
                resources: {
                    uniforms: {
                        uTintColor: { value: [0, 1, 0, 1], type: 'vec4<f32>' }
                    }
                }
            }),
        });

        // Write face 0 (+X) = red, face 1 (-X) = green.
        renderer.render({
            target: renderTarget,
            container: solidRed,
            clear: true,
            clearColor: [0, 0, 0, 1],
            layer: 0,
        });

        renderer.render({
            target: renderTarget,
            container: solidGreen,
            clear: true,
            clearColor: [0, 0, 0, 1],
            layer: 1,
        });

        // Sample the cube back: left half samples +X, right half samples -X.
        const sampleGeometry = new Geometry({
            attributes: {
                aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1],
                aUV: [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
            },
        });

        const sampleGpuShaderSrc = /* wgsl */`
            @group(0) @binding(0) var uTexture : texture_cube<f32>;
            @group(0) @binding(1) var uSampler : sampler;

            struct VSOutput {
                @builtin(position) position: vec4<f32>,
                @location(0) uv: vec2<f32>,
            };

            @vertex
            fn vsMain(
                @location(0) aPosition: vec2<f32>,
                @location(1) aUV: vec2<f32>,
            ) -> VSOutput {
                var out: VSOutput;
                out.position = vec4<f32>(aPosition, 0.0, 1.0);
                out.uv = aUV;
                return out;
            }

            @fragment
            fn fsMain(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
                let isLeft = uv.x < 0.5;
                let dir = select(vec3<f32>(-1.0, 0.0, 0.0), vec3<f32>(1.0, 0.0, 0.0), isLeft);
                return textureSample(uTexture, uSampler, dir);
            }
        `;

        const sampleGl = {
            vertex: `#version 300 es
                precision highp float;
                in vec2 aPosition;
                in vec2 aUV;
                out vec2 vUV;
                void main() {
                    vUV = aUV;
                    gl_Position = vec4(aPosition, 0.0, 1.0);
                }
            `,
            fragment: `#version 300 es
                precision highp float;
                precision highp samplerCube;
                in vec2 vUV;
                uniform samplerCube uTexture;
                out vec4 fragColor;
                void main() {
                    float rightMask = step(0.5, vUV.x);
                    vec3 dir = mix(vec3(1.0, 0.0, 0.0), vec3(-1.0, 0.0, 0.0), rightMask);
                    fragColor = texture(uTexture, dir);
                }
            `,
        };

        const sampleMesh = new Mesh({
            geometry: sampleGeometry,
            shader: Shader.from({
                gl: sampleGl,
                gpu: {
                    vertex: { source: sampleGpuShaderSrc, entryPoint: 'vsMain' },
                    fragment: { source: sampleGpuShaderSrc, entryPoint: 'fsMain' },
                },
                resources: {
                    uTexture: cubeTexture.source,
                    uSampler: cubeTexture.source.style,
                }
            }),
        });

        scene.addChild(sampleMesh);
    },
};

