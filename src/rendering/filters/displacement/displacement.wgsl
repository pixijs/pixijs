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

struct DisplacementUniforms {
  filterMatrix:mat3x3<f32>,
  scale:vec2<f32>,
  rotation:mat2x2<f32>
};



@group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;

@group(1) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(1) @binding(1) var myTexture: texture_2d<f32>;
@group(1) @binding(2) var mySampler : sampler;
@group(1) @binding(3) var backTexture: texture_2d<f32>;

@group(2) @binding(0) var<uniform> filterUniforms : DisplacementUniforms;
@group(2) @binding(1) var mapTexture: texture_2d<f32>;
@group(2) @binding(2) var mapSampler : sampler;




struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>,
    @location(1) backgroundUv : vec2<f32>,
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

fn getFilterCoord(aPosition:vec2<f32> ) -> vec2<f32>
{
  return ( filterUniforms.filterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;
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
   getFilterCoord(aPosition)
  );
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @location(1) filterUv: vec2<f32>,
  @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    var map = textureSample(mapTexture, mapSampler, filterUv);
    
    var offset =  gfu.inputSize.zw * (filterUniforms.rotation * (map.xy - 0.5)) * filterUniforms.scale; 
   
     return textureSample(myTexture, mySampler, clamp(uv + offset, gfu.inputClamp.xy, gfu.inputClamp.zw));
}