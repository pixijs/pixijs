import { Geometry, RenderTarget, Shader, Texture, TextureSource } from '~/rendering';
import { Mesh, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should support reading from a color texture that was previously rendered to',
    renderers: {
        webgpu: true,
        webgl2: false,
        webgl1: false,
    },
    create: async (scene: Container, renderer: Renderer) =>
    {
        // 1. Create the color texture we will render to in pass 1, then read in pass 2.
        const sharedColorSource = new TextureSource({
            width: 128,
            height: 128,
            resolution: 1,
            mipLevelCount: 1,
            autoGenerateMipmaps: false,
        });

        const _sharedColorTexture = new Texture({ source: sharedColorSource });

        // 2. Create a second color texture for the final output (pass 2 writes here).
        const outputColorSource = new TextureSource({
            width: 128,
            height: 128,
            resolution: 1,
            mipLevelCount: 1,
            autoGenerateMipmaps: false,
        });

        const outputColorTexture = new Texture({ source: outputColorSource });

        // 3. RenderTarget A: renders into the shared color texture.
        const renderTargetWrite = new RenderTarget({
            colorAttachments: [
                {
                    texture: sharedColorSource,
                    loadOp: 'clear',
                    storeOp: 'store',
                    clearValue: [0, 0, 0, 1],
                }
            ],
        });

        // 4. RenderTarget B: renders into the output texture (pass 2 reads sharedColorSource).
        const renderTargetRead = new RenderTarget({
            colorAttachments: [
                {
                    texture: outputColorSource,
                    loadOp: 'clear',
                    storeOp: 'store',
                    clearValue: [0, 0, 0, 1],
                }
            ],
        });

        // --- FIRST PASS: Write colored quads to the shared color texture ---
        const writeColorShaderSrc = /* wgsl */`
            struct VSOutput {
                @builtin(position) position: vec4<f32>,
                @location(0) uv: vec2<f32>,
            };

            @vertex
            fn vsMain(@location(0) aPosition : vec2<f32>) -> VSOutput {
                var out: VSOutput;
                out.position = vec4<f32>(aPosition, 0.0, 1.0);
                out.uv = aPosition * 0.5 + 0.5;
                return out;
            }

            @fragment
            fn fsMain(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
                // Left half = red, blending to green across
                return vec4<f32>(1.0 - uv.x, uv.x, uv.y, 1.0);
            }
        `;

        const writeQuadGeom = new Geometry({
            attributes: {
                aPosition: [-1, -1, 0, -1, 0, 1, -1, -1, 0, 1, -1, 1], // Left half
            },
        });

        const writeMesh = new Mesh({
            geometry: writeQuadGeom,
            shader: Shader.from({
                gpu: {
                    vertex: { source: writeColorShaderSrc, entryPoint: 'vsMain' },
                    fragment: { source: writeColorShaderSrc, entryPoint: 'fsMain' },
                }
            }),
        });

        // Render first pass (writes a gradient to the left half of the shared color texture)
        renderer.render({
            target: renderTargetWrite,
            container: writeMesh,
            clear: true,
            clearColor: [0, 0, 0, 1],
        });

        // --- SECOND PASS: Read the shared color texture in a shader ---
        const readColorShaderSrc = /* wgsl */`
            @group(0) @binding(1) var uColorTexture: texture_2d<f32>;

            struct VSOutput {
                @builtin(position) position: vec4<f32>,
                @location(0) uv: vec2<f32>,
            };

            @vertex
            fn vsMain(@location(0) aPosition : vec2<f32>, @location(1) aUV: vec2<f32>) -> VSOutput {
                var out: VSOutput;
                out.position = vec4<f32>(aPosition, 0.0, 1.0);
                out.uv = aUV;
                return out;
            }

            @fragment
            fn fsMain(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
                let dimensions = textureDimensions(uColorTexture);
                let coord = vec2<i32>(uv * vec2<f32>(dimensions));
                let color = textureLoad(uColorTexture, coord, 0);

                return color;
            }
        `;

        const readQuadGeom = new Geometry({
            attributes: {
                aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1], // Full screen
                aUV: [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
            },
        });

        const readMesh = new Mesh({
            geometry: readQuadGeom,
            shader: Shader.from({
                gpu: {
                    vertex: { source: readColorShaderSrc, entryPoint: 'vsMain' },
                    fragment: { source: readColorShaderSrc, entryPoint: 'fsMain' },
                },
                resources: {
                    uColorTexture: sharedColorSource,
                }
            }),
        });

        // Render second pass (reads the shared color texture and writes to the output texture)
        renderer.render({
            target: renderTargetRead,
            container: readMesh,
            clear: true,
            clearColor: [0, 0, 0, 1],
        });

        // Display the result
        const result = new Sprite(outputColorTexture);

        scene.addChild(result);
    },
};
