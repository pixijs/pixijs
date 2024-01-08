import { Geometry } from '../../../../src/rendering/renderers/shared/geometry/Geometry';
import { Shader } from '../../../../src/rendering/renderers/shared/shader/Shader';
import { Mesh } from '../../../../src/scene/mesh/shared/Mesh';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render a custom triangle correctly',
    create: async (scene: Container) =>
    {
        const geometry = new Geometry({
            attributes: {
                aPosition: {
                    buffer: [-50, -50, 50, -50, 0, 50],
                    shaderLocation: 0,
                    stride: 2 * 4,
                    offset: 0,
                    format: 'float32x2',
                }
            },
        });

        const gl = {
            vertex: `
        in vec2 aPosition;
        
        uniform mat3 projectionMatrix;
        uniform mat3 worldTransformMatrix;

        uniform mat3 uTransformMatrix;
        
        
        void main() {

            mat3 mvp = projectionMatrix * worldTransformMatrix * uTransformMatrix;
            gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
        }
    `,
            fragment: ` 
        void main() {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
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
            
            @vertex
            fn main(
                @location(0) aPosition : vec2<f32>,
            ) -> @builtin(position) vec4<f32> {     
                var mvp = globalUniforms.projectionMatrix 
                    * globalUniforms.worldTransformMatrix 
                    * localUniforms.uTransformMatrix;
                return vec4<f32>(mvp * vec3<f32>(aPosition, 1.0), 1.0);
            };
        `
            },
            fragment: {
                entryPoint: 'main',
                source: /* wgsl */`
            @fragment
            fn main() -> @location(0) vec4<f32> {
                return vec4<f32>(1.0, 0.0, 0.0, 1.0);
            }
        `
            },
        };

        const shader = Shader.from({
            gl,
            gpu
        });

        const triangle = new Mesh({
            geometry,
            shader,
        });

        triangle.position.set(128 / 2, 128 / 2);

        scene.addChild(triangle);
    },
};
