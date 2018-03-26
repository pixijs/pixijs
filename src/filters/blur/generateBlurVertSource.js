const vertTemplate = [
    'attribute vec2 aVertexPosition;',
    'attribute vec2 aTextureCoord;',

    'uniform float strength;',
    'uniform mat3 projectionMatrix;',

    'varying vec2 vBlurTexCoords[%size%];',

    'void main(void)',
    '{',
    'gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);',
    '%blur%',
    '}',
].join('\n');

export default function generateVertBlurSource(kernelSize, x)
{
    const halfLength = Math.ceil(kernelSize / 2);

    let vertSource = vertTemplate;

    let blurLoop = '';
    let template;
    // let value;

    if (x)
    {
        template = 'vBlurTexCoords[%index%] = aTextureCoord + vec2(%sampleIndex% * strength, 0.0);';
    }
    else
    {
        template = 'vBlurTexCoords[%index%] = aTextureCoord + vec2(0.0, %sampleIndex% * strength);';
    }

    for (let i = 0; i < kernelSize; i++)
    {
        let blur = template.replace('%index%', i);

        // value = i;

        // if(i >= halfLength)
        // {
        //     value = kernelSize - i - 1;
        // }

        blur = blur.replace('%sampleIndex%', `${i - (halfLength - 1)}.0`);

        blurLoop += blur;
        blurLoop += '\n';
    }

    vertSource = vertSource.replace('%blur%', blurLoop);
    vertSource = vertSource.replace('%size%', kernelSize);

    return vertSource;
}
