import { Matrix } from '../../../maths/Matrix';
import { MAX_TEXTURES } from '../../batcher/shared/const';
import { compileHighShaderGlProgram, compileHighShaderGpuProgram } from '../../high-shader/compileHighShaderToProgram';
import { colorBit, colorBitGl } from '../../high-shader/shader-bits/colorBit';
import { generateTextureBatchBit, generateTextureBatchBitGl } from '../../high-shader/shader-bits/generateTextureBatchBit';
import { localUniformBitGl } from '../../high-shader/shader-bits/localUniformBit';
import { batchSamplersUniformGroup } from '../../renderers/gl/shader/batchSamplersUniformGroup';
import { Shader } from '../../renderers/shared/shader/Shader';
import { UniformGroup } from '../../renderers/shared/shader/UniformGroup';
import { localUniformMSDFBit } from './shader-bits/localUniformMSDFBit';
import { mSDFBit, mSDFBitGl } from './shader-bits/mSDFBit';

export class SdfShader extends Shader
{
    constructor()
    {
        const uniforms = new UniformGroup({
            uColor: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
            uTransformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            uDistance: { value: 4, type: 'f32' },
        });

        const gpuProgram = compileHighShaderGpuProgram({
            name: 'sdf-shader',
            bits: [
                colorBit,
                generateTextureBatchBit(MAX_TEXTURES),
                localUniformMSDFBit,
                mSDFBit,
            ]
        });

        const glProgram = compileHighShaderGlProgram({
            name: 'sdf-shader',
            bits: [
                colorBitGl,
                generateTextureBatchBitGl(MAX_TEXTURES),
                localUniformBitGl,
                mSDFBitGl,
            ]
        });

        super({
            glProgram,
            gpuProgram,
            resources: {
                localUniforms: uniforms,
                batchSamplers: batchSamplersUniformGroup,
            }
        });
    }
}
