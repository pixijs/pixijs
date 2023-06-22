struct GlobalUniforms {
projectionMatrix:mat3x3<f32>,
  worldTransformMatrix:mat3x3<f32>,
  worldAlpha: f32
};

struct LocalUniforms {
  transformMatrix:mat3x3<f32>,
  color:vec4<f32>,
};

struct TilingUniforms {
  uMapCoord:mat3x3<f32>,
  uClampFrame:vec4<f32>,
  uClampOffset:vec2<f32>,
  uTextureTransform:mat3x3<f32>,
  uSizeAnchor:vec4<f32>
};

@group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
@group(1) @binding(0) var<uniform> localUniforms: LocalUniforms;

@group(2) @binding(0) var<uniform> tilingUniforms: TilingUniforms;
@group(2) @binding(1) var uTexture: texture_2d<f32>;
@group(2) @binding(2) var uSampler: sampler;


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

    var modifiedPosition = (aPosition - tilingUniforms.uSizeAnchor.zw) * tilingUniforms.uSizeAnchor.xy;
  
    var  mvpMatrix = globalUniforms.projectionMatrix * globalUniforms.worldTransformMatrix * localUniforms.transformMatrix;

    var  colorOut = localUniforms.color;

    colorOut.r *= colorOut.a;
    colorOut.g *= colorOut.a;
    colorOut.b *= colorOut.a;
    
  return VSOutput(
    vec4<f32>((mvpMatrix * vec3<f32>(modifiedPosition, 1.0)).xy, 0.0, 1.0),
    (tilingUniforms.uTextureTransform * vec3(aUV, 1.0)).xy,
    colorOut,
  );
};


@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @location(1) color:vec4<f32>,
) -> @location(0) vec4<f32> {

    var coord = uv + ceil(tilingUniforms.uClampOffset - uv);
    coord = (tilingUniforms.uMapCoord * vec3(coord, 1.0)).xy;
    var unclamped = coord;
    coord = clamp(coord, tilingUniforms.uClampFrame.xy, tilingUniforms.uClampFrame.zw);

    var bias = 0.;

    if(unclamped.x == coord.x && unclamped.y == coord.y)
    {
      bias = -32.;
    } 
    

    var finalColor = textureSampleBias(uTexture, uSampler, coord, bias);
    
   return finalColor * color;

}