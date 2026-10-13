import { BindGroup, Geometry, Shader, State, UniformGroup } from '~/rendering';
import { RenderContainer } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer, WebGPURenderer } from '~/rendering';
import type { Container } from '~/scene';

// Two draws in one render pass share a BindGroup and a program. Between them the group's color
// binding is re-pointed from red to green, so the encoder must rebind group 0 for the second draw.
// If it skipped the rebind, both triangles would be red.
export const scene: TestScene = {
    it: 'should rebind a BindGroup re-pointed between two draws in one render pass',
    renderers: ['webgpu'],
    create: async (scene: Container) =>
    {
        const triangle = (x: number) => new Geometry({
            attributes: {
                aPosition: [
                    x - 0.3, -0.3,
                    x + 0.3, -0.3,
                    x, 0.3,
                ],
            },
        });
        const left = triangle(-0.5);
        const right = triangle(0.5);

        const red = new UniformGroup({
            uColor: { value: new Float32Array([1, 0, 0, 1]), type: 'vec4<f32>' },
        });
        const green = new UniformGroup({
            uColor: { value: new Float32Array([0, 1, 0, 1]), type: 'vec4<f32>' },
        });

        const bindGroup = new BindGroup({ 0: red });

        const shader = Shader.from({
            gpu: {
                name: 'rebind-repointed-bindgroup',
                vertex: {
                    entryPoint: 'main',
                    source: /* wgsl */`
                        @vertex
                        fn main(@location(0) aPosition: vec2<f32>) -> @builtin(position) vec4<f32> {
                            return vec4<f32>(aPosition, 0.0, 1.0);
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
            groups: { 0: bindGroup },
        });

        const state = State.for2d();

        const container = new RenderContainer({
            render: (renderer: Renderer) =>
            {
                const encoder = (renderer as WebGPURenderer).encoder;

                bindGroup.setResource(red, 0);
                encoder.draw({ geometry: left, shader, state });

                bindGroup.setResource(green, 0);
                encoder.draw({ geometry: right, shader, state });
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
