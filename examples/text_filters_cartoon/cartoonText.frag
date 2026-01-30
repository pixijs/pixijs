precision highp float;
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform float uThickness;
uniform vec3 uBorderColor;
uniform vec3 uTopColor;
uniform vec3 uBottomColor;

in vec2 vOut;

uniform vec4 uInputClamp;
uniform vec4 uInputSize;

const float DOUBLE_PI = 6.28318530718; // 2 * PI
const float ANGLE_STEP = 0.0628319;

float outlineMaxAlphaAtPos(vec2 pos) {
    vec2 thickness = vec2(uThickness) / uInputSize.xy;
    float maxAlpha = 0.0;

    for (float angle = 0.0; angle <= DOUBLE_PI; angle += ANGLE_STEP) {
        vec2 displacedPos = pos + thickness * vec2(cos(angle), sin(angle));
        vec4 displacedColor = texture(uTexture, clamp(displacedPos, uInputClamp.xy, uInputClamp.zw));
        maxAlpha = max(maxAlpha, displacedColor.a);
    }

    return maxAlpha;
}

void main(void) {
    vec4 contentColor = texture(uTexture, vTextureCoord);
    vec2 thickness = uThickness / uInputSize.xy;
    vec2 offset = vec2(0.0, thickness.y * 0.6);

    float outlineAlpha = outlineMaxAlphaAtPos(vTextureCoord) * (1.0 - contentColor.a);
    vec4 outlineColor = vec4(uBorderColor * outlineAlpha, outlineAlpha);

    float outlineBaseAlpha = outlineMaxAlphaAtPos(vTextureCoord - offset);
    vec4 outlineBaseColor = vec4(mix(uBorderColor, vec3(0.0), 0.35) * outlineBaseAlpha, outlineBaseAlpha);
    outlineBaseColor *= (1.0 - outlineAlpha) * (1.0 - contentColor.a);

    float outlineDropShadowAlpha = outlineMaxAlphaAtPos(vTextureCoord - (offset * 2.0));
    vec4 outlineDropShadowColor = vec4(vec3(0.0) * outlineDropShadowAlpha, outlineDropShadowAlpha) * 0.3;
    outlineDropShadowColor *= (1.0 - outlineAlpha) * (1.0 - contentColor.a);

    vec4 innerShadowAlpha = texture(uTexture, vTextureCoord + vec2(0.0, -thickness.y * 0.35));
    innerShadowAlpha.a = (1.0 - innerShadowAlpha.a) * contentColor.a;
    vec4 innerShadowColor = vec4(vec3(0.0) * innerShadowAlpha.a, innerShadowAlpha.a) * 0.3;

    float curveAmount = -0.05;
    float horizonY = 0.54 + curveAmount * sin(vOut.x * 3.14159);
    float gradientStart = horizonY - 0.005;
    float gradientEnd = horizonY + 0.005;
    float gradientRatio = smoothstep(gradientStart, gradientEnd, vOut.y);

    vec4 gradientColor = mix(vec4(uTopColor, 1.0), vec4(uBottomColor, 1.0), gradientRatio);
    gradientColor *= contentColor.a;

    finalColor = mix(gradientColor, innerShadowColor, innerShadowColor.a) + outlineColor + outlineBaseColor + outlineDropShadowColor;
}
