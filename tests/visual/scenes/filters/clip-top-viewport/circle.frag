precision highp float;

in vec2 vTextureCoord;
out vec4 finalColor;

uniform vec4 filterArea;
uniform sampler2D uTexture;
uniform vec4 uInputSize;

vec2 center = vec2(0.5);
float angleToRotate = 45.0 * (3.14159265 / 180.0);

vec2 mapCoord( vec2 coord )
{
    coord *= uInputSize.xy;
    coord += uInputSize.zw;

    return coord;
}

vec2 unmapCoord( vec2 coord )
{
    coord -= uInputSize.zw;
    coord /= uInputSize.xy;

    return coord;
}

void main(void)
{
    vec2 centerInPx = mapCoord(center);
    vec2 coord = mapCoord(vTextureCoord);
    coord -= centerInPx;

    float radius = length(coord);
    float angle = atan(coord.y, coord.x) + angleToRotate;

    vec2 rotatedPoint = coord;

    if (radius < 32.0) {
        rotatedPoint = vec2(cos(angle), sin(angle)) * radius;
    }

    rotatedPoint += centerInPx;
    rotatedPoint = unmapCoord(rotatedPoint);

    finalColor = texture(uTexture, rotatedPoint);
}
