import { Geometry, RenderTarget, Shader, Texture, TextureSource } from '~/rendering';
import { Mesh } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render to different array layers and sample them back side-by-side',
    renderers: {
        webgpu: true,
        webgl2: true,
        webgl1: false,
    },
    create: async (scene: Container, renderer: Renderer) =>
    {
        // A 2D-array texture with 2 layers, sampled as 2d-array but rendered to as per-layer 2d views.
        const arraySource = new TextureSource({
            width: 64,
            height: 64,
            resolution: 1,
            arrayLayerCount: 2,
            viewDimension: '2d-array',
            mipLevelCount: 1,
            autoGenerateMipmaps: false,
        });

        const arrayTexture = new Texture({ source: arraySource });

        const renderTarget = new RenderTarget({
            colorTextures: [arrayTexture],
        });

        const solidGeometry = new Geometry({
            attributes: {
                // Fullscreen quad in NDC
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

        // Render layer 0 as solid red, layer 1 as solid green.
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

        // Sample both layers back: left half = layer 0, right half = layer 1.
        const sampleGeometry = new Geometry({
            attributes: {
                aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1],
                aUV: [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
            },
        });

        const sampleGpuShaderSrc = /* wgsl */`
            @group(0) @binding(0) var uTexture : texture_2d_array<f32>;
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
                // Avoid non-uniform control flow around textureSample (requires uniform control flow).
                let isLeft = uv.x < 0.5;

                let uvL = vec2<f32>(uv.x * 2.0, uv.y);
                let uvR = vec2<f32>((uv.x - 0.5) * 2.0, uv.y);

                let uvS = select(uvR, uvL, isLeft);
                let layer = select(1, 0, isLeft);

                return textureSample(uTexture, uSampler, uvS, layer);
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
                precision highp sampler2DArray;
                in vec2 vUV;
                uniform sampler2DArray uTexture;
                out vec4 fragColor;
                void main() {
                    float rightMask = step(0.5, vUV.x);
                    float uL = vUV.x * 2.0;
                    float uR = (vUV.x - 0.5) * 2.0;
                    float u = mix(uL, uR, rightMask);
                    float layer = rightMask; // 0 on left, 1 on right
                    fragColor = texture(uTexture, vec3(u, vUV.y, layer));
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
                    uTexture: arrayTexture.source,
                    uSampler: arrayTexture.source.style,
                }
            }),
        });

        scene.addChild(sampleMesh);
    },
};
