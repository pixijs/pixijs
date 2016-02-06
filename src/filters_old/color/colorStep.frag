precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float step;

void main(void)
{
    vec4 color = texture2D(uSampler, vTextureCoord);

    color = floor(color * step) / step;

    gl_FragColor = color;
}
