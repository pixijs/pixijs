varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 uColor;

void main(void)
{
    vec4 sample = texture2D(uSampler, vTextureCoord);
    vec4 color = vec4(uColor.rgb * uColor.a, uColor.a);
    gl_FragColor = sample * color;
}
