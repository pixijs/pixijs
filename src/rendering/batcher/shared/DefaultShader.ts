import { compileHighShaderGlProgram, compileHighShaderGpuProgram } from '../../high-shader/compileHighShaderToProgram';
import { colorBit, colorBitGl } from '../../high-shader/shader-bits/colorBit';
import { generateTextureBatchBit, generateTextureBatchBitGl } from '../../high-shader/shader-bits/generateTextureBatchBit';
import { roundPixelsBit, roundPixelsBitGl } from '../../high-shader/shader-bits/roundPixelsBit';
import { getBatchSamplersUniformGroup } from '../../renderers/gl/shader/getBatchSamplersUniformGroup';
import { Shader } from '../../renderers/shared/shader/Shader';

export class DefaultShader extends Shader
{
    constructor(maxTextures: number)
    {
        const glProgram = compileHighShaderGlProgram({
            name: 'batch',
            bits: [
                colorBitGl,
                generateTextureBatchBitGl(maxTextures),
                roundPixelsBitGl,
            ]
        });

        const gpuProgram = compileHighShaderGpuProgram({
            name: 'batch',
            bits: [
                colorBit,
                generateTextureBatchBit(maxTextures),
                roundPixelsBit,
            ]
        });

        super({
            glProgram,
            gpuProgram,
            resources: {
                batchSamplers: getBatchSamplersUniformGroup(maxTextures),
            }
        });
    }
}
