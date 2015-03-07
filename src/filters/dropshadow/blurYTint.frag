precision lowp float;

varying vec2 vTextureCoord;
varying vec2 vBlurTexCoords[14];
varying vec4 vColor;

uniform float blur;
uniform vec3 color;
uniform float alpha;

uniform sampler2D uSampler;

void main(void)
{
    vec4 sum = vec4(0.0);

    sum += texture2D(uSampler, vBlurTexCoords[ 0])*0.0044299121055113265;
    sum += texture2D(uSampler, vBlurTexCoords[ 1])*0.00895781211794;
    sum += texture2D(uSampler, vBlurTexCoords[ 2])*0.0215963866053;
    sum += texture2D(uSampler, vBlurTexCoords[ 3])*0.0443683338718;
    sum += texture2D(uSampler, vBlurTexCoords[ 4])*0.0776744219933;
    sum += texture2D(uSampler, vBlurTexCoords[ 5])*0.115876621105;
    sum += texture2D(uSampler, vBlurTexCoords[ 6])*0.147308056121;
    sum += texture2D(uSampler, vTextureCoord         )*0.159576912161;
    sum += texture2D(uSampler, vBlurTexCoords[ 7])*0.147308056121;
    sum += texture2D(uSampler, vBlurTexCoords[ 8])*0.115876621105;
    sum += texture2D(uSampler, vBlurTexCoords[ 9])*0.0776744219933;
    sum += texture2D(uSampler, vBlurTexCoords[10])*0.0443683338718;
    sum += texture2D(uSampler, vBlurTexCoords[11])*0.0215963866053;
    sum += texture2D(uSampler, vBlurTexCoords[12])*0.00895781211794;
    sum += texture2D(uSampler, vBlurTexCoords[13])*0.0044299121055113265;

    gl_FragColor = vec4( color.rgb * sum.a * alpha, sum.a * alpha );
}
