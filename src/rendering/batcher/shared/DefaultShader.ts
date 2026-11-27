import { compileHighShaderGlProgram, compileHighShaderGpuProgram } from '../../high-shader/compileHighShaderToProgram';
import { colorBit, colorBitGl } from '../../high-shader/shader-bits/colorBit';
import { generateTextureBatchBit, generateTextureBatchBitGl } from '../../high-shader/shader-bits/generateTextureBatchBit';
import { roundPixelsBit, roundPixelsBitGl } from '../../high-shader/shader-bits/roundPixelsBit';
import { getBatchSamplersUniformGroup } from '../../renderers/gl/shader/getBatchSamplersUniformGroup';
import { Shader } from '../../renderers/shared/shader/Shader';

import type { HighShaderBit } from '../../high-shader/compiler/types';

const premultiplyTextureBitGl: HighShaderBit = {
    name: 'premultiply-texture',
    vertex: {
        header: 'out float vPremultiplyTexture;',
        main: 'vPremultiplyTexture = step(2.0, aTextureIdAndRound.x);',
    },
    fragment: {
        header: 'in float vPremultiplyTexture;',
        main: /* glsl */`
            if (vPremultiplyTexture > 0.5)
            {
                outColor.rgb *= outColor.a;
            }
        `,
    },
};

const premultiplyTextureBit: HighShaderBit = {
    name: 'premultiply-texture',
    vertex: {
        header: '@out @interpolate(flat) vPremultiplyTexture: u32;',
        main: 'vPremultiplyTexture = aTextureIdAndRound.x & 2u;',
    },
    fragment: {
        header: '@in @interpolate(flat) vPremultiplyTexture: u32;',
        main: /* wgsl */`
            if (vPremultiplyTexture != 0u)
            {
                outColor = vec4<f32>(outColor.rgb * outColor.a, outColor.a);
            }
        `,
    },
};

/**
 * DefaultShader is a specialized shader class designed for batch rendering.
 * It extends the base Shader class and provides functionality for handling
 * color, texture batching, and pixel rounding in both WebGL and WebGPU contexts.
 *
 * It is used by the default batcher
 * @extends Shader
 * @category rendering
 * @advanced
 */
export class DefaultShader extends Shader
{
    /** @internal */
    public maxTextures?: number;

    constructor(maxTextures: number)
    {
        const glProgram = compileHighShaderGlProgram({
            name: 'batch',
            bits: [
                colorBitGl,
                generateTextureBatchBitGl(maxTextures),
                premultiplyTextureBitGl,
                roundPixelsBitGl,
            ]
        });

        const gpuProgram = compileHighShaderGpuProgram({
            name: 'batch',
            bits: [
                colorBit,
                generateTextureBatchBit(maxTextures),
                premultiplyTextureBit,
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
