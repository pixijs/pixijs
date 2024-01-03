import { GAUSSIAN_VALUES } from '../const';

const fragTemplate = [
    'in vec2 vBlurTexCoords[%size%];',
    'uniform sampler2D uTexture;',
    'out vec4 finalColor;',

    'void main(void)',
    '{',
    '    finalColor = vec4(0.0);',
    '    %blur%',
    '}',

].join('\n');

export function generateBlurFragSource(kernelSize: number): string
{
    const kernel = GAUSSIAN_VALUES[kernelSize];
    const halfLength = kernel.length;

    let fragSource = fragTemplate;

    let blurLoop = '';
    const template = 'finalColor += texture(uTexture, vBlurTexCoords[%index%]) * %value%;';
    let value: number;

    for (let i = 0; i < kernelSize; i++)
    {
        let blur = template.replace('%index%', i.toString());

        value = i;

        if (i >= halfLength)
        {
            value = kernelSize - i - 1;
        }

        blur = blur.replace('%value%', kernel[value].toString());

        blurLoop += blur;
        blurLoop += '\n';
    }

    fragSource = fragSource.replace('%blur%', blurLoop);
    fragSource = fragSource.replace('%size%', kernelSize.toString());

    return fragSource;
}
