import { GlProgram } from '../../../../rendering/renderers/gl/shader/GlProgram';
import { generateBlurFragSource } from './generateBlurFragSource';
import { generateBlurVertSource } from './generateBlurVertSource';

/**
 * @internal
 * @param horizontal - Whether to generate a horizontal or vertical blur program.
 * @param kernelSize - The size of the kernel.
 * @param fix - Whether to use the new Gaussian values.
 */
export function generateBlurGlProgram(horizontal: boolean, kernelSize: number, fix: boolean)
{
    const vertex = generateBlurVertSource(kernelSize, horizontal);
    const fragment = generateBlurFragSource(kernelSize, fix);

    return GlProgram.from({
        vertex,
        fragment,
        name: `blur-${horizontal ? 'horizontal' : 'vertical'}-pass-filter`
    });
}
