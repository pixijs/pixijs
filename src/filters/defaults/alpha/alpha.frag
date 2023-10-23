
in vec2 vTextureCoord;

out vec4 fragColor;

uniform float uAlpha;
uniform sampler2D uSampler;

void main()
{
    fragColor =  texture(uSampler, vTextureCoord) * uAlpha;
}
