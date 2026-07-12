import { BindGroup, Geometry, Shader, State, UniformGroup } from '~/rendering';
import { RenderContainer } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer, WebGPURenderer } from '~/rendering';
import type { Container } from '~/scene';

// Regression test for the GpuEncoderSystem.setBindGroup cache miss-keying bug.
// One BindGroup is shared between two shaders whose group-0 layouts differ:
//   - shaderA declares only @group(0) @binding(0) (uColor)
//   - shaderB declares @group(0) @binding(0) (uColor) and @group(0) @binding(1) (uOffset)
// Both draws happen in the same render pass, against the same BindGroup
// JS instance, with the same resources, so bindGroup._key is unchanged between them.
// If the encoder short-circuits on bindGroup._key alone, the second draw will keep
// the GPUBindGroup created for shaderA's layout bound — WebGPU validation fires and
// the right-hand triangle never appears.
export const scene: TestScene = {
    it: 'should rebind a shared BindGroup when switching to a program with a different group-0 layout',
    renderers: ['webgpu'],
    create: async (scene: Container) =>
    {
        const triangle = new Geometry({
            attributes: {
                aPosition: [
                    -0.3, -0.3,
                    0.3, -0.3,
                    0.0, 0.3,
                ],
            },
        });

        const uColorGroup = new UniformGroup({
            uColor: { value: new Float32Array([1, 0.5, 0.2, 1]), type: 'vec4<f32>' },
        });
        const uOffsetGroup = new UniformGroup({
            uOffset: { value: new Float32Array([0.5, 0, 0, 0]), type: 'vec4<f32>' },
        });

        const sharedBindGroup = new BindGroup({
            0: uColorGroup,
            1: uOffsetGroup,
        });

        // Shader A: group-0 layout has ONLY binding 0.
        const shaderA = Shader.from({
            gpu: {
                name: 'shared-bindgroup-cross-program-a',
                vertex: {
                    entryPoint: 'main',
                    source: /* wgsl */`
                        @vertex
                        fn main(@location(0) aPosition: vec2<f32>) -> @builtin(position) vec4<f32> {
                            return vec4<f32>(aPosition - vec2<f32>(0.5, 0.0), 0.0, 1.0);
                        };
                    `,
                },
                fragment: {
                    entryPoint: 'main',
                    source: /* wgsl */`
                        struct Globals { uColor: vec4<f32> };
                        @group(0) @binding(0) var<uniform> g: Globals;

                        @fragment
                        fn main() -> @location(0) vec4<f32> {
                            return g.uColor;
                        }
                    `,
                },
            },
            groups: { 0: sharedBindGroup },
        });

        // Shader B: group-0 layout has BOTH binding 0 and binding 1.
        const shaderB = Shader.from({
            gpu: {
                name: 'shared-bindgroup-cross-program-b',
                vertex: {
                    entryPoint: 'main',
                    source: /* wgsl */`
                        struct Offset { uOffset: vec4<f32> };
                        @group(0) @binding(1) var<uniform> o: Offset;

                        @vertex
                        fn main(@location(0) aPosition: vec2<f32>) -> @builtin(position) vec4<f32> {
                            return vec4<f32>(aPosition + o.uOffset.xy, 0.0, 1.0);
                        };
                    `,
                },
                fragment: {
                    entryPoint: 'main',
                    source: /* wgsl */`
                        struct Globals { uColor: vec4<f32> };
                        @group(0) @binding(0) var<uniform> g: Globals;

                        @fragment
                        fn main() -> @location(0) vec4<f32> {
                            return g.uColor;
                        }
                    `,
                },
            },
            groups: { 0: sharedBindGroup },
        });

        const state = State.for2d();

        const container = new RenderContainer({
            render: (renderer: Renderer) =>
            {
                const gpuRenderer = renderer as WebGPURenderer;
                const encoder = gpuRenderer.encoder;

                encoder.draw({ geometry: triangle, shader: shaderA, state });
                encoder.draw({ geometry: triangle, shader: shaderB, state });
            },
            addBounds: (bounds) =>
            {
                bounds.minX = -0.8;
                bounds.minY = -0.3;
                bounds.maxX = 0.8;
                bounds.maxY = 0.3;
            },
        });

        scene.addChild(container);
    },
};
