struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

struct CartoonTextUniforms {
  uThickness:f32,
  uBorderColor:vec3<f32>,
  uTopColor:vec3<f32>,
  uBottomColor:vec3<f32>,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler : sampler;

@group(1) @binding(0) var<uniform> cartoonTextUniforms : CartoonTextUniforms;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>,
    @location(1) vOut : vec2<f32>,
};

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
  return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>, 
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition),
   aPosition,
  );
}

const DOUBLE_PI: f32 = 6.28318530718; // 2 * PI
const ANGLE_STEP: f32 = 0.0628319;

fn outlineMaxAlphaAtPos(pos: vec2<f32>) -> f32 {
    let thickness = vec2<f32>(cartoonTextUniforms.uThickness) / gfu.uInputSize.xy;
    var maxAlpha: f32 = 0.0;

    for (var angle: f32 = 0.0; angle <= DOUBLE_PI; angle += ANGLE_STEP) {
        let displacedPos = pos + thickness * vec2<f32>(cos(angle), sin(angle));
        let displacedColor = textureSample(uTexture, uSampler, clamp(displacedPos, gfu.uInputClamp.xy, gfu.uInputClamp.zw));
        maxAlpha = max(maxAlpha, displacedColor.a);
    }

    return maxAlpha;
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @location(1) vOut: vec2<f32>,
) -> @location(0) vec4<f32> {

    let contentColor = textureSample(uTexture, uSampler, uv);
    let thickness = cartoonTextUniforms.uThickness / gfu.uInputSize.xy;
    let offset = vec2<f32>(0.0, thickness.y * 0.6);

    let outlineAlpha = outlineMaxAlphaAtPos(uv) * (1.0 - contentColor.a);
    let outlineColor = vec4<f32>(cartoonTextUniforms.uBorderColor * outlineAlpha, outlineAlpha);

    let outlineBaseAlpha = outlineMaxAlphaAtPos(uv - offset);
    var outlineBaseColor = vec4<f32>(mix(cartoonTextUniforms.uBorderColor, vec3<f32>(0.0), 0.35) * outlineBaseAlpha, outlineBaseAlpha);
    outlineBaseColor *= (1.0 - outlineAlpha) * (1.0 - contentColor.a);

    let outlineDropShadowAlpha = outlineMaxAlphaAtPos(uv - (offset * 2.0));
    var outlineDropShadowColor = vec4<f32>(vec3<f32>(0.0) * outlineDropShadowAlpha, outlineDropShadowAlpha) * 0.3;
    outlineDropShadowColor *= (1.0 - outlineAlpha) * (1.0 - contentColor.a);

    let innerShadowAlpha = textureSample(uTexture, uSampler, uv + vec2<f32>(0.0, -thickness.y * 0.35));
    let innerShadowAlphaValue = (1.0 - innerShadowAlpha.a) * contentColor.a;
    let innerShadowColor = vec4<f32>(vec3<f32>(0.0) * innerShadowAlphaValue, innerShadowAlphaValue) * 0.3;

    let curveAmount: f32 = -0.05;
    let horizonY = 0.54 + curveAmount * sin(vOut.x * 3.14159);
    let gradientStart = horizonY - 0.005;
    let gradientEnd = horizonY + 0.005;
    let gradientRatio = smoothstep(gradientStart, gradientEnd, vOut.y);

    var gradientColor = mix(vec4<f32>(cartoonTextUniforms.uTopColor, 1.0), vec4<f32>(cartoonTextUniforms.uBottomColor, 1.0), gradientRatio);
    gradientColor *= contentColor.a;

    return mix(gradientColor, innerShadowColor, innerShadowColor.a) + outlineColor + outlineBaseColor + outlineDropShadowColor;
} 