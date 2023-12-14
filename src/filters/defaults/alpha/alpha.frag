
in vec2 vTextureCoord;

out vec4 finalColor;

uniform float uAlpha;
uniform sampler2D uSampler;

void main()
{
    finalColor =  texture(uSampler, vTextureCoord) * uAlpha;
}
