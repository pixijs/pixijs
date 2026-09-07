import { GAUSSIAN_VALUES } from '../const';

const fragTemplate = [
    'in vec2 vBlurTexCoords[%size%];',
    'uniform sampler2D uTexture;',
    'uniform vec4 uInputClamp;',
    'out vec4 finalColor;',

    'void main(void)',
    '{',
    '    %blur%',
    '}',

].join('\n');

/**
 * @internal
 * @param kernelSize - The size of the kernel.
 */
export function generateBlurFragSource(kernelSize: number): string
{
    const kernel = GAUSSIAN_VALUES[kernelSize];
    const halfLength = kernel.length;

    let blurLoop = '';
    const prefixFirst = 'finalColor = ';
    const prefixRest = '    + ';
    const template = 'texture(uTexture, clamp(vBlurTexCoords[%index%], uInputClamp.xy, uInputClamp.zw)) * %value%';

    for (let i = 0; i < kernelSize; i++)
    {
        const prefix = i === 0 ? prefixFirst : prefixRest;
        const value = i < halfLength ? i : kernelSize - i - 1;
        const blur = template
            .replace('%index%', i.toString())
            .replace('%value%', kernel[value].toString());

        blurLoop += `${prefix}${blur}\n`;
    }

    return fragTemplate
        .replace('%blur%', `${blurLoop};`)
        .replace('%size%', kernelSize.toString());
}
