attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;

uniform mat4 projectionMatrix;
uniform mat3 otherMatrix;

varying vec2 vMapCoord;
varying vec2 vTextureCoord;
varying vec4 vColor;

void main(void)
{
   gl_Position = projectionMatrix * vec4(aVertexPosition, 0.0, 1.0);
   vTextureCoord = aTextureCoord;
   vMapCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;
   vColor = vec4(aColor.rgb * aColor.a, aColor.a);
}
