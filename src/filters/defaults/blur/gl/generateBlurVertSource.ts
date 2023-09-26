const vertTemplate = `
    in vec2 aPosition;

    uniform float strength;

    out vec2 vBlurTexCoords[%size%];

    uniform vec4 inputSize;
    uniform vec4 outputFrame;
    uniform vec4 inputPixel;
    uniform vec4 outputTexture;

    vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * outputFrame.zw + outputFrame.xy;
    
    position.x = position.x * (2.0 / outputTexture.x) - 1.0;
    position.y = position.y * (2.0*outputTexture.z / outputTexture.y) - outputTexture.z;

    return vec4(position, 0.0, 1.0);
}

    vec2 filterTextureCoord( void )
    {
        return aPosition * (outputFrame.zw * inputSize.zw);
    }

    void main(void)
    {
        gl_Position = filterVertexPosition();

        float pixelStrength = inputSize.%dimension% * strength;

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
        template = 'vBlurTexCoords[%index%] =  textureCoord + vec2(%sampleIndex% * pixelStrength, 0.0);';
    }
    else
    {
        template = 'vBlurTexCoords[%index%] =  textureCoord + vec2(0.0, %sampleIndex% * pixelStrength);';
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
    vertSource = vertSource.replace('%dimension%', x ? 'z' : 'w');

    return vertSource;
}
