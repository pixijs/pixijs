import fragmentSrc from './batcher-template.frag';
import vertexSrc from './batcher-template.vert';
import { generateBatchGlProgram } from './generateBatchGlProgram';

import type { GlProgram } from '../../renderers/gl/shader/GlProgram';

export function generateDefaultBatchGlProgram(maxTextures: number): GlProgram
{
    return generateBatchGlProgram({
        vertexSrc,
        fragmentSrc,
        maxTextures,
        name: 'default',
    });
}
