 precision highp float;
in vec2 vTextureCoord;
out vec4 finalColor;

uniform vec2 uMouse;
uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform float uTime;

void main() {
    vec2 screenPos = vTextureCoord * uInputSize.xy + uOutputFrame.xy;
    if (length(uMouse - screenPos) < 25.0) {
        finalColor = vec4(1.0, 1.0, 0.0, 1.0) * 0.7; //yellow circle, alpha=0.7
    } else {
        // blend with underlying image, alpha=0.5
        finalColor = vec4( sin(uTime), (uMouse.xy - uOutputFrame.xy) / uOutputFrame.zw, 1.0) * 0.5;
    }
}