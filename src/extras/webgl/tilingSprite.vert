attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;

uniform vec4 uFrame;
uniform vec4 uTransform;

varying vec2 vTextureCoord;
varying vec4 vColor;

void main(void)
{
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    vec2 coord = aTextureCoord;
    coord -= uTransform.xy;
    coord /= uTransform.zw;
    vTextureCoord = coord;

    vColor = vec4(aColor.rgb * aColor.a, aColor.a);
}
