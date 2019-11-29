/* Absolute Coordinates Supplement Shader */

varying vec2 vTextureCoord;
varying vec2 vAbsoluteCoord;// unused!

uniform sampler2D uSampler;

void main(void){
   gl_FragColor = texture2D(uSampler, vTextureCoord);
}
