varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 uColor;

void main(void)
{
    vec4 _sample = texture2D(uSampler, vTextureCoord);
    gl_FragColor = _sample * uColor;
}
