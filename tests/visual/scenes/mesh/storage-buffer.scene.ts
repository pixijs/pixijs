import { Buffer, BufferResource, BufferUsage, Geometry, Shader } from '~/rendering';
import { Mesh } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render a mesh using a storage buffer (SSBO)',
    only: true,
    renderers: {
        webgl1: false,
        webgl2: false,
        webgpu: true,
    },
    create: async (scene: Container) =>
    {
        // Create a storage buffer with color data
        // Each color is 4 floats (RGBA), we'll store 4 colors for the corners
        const colorData = new Float32Array([
            1.0, 0.0, 0.0, 1.0, // Red (top-left)
            0.0, 1.0, 0.0, 1.0, // Green (top-right)
            0.0, 0.0, 1.0, 1.0, // Blue (bottom-right)
            1.0, 1.0, 0.0, 1.0, // Yellow (bottom-left)
        ]);

        // Create the buffer with STORAGE usage
        const buffer = new Buffer({
            data: colorData,
            usage: BufferUsage.STORAGE | BufferUsage.COPY_DST,
            label: 'colorStorageBuffer',
        });

        // Create a BufferResource with isStorage: true
        const storageResource = new BufferResource({
            buffer,
        });

        const geometry = new Geometry({
            attributes: {
                aPosition: [
                    -50, -50, // top-left
                    50, -50, // top-right
                    50, 50, // bottom-right
                    -50, 50, // bottom-left
                ],
                aColorIndex: [
                    0, // top-left uses color 0
                    1, // top-right uses color 1
                    2, // bottom-right uses color 2
                    3, // bottom-left uses color 3
                ]
            },
            indexBuffer: [0, 1, 2, 0, 2, 3]
        });

        // WebGL shader - uses texture sampling for storage buffer fallback
        const gl = {
            vertex: `
                in vec2 aPosition;
                in float aColorIndex;

                out float vColorIndex;

                uniform mat3 uProjectionMatrix;
                uniform mat3 uWorldTransformMatrix;
                uniform mat3 uTransformMatrix;

                void main() {
                    mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
                    gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
                    vColorIndex = aColorIndex;
                }
            `,
            fragment: `
                in float vColorIndex;

                uniform sampler2D uStorageBuffer;
                uniform vec2 uStorageBufferSize;

                void main() {
                    // Calculate UV to sample from the storage texture
                    // Each color is 4 floats (1 pixel in RGBA32F)
                    float index = floor(vColorIndex);
                    vec2 uv = vec2((index + 0.5) / uStorageBufferSize.x, 0.5);
                    vec4 color = texture(uStorageBuffer, uv);
                    gl_FragColor = color;
                }
            `,
        };

        // WebGPU shader - uses actual storage buffer
        const gpu = {
            vertex: {
                entryPoint: 'main',
                source: /* wgsl */`
                    struct GlobalUniforms {
                        uProjectionMatrix: mat3x3<f32>,
                        uWorldTransformMatrix: mat3x3<f32>,
                        uWorldColorAlpha: vec4<f32>,
                        uResolution: vec2<f32>,
                    }

                    struct LocalUniforms {
                        uTransformMatrix: mat3x3<f32>,
                        uColor: vec4<f32>,
                        uRound: f32,
                    }

                    @group(0) @binding(0) var<uniform> globalUniforms: GlobalUniforms;
                    @group(1) @binding(0) var<uniform> localUniforms: LocalUniforms;

                    struct VertexOutput {
                        @builtin(position) position: vec4<f32>,
                        @location(0) vColorIndex: f32,
                    };

                    @vertex
                    fn main(
                        @location(0) aPosition: vec2<f32>,
                        @location(1) aColorIndex: f32,
                    ) -> VertexOutput {
                        var mvp = globalUniforms.uProjectionMatrix
                            * globalUniforms.uWorldTransformMatrix
                            * localUniforms.uTransformMatrix;

                        var output: VertexOutput;
                        output.position = vec4<f32>(mvp * vec3<f32>(aPosition, 1.0), 1.0);
                        output.vColorIndex = aColorIndex;

                        return output;
                    };
                `
            },
            fragment: {
                entryPoint: 'main',
                source: /* wgsl */`
                    struct ColorData {
                        colors: array<vec4<f32>, 4>,
                    }

                    @group(2) @binding(0) var<storage, read> uStorageBuffer: ColorData;

                    @fragment
                    fn main(
                        @location(0) vColorIndex: f32,
                    ) -> @location(0) vec4<f32> {
                        let index = u32(floor(vColorIndex));
                        return uStorageBuffer.colors[index];
                    };
                `
            },
        };

        const shader = Shader.from({
            gl,
            gpu,
            resources: {
                uStorageBuffer: storageResource,
                storageBufferUniforms: {
                    uStorageBufferSize: { value: [4, 1], type: 'vec2<f32>' },
                }
            }
        });

        const mesh = new Mesh({
            geometry,
            shader,
        });

        mesh.position.set(128 / 2, 128 / 2);

        scene.addChild(mesh);
    },
};
