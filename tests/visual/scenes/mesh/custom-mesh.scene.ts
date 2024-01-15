import { Assets } from '../../../../src/assets/Assets';
import { Geometry } from '../../../../src/rendering/renderers/shared/geometry/Geometry';
import { Shader } from '../../../../src/rendering/renderers/shared/shader/Shader';
import { Mesh } from '../../../../src/scene/mesh/shared/Mesh';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render a custom mesh correctly',
    create: async (scene: Container) =>
    {
        const spinnyBG = await Assets.load('bg_scene_rotate.jpg');

        const geometry = new Geometry({
            attributes: {
                aPosition: [
                    -100, -100, // x, y
                    100, -200, // x, y
                    100, 100,
                    -200, 100, // x, y
                ],
                aUV: [
                    0, 0, // u, v
                    1, 0, // u, v
                    1, 1,
                    0, 1
                ]
            },
            indexBuffer: [0, 1, 2, 0, 2, 3]
        });

        const gl = {
            vertex: `
        in vec2 aPosition;
        in vec2 aUV;
        
        out vec2 vUV;

        uniform mat3 projectionMatrix;
        uniform mat3 worldTransformMatrix;
        uniform mat3 uTransformMatrix;
        
        
        void main() {

            mat3 mvp = projectionMatrix * worldTransformMatrix * uTransformMatrix;
            gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);

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
                projectionMatrix:mat3x3<f32>,
                worldTransformMatrix:mat3x3<f32>,
                worldColorAlpha: vec4<f32>,
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
            ) -> VertexOutput {     
                var mvp = globalUniforms.projectionMatrix 
                    * globalUniforms.worldTransformMatrix 
                    * localUniforms.uTransformMatrix;
                
                var output: VertexOutput;

                output.position = vec4<f32>(mvp * vec3<f32>(aPosition, 1.0), 1.0);
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
