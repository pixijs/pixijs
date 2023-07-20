struct GlobalUniforms {
  projectionMatrix:mat3x3<f32>,
  worldTransformMatrix:mat3x3<f32>,
  worldAlpha: f32
}

struct GlobalFilterUniforms {
  inputSize:vec4<f32>,
  inputPixel:vec4<f32>,
  inputClamp:vec4<f32>,
  outputFrame:vec4<f32>,
  backgroundFrame:vec4<f32>,
  globalFrame:vec4<f32>,
};

struct AlphaUniforms {
  uAlpha:f32,
};

@group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;

@group(1) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(1) @binding(1) var iTexture: texture_2d<f32>;
@group(1) @binding(2) var iSampler : sampler;

@group(2) @binding(0) var<uniform> alphaUniforms : AlphaUniforms;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>,
  };

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * max(gfu.outputFrame.zw, vec2(0.)) + gfu.outputFrame.xy;

    return vec4((globalUniforms.projectionMatrix * globalUniforms.worldTransformMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
    return aPosition * (gfu.outputFrame.zw * gfu.inputSize.zw);
}

fn filterBackgroundTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
    return aPosition * gfu.backgroundFrame.zw;
}

fn globalTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
  return  (aPosition.xy / gfu.globalFrame.zw) + (gfu.globalFrame.xy / gfu.globalFrame.zw);  
}

fn getSize() -> vec2<f32>
{
  return gfu.globalFrame.zw;
}
  
@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>, 
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition),
  );
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
) -> @location(0) vec4<f32> {
  return textureSample(iTexture, iSampler, uv) * alphaUniforms.uAlpha;
}