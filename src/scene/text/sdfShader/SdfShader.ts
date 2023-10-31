import { Matrix } from '../../../maths/matrix/Matrix';
import { MAX_TEXTURES } from '../../../rendering/batcher/shared/const';
import {
    compileHighShaderGlProgram,
    compileHighShaderGpuProgram
} from '../../../rendering/high-shader/compileHighShaderToProgram';
import { colorBit, colorBitGl } from '../../../rendering/high-shader/shader-bits/colorBit';
import {
    generateTextureBatchBit,
    generateTextureBatchBitGl
} from '../../../rendering/high-shader/shader-bits/generateTextureBatchBit';
import { roundPixelsBit, roundPixelsBitGl } from '../../../rendering/high-shader/shader-bits/roundPixelsBit';
import { batchSamplersUniformGroup } from '../../../rendering/renderers/gl/shader/batchSamplersUniformGroup';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { localUniformMSDFBit, localUniformMSDFBitGl } from './shader-bits/localUniformMSDFBit';
import { mSDFBit, mSDFBitGl } from './shader-bits/mSDFBit';

export class SdfShader extends Shader
{
    constructor()
    {
        const uniforms = new UniformGroup({
            uColor: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
            uTransformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            uDistance: { value: 4, type: 'f32' },
            uRound: { value: 0, type: 'f32' },
        });

        const gpuProgram = compileHighShaderGpuProgram({
            name: 'sdf-shader',
            bits: [
                colorBit,
                generateTextureBatchBit(MAX_TEXTURES),
                localUniformMSDFBit,
                mSDFBit,
                roundPixelsBit
            ]
        });

        const glProgram = compileHighShaderGlProgram({
            name: 'sdf-shader',
            bits: [
                colorBitGl,
                generateTextureBatchBitGl(MAX_TEXTURES),
                localUniformMSDFBitGl,
                mSDFBitGl,
                roundPixelsBitGl,
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
