in vec2 aPosition;
out vec2 vTextureCoord;
out vec2 backgroundUv;

uniform globalUniforms {
  mat3 projectionMatrix;
  mat3 worldTransformMatrix;
  float worldAlpha;
};

uniform vec4 inputSize;
uniform vec4 outputFrame;
uniform vec4 backgroundFrame;

vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;
    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aPosition * (outputFrame.zw * inputSize.zw);
}

vec2 filterBackgroundTextureCoord( void ) 
{
    return aPosition * aPosition * backgroundFrame.zw;
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
    backgroundUv = filterBackgroundTextureCoord();
}
