varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;

#pragma glslify: fxaa = require('./fxaa.glsl')

void main() {

  	vec2 fragCoord = vTextureCoord * filterArea.xy;

  	vec4 color;

    color = fxaa(uSampler, fragCoord, filterArea.xy, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);

  	gl_FragColor = color;
}
