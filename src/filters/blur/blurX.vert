attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;

uniform float strength;
uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying vec2 vBlurTexCoords[14];

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;

    vBlurTexCoords[ 0] = aTextureCoord + vec2(-0.028 * strength, 0.0);
    vBlurTexCoords[ 1] = aTextureCoord + vec2(-0.024 * strength, 0.0);
    vBlurTexCoords[ 2] = aTextureCoord + vec2(-0.020 * strength, 0.0);
    vBlurTexCoords[ 3] = aTextureCoord + vec2(-0.016 * strength, 0.0);
    vBlurTexCoords[ 4] = aTextureCoord + vec2(-0.012 * strength, 0.0);
    vBlurTexCoords[ 5] = aTextureCoord + vec2(-0.008 * strength, 0.0);
    vBlurTexCoords[ 6] = aTextureCoord + vec2(-0.004 * strength, 0.0);
    vBlurTexCoords[ 7] = aTextureCoord + vec2( 0.004 * strength, 0.0);
    vBlurTexCoords[ 8] = aTextureCoord + vec2( 0.008 * strength, 0.0);
    vBlurTexCoords[ 9] = aTextureCoord + vec2( 0.012 * strength, 0.0);
    vBlurTexCoords[10] = aTextureCoord + vec2( 0.016 * strength, 0.0);
    vBlurTexCoords[11] = aTextureCoord + vec2( 0.020 * strength, 0.0);
    vBlurTexCoords[12] = aTextureCoord + vec2( 0.024 * strength, 0.0);
    vBlurTexCoords[13] = aTextureCoord + vec2( 0.028 * strength, 0.0);

   vColor = vec4(aColor.rgb * aColor.a, aColor.a);
}
