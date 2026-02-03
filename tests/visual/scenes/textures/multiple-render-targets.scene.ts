import { Mesh } from '../../../../src/scene/mesh/shared/Mesh';
import { Sprite } from '../../../../src/scene/sprite/Sprite';
import { Geometry, RenderTarget, Shader, Texture } from '~/rendering';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should render to multiple color attachments (MRT)',
    pixelMatch: 500,
    create: async (scene: Container, renderer: Renderer) =>
    {
        // Check if MRT is supported

        // Create a render target with 3 color attachments
        const renderTarget = new RenderTarget({
            width: 128 / 2,
            height: 128 / 2,
            colorTextures: 3, // Create 3 color textures
        });

        // Create a simple quad geometry
        const geometry = new Geometry({
            attributes: {
                aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1],
                aUV: [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
            },
            indexBuffer: [0, 1, 2, 3, 4, 5],
        });

        const isWebGL1 = (renderer as any).context?.webGLVersion === 1;

        // Shader that writes different colors to different render targets
        const shader = Shader.from({
            gl: {
                vertex: `
                    in vec2 aPosition;
                    in vec2 aUV;
                    out vec2 vUV;

                    void main() {
                        vUV = aUV;
                        gl_Position = vec4(aPosition, 0.0, 1.0);
                    }
                `,
                fragment: `
                    ${isWebGL1
                            ? `#extension GL_EXT_draw_buffers : require`
                            : `#version 300 es
                            layout(location = 0) out vec4 outColour0;
                            layout(location = 1) out vec4 outColour1;
                            layout(location = 2) out vec4 outColour2;`
                    }

                    precision mediump float;
                    in vec2 vUV;

                    void main() {

                    ${isWebGL1
                            ? `gl_FragData[0] = vec4(vUV.x, 0.0, 0.0, 1.0);          // Red gradient
                            gl_FragData[1] = vec4(0.0, vUV.y, 0.0, 1.0);          // Green gradient
                            gl_FragData[2] = vec4(0.0, 0.0, vUV.x * vUV.y, 1.0);   // Blue gradient`
                            : `outColour0 = vec4(vUV.x, 0.0, 0.0, 1.0);          // Red gradient
                            outColour1 = vec4(0.0, vUV.y, 0.0, 1.0);          // Green gradient
                            outColour2 = vec4(0.0, 0.0, vUV.x * vUV.y, 1.0);   // Blue gradient`
                    }
                    }
                `,
            },
            gpu: {
                vertex: {
                    entryPoint: 'main',
                    source: `
                        struct VSOutput {
                            @builtin(position) position: vec4<f32>,
                            @location(0) uv: vec2<f32>,
                        };

                        @vertex
                        fn main(
                            @location(0) aPosition: vec2<f32>,
                            @location(1) aUV: vec2<f32>,
                        ) -> VSOutput {
                            var output: VSOutput;
                            output.position = vec4<f32>(aPosition, 0.0, 1.0);
                            output.uv = aUV;
                            return output;
                        }
                    `,
                },
                fragment: {
                    entryPoint: 'main',
                    source: `
                        struct FragmentOutput {
                            @location(0) color0: vec4<f32>,
                            @location(1) color1: vec4<f32>,
                            @location(2) color2: vec4<f32>,
                        };

                        @fragment
                        fn main(@location(0) uv: vec2<f32>) -> FragmentOutput {
                            var output: FragmentOutput;
                            output.color0 = vec4<f32>(uv.x, 0.0, 0.0, 1.0);      // Red gradient
                            output.color1 = vec4<f32>(0.0, uv.y, 0.0, 1.0);      // Green gradient
                            output.color2 = vec4<f32>(0.0, 0.0, uv.x * uv.y, 1.0); // Blue gradient
                            return output;
                        }
                    `,
                },
            },
        });

        const quad = new Mesh({ geometry, shader });

        // Render to the MRT
        renderer.render({
            target: renderTarget,
            container: quad,
        });

        // Create textures from the render target's color attachments
        const texture0 = new Texture({ source: renderTarget.colorTextures[0] });
        const texture1 = new Texture({ source: renderTarget.colorTextures[1] });
        const texture2 = new Texture({ source: renderTarget.colorTextures[2] });

        // Display the three textures side by side
        const sprite0 = new Sprite(texture0);
        const sprite1 = new Sprite(texture1);
        const sprite2 = new Sprite(texture2);

        sprite0.position.set(0, 0);
        sprite1.position.set(128 / 2, 0);
        sprite2.position.set(0, 128 / 2);

        scene.addChild(sprite0);
        scene.addChild(sprite1);
        scene.addChild(sprite2);

        // Add labels
    },
};

