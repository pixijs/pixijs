// Pixi texture info
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

// Tint
uniform vec4 uColor;

// on 2D applications fwidth is screenScale / glyphAtlasScale * distanceFieldRange
uniform float uFWidth;

void main(void) {
  // Outline and drop shadow can be done via shader.
  // https://github.com/libgdx/libgdx/wiki/Distance-field-fonts

  vec4 texColor = texture2D(uSampler, vTextureCoord);

  if (uFWidth > 0.0) {

    // To stack MSDF and SDF we need a non-pre-multiplied-alpha texture.

    // MSDF
    float median = texColor.r + texColor.g + texColor.b -
                   min(texColor.r, min(texColor.g, texColor.b)) -
                   max(texColor.r, max(texColor.g, texColor.b));
    // SDF
    median = min(median, texColor.a);

    float screenPxDistance = uFWidth * (median - 0.5);
    float alpha = clamp(screenPxDistance + 0.5, 0.0, 1.0);

    gl_FragColor = vec4(uColor * alpha);
  } else {
    gl_FragColor = texColor * uColor;
  }
}
