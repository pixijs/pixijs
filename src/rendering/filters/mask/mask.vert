in vec2 aPosition;

out vec2 vTextureCoord;
out vec2 vMaskCoord;

uniform globalUniforms {
  mat3 projectionMatrix;
  mat3 worldTransformMatrix;
  float worldAlpha;
};

uniform vec4 inputSize;
uniform vec4 outputFrame;
uniform mat3 filterMatrix;

vec4 filterVertexPosition(  vec2 aPosition )
{
    vec2 position = aPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord(  vec2 aPosition )
{
    return aPosition * (outputFrame.zw * inputSize.zw);
}

vec2 getFilterCoord( vec2 aPosition )
{
    return  ( filterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;
}   

void main(void)
{
    gl_Position = filterVertexPosition(aPosition);
    vTextureCoord = filterTextureCoord(aPosition);
    vMaskCoord = getFilterCoord(aPosition);
}
