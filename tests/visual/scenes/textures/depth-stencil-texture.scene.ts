import { Geometry, RenderTarget, Shader, State, Texture, TextureSource } from '~/rendering';
import { Mesh, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should depth-test correctly with an explicit depthStencilTexture on a RenderTarget',
    renderers: {
        webgpu: true,
        webgl2: true,
        webgl1: false,
    },
    create: async (scene: Container, renderer: Renderer) =>
    {
        // Create a colour texture to render into.
        const colorSource = new TextureSource({
            width: 128,
            height: 128,
            resolution: 1,
            mipLevelCount: 1,
            autoGenerateMipmaps: false,
        });

        const colorTexture = new Texture({ source: colorSource });

        // Explicit depth-stencil texture (the code path under test).
        const depthStencilSource = new TextureSource({
            width: 128,
            height: 128,
            resolution: 1,
            format: 'depth24plus-stencil8',
            mipLevelCount: 1,
            autoGenerateMipmaps: false,
        });

        const renderTarget = new RenderTarget({
            colorTextures: [colorTexture],
            depthStencilTexture: depthStencilSource,
            depth: true,
            stencil: true,
        });

        // Two quads that overlap. The first (green) is at z = 0.2 (closer),
        // the second (red) is at z = 0.8 (farther). With depth testing enabled
        // and both drawn in order red-then-green, the green quad should appear
        // in front in the overlap region because it has a smaller depth value.

        const gpuShaderSrc = /* wgsl */`
            struct Uniforms {
                uColor: vec4<f32>,
                uDepth: f32,
            }

            @group(0) @binding(0) var<uniform> uniforms : Uniforms;

            struct VSOutput {
                @builtin(position) position: vec4<f32>,
            };

            @vertex
            fn vsMain(@location(0) aPosition : vec2<f32>) -> VSOutput {
                var out: VSOutput;
                out.position = vec4<f32>(aPosition, uniforms.uDepth, 1.0);
                return out;
            }

            @fragment
            fn fsMain() -> @location(0) vec4<f32> {
                return uniforms.uColor;
            }
        `;

        const glShader = {
            vertex: `#version 300 es
                precision highp float;
                in vec2 aPosition;
                uniform float uDepth;
                void main() {
                    gl_Position = vec4(aPosition, uDepth, 1.0);
                }
            `,
            fragment: `#version 300 es
                precision highp float;
                uniform vec4 uColor;
                out vec4 fragColor;
                void main() {
                    fragColor = uColor;
                }
            `,
        };

        // Left-biased quad (covers left 75% of the screen).
        const leftQuadGeom = new Geometry({
            attributes: {
                aPosition: [-1, -1, 0.5, -1, 0.5, 1, -1, -1, 0.5, 1, -1, 1],
            },
        });

        // Right-biased quad (covers right 75% of the screen).
        const rightQuadGeom = new Geometry({
            attributes: {
                aPosition: [-0.5, -1, 1, -1, 1, 1, -0.5, -1, 1, 1, -0.5, 1],
            },
        });

        const depthState = new State();

        depthState.depthTest = true;
        depthState.depthMask = true;
        depthState.blendMode = 'none';

        // Red quad drawn first — farther away (z = 0.8).
        const redQuad = new Mesh({
            geometry: rightQuadGeom,
            shader: Shader.from({
                gl: glShader,
                gpu: {
                    vertex: { source: gpuShaderSrc, entryPoint: 'vsMain' },
                    fragment: { source: gpuShaderSrc, entryPoint: 'fsMain' },
                },
                resources: {
                    uniforms: {
                        uColor: { value: [1, 0, 0, 1], type: 'vec4<f32>' },
                        uDepth: { value: 0.8, type: 'f32' },
                    },
                },
            }),
            state: depthState,
        });

        // Green quad drawn second — closer (z = 0.2). Should win in overlap.
        const greenQuad = new Mesh({
            geometry: leftQuadGeom,
            shader: Shader.from({
                gl: glShader,
                gpu: {
                    vertex: { source: gpuShaderSrc, entryPoint: 'vsMain' },
                    fragment: { source: gpuShaderSrc, entryPoint: 'fsMain' },
                },
                resources: {
                    uniforms: {
                        uColor: { value: [0, 1, 0, 1], type: 'vec4<f32>' },
                        uDepth: { value: 0.2, type: 'f32' },
                    },
                },
            }),
            state: depthState,
        });

        // Render both quads into the off-screen target.
        renderer.render({
            target: renderTarget,
            container: redQuad,
            clear: true,
            clearColor: [0, 0, 0, 1],
        });

        renderer.render({
            target: renderTarget,
            container: greenQuad,
            clear: false,
        });

        // Display the result as a sprite so the visual test framework can capture it.
        // Expected: left strip = green, overlap center = green (closer), right strip = red.
        const result = new Sprite(colorTexture);

        scene.addChild(result);
    },
};
