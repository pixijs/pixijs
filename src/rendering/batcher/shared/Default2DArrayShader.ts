import { compileHighShaderGlProgram, compileHighShaderGpuProgram } from '../../high-shader/compileHighShaderToProgram';
import { colorBit, colorBitGl } from '../../high-shader/shader-bits/colorBit';
import {
    generateTexture2DArrayBatchBit,
    generateTexture2DArrayBatchBitGl,
} from '../../high-shader/shader-bits/generateTexture2DArrayBatchBit';
import { roundPixelsBit, roundPixelsBitGl } from '../../high-shader/shader-bits/roundPixelsBit';
import { getBatchSamplers2DArrayUniformGroup } from '../../renderers/gl/shader/getBatchSamplers2DArrayUniformGroup';
import { Shader } from '../../renderers/shared/shader/Shader';

/**
 * Default2DArrayShader is a specialized shader class designed for batch 2d array rendering.
 * It extends the base Shader class and provides functionality for handling
 * color, texture batching, layer, and pixel rounding in both WebGL and WebGPU contexts.
 *
 * It is used by the default 2darray batcher
 * @extends Shader
 * @memberof rendering
 */
export class Default2DArrayShader extends Shader
{
    constructor(maxTextures: number)
    {
        const glProgram = compileHighShaderGlProgram({
            name: 'batch',
            bits: [
                colorBitGl,
                generateTexture2DArrayBatchBitGl(maxTextures),
                roundPixelsBitGl,
            ]
        });

        const gpuProgram = compileHighShaderGpuProgram({
            name: 'batch',
            bits: [
                colorBit,
                generateTexture2DArrayBatchBit(maxTextures),
                roundPixelsBit,
            ]
        });

        super({
            glProgram,
            gpuProgram,
            resources: {
                batchSamplers: getBatchSamplers2DArrayUniformGroup(maxTextures),
            }
        });
    }
}
