
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 v_rgbN;
varying vec2 v_rgbE;
varying vec2 v_rgbS;
varying vec2 v_rgbW;
varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;

uniform vec4 filterArea;

varying vec2 vTextureCoord;

void texcoords(vec2 fragCoord, vec2 resolution,
               out vec2 v_rgbNW, out vec2 v_rgbNE,
               out vec2 v_rgbSW, out vec2 v_rgbSE,
               out vec2 v_rgbM,
               out vec2 v_rgbN, out vec2 v_rgbE,
               out vec2 v_rgbS, out vec2 v_rgbW) {
    vec2 inverseVP = 1.0 / resolution.xy;
    float size = 30.0;

    v_rgbNW = (fragCoord + vec2(-size, -size)) * inverseVP;
    v_rgbNE = (fragCoord + vec2(size, -size)) * inverseVP;
    v_rgbSW = (fragCoord + vec2(-size, size)) * inverseVP;
    v_rgbSE = (fragCoord + vec2(size, size)) * inverseVP;
    v_rgbM = vec2(fragCoord * inverseVP);

    v_rgbN = (fragCoord + vec2(0.0, -size)) * inverseVP;
    v_rgbE = (fragCoord + vec2(size, 0.0)) * inverseVP;
    v_rgbS = (fragCoord + vec2(0.0, size)) * inverseVP;
    v_rgbW = (fragCoord + vec2(-size, 0.0)) * inverseVP;

}

void main(void) {

   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

   vTextureCoord = aTextureCoord;

   vec2 fragCoord = vTextureCoord * filterArea.xy;

   texcoords(fragCoord, filterArea.xy, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM, v_rgbN, v_rgbE, v_rgbS, v_rgbW);
}
