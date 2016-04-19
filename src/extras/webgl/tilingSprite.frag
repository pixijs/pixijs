varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;
uniform vec4 uFrame;
uniform vec2 uPixelSize;

void main(void)
{

   vec2 coord = mod(vTextureCoord, uFrame.zw);
   coord = clamp(coord, uPixelSize, uFrame.zw - uPixelSize);
   coord += uFrame.xy;

   gl_FragColor =  texture2D(uSampler, coord) ;
}
