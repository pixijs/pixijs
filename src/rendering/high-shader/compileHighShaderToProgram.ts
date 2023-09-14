import { GpuProgram } from '../renderers/gpu/shader/GpuProgram';
import { compileHighShader } from './compiler/compileHighShader';
import { fragmentGPUTemplate, vertexGPUTemplate } from './defaultProgramTemplate';
import { globalUniformsBit } from './shader-bits/globalUniformsBit';

import type { HighShaderBit } from './compiler/types';

export function compileHighShaderProgram({ bits }: {bits: HighShaderBit[]}): GpuProgram
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

    return new GpuProgram({
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
