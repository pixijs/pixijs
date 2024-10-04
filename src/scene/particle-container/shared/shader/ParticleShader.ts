import { Color } from '../../../../color/Color';
import { Matrix } from '../../../../maths/matrix/Matrix';
import { GlProgram } from '../../../../rendering/renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../../../rendering/renderers/gpu/shader/GpuProgram';
import { Shader } from '../../../../rendering/renderers/shared/shader/Shader';
import { Texture } from '../../../../rendering/renderers/shared/texture/Texture';
import { TextureStyle } from '../../../../rendering/renderers/shared/texture/TextureStyle';
import fragment from './particles.frag';
import vertex from './particles.vert';
import wgsl from './particles.wgsl';

export class ParticleShader extends Shader
{
    constructor()
    {
        const glProgram = GlProgram.from({
            vertex,
            fragment
        });

        const gpuProgram = GpuProgram.from({
            fragment: {
                source: wgsl,
                entryPoint: 'mainFragment'
            },
            vertex: {
                source: wgsl,
                entryPoint: 'mainVertex'
            }
        });

        super({
            glProgram,
            gpuProgram,
            resources: {
                // this will be replaced with the texture from the particle container
                uTexture: Texture.WHITE.source,
                // this will be replaced with the texture style from the particle container
                uSampler: new TextureStyle({}),
                // this will be replaced with the local uniforms from the particle container
                uniforms: {
                    uTranslationMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
                    uColor: { value: new Color(0xFFFFFF), type: 'vec4<f32>' },
                    uRound: { value: 1, type: 'f32' },
                    uResolution: { value: [0, 0], type: 'vec2<f32>' },
                }
            }
        });
    }
}
