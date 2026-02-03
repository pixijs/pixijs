import { Geometry, RenderTarget, Shader, Texture, TextureSource } from '~/rendering';
import { Mesh } from '~/scene/mesh/shared/Mesh';
import { Sprite } from '~/scene/sprite/Sprite';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render to MRT at a specific mip level',
    excludeRenderers: ['webgl1'],
    create: async (scene: Container, renderer: Renderer) =>
    {
        // IMPORTANT: mipLevelCount must be set before the GPU texture is created.
        // If you set it after first use, the GPU texture won't gain mip levels and rendering to mip>0 will be invalid.
        const src0 = new TextureSource({
            width: 128,
            height: 128,
            resolution: 1,
            mipLevelCount: 4,
            autoGenerateMipmaps: false,
        });

        const src1 = new TextureSource({
            width: 128,
            height: 128,
            resolution: 1,
            mipLevelCount: 4,
            autoGenerateMipmaps: false,
        });

        const tex0 = new Texture({ source: src0 });
        const tex1 = new Texture({ source: src1 });

        // Create a render target with 2 color attachments, each mip-capable.
        const renderTarget = new RenderTarget({
            colorTextures: [tex0, tex1],
        });

        // Create a simple quad geometry
        const geometry = new Geometry({
            attributes: {
                aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1],
                aUV: [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
            },
            indexBuffer: [0, 1, 2, 3, 4, 5],
        });

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
                fragment: `#version 300 es
                    precision mediump float;
                    in vec2 vUV;
                    layout(location = 0) out vec4 outColour0;
                    layout(location = 1) out vec4 outColour1;

                    void main() {
                        outColour0 = vec4(vUV.x, 0.0, 0.0, 1.0); // red gradient
                        outColour1 = vec4(0.0, vUV.y, 0.0, 1.0); // green gradient
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
                        };

                        @fragment
                        fn main(@location(0) uv: vec2<f32>) -> FragmentOutput {
                            var output: FragmentOutput;
                            output.color0 = vec4<f32>(uv.x, 0.0, 0.0, 1.0);
                            output.color1 = vec4<f32>(0.0, uv.y, 0.0, 1.0);
                            return output;
                        }
                    `,
                },
            },
        });

        const quad = new Mesh({ geometry, shader });

        // Render something obvious into mip 0 first, so if sampling accidentally picks mip 0 you'll see it.
        const shaderMip0 = Shader.from({
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
                fragment: `#version 300 es
                    precision mediump float;
                    in vec2 vUV;
                    layout(location = 0) out vec4 outColour0;
                    layout(location = 1) out vec4 outColour1;

                    void main() {
                        // solid colors
                        outColour0 = vec4(0.0, 0.0, 1.0, 1.0); // blue
                        outColour1 = vec4(1.0, 1.0, 0.0, 1.0); // yellow
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
                        };

                        @fragment
                        fn main(@location(0) uv: vec2<f32>) -> FragmentOutput {
                            var output: FragmentOutput;
                            output.color0 = vec4<f32>(0.0, 0.0, 1.0, 1.0);
                            output.color1 = vec4<f32>(1.0, 1.0, 0.0, 1.0);
                            return output;
                        }
                    `,
                },
            },
        });

        const quadMip0 = new Mesh({ geometry, shader: shaderMip0 });

        renderer.render({
            target: renderTarget,
            container: quadMip0,
            mipLevel: 0,
            clear: true,
            clearColor: [0, 0, 0, 1],
        });

        // Render into mip 1 (64x64) of both attachments (gradients).
        renderer.render({
            target: renderTarget,
            container: quad,
            mipLevel: 1,
            clear: true,
            clearColor: [0, 0, 0, 1],
        });

        // Create textures from the render target's color attachments.
        const texture0 = new Texture({ source: renderTarget.colorTextures[0] });
        const texture1 = new Texture({ source: renderTarget.colorTextures[1] });

        // Display the two textures side by side.
        const sprite0 = new Sprite(texture0);
        const sprite1 = new Sprite(texture1);

        // Encourage mip 1 sampling.
        texture0.source.minFilter = 'linear';
        texture1.source.minFilter = 'linear';
        texture0.source.mipmapFilter = 'linear';
        texture1.source.mipmapFilter = 'linear';

        sprite0.scale.set(0.5);
        sprite1.scale.set(0.5);
        sprite0.position.set(0, 0);
        sprite1.position.set(64, 0);
        scene.addChild(sprite0, sprite1);
    },
};
