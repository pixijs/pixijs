
in vec2 aPosition;
in vec2 aUV;

uniform globalUniforms {
  mat3 projectionMatrix;
  mat3 worldTransformMatrix;
  float worldAlpha;
};

uniform mat3 transformMatrix;
uniform vec4 color;

out vec2 vTextureCoord;
out vec4 vColor;

void main(void){
    gl_Position = vec4((projectionMatrix * worldTransformMatrix * transformMatrix * vec3(aPosition, 1.0)).xy, 0.0, 1.0);

    vTextureCoord = aUV;
    
    vColor = vec4(color.rgb * color.a, color.a) * worldAlpha;
}