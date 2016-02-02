precision highp float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform float noise;
uniform sampler2D uSampler;

float rand(vec2 co)
{
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main()
{
    vec4 color = texture2D(uSampler, vTextureCoord);

    float diff = (rand(vTextureCoord) - 0.5) * noise;

    color.r += diff;
    color.g += diff;
    color.b += diff;

    gl_FragColor = color;
}
