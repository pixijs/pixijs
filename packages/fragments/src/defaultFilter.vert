attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;
uniform vec4 sourceFrame;
uniform vec4 destinationFrame;

varying vec2 vTextureCoord;

vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(sourceFrame.zw, vec2(0.)) + sourceFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aVertexPosition * (sourceFrame.zw / destinationFrame.zw);
}


void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}