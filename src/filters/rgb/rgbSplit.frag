precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 dimensions;
uniform vec2 red;
uniform vec2 green;
uniform vec2 blue;

void main(void)
{
   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/dimensions.xy).r;
   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/dimensions.xy).g;
   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/dimensions.xy).b;
   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;
}
