precision mediump float;
varying vec2 vUvs;
uniform float amount;
uniform float phase;
uniform sampler2D texIn;

void main()
{
    //Generate a simple grid.
    vec2 uv = vUvs;
    //Calculate distance from center
    float distance = length( uv - vec2(0.5));
    vec4 color = texture2D(texIn, uv);
    color.rgb *= sin(distance*25.0+phase) * amount+1.;
    finalColor = color;
}