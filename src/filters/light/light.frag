varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float radius;
uniform vec2 offset;
uniform vec2 direction;
uniform vec2 scale;
uniform vec4 dark;
uniform vec4 light;
uniform vec4 filterArea;
uniform float intensity;

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



float gradientLine ( float t, float b, float c, float d) {

    return c * sin(t/d * (PI/2.0)) + b;
    //return c * sqrt(1.0 - (t=t/d-1.0)*t) + b;
}

float gradient(vec2 coord)
{
    coord -= offset;

    coord += direction;

    coord *= scale;

    float dist = length(coord);

    float ratioDist = (radius - dist) / radius;
    ratioDist = max(ratioDist, 0.0);
    ratioDist = min(ratioDist, 1.0);

    ratioDist = gradientLine(ratioDist, 0.0, ratioDist, 1.0);

    return ratioDist;

}

void main(void)
{

    vec2 coord = mapCoord(vTextureCoord);

    float strength = gradient(coord);

    gl_FragColor = texture2D(uSampler, vTextureCoord );

    gl_FragColor *= mix(dark, light, strength);

    gl_FragColor.rgb += intensity*(1.0-strength)* gl_FragColor.a;

}
