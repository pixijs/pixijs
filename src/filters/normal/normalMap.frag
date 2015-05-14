precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D displacementMap;
uniform sampler2D uSampler;

uniform vec4 dimensions;

const vec2 Resolution = vec2(1.0,1.0);      //resolution of screen
uniform vec3 LightPos;    //light position, normalized
const vec4 LightColor = vec4(1.0, 1.0, 1.0, 1.0);      //light RGBA -- alpha is intensity
const vec4 AmbientColor = vec4(1.0, 1.0, 1.0, 0.5);    //ambient RGBA -- alpha is intensity
const vec3 Falloff = vec3(0.0, 1.0, 0.2);         //attenuation coefficients

uniform vec3 LightDir; // = vec3(1.0, 0.0, 1.0);

uniform vec2 mapDimensions; // = vec2(256.0, 256.0);


void main(void)
{
    vec2 mapCords = vTextureCoord.xy;

    vec4 color = texture2D(uSampler, vTextureCoord.st);
    vec3 nColor = texture2D(displacementMap, vTextureCoord.st).rgb;


    mapCords *= vec2(dimensions.x/512.0, dimensions.y/512.0);

    mapCords.y *= -1.0;
    mapCords.y += 1.0;

    // RGBA of our diffuse color
    vec4 DiffuseColor = texture2D(uSampler, vTextureCoord);

    // RGB of our normal map
    vec3 NormalMap = texture2D(displacementMap, mapCords).rgb;

    // The delta position of light
    // vec3 LightDir = vec3(LightPos.xy - (gl_FragCoord.xy / Resolution.xy), LightPos.z);
    vec3 LightDir = vec3(LightPos.xy - (mapCords.xy), LightPos.z);

    // Correct for aspect ratio
    // LightDir.x *= Resolution.x / Resolution.y;

    // Determine distance (used for attenuation) BEFORE we normalize our LightDir
    float D = length(LightDir);

    // normalize our vectors
    vec3 N = normalize(NormalMap * 2.0 - 1.0);
    vec3 L = normalize(LightDir);

    // Pre-multiply light color with intensity
    // Then perform 'N dot L' to determine our diffuse term
    vec3 Diffuse = (LightColor.rgb * LightColor.a) * max(dot(N, L), 0.0);

    // pre-multiply ambient color with intensity
    vec3 Ambient = AmbientColor.rgb * AmbientColor.a;

    // calculate attenuation
    float Attenuation = 1.0 / ( Falloff.x + (Falloff.y*D) + (Falloff.z*D*D) );

    // the calculation which brings it all together
    vec3 Intensity = Ambient + Diffuse * Attenuation;
    vec3 FinalColor = DiffuseColor.rgb * Intensity;
    gl_FragColor = vColor * vec4(FinalColor, DiffuseColor.a);

    // gl_FragColor = vec4(1.0, 0.0, 0.0, Attenuation); // vColor * vec4(FinalColor, DiffuseColor.a);

/*
    // normalise color
    vec3 normal = normalize(nColor * 2.0 - 1.0);

    vec3 deltaPos = vec3( (light.xy - gl_FragCoord.xy) / resolution.xy, light.z );

    float lambert = clamp(dot(normal, lightDir), 0.0, 1.0);

    float d = sqrt(dot(deltaPos, deltaPos));
    float att = 1.0 / ( attenuation.x + (attenuation.y*d) + (attenuation.z*d*d) );

    vec3 result = (ambientColor * ambientIntensity) + (lightColor.rgb * lambert) * att;
    result *= color.rgb;

    gl_FragColor = vec4(result, 1.0);
*/
}
