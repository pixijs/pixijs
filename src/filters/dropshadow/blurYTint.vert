attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;

uniform float strength;
uniform vec2 offset;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying vec2 vBlurTexCoords[6];

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3((aVertexPosition+offset), 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;

    vBlurTexCoords[ 0] = aTextureCoord + vec2(0.0, -0.012 * strength);
    vBlurTexCoords[ 1] = aTextureCoord + vec2(0.0, -0.008 * strength);
    vBlurTexCoords[ 2] = aTextureCoord + vec2(0.0, -0.004 * strength);
    vBlurTexCoords[ 3] = aTextureCoord + vec2(0.0,  0.004 * strength);
    vBlurTexCoords[ 4] = aTextureCoord + vec2(0.0,  0.008 * strength);
    vBlurTexCoords[ 5] = aTextureCoord + vec2(0.0,  0.012 * strength);

   vColor = vec4(aColor.rgb * aColor.a, aColor.a);
}
