precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float sepia;

const mat3 sepiaMatrix = mat3(0.3588, 0.7044, 0.1368, 0.2990, 0.5870, 0.1140, 0.2392, 0.4696, 0.0912);

void main(void)
{
   gl_FragColor = texture2D(uSampler, vTextureCoord);
   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * sepiaMatrix, sepia);
}
