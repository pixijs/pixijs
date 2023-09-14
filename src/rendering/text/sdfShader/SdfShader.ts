import { Matrix } from '../../../maths/Matrix';
import { MAX_TEXTURES } from '../../batcher/shared/const';
import { compileHighShaderProgram } from '../../high-shader/compileHighShaderToProgram';
import { colorBit } from '../../high-shader/shader-bits/colorBit';
import { generateTextureBatchBit } from '../../high-shader/shader-bits/generateTextureBatchBit';
import { batchSamplersUniformGroup } from '../../renderers/gl/shader/batchSamplersUniformGroup';
import { Shader } from '../../renderers/shared/shader/Shader';
import { UniformGroup } from '../../renderers/shared/shader/UniformGroup';
import { generateDefaultSdfBatchGlProgram } from './generateDefaultSdfBatchGlProgram';
import { localUniformMSDFBit } from './shader-bits/localUniformMSDFBit';
import { mSDFBit } from './shader-bits/mSDFBit';

export class SdfShader extends Shader
{
    constructor()
    {
        const uniforms = new UniformGroup({
            color: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
            transformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            distance: { value: 4, type: 'f32' },
        });

        const gpuProgram = compileHighShaderProgram({
            bits: [
                colorBit,
                generateTextureBatchBit(MAX_TEXTURES),
                localUniformMSDFBit,
                mSDFBit,
            ]
        });

        super({
            glProgram: generateDefaultSdfBatchGlProgram(MAX_TEXTURES),
            gpuProgram,
            resources: {
                localUniforms: uniforms,
                batchSamplers: batchSamplersUniformGroup,
            }
        });
    }
}
