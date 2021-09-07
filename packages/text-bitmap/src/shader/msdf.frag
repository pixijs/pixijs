// Pixi texture info
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

// Tint
uniform vec4 uColor;

// fwidth equivalent smoothing factor (in our case, spread * scale)
uniform float uFWidth;

void main(void) {
  // Outline and drop shadow can be done via shader.
  // https://github.com/libgdx/libgdx/wiki/Distance-field-fonts

  float smoothing = 0.25 / uFWidth;

  vec4 fontColor = texture2D(uSampler, vTextureCoord);

  // MSDF
  float median = fontColor.r + fontColor.g + fontColor.b -
                 min(fontColor.r, min(fontColor.g, fontColor.b)) -
                 max(fontColor.r, max(fontColor.g, fontColor.b));
  // SDF
  median = min(median, fontColor.a);

  float alpha = smoothstep(0.5 - smoothing, 0.5 + smoothing, median);
  gl_FragColor = vec4(uColor * alpha);
}
