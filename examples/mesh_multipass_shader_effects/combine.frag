precision mediump float;
varying vec2 vUvs;

uniform sampler2D texRipple;
uniform sampler2D texNoise;
uniform sampler2D texWave;

void main()
{
    //Read color from all
    vec4 ripple = texture2D(texRipple, vUvs);
    vec4 noise = texture2D(texNoise, vUvs);
    vec4 wave = texture2D(texWave, vUvs);

    gl_FragColor = mix(ripple, wave,noise.r);
}