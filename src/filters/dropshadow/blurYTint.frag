precision lowp float;

varying vec2 vTextureCoord;
varying vec2 vBlurTexCoords[6];
varying vec4 vColor;

uniform vec3 color;
uniform float alpha;

uniform sampler2D uSampler;

void main(void)
{
    vec4 sum = vec4(0.0);

    sum += texture2D(uSampler, vBlurTexCoords[ 0])*0.004431848411938341;
    sum += texture2D(uSampler, vBlurTexCoords[ 1])*0.05399096651318985;
    sum += texture2D(uSampler, vBlurTexCoords[ 2])*0.2419707245191454;
    sum += texture2D(uSampler, vTextureCoord     )*0.3989422804014327;
    sum += texture2D(uSampler, vBlurTexCoords[ 3])*0.2419707245191454;
    sum += texture2D(uSampler, vBlurTexCoords[ 4])*0.05399096651318985;
    sum += texture2D(uSampler, vBlurTexCoords[ 5])*0.004431848411938341;

    gl_FragColor = vec4( color.rgb * sum.a * alpha, sum.a * alpha );
}
