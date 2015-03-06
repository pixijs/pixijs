attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;
uniform vec2 offset;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;
varying vec4 vColor;

void main(void)
{
   gl_Position = vec4((projectionMatrix * vec3((aVertexPosition+offset), 1.0)).xy, 0.0, 1.0);
   vTextureCoord = aTextureCoord;
   vColor = vec4(aColor.rgb * aColor.a, aColor.a);
}
