varying vec2 vTextureCoord;
uniform float alpha;
uniform vec3 tint;

uniform sampler2D uSampler;

void main(void)
{
    gl_FragColor = texture2D(uSampler, vTextureCoord) * vec4(tint * alpha, alpha);
}
