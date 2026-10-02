import { CLEAR, Geometry, RenderTarget, Shader, State, Texture, TextureSource } from '~/rendering';
import { Container, Mesh, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';

export const scene: TestScene = {
    it: 'should resolve depth from an antialiased render target via copyDepthTexture',
    renderers: {
        webgpu: true,
        webgl2: true,
        webgl1: false,
        canvas: false,
    },
    create: async (scene: Container, renderer: Renderer) =>
    {
        // -- Textures and targets --

        // antialiased, so its depth is multisampled and the copy has to resolve it
        const sourceRT = new RenderTarget({ width: 128, height: 128, antialias: true, depthStencilTexture: true });

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

        const destDepthTexture = new Texture({ source: destDepthSource });

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
                depthClearValue: 1.0,
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

        const quad = (geometry: Geometry, color: number[], depth: number) => new Mesh({
            geometry,
            shader: Shader.from({
                gl: glShader,
                gpu: {
                    vertex: { source: gpuShaderSrc, entryPoint: 'vsMain' },
                    fragment: { source: gpuShaderSrc, entryPoint: 'fsMain' },
                },
                resources: {
                    uniforms: {
                        uTestColor: { value: color, type: 'vec4<f32>' },
                        uDepth: { value: depth, type: 'f32' },
                    },
                },
            }),
            state: depthState,
        });

        // -- PASS 1: a green left-half quad at depth 0.3 into the antialiased source (x 0-64) --

        renderer.render({
            target: sourceRT,
            container: quad(leftQuadGeom, [0, 1, 0, 1], 0.3),
            clear: true,
            clearColor: [0, 0, 0, 1],
        });

        // clear the destination's depth to 1 so only the copied region can block anything
        renderer.render({ target: destRT, container: new Container(), clear: true });

        // -- COPY: source x 32-96, y 16-112 into destination x 16-80, y 0-96 --
        // The quad's depth lands at destination x 16-48; destination x 48-80 gets the source's cleared depth.

        renderer.renderTarget.copyDepthTexture(
            sourceRT,
            destDepthTexture,
            { x: 32, y: 16 },
            { width: 64, height: 96 },
            { x: 16, y: 0 },
        );

        // -- PASS 2: a full-screen red quad at depth 0.5 into the destination, keeping the copied depth --

        renderer.render({
            target: destRT,
            container: quad(fullQuadGeom, [1, 0, 0, 1], 0.5),
            clear: CLEAR.COLOR,
            clearColor: [0, 0, 0, 1],
        });

        // Expected: red everywhere but a black (depth-blocked) stripe at x 16-48 over the copied rows.
        scene.addChild(new Sprite(destColorTexture));
    },
};
