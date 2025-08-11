import { Matrix } from '../../../maths/matrix/Matrix';
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
import { getBatchSamplersUniformGroup } from '../../../rendering/renderers/gl/shader/getBatchSamplersUniformGroup';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { localUniformMSDFBit, localUniformMSDFBitGl } from './shader-bits/localUniformMSDFBit';
import { mSDFBit, mSDFBitGl } from './shader-bits/mSDFBit';

import type { GlProgram } from '../../../rendering/renderers/gl/shader/GlProgram';
import type { GpuProgram } from '../../../rendering/renderers/gpu/shader/GpuProgram';

const typeSymbol = Symbol.for('pixijs.SdfShader');

let gpuProgram: GpuProgram;
let glProgram: GlProgram;

/** @internal */
export class SdfShader extends Shader
{
    /**
     * Type symbol used to identify instances of SdfShader.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a SdfShader.
     * @param obj - The object to check.
     * @returns True if the object is a SdfShader, false otherwise.
     */
    public static isSdfShader(obj: any): obj is SdfShader
    {
        return !!obj && !!obj[typeSymbol];
    }

    constructor(maxTextures: number)
    {
        const uniforms = new UniformGroup({
            uColor: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
            uTransformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            uDistance: { value: 4, type: 'f32' },
            uRound: { value: 0, type: 'f32' },
        });

        gpuProgram ??= compileHighShaderGpuProgram({
            name: 'sdf-shader',
            bits: [
                colorBit,
                generateTextureBatchBit(maxTextures),
                localUniformMSDFBit,
                mSDFBit,
                roundPixelsBit
            ]
        });

        glProgram ??= compileHighShaderGlProgram({
            name: 'sdf-shader',
            bits: [
                colorBitGl,
                generateTextureBatchBitGl(maxTextures),
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
                batchSamplers: getBatchSamplersUniformGroup(maxTextures),
            }
        });
    }
}
