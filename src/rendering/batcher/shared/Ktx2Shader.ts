import { compileHighShaderGlProgram, compileHighShaderGpuProgram } from '../../high-shader/compileHighShaderToProgram';
import { generateTextureBatchBit, generateTextureBatchBitGl } from '../../high-shader/shader-bits/generateTextureBatchBit';
import { ktx2ColorBit, ktx2ColorBitGl } from '../../high-shader/shader-bits/ktx2ColorBit';
import { roundPixelsBit, roundPixelsBitGl } from '../../high-shader/shader-bits/roundPixelsBit';
import { getBatchSamplersUniformGroup } from '../../renderers/gl/shader/getBatchSamplersUniformGroup';
import { Shader } from '../../renderers/shared/shader/Shader';

/**
 * Ktx2Shader is a specialized shader for KTX2/Basis Universal compressed textures.
 *
 * This shader uses custom non-premultiply colorBit, which is required for correct
 * alpha transparency with KTX2 textures that use straight (non-premultiplied) alpha.
 * @extends Shader
 * @category rendering
 * @advanced
 */
export class Ktx2Shader extends Shader
{
    /** @internal */
    public maxTextures?: number;

    constructor(maxTextures: number)
    {
        const glProgram = compileHighShaderGlProgram({
            name: 'ktx2-batch',
            bits: [
                ktx2ColorBitGl,
                generateTextureBatchBitGl(maxTextures),
                roundPixelsBitGl,
            ]
        });

        const gpuProgram = compileHighShaderGpuProgram({
            name: 'ktx2-batch',
            bits: [
                ktx2ColorBit,
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

        this.maxTextures = maxTextures;
    }
}

