import { GlProgram } from '../../../../rendering/renderers/gl/shader/GlProgram';
import { generateBlurFragSource } from './generateBlurFragSource';
import { generateBlurVertSource } from './generateBlurVertSource';

export function generateBlurGlProgram(horizontal: boolean, kernelSize: number)
{
    const vertex = generateBlurVertSource(kernelSize, horizontal);
    const fragment = generateBlurFragSource(kernelSize);

    return GlProgram.from({
        vertex,
        fragment,
        name: `blur-${horizontal ? 'horizontal' : 'vertical'}-pass-filter`
    });
}
