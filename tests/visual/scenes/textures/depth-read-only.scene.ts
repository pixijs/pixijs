import { Geometry, RenderTarget, Shader, State, Texture, TextureSource } from '~/rendering';
import { TextureView } from '~/rendering/renderers/shared/texture/TextureView';
import { Mesh, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should support reading from a depth texture while it is attached as depthReadOnly',
    renderers: {
        webgpu: true,
        webgl2: false,
        webgl1: false,
    },
    create: async (scene: Container, renderer: Renderer) =>
    {
        // 1. Create a colour texture to render into.
        const colorSource = new TextureSource({
            width: 128,
            height: 128,
            resolution: 1,
            mipLevelCount: 1,
            autoGenerateMipmaps: false,
        });

        const colorTexture = new Texture({ source: colorSource });

        // 2. Create the shared depth-stencil texture.
        const depthStencilSource = new TextureSource({
            width: 128,
            height: 128,
            resolution: 1,
            format: 'depth24plus-stencil8',
            mipLevelCount: 1,
            autoGenerateMipmaps: false,
        });

        depthStencilSource.style.scaleMode = 'nearest';

        // 3. RenderTarget A: normal depth writing
        const renderTargetWrite = new RenderTarget({
            colorAttachments: [
                {
                    texture: colorSource,
                    loadOp: 'clear',
                    storeOp: 'store',
                    clearValue: [0, 0, 0, 1]
                }
            ],
            depthStencilAttachment: {
                texture: depthStencilSource,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
                depthClearValue: 1.0,
                // stencilLoadOp: 'clear',
                // stencilStoreOp: 'store',
            }
        });

        // 4. RenderTarget B: same textures, but depth is read-only
        const renderTargetReadOnly = new RenderTarget({
            colorAttachments: [
                {
                    texture: colorSource,
                    loadOp: 'load',
                    storeOp: 'store',
                }
            ],
            depthStencilAttachment: {
                texture: depthStencilSource,
                depthReadOnly: true,
            }
        });

        // --- FIRST PASS: Write to depth ---
        const writeDepthShaderSrc = /* wgsl */`
            struct VSOutput {
                @builtin(position) position: vec4<f32>,
            };

            @vertex
            fn vsMain(@location(0) aPosition : vec2<f32>) -> VSOutput {
                var out: VSOutput;
                // Render at depth = 0.5
                out.position = vec4<f32>(aPosition, 0.5, 1.0);
                return out;
            }

            @fragment
            fn fsMain() -> @location(0) vec4<f32> {
                return vec4<f32>(1.0, 0.0, 0.0, 1.0); // Red
            }
        `;

        const writeQuadGeom = new Geometry({
            attributes: {
                aPosition: [-1, -1, 0, -1, 0, 1, -1, -1, 0, 1, -1, 1], // Left half
            },
        });

        const depthWriteState = new State();

        depthWriteState.depthTest = true;
        depthWriteState.depthMask = true;

        const writeMesh = new Mesh({
            geometry: writeQuadGeom,
            shader: Shader.from({
                gpu: {
                    vertex: { source: writeDepthShaderSrc, entryPoint: 'vsMain' },
                    fragment: { source: writeDepthShaderSrc, entryPoint: 'fsMain' },
                }
            }),
            state: depthWriteState,
        });

        // Render first pass (writes red color and 0.5 depth to the left half)
        renderer.render({
            target: renderTargetWrite,
            container: writeMesh,
            clear: true,
            clearColor: [0, 0, 0, 1],
        });

        // --- SECOND PASS: Read depth in shader while it is bound as depthReadOnly ---
        const readDepthShaderSrc = /* wgsl */`
            @group(0) @binding(1) var uDepthTexture: texture_depth_2d;

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
                // Read the depth texture directly without a sampler
                let dimensions = textureDimensions(uDepthTexture);
                let coord = vec2<i32>(uv * vec2<f32>(dimensions));
                let depthValue = textureLoad(uDepthTexture, coord, 0);
                
                // Output depth value as grayscale color
                return vec4<f32>(depthValue, depthValue, depthValue, 1.0);
            }
        `;

        const readQuadGeom = new Geometry({
            attributes: {
                aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1], // Full screen
                aUV: [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
            },
        });

        const depthReadState = new State();

        depthReadState.depthTest = true;
        depthReadState.depthMask = false; // Important: we must not write to depth in this pass!

        // Create a TextureView to sample only the depth aspect
        const depthTextureView = new TextureView(depthStencilSource, { aspect: 'depth-only' });

        const readMesh = new Mesh({
            geometry: readQuadGeom,
            shader: Shader.from({
                gpu: {
                    vertex: { source: readDepthShaderSrc, entryPoint: 'vsMain' },
                    fragment: { source: readDepthShaderSrc, entryPoint: 'fsMain' },
                },
                resources: {
                    uDepthTexture: depthTextureView,
                }
            }),
            state: depthReadState,
        });

        // Render second pass (samples the depth texture and writes it as grayscale over the full screen)
        // Since we bound renderTargetReadOnly, depth stencil attachment should be read-only!
        renderer.render({
            target: renderTargetReadOnly,
            container: readMesh,
            clear: false,
        });

        // Display the result
        const result = new Sprite(colorTexture);

        scene.addChild(result);
    },
};
