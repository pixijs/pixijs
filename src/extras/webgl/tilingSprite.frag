varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 uColor;
uniform vec4 uFrame;
uniform vec2 uPixelSize;

void main(void)
{

   	vec2 coord = mod(vTextureCoord, uFrame.zw);
   	coord = clamp(coord, uPixelSize, uFrame.zw - uPixelSize);
   	coord += uFrame.xy;

   	vec4 sample = texture2D(uSampler, coord);
  	vec4 color = vec4(uColor.rgb * uColor.a, uColor.a);

   	gl_FragColor = sample * color ;
}
