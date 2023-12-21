in vec2 vMaskCoord;
in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform sampler2D mapTexture;

uniform float alpha;
uniform vec4 maskClamp;

out vec4 finalColor;

void main(void)
{
    float clip = step(3.5,
        step(maskClamp.x, vMaskCoord.x) +
        step(maskClamp.y, vMaskCoord.y) +
        step(vMaskCoord.x, maskClamp.z) +
        step(vMaskCoord.y, maskClamp.w));

    // TODO look into why this is needed
    float npmAlpha = alpha; 
    vec4 original = texture(uTexture, vTextureCoord);
    vec4 masky = texture(mapTexture, vMaskCoord);
    float alphaMul = 1.0 - npmAlpha * (1.0 - masky.a);

    original *= (alphaMul * masky.r * alpha * clip);

    finalColor = original;
}
