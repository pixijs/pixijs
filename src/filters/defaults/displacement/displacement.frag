
in vec2 vTextureCoord;
in vec2 vFilterUv;

out vec4 finalColor;

uniform sampler2D uTexture;
uniform sampler2D uMapTexture;

uniform vec4 filterArea;
uniform vec4 filterClamp;
uniform vec4 inputClamp;
uniform highp vec4 inputSize;
uniform mat2 rotation;
uniform vec2 scale;


void main()
{
vec4 map = texture(uMapTexture, vFilterUv);
    
    vec2 offset = inputSize.zw * (rotation * (map.xy - 0.5)) * scale; 

    finalColor = texture(uTexture, clamp(vTextureCoord + offset, inputClamp.xy, inputClamp.zw));
}
