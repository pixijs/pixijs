import programSrc from './batcher-template.wgsl';
import { generateBatchProgram } from './generateBatchProgram';

import type { GpuProgram } from '../../renderers/gpu/shader/GpuProgram';

export function generateDefaultBatchProgram(maxTextures: number): GpuProgram
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
