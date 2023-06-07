precision lowp float;

in vec2 aPosition;
in vec2 aUV;

uniform globalUniforms {
  mat3 projectionMatrix;
  mat3 worldTransformMatrix;
  float worldAlpha;
};


uniform mat3 transformMatrix;
uniform vec4 color;
uniform mat3 uTextureTransform;
uniform vec4 uSizeAnchor;

out vec2 vTextureCoord;
out vec4 vColor;

void main(void)
{
    vec2 modifiedPosition = (aPosition - uSizeAnchor.zw) * uSizeAnchor.xy;
  
    gl_Position = vec4((projectionMatrix * worldTransformMatrix * transformMatrix * vec3(modifiedPosition, 1.0)).xy, 0.0, 1.0);

    vTextureCoord = (uTextureTransform * vec3(aUV, 1.0)).xy;

    vColor = color * worldAlpha;
}
