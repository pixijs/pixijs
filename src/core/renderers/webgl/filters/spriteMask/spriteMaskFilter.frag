varying vec2 vMaskCoord;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float alpha;
uniform sampler2D mask;

void main(void)
{
    // check clip! this will stop the mask bleeding out from the edges
    vec2 text = abs( vMaskCoord - 0.5 );
    text = step(0.5, text);

    float clip = 1.0 - max(text.y, text.x);
    vec4 original = texture2D(uSampler, vTextureCoord);
    vec4 masky = texture2D(mask, vMaskCoord);

    original *= (masky.r * masky.a * alpha * clip);

    gl_FragColor = original;
}
