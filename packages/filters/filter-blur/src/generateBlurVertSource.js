const vertTemplate = `
    attribute vec2 aVertexPosition;

    uniform mat3 projectionMatrix;

    uniform vec4 destinationFrame;
    uniform vec4 sourceFrame;

    uniform float strength;

    varying vec2 vBlurTexCoords[%size%];

    void main(void)
    {
        vec2 position = aVertexPosition * max(sourceFrame.zw, vec2(0.)) + sourceFrame.xy;

        gl_Position = vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);

        vec2 textureCoord = aVertexPosition * (sourceFrame.zw / destinationFrame.zw);
        %blur%
    }`;

export default function generateVertBlurSource(kernelSize, x)
{
    const halfLength = Math.ceil(kernelSize / 2);

    let vertSource = vertTemplate;

    let blurLoop = '';
    let template;
    // let value;

    if (x)
    {
        template = 'vBlurTexCoords[%index%] = textureCoord + vec2(%sampleIndex% * strength, 0.0);';
    }
    else
    {
        template = 'vBlurTexCoords[%index%] = textureCoord + vec2(0.0, %sampleIndex% * strength);';
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
