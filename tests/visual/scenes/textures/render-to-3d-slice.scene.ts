import { Geometry, Shader, TextureSource } from '~/rendering';
import { Mesh } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render to each depth slice of a 3D texture and sample them back',
    renderers: ['webgpu', 'webgl2'],
    create: async (scene: Container, renderer: Renderer) =>
    {
        const volume = new TextureSource({
            width: 64,
            height: 64,
            depth: 4,
            format: 'rgba8unorm',
            scaleMode: 'nearest',
        });

        const solidQuad = new Geometry({
            attributes: {
                aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1],
            },
        });

        const solidWgsl = /* wgsl */`
            struct Uniforms {
                uSliceColor: vec4<f32>,
            }

            @group(0) @binding(0) var<uniform> uniforms: Uniforms;

            @vertex
            fn vsMain(@location(0) aPosition: vec2<f32>) -> @builtin(position) vec4<f32> {
                return vec4<f32>(aPosition, 0.0, 1.0);
            }

            @fragment
            fn fsMain() -> @location(0) vec4<f32> {
                return uniforms.uSliceColor;
            }
        `;

        const solid = new Mesh({
            geometry: solidQuad,
            shader: Shader.from({
                gl: {
                    vertex: `#version 300 es
                        in vec2 aPosition;
                        void main() {
                            gl_Position = vec4(aPosition, 0.0, 1.0);
                        }
                    `,
                    fragment: `#version 300 es
                        uniform vec4 uSliceColor;
                        out vec4 fragColor;
                        void main() {
                            fragColor = uSliceColor;
                        }
                    `,
                },
                gpu: {
                    vertex: { source: solidWgsl, entryPoint: 'vsMain' },
                    fragment: { source: solidWgsl, entryPoint: 'fsMain' },
                },
                resources: {
                    uniforms: {
                        uSliceColor: { value: [0, 0, 0, 1], type: 'vec4<f32>' },
                    },
                },
            }),
        });

        // red, green, blue, yellow into slices 0 to 3
        const sliceColors = [
            [1, 0, 0, 1],
            [0, 1, 0, 1],
            [0, 0, 1, 1],
            [1, 1, 0, 1],
        ];

        for (let z = 0; z < sliceColors.length; z++)
        {
            solid.shader.resources.uniforms.uniforms.uSliceColor = sliceColors[z];

            renderer.render({ container: solid, target: volume, layer: z, clear: true });
        }

        // sample it back: four columns, one slice each
        const sampleWgsl = /* wgsl */`
            @group(0) @binding(0) var uVolume: texture_3d<f32>;
            @group(0) @binding(1) var uVolumeSampler: sampler;

            struct VSOutput {
                @builtin(position) position: vec4<f32>,
                @location(0) uv: vec2<f32>,
            };

            @vertex
            fn vsMain(@location(0) aPosition: vec2<f32>, @location(1) aUV: vec2<f32>) -> VSOutput {
                var out: VSOutput;
                out.position = vec4<f32>(aPosition, 0.0, 1.0);
                out.uv = aUV;
                return out;
            }

            @fragment
            fn fsMain(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
                let slice = floor(uv.x * 4.0);

                return textureSample(uVolume, uVolumeSampler, vec3<f32>(fract(uv.x * 4.0), uv.y, (slice + 0.5) / 4.0));
            }
        `;

        const sample = new Mesh({
            geometry: new Geometry({
                attributes: {
                    aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1],
                    aUV: [0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0],
                },
            }),
            shader: Shader.from({
                gl: {
                    vertex: `#version 300 es
                        in vec2 aPosition;
                        in vec2 aUV;
                        out vec2 vUV;
                        void main() {
                            vUV = aUV;
                            gl_Position = vec4(aPosition, 0.0, 1.0);
                        }
                    `,
                    fragment: `#version 300 es
                        in vec2 vUV;
                        uniform sampler3D uVolume;
                        out vec4 fragColor;
                        void main() {
                            float slice = floor(vUV.x * 4.0);

                            fragColor = texture(uVolume, vec3(fract(vUV.x * 4.0), vUV.y, (slice + 0.5) / 4.0));
                        }
                    `,
                },
                gpu: {
                    vertex: { source: sampleWgsl, entryPoint: 'vsMain' },
                    fragment: { source: sampleWgsl, entryPoint: 'fsMain' },
                },
                resources: {
                    uVolume: volume,
                    uVolumeSampler: volume.style,
                },
            }),
        });

        scene.addChild(sample);
    },
};
