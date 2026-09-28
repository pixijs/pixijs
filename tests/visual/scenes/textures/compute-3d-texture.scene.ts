import { Geometry, Shader, TextureSource } from '~/rendering';
import { Mesh } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer, WebGPURenderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should sample a 3D storage texture written by a compute shader',
    renderers: {
        webgpu: true,
        webgl2: false,
        webgl1: false,
        canvas: false,
    },
    create: async (scene: Container, renderer: Renderer) =>
    {
        const volume = new TextureSource({
            width: 4,
            height: 4,
            depth: 4,
            format: 'rgba8unorm',
            scaleMode: 'nearest',
            storage: true,
        });

        // the same volume texture-3d.scene uploads from a buffer, written on the GPU instead:
        // one colour per slice, every other column darker
        const gpuRenderer = renderer as WebGPURenderer;
        const device = gpuRenderer.gpu.device;
        const pipeline = device.createComputePipeline({
            layout: 'auto',
            compute: {
                entryPoint: 'main',
                module: device.createShaderModule({
                    code: /* wgsl */`
                        @group(0) @binding(0) var volume: texture_storage_3d<rgba8unorm, write>;

                        const sliceColors = array<vec3<f32>, 4>(
                            vec3<f32>(1.0, 0.0, 0.0),
                            vec3<f32>(0.0, 1.0, 0.0),
                            vec3<f32>(0.0, 0.0, 1.0),
                            vec3<f32>(1.0, 1.0, 0.0),
                        );

                        @compute @workgroup_size(4, 4, 4)
                        fn main(@builtin(global_invocation_id) id: vec3<u32>) {
                            let shade = select(1.0, 0.4, id.x % 2u == 1u);

                            textureStore(volume, id, vec4<f32>(sliceColors[id.z] * shade, 1.0));
                        }
                    `,
                }),
            },
        });

        const encoder = device.createCommandEncoder();
        const pass = encoder.beginComputePass();

        pass.setPipeline(pipeline);
        pass.setBindGroup(0, device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [{ binding: 0, resource: gpuRenderer.texture.getGpuSource(volume).createView() }],
        }));
        pass.dispatchWorkgroups(1);
        pass.end();
        device.queue.submit([encoder.finish()]);

        // four columns, one depth slice each
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
                let slice = floor(uv.x * 4.0);

                return textureSample(uVolume, uVolumeSampler, vec3<f32>(fract(uv.x * 4.0), uv.y, (slice + 0.5) / 4.0));
            }
        `;

        scene.addChild(new Mesh({
            geometry: new Geometry({
                attributes: {
                    aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1],
                    aUV: [0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0],
                },
            }),
            shader: Shader.from({
                gpu: {
                    vertex: { source: wgsl, entryPoint: 'vsMain' },
                    fragment: { source: wgsl, entryPoint: 'fsMain' },
                },
                resources: {
                    uVolume: volume,
                    uVolumeSampler: volume.style,
                },
            }),
        }));
    },
};
