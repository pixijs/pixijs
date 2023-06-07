struct GlobalUniforms {
  projectionMatrix:mat3x3<f32>,
  worldTransformMatrix:mat3x3<f32>,
  worldAlpha: f32
}

@group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>,
    @location(1) color : vec4<f32>,
    @location(2) @interpolate(flat) textureId : u32,
  };

  
@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>, 
  @location(1) aUV : vec2<f32>,
  @location(2) aColor : vec4<f32>,
  @location(3) aTexture : f32,
) -> VSOutput {

  var  mvpMatrix = globalUniforms.projectionMatrix * globalUniforms.worldTransformMatrix;

  var  colorOut = aColor;

  var alpha = vec4<f32>(
    colorOut.a * globalUniforms.worldAlpha,
    colorOut.a * globalUniforms.worldAlpha,
    colorOut.a * globalUniforms.worldAlpha,
    globalUniforms.worldAlpha
  );

  colorOut *= alpha;


  return VSOutput(
    vec4<f32>((mvpMatrix * vec3<f32>(aPosition, 1.0)).xy, 0.0, 1.0),
    aUV,
    colorOut,
    u32(aTexture)
  );
};

%bindings%

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @location(1) color:vec4<f32>,
  @location(2) @interpolate(flat) textureId: u32,
) -> @location(0) vec4<f32> {


    var uvDx = dpdx(uv);
    var uvDy = dpdy(uv);

    var outColor:vec4<f32>;
    
    %forloop%
  
    // multiply the alpha!
    outColor.r *= outColor.a;
    outColor.g *= outColor.a;
    outColor.b *= outColor.a;

    return (outColor) * color;
};
