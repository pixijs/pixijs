struct GlobalUniforms {
  projectionMatrix:mat3x3<f32>,
  worldTransformMatrix:mat3x3<f32>,
  worldAlpha: f32
}

struct LocalUniforms {
  transformMatrix:mat3x3<f32>,
  color:vec4<f32>
}


@group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
@group(1) @binding(0) var<uniform> localUniforms: LocalUniforms;

@group(2) @binding(0) var uTexture: texture_2d<f32>;
@group(2) @binding(1) var uSampler: sampler;



struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>,
    @location(1) color : vec4<f32>,
  };

  
@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>, 
  @location(1) aUV : vec2<f32>,
) -> VSOutput {

    var  mvpMatrix = globalUniforms.projectionMatrix * globalUniforms.worldTransformMatrix * localUniforms.transformMatrix;

    var  colorOut = localUniforms.color;

    colorOut.r *= colorOut.a;
    colorOut.g *= colorOut.a;
    colorOut.b *= colorOut.a;
    
  return VSOutput(
    vec4<f32>((mvpMatrix * vec3<f32>(aPosition, 1.0)).xy, 0.0, 1.0),
    aUV,
    colorOut,
  );
};


@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @location(1) color:vec4<f32>,
) -> @location(0) vec4<f32> {

  return textureSample(uTexture, uSampler, uv) * color;
  
}