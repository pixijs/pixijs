varying vec2 vMapCoord;
varying vec2 vTextureCoord;
varying vec4 vColor;

uniform vec2 scale;

uniform sampler2D uSampler;
uniform sampler2D mapSampler;

void main(void)
{
   vec4 map =  texture2D(mapSampler, vMapCoord);

   map -= 0.5;
   map.xy *= scale;

   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y));
}
