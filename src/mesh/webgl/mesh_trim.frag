varying vec2 vTextureCoord;
uniform float alpha;
uniform vec3 tint;
uniform vec4 uClampFrame;

uniform sampler2D uSampler;

void main(void)
{
    vec2 coord = vTextureCoord;
    if (coord.x < uClampFrame.x || coord.x > uClampFrame.z
        || coord.y < uClampFrame.y || coord.y > uClampFrame.w)
            discard;
    gl_FragColor = texture2D(uSampler, coord) * vec4(tint * alpha, alpha);
}
