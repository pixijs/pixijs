attribute vec2 aVertexPosition;
attribute vec4 aColor;
attribute vec2 aTextureCoord;

uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;

uniform float alpha;
uniform vec3 tint;

varying vec4 vColor;
varying vec2 vTextureCoord;

void main(void){
   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
   vColor = aColor;
   vColor.rgb *= aColor.a;
   vColor *= vec4(tint * alpha, alpha);
   vTextureCoord = aTextureCoord;
}
