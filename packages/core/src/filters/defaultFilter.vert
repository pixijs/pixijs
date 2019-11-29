attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

uniform vec4 inputSize;
uniform vec4 inputFrame;
uniform vec4 outputFrame;

vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

void main(void)
{
    gl_Position = filterVertexPosition();

    vec2 outTextureCoord = aVertexPosition * (outputFrame.zw * inputSize.zw);
    vTextureCoord = clamp(outTextureCoord - (inputFrame.xy - outputFrame.xy) * inputSize.zw,
        vec2(.0, .0), inputFrame.zw * inputSize.zw);
}
