import { generateBatchGlProgram } from '../../batcher/gl/generateBatchGlProgram';
import fragmentSrc from './graphics-batcher-template.frag';
import vertexSrc from './graphics-batcher-template.vert';

import type { GlProgram } from '../../renderers/gl/shader/GlProgram';

export function generateDefaultGraphicsBatchGlProgram(maxTextures: number): GlProgram
{
    return generateBatchGlProgram({
        vertexSrc,
        fragmentSrc,
        maxTextures,
        name: 'graphics'
    });
}
