const vertTemplate = `
    attribute vec2 aVertexPosition;

    uniform mat3 projectionMatrix;

    uniform vec4 destinationFrame;
    uniform vec4 sourceFrame;

    uniform float strength;
    uniform float resolution;

    varying vec2 vBlurTexCoords[%size%];

    vec4 filterVertexPosition( void )
    {
        vec2 position = aVertexPosition * max(sourceFrame.zw, vec2(0.)) + sourceFrame.xy;

        return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
    }

    vec2 filterTextureCoord( void )
    {
        return aVertexPosition * (sourceFrame.zw / destinationFrame.zw);
    }

    vec2 size( void )
    {
        return ( (sourceFrame.zw -resolution) / destinationFrame.zw);
    }

    void main(void)
    {
        gl_Position = filterVertexPosition();

        vec2 textureCoord = filterTextureCoord();
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
        template = 'vBlurTexCoords[%index%] =  min( textureCoord + vec2(%sampleIndex% * strength, 0.0), size());';
    }
    else
    {
        template = 'vBlurTexCoords[%index%] =  min( textureCoord + vec2(0.0, %sampleIndex% * strength), size());';
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
