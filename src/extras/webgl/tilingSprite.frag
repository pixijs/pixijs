varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 uColor;
uniform mat3 uMapCoord;
uniform vec4 uFrame;
uniform vec2 uPixelSize;

void main(void)
{
    vec2 coord = mod(vTextureCoord, vec2(1.0, 1.0));
    coord = (uMapCoord * vec3(coord, 1.0)).xy;
    coord = clamp(coord, uFrame.xy, uFrame.zw);

    vec4 sample = texture2D(uSampler, coord);
    vec4 color = vec4(uColor.rgb * uColor.a, uColor.a);

    gl_FragColor = sample * color ;
}
