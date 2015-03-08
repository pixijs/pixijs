precision lowp float;

varying vec2 vTextureCoord;
varying vec2 vBlurTexCoords[6];
varying vec4 vColor;

uniform sampler2D uSampler;

void main(void)
{
    gl_FragColor = vec4(0.0);

    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 0])*0.004431848411938341;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 1])*0.05399096651318985;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 2])*0.2419707245191454;
    gl_FragColor += texture2D(uSampler, vTextureCoord     )*0.3989422804014327;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 3])*0.2419707245191454;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 4])*0.05399096651318985;
    gl_FragColor += texture2D(uSampler, vBlurTexCoords[ 5])*0.004431848411938341;
}
