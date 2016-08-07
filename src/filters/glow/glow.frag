varying vec2 vTextureCoord;
varying vec2 vTextureCoordScaled;

uniform sampler2D uSampler;
uniform sampler2D uBlurSampler;
uniform float strength;
uniform float haloStrength;


void main(void)
{
  vec4 original = texture2D(uSampler, vTextureCoord);
  vec4 bluredNormal = texture2D(uBlurSampler, vTextureCoord);

  vec4 originalScaled = texture2D(uSampler, vTextureCoordScaled);
  vec4 bluredScaled = texture2D(uBlurSampler, vTextureCoordScaled);


  float intensity = 2.0;
  float alpha = max(bluredNormal.a * intensity, original.a);
  alpha = min(alpha, 1.0);

  vec4 originalColor = vec4(125.0/255.0, 249.0/255.0, 255.0/255.0, 0.0);
  vec4 color = originalColor * alpha;

  color *= strength;


  float knockout = bluredScaled.a * ( 1.0-originalScaled.a );
  bluredScaled *= knockout;
  bluredScaled *= 3.0;
  bluredScaled *= haloStrength * strength;
  bluredScaled = originalColor * bluredScaled.a;

  gl_FragColor = color + (bluredScaled  * (1.0-color.a) );


}
