import { Geometry, Shader, State } from '~/rendering';
import { Mesh } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should completely overwrite destination when blend is disabled',
    renderers: {
        webgl2: true,
        webgpu: true,
        webgl1: true,
        canvas: false,
    },
    create: async (scene: Container) =>
    {
        // Fullscreen-quad geometry in NDC.
        const geometry = new Geometry({
            attributes: {
                aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1],
            },
        });

        const gpuShaderSrc = /* wgsl */`
            struct Uniforms {
                uTint: vec4<f32>,
            }

            @group(0) @binding(0) var<uniform> uniforms : Uniforms;

            @vertex
            fn vsMain(@location(0) aPosition : vec2<f32>) -> @builtin(position) vec4<f32> {
                return vec4<f32>(aPosition, 0.0, 1.0);
            }

            @fragment
            fn fsMain() -> @location(0) vec4<f32> {
                return uniforms.uTint;
            }
        `;

        const glShader = {
            vertex: `
                precision highp float;
                in vec2 aPosition;
                void main() {
                    gl_Position = vec4(aPosition, 0.0, 1.0);
                }
            `,
            fragment: `
                precision highp float;
                uniform vec4 uTint;

                void main() {
                    finalColor = uTint;
                }
            `,

        };

        // 1. Draw a solid red background (blending on, normal – covers the whole canvas).
        const redBg = new Mesh({
            geometry,
            shader: Shader.from({
                gl: glShader,
                gpu: {
                    vertex: { source: gpuShaderSrc, entryPoint: 'vsMain' },
                    fragment: { source: gpuShaderSrc, entryPoint: 'fsMain' },
                },
                resources: {
                    uniforms: {
                        uTint: { value: [1, 0, 0, 1], type: 'vec4<f32>' },
                    },
                },

            }),
        });

        // redBg.shader.glProgram.un

        // 2. Draw a half-alpha green quad WITH blending disabled.
        //    If blend-disable works correctly the destination (red) should be fully
        //    overwritten by the half-alpha green, resulting in (0, 0.5, 0, 0.5).
        //    If blending were mistakenly still active the green would be composited
        //    over red and produce a different colour.
        const noBlendState = new State();

        noBlendState.blend = false;

        const greenOverlay = new Mesh({
            geometry,
            shader: Shader.from({
                gl: glShader,
                gpu: {
                    vertex: { source: gpuShaderSrc, entryPoint: 'vsMain' },
                    fragment: { source: gpuShaderSrc, entryPoint: 'fsMain' },
                },
                resources: {
                    uniforms: {
                        uTint: { value: [0, 0, 0, 0], type: 'vec4<f32>' },
                    },
                },
            }),
            state: noBlendState,
        });

        scene.addChild(redBg, greenOverlay);
    },
};
