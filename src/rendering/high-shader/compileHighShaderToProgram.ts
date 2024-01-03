import { GlProgram } from '../renderers/gl/shader/GlProgram';
import { GpuProgram } from '../renderers/gpu/shader/GpuProgram';
import { compileHighShader, compileHighShaderGl } from './compiler/compileHighShader';
import { fragmentGlTemplate, fragmentGPUTemplate, vertexGlTemplate, vertexGPUTemplate } from './defaultProgramTemplate';
import { globalUniformsBit, globalUniformsBitGl } from './shader-bits/globalUniformsBit';

import type { HighShaderBit } from './compiler/types';

export function compileHighShaderGpuProgram({ bits, name }: {bits: HighShaderBit[], name: string}): GpuProgram
{
    const source = compileHighShader({
        template: {
            fragment: fragmentGPUTemplate,
            vertex: vertexGPUTemplate,
        },
        bits: [
            globalUniformsBit,
            ...bits,
        ]
    });

    return GpuProgram.from({
        name,
        vertex: {
            source: source.vertex,
            entryPoint: 'main',
        },
        fragment: {
            source: source.fragment,
            entryPoint: 'main',
        },
    });
}

export function compileHighShaderGlProgram({ bits, name }: {bits: HighShaderBit[], name: string}): GlProgram
{
    return new GlProgram({
        name,
        ...compileHighShaderGl({
            template: {
                vertex: vertexGlTemplate,
                fragment: fragmentGlTemplate,
            },
            bits: [
                globalUniformsBitGl,
                ...bits,
            ]
        })
    });
}
