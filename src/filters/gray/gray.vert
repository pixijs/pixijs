attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 projectionMatrix;
varying vec2 vTextureCoord;

void main(void){
    gl_Position = projectionMatrix * vec4(aVertexPosition, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}
