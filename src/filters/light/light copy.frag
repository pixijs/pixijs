varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float radius;
uniform vec2 offset;
uniform vec2 direction;
uniform vec2 scale;
uniform vec4 filterArea;

const float PI = 3.141592657;

vec2 mapCoord( vec2 coord )
{
    coord *= filterArea.xy;
    coord += filterArea.zw;

    return coord;
}

vec2 unmapCoord( vec2 coord )
{
    coord -= filterArea.zw;
    coord /= filterArea.xy;

    return coord;
}

float gradient (x, t, b, c, d) {

    return c * sin(t/d * (PI/2.0)) + b;
}

float gradient(vec2 coord)
{
    coord -= offset;

    coord += direction;

    coord *= scale;

    float dist = length(coord);

    if (dist < radius)
    {

    }

    float ratioDist = (radius - dist) / radius;
    ratioDist += ratioDist;
//    ratioDist *= ratioDist;
    ratioDist *= 0.5;

   // ratioDist = sin(ratioDist * PI * .5) * ratioDist;
    ratioDist = max(ratioDist, 0.3);

    return ratioDist;

}

void main(void)
{

    vec2 coord = mapCoord(vTextureCoord);


    float gradient_ = gradient(coord);

    gl_FragColor = texture2D(uSampler, vTextureCoord );
    gl_FragColor *= gradient_;

}
