in vec2 vTextureCoord;
in vec4 vColor;
in float vTextureId;
uniform sampler2D uSamplers[%count%];

out vec4 finalColor;

void main(void){
    vec4 outColor;
    %forloop%
    finalColor = outColor * vColor;
}
