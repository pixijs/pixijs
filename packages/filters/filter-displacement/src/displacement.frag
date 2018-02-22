varying vec2 vFilterCoord;
varying vec2 vTextureCoord;
varying vec4 vFilterClamp;

uniform vec2 scale;

uniform sampler2D uSampler;
uniform sampler2D mapSampler;

uniform vec4 destinationFrame;

void main(void)
{
  vec4 map =  texture2D(mapSampler, vFilterCoord);

  map -= 0.5;
  map.xy *= scale / destinationFrame.zw;

  gl_FragColor = texture2D(uSampler, clamp(vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y), vFilterClamp.xy, vFilterClamp.zw));
}
