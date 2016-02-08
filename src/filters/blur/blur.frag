precision mediump float;

varying vec2 vTextureCoord;
varying vec2 vBlurTexCoords[15];

uniform sampler2D uSampler;

void main(void)
{
    gl_FragColor = vec4(0.0);

    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 0]) * 0.000489;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 1]) * 0.002403;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 2]) * 0.009246;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 3]) * 0.02784;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 4]) * 0.065602;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 5]) * 0.120999;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 6]) * 0.174697;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 7]) * 0.197448;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 8]) * 0.174697;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 9]) * 0.120999;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 10]) * 0.065602;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 11]) * 0.02784;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 12]) * 0.009246;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 13]) * 0.002403;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 14]) * 0.000489;
    



}
