import { Geometry, GlProgram, GpuProgram, Shader } from '~/rendering';
import { Mesh } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

/**
 * NOTE on the result:
 * The webGL triangles will be upside down in this test - this is actually correct as rendering to a
 * texture in WebGL causes it to be inverted on the Y. This is not the case in WebGPU
 * We usually handle this automatically with our transform uniforms, but as this example
 * does not use them.. they come out flipped!
 */
export const scene: TestScene = {
    it: 'should render a fully custom mesh',
    create: async (scene: Container) =>
    {
        // Create our application instance
        const shaderSrc = `
            struct MyUniforms {
                uTint: vec4<f32>,
            }

            @binding(0) @group(0) var<uniform> myUniforms : MyUniforms;

            @vertex
            fn vsMain(
                @location(0) aPosition : vec2<f32>,
            ) -> @builtin(position) vec4f {
            return vec4f(aPosition, 0, 1);
            }

            @fragment
            fn fsMain() -> @location(0) vec4<f32> {
                return myUniforms.uTint;
            }
        `;

        const geometry = new Geometry({
            attributes: {
                aPosition: [-1, -1, -1, 1, 1, 1, 1, -1],
            },
            indexBuffer: [0, 1, 2, 0, 2, 3],
        });

        const gpuProgram = new GpuProgram({
            name: 'my-shader',
            vertex: {
                source: shaderSrc,
                entryPoint: 'vsMain'
            },
            fragment: {
                source: shaderSrc,
                entryPoint: 'fsMain'
            }
        });

        const glProgram = new GlProgram({
            name: 'my-shader',
            vertex: `
            attribute vec2 aPosition;

            void main() {
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `,
            fragment: `

            uniform vec4 uTint;

            void main() {
                gl_FragColor = uTint;
            }
        `
        });

        const shader = new Shader({
            glProgram,
            gpuProgram,
            resources: {
                myUniforms: {
                    uTint: {
                        value: [1, 1, 0, 1],
                        type: 'vec4<f32>'
                    }
                }
            }
        });

        const mesh = new Mesh({
            geometry,
            shader,
        });

        scene.addChild(mesh);
    },
};
