varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

uniform sampler2D uSampler;
uniform sampler2D filterSampler;

void main(void){
   vec4 masky = texture2D(filterSampler, vFilterCoord);
   vec4 sample = texture2D(uSampler, vTextureCoord);
   vec4 color;
   if(mod(vFilterCoord.x, 1.0) > 0.5)
   {
     color = vec4(1.0, 0.0, 0.0, 1.0);
   }
   else
   {
     color = vec4(0.0, 1.0, 0.0, 1.0);
   }
   // gl_FragColor = vec4(mod(vFilterCoord.x, 1.5), vFilterCoord.y,0.0,1.0);
   gl_FragColor = mix(sample, masky, 0.5);
   gl_FragColor *= sample.a;
}
