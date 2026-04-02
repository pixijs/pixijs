import { CLEAR, Geometry, RenderTarget, Shader, State, Texture, TextureSource } from '~/rendering';
import { Mesh, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should copy depth from one render target to another via copyDepthTexture',
    renderers: {
        webgpu: true,
        webgl2: true,
        webgl1: false,
    },
    create: async (scene: Container, renderer: Renderer) =>
    {
        // -- Textures --

        const sourceColorSource = new TextureSource({
            width: 128,
            height: 128,
            resolution: 1,
            mipLevelCount: 1,
            autoGenerateMipmaps: false,
        });

        const sourceDepthSource = new TextureSource({
            width: 128,
            height: 128,
            resolution: 1,
            format: 'depth24plus-stencil8',
            mipLevelCount: 1,
            autoGenerateMipmaps: false,
        });

        const destColorSource = new TextureSource({
            width: 128,
            height: 128,
            resolution: 1,
            mipLevelCount: 1,
            autoGenerateMipmaps: false,
        });

        const destColorTexture = new Texture({ source: destColorSource });

        const destDepthSource = new TextureSource({
            width: 128,
            height: 128,
            resolution: 1,
            format: 'depth24plus-stencil8',
            mipLevelCount: 1,
            autoGenerateMipmaps: false,
        });

        // -- Render Targets --

        const sourceRT = new RenderTarget({
            colorAttachments: [{
                texture: sourceColorSource,
                loadOp: 'clear',
                storeOp: 'store',
                clearValue: [0, 0, 0, 1],
            }],
            depthStencilAttachment: {
                texture: sourceDepthSource,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
                depthClearValue: 1.0,
            },
        });

        const destRT = new RenderTarget({
            colorAttachments: [{
                texture: destColorSource,
                loadOp: 'clear',
                storeOp: 'store',
                clearValue: [0, 0, 0, 1],
            }],
            depthStencilAttachment: {
                texture: destDepthSource,
                depthLoadOp: 'load',
                depthStoreOp: 'store',
            },
        });

        // -- Shaders --

        // IMPORTANT NOTE FOR CUSTOM SHADERS ON MESHES:
        // Do NOT use the uniform name `uColor` in your custom shaders if you are
        // rendering them via `Mesh`. PixiJS's `MeshPipe` injects its own `localUniforms`
        // which includes a `uColor` property (used for mesh tinting).
        // In WebGPU, this is fine if you use a different bind group, but in WebGL,
        // uniforms share a flat namespace per program, and the internal `uColor`
        // will overwrite your custom uniform! Use a distinct name like `uTestColor`.
        const gpuShaderSrc = /* wgsl */`
            struct Uniforms {
                uTestColor: vec4<f32>,
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
                return uniforms.uTestColor;
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
                uniform vec4 uTestColor;
                out vec4 fragColor;
                void main() {
                    fragColor = uTestColor;
                }
            `,
        };

        // Left-half quad
        const leftQuadGeom = new Geometry({
            attributes: {
                aPosition: [-1, -1, 0, -1, 0, 1, -1, -1, 0, 1, -1, 1],
            },
        });

        // Full-screen quad
        const fullQuadGeom = new Geometry({
            attributes: {
                aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1],
            },
        });

        const depthState = new State();

        depthState.depthTest = true;
        depthState.depthMask = true;
        depthState.blendMode = 'none';

        // -- PASS 1: Write a green left-half quad at depth 0.3 into sourceRT --

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
                        uTestColor: { value: [0, 1, 0, 1], type: 'vec4<f32>' },
                        uDepth: { value: 0.3, type: 'f32' },
                    },
                },
            }),
            state: depthState,
        });

        renderer.render({
            target: sourceRT,
            container: greenQuad,
            clear: true,
            clearColor: [0, 0, 0, 1],
        });

        // -- COPY: Copy the depth buffer from sourceRT to destRT --

        renderer.renderTarget.copyDepthTexture(sourceRT, destRT);

        // -- PASS 2: Render a full-screen red quad at depth 0.5 into destRT --
        // The left half should be blocked by the copied depth (0.3 < 0.5),
        // so only the right half should show red.
        //
        // IMPORTANT NOTE FOR DEPTH/STENCIL PRESERVATION:
        // We MUST explicitly clear ONLY the color buffer here (`clear: CLEAR.COLOR`).
        // If we passed `clear: false`, the newly created `destRT`'s color attachment
        // would be completely uninitialized (transparent), causing the background
        // to bleed through where the depth test fails.
        // If we passed `clear: true`, we would inadvertently clear the Depth buffer
        // that we just painstakingly copied!

        const redQuad = new Mesh({
            geometry: fullQuadGeom,
            shader: Shader.from({
                gl: glShader,
                gpu: {
                    vertex: { source: gpuShaderSrc, entryPoint: 'vsMain' },
                    fragment: { source: gpuShaderSrc, entryPoint: 'fsMain' },
                },
                resources: {
                    uniforms: {
                        uTestColor: { value: [1, 0, 0, 1], type: 'vec4<f32>' },
                        uDepth: { value: 0.5, type: 'f32' },
                    },
                },
            }),
            state: depthState,
        });

        renderer.render({
            target: destRT,
            container: redQuad,
            clear: CLEAR.COLOR,
            clearColor: [0, 0, 0, 1],
        });

        // Expected: left half = black (depth-blocked), right half = red.
        const result = new Sprite(destColorTexture);

        scene.addChild(result);
    },
};
