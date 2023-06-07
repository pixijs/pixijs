precision lowp float;

in vec2 vTextureCoord;
in vec4 vColor;

out vec4 outColor;

uniform sampler2D uTexture;
uniform mat3 uMapCoord;
uniform vec4 uClampFrame;
uniform vec2 uClampOffset;

void main(void)
{
    vec2 coord = vTextureCoord + ceil(uClampOffset - vTextureCoord);
    coord = (uMapCoord * vec3(coord, 1.0)).xy;
    vec2 unclamped = coord;
    coord = clamp(coord, uClampFrame.xy, uClampFrame.zw);

    vec4 texSample = texture(uTexture, coord, unclamped == coord ? 0.0f : -32.0f);// lod-bias very negative to force lod 0

    outColor = texSample * vColor;
}
