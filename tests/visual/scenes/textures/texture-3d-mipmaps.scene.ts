import { BufferImageSource, Geometry, Shader } from '~/rendering';
import { Mesh } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

// one colour per depth slice: red, green, blue, yellow
const sliceColors = [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [255, 255, 0],
];

export const scene: TestScene = {
    it: 'should generate mipmaps for a 3D texture and sample mip 1',
    renderers: {
        webgpu: true,
        webgl2: true,
        webgl1: false,
        canvas: false,
    },
    create: async (scene: Container) =>
    {
        const size = 4;
        const data = new Uint8Array(size * size * size * 4);

        // texel (x, y, z) sits at x + (y * width) + (z * width * height). Every other column is darker, so a
        // slice read from the wrong offset shows up as colour changing down a column
        for (let z = 0; z < size; z++)
        {
            for (let y = 0; y < size; y++)
            {
                for (let x = 0; x < size; x++)
                {
                    const i = (x + (y * size) + (z * size * size)) * 4;
                    const shade = x % 2 ? 0.4 : 1;

                    data[i] = sliceColors[z][0] * shade;
                    data[i + 1] = sliceColors[z][1] * shade;
                    data[i + 2] = sliceColors[z][2] * shade;
                    data[i + 3] = 255;
                }
            }
        }

        const volume = new BufferImageSource({
            resource: data,
            width: size,
            height: size,
            depth: size,
            format: 'rgba8unorm',
            scaleMode: 'nearest',
            // WebGPU writes 3D mips with a compute shader, so it needs storage; WebGL ignores it
            storage: true,
            autoGenerateMipmaps: true,
        });

        const geometry = new Geometry({
            attributes: {
                aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1],
                aUV: [0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0],
            },
        });

        // mip 1 is 2x2x2: each texel averages two slices and a dark and light column. Two columns, one mip-1
        // slice each: red + green, then blue + yellow
        const wgsl = /* wgsl */`
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
                let slice = floor(uv.x * 2.0);

                return textureSampleLevel(
                    uVolume, uVolumeSampler, vec3<f32>(fract(uv.x * 2.0), uv.y, (slice + 0.5) / 2.0), 1.0
                );
            }
        `;

        const mesh = new Mesh({
            geometry,
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
                            float slice = floor(vUV.x * 2.0);

                            fragColor = textureLod(uVolume, vec3(fract(vUV.x * 2.0), vUV.y, (slice + 0.5) / 2.0), 1.0);
                        }
                    `,
                },
                gpu: {
                    vertex: { source: wgsl, entryPoint: 'vsMain' },
                    fragment: { source: wgsl, entryPoint: 'fsMain' },
                },
                resources: {
                    uVolume: volume,
                    uVolumeSampler: volume.style,
                },
            }),
        });

        scene.addChild(mesh);
    },
};
