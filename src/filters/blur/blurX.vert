attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform float strength;
uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;
varying vec2 vBlurTexCoords[15];

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;

    vBlurTexCoords[ 0] = aTextureCoord + vec2(-7.0 * strength, 0.0);
    vBlurTexCoords[ 1] = aTextureCoord + vec2(-6.0 * strength, 0.0);
    vBlurTexCoords[ 2] = aTextureCoord + vec2(-5.0 * strength, 0.0);
    vBlurTexCoords[ 3] = aTextureCoord + vec2(-4.0 * strength, 0.0);
    vBlurTexCoords[ 4] = aTextureCoord + vec2(-3.0 * strength, 0.0);
    vBlurTexCoords[ 5] = aTextureCoord + vec2(-2.0 * strength, 0.0);
    vBlurTexCoords[ 6] = aTextureCoord + vec2(-1.0 * strength, 0.0);
    vBlurTexCoords[ 7] = aTextureCoord;
    vBlurTexCoords[ 8] = aTextureCoord + vec2(1.0 * strength, 0.0);
    vBlurTexCoords[ 9] = aTextureCoord + vec2(2.0 * strength, 0.0);
    vBlurTexCoords[ 10] = aTextureCoord + vec2(3.0 * strength, 0.0);
    vBlurTexCoords[ 11] = aTextureCoord + vec2(4.0 * strength, 0.0);
    vBlurTexCoords[ 12] = aTextureCoord + vec2(5.0 * strength, 0.0);
    vBlurTexCoords[ 13] = aTextureCoord + vec2(6.0 * strength, 0.0);
    vBlurTexCoords[ 14] = aTextureCoord + vec2(7.0 * strength, 0.0);

}
