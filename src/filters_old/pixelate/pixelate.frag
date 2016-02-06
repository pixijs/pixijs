precision mediump float;

varying vec2 vTextureCoord;

uniform vec4 dimensions;
uniform vec2 pixelSize;
uniform sampler2D uSampler;

void main(void)
{
    vec2 coord = vTextureCoord;

    vec2 size = dimensions.xy / pixelSize;

    vec2 color = floor( ( vTextureCoord * size ) ) / size + pixelSize/dimensions.xy * 0.5;

    gl_FragColor = texture2D(uSampler, color);
}
