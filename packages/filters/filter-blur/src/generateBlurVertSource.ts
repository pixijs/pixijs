const vertTemplate = `
    attribute vec2 aVertexPosition;

    uniform mat3 projectionMatrix;

    uniform float strength;

    varying vec2 vBlurTexCoords[%size%];

    uniform vec4 inputSize;
    uniform vec4 outputFrame;

    vec4 filterVertexPosition( void )
    {
        vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

        return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
    }

    vec2 filterTextureCoord( void )
    {
        return aVertexPosition * (outputFrame.zw * inputSize.zw);
    }

    void main(void)
    {
        gl_Position = filterVertexPosition();

        vec2 textureCoord = filterTextureCoord();
        %blur%
    }`;

export function generateBlurVertSource(kernelSize: number, x: boolean): string
{
    const halfLength = Math.ceil(kernelSize / 2);

    let vertSource = vertTemplate;

    let blurLoop = '';
    let template;

    if (x)
    {
        template = 'vBlurTexCoords[%index%] =  textureCoord + vec2(%sampleIndex% * strength, 0.0);';
    }
    else
    {
        template = 'vBlurTexCoords[%index%] =  textureCoord + vec2(0.0, %sampleIndex% * strength);';
    }

    for (let i = 0; i < kernelSize; i++)
    {
        let blur = template.replace('%index%', i.toString());

        blur = blur.replace('%sampleIndex%', `${i - (halfLength - 1)}.0`);

        blurLoop += blur;
        blurLoop += '\n';
    }

    vertSource = vertSource.replace('%blur%', blurLoop);
    vertSource = vertSource.replace('%size%', kernelSize.toString());

    return vertSource;
}
