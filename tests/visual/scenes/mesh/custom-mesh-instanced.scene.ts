import { Assets } from '~/assets';
import { Geometry, Shader } from '~/rendering';
import { Mesh } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render a custom instanced mesh correctly',
    create: async (scene: Container) =>
    {
        const spinnyBG = await Assets.load('bg_scene_rotate.jpg');

        const geometry = new Geometry({
            attributes: {
                aPosition: [
                    -10, -10, // x, y
                    10, -20, // x, y
                    10, 10,
                ],
                aUV:  [
                    0, 0, // u, v
                    1, 0, // u, v
                    1, 1,
                    0, 1
                ],
                aPositionOffset: {
                    buffer: [
                        -50, -50, // x, y
                        -0, -50, // x, y
                        -50, 0, // x, y
                        0, 0, // x, y
                        50, 0,
                        50, 50,
                        0, 50,
                        -50, 50,
                        50, -50,
                    ],
                    instance: true,
                },
            },
            instanceCount: 9,
        });

        const gl = {
            vertex: `
                in vec2 aPosition;
                in vec2 aUV;
                in vec2 aPositionOffset;

                out vec2 vUV;

                uniform mat3 uProjectionMatrix;
                uniform mat3 uWorldTransformMatrix;
                uniform mat3 uTransformMatrix;


                void main() {

                    mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
                    gl_Position = vec4((mvp * vec3(aPosition + aPositionOffset, 1.0)).xy, 0.0, 1.0);

                    vUV = aUV;
                }
            `,
            fragment: `
                in vec2 vUV;
                uniform sampler2D uTexture;
                uniform float time;

                void main() {
                    gl_FragColor = texture(uTexture, vUV + sin( (time + (vUV.x) * 14.) ) * 0.1 );
                }
            `,
        };

        const gpu = {
            vertex: {
                entryPoint: 'main',
                source: /* wgsl */`
                    struct GlobalUniforms {
                        uProjectionMatrix:mat3x3<f32>,
                        uWorldTransformMatrix:mat3x3<f32>,
                        uWorldColorAlpha: vec4<f32>,
                        uResolution: vec2<f32>,
                    }

                    struct LocalUniforms {
                        uTransformMatrix:mat3x3<f32>,
                        uColor:vec4<f32>,
                        uRound:f32,
                    }


                    @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
                    @group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;

                    struct VertexOutput {
                        @builtin(position) position: vec4<f32>,
                        @location(0) vUV: vec2<f32>,
                    };


                    @vertex
                    fn main(
                        @location(0) aPosition : vec2<f32>,
                        @location(1) aUV : vec2<f32>,
                        @location(2) aPositionOffset : vec2<f32>,
                    ) -> VertexOutput {
                        var mvp = globalUniforms.uProjectionMatrix
                            * globalUniforms.uWorldTransformMatrix
                            * localUniforms.uTransformMatrix;

                        var output: VertexOutput;

                        output.position = vec4<f32>(mvp * vec3<f32>(aPosition+aPositionOffset, 1.0), 1.0);
                        output.vUV = aUV;

                        return output;
                    };
                `
            },
            fragment: {
                entryPoint: 'main',
                source: /* wgsl */`
                    struct WaveUniforms {
                        time:f32,
                    }

                    @group(2) @binding(1) var uTexture : texture_2d<f32>;
                    @group(2) @binding(2) var uSampler : sampler;
                    @group(2) @binding(3) var<uniform> waveUniforms : WaveUniforms;

                    @fragment
                    fn main(
                        @location(0) vUV: vec2<f32>,
                    ) -> @location(0) vec4<f32> {
                        return textureSample(uTexture, uSampler, vUV + sin( (waveUniforms.time + (vUV.x) * 14.) ) * 0.1);
                    };
                `
            },
        };

        const shader = Shader.from({
            gl,
            gpu,
            resources: {
                uTexture: spinnyBG.source,
                uSampler: spinnyBG.source.style,
                waveUniforms: {
                    time: { value: 1, type: 'f32' },
                }
            }
        });

        const triangle = new Mesh({
            geometry,
            shader,
        });

        triangle.position.set(128 / 2, 128 / 2);

        scene.addChild(triangle);
    },
};
