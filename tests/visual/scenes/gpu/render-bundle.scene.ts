import { Geometry, Shader, State } from '~/rendering';
import { RenderContainer } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer, WebGPURenderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render correctly via a WebGPU render bundle',
    renderers: ['webgpu'],
    create: async (scene: Container) =>
    {
        // Positions are in clip space (-1 to 1) so no uniforms are needed.
        const geometry = new Geometry({
            attributes: {
                aPosition: [
                    -0.5, -0.5,
                    0.5, -0.5,
                    0.0, 0.5,
                ],
            },
        });

        const shader = Shader.from({
            gpu: {
                vertex: {
                    entryPoint: 'main',
                    source: /* wgsl */`
                        @vertex
                        fn main(
                            @location(0) aPosition : vec2<f32>,
                        ) -> @builtin(position) vec4<f32> {
                            return vec4<f32>(aPosition, 0.0, 1.0);
                        };
                    `,
                },
                fragment: {
                    entryPoint: 'main',
                    source: /* wgsl */`
                        @fragment
                        fn main() -> @location(0) vec4<f32> {
                            return vec4<f32>(1.0, 0.0, 0.0, 1.0);
                        }
                    `,
                },
            },
        });

        const state = State.for2d();

        const container = new RenderContainer({
            render: (renderer: Renderer) =>
            {
                const gpuRenderer = renderer as WebGPURenderer;
                const encoder = gpuRenderer.encoder;

                encoder.beginBundle();
                encoder.draw({ geometry, shader, state });
                const bundle = encoder.endBundle();

                encoder.executeBundle(bundle);
            },
            addBounds: (bounds) =>
            {
                bounds.minX = -0.5;
                bounds.minY = -0.5;
                bounds.maxX = 0.5;
                bounds.maxY = 0.5;
            },
        });

        scene.addChild(container);
    },
};
