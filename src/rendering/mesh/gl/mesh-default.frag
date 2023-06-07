in vec2 vTextureCoord;
in vec4 vColor;

uniform sampler2D uTexture;

out vec4 outColor;

void main(void){
   outColor = texture(uTexture, vTextureCoord) * vColor;
}