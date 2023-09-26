
in vec2 vTextureCoord;
in vec4 vColor;

uniform vec4 inputSize;
uniform vec4 inputClamp;

out vec4 fragColor;

uniform vec2 uCenter;
uniform float uTime;
uniform float uSpeed;
uniform vec4 uWave;

uniform sampler2D uSampler;


const float PI = 3.14159;

void main()
{
    float uAmplitude = uWave[0];
    float uWavelength = uWave[1];
    float uBrightness = uWave[2];
    float uRadius = uWave[3];

    float halfWavelength = uWavelength * 0.5 / inputSize.x;
    float maxRadius = uRadius / inputSize.x;
    float currentRadius = uTime * uSpeed / inputSize.x;

    float fade = 1.0;

    if (maxRadius > 0.0) {
        if (currentRadius > maxRadius) {
            fragColor = texture(uSampler, vTextureCoord);
            return;
        }
        fade = 1.0 - pow(currentRadius / maxRadius, 2.0);
    }

    vec2 dir = vec2(vTextureCoord - uCenter / inputSize.xy);
    dir.y *= inputSize.y / inputSize.x;
    float dist = length(dir);

    if (dist <= 0.0 || dist < currentRadius - halfWavelength || dist > currentRadius + halfWavelength) {
        fragColor = texture(uSampler, vTextureCoord);
        return;
    }

    vec2 diffUV = normalize(dir);

    float diff = (dist - currentRadius) / halfWavelength;

    float p = 1.0 - pow(abs(diff), 2.0);

    // float powDiff = diff * pow(p, 2.0) * ( amplitude * fade );
    float powDiff = 1.25 * sin(diff * PI) * p * ( uAmplitude * fade );

    vec2 offset = diffUV * powDiff / inputSize.xy;

    // Do clamp :
    vec2 coord = vTextureCoord + offset;
    vec2 clampedCoord = clamp(coord, inputClamp.xy, inputClamp.zw);
    vec4 color = texture(uSampler, clampedCoord);
    if (coord != clampedCoord) {
        color *= max(0.0, 1.0 - length(coord - clampedCoord));
    }

    // No clamp :
    // fragColor = texture(uSampler, vTextureCoord + offset);

    color.rgb *= 1.0 + (uBrightness - 1.0) * p * fade;

    fragColor = color;
}
