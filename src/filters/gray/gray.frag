varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float gray;

void main(void)
{
   gl_FragColor = texture2D(uSampler, vTextureCoord);
   gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.2126*gl_FragColor.r + 0.7152*gl_FragColor.g + 0.0722*gl_FragColor.b), gray);
}
