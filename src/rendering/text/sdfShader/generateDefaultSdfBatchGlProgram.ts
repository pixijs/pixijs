import { generateBatchGlProgram } from '../../batcher/gl/generateBatchGlProgram';
import fragmentSrc from './sdf-batcher-template.frag';
import vertexSrc from './sdf-batcher-template.vert';

import type { GlProgram } from '../../renderers/gl/shader/GlProgram';

export function generateDefaultSdfBatchGlProgram(maxTextures: number): GlProgram
{
    return generateBatchGlProgram({
        vertexSrc,
        fragmentSrc,
        maxTextures,
        name: 'sdf'
    });
}
