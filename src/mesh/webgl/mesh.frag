varying vec2 vTextureCoord;
uniform float alpha;
uniform vec3 tint;

uniform sampler2D uSampler2;

void main(void)
{
    gl_FragColor = texture2D(uSampler2, vTextureCoord) * vec4(tint * alpha, alpha);
}
