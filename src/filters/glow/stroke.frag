varying vec2 v_rgbN;
varying vec2 v_rgbE;
varying vec2 v_rgbS;
varying vec2 v_rgbW;
varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;


vec4 stroke(sampler2D tex, vec2 fragCoord, vec2 resolution,
          vec2 v_rgbNW, vec2 v_rgbNE,
          vec2 v_rgbSW, vec2 v_rgbSE,
          vec2 v_rgbM,
          vec2 v_rgbN, vec2 v_rgbE,
          vec2 v_rgbS, vec2 v_rgbW) {
    vec4 color;
    mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);

    float rgbNW = texture2D(tex, v_rgbNW).a;
    float rgbNE = texture2D(tex, v_rgbNE).a;
    float rgbSW = texture2D(tex, v_rgbSW).a;
    float rgbSE = texture2D(tex, v_rgbSE).a;
    float rgbN = texture2D(tex, v_rgbN).a;
    float rgbE = texture2D(tex, v_rgbE).a;
    float rgbS = texture2D(tex, v_rgbS).a;
    float rgbW = texture2D(tex, v_rgbW).a;

    vec4 texColor = texture2D(tex, v_rgbM);

    float intensity = rgbNW + rgbNE + rgbSW + rgbSE + rgbN + rgbE + rgbS + rgbW + texColor.a;

    vec4 outline = vec4(1.0, 0.0, 0.0, 1.0) * intensity;
    return mix(outline, texColor, texColor.a);
}

void main() {

  	vec2 fragCoord = vTextureCoord * filterArea.xy;

  	vec4 color;

    color = stroke(uSampler, fragCoord, filterArea.xy, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM, v_rgbN, v_rgbS, v_rgbE, v_rgbW);

  	gl_FragColor = color;
}
