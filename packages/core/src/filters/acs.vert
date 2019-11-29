/* Absolute Coordinates Supplement Shader */

attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;// actually the input texture coord (gl_FragColor to set output)
varying vec2 vAbsoluteCoord;

uniform vec4 inputSize;
uniform vec4 inputFrame;
uniform vec4 outputFrame;

void main(void)
{
    vec2 absolutePosition = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    // projected position!
    gl_Position = vec4((projectionMatrix * vec3(absolutePosition, 1.0)).xy, 0.0, 1.0);

    vec2 outTextureCoord = aVertexPosition * (outputFrame.zw * inputSize.zw);
    vTextureCoord = clamp(outTextureCoord - (inputFrame.xy - outputFrame.xy) * inputSize.zw,
        vec2(0, 0), vec2((inputFrame.zw - vec2(0.5, 0.5)) * inputSize.zw));
    vAbsoluteCoord = absolutePosition;
}
