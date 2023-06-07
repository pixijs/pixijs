import { generateBatchProgram } from '../../batcher/gpu/generateBatchProgram';
import programSrc from './graphics-batcher-template.wgsl';

import type { GpuProgram } from '../../renderers/gpu/shader/GpuProgram';

export function generateDefaultGraphicsBatchProgram(maxTextures: number): GpuProgram
{
    return generateBatchProgram({
        vertex: {
            source: programSrc,
            entryPoint: 'mainVertex',
        },
        fragment: {
            source: programSrc,
            entryPoint: 'mainFragment',
        },
        maxTextures,
    });
}
