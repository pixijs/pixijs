struct GlobalUniforms {
    projectionMatrix:mat3x3<f32>,
    worldTransformMatrix:mat3x3<f32>,
    worldColorAlpha: vec4<f32>,
    uResolution: vec2<f32>,
}

struct LocalUniforms {
    uTransformMatrix:mat3x3<f32>,
    uColor:vec4<f32>,
    uRound:f32,
}

@group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
@group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;

@vertex
fn main(
    @location(0) aPosition : vec2<f32>,
) -> @builtin(position) vec4<f32> {     
    var mvp = globalUniforms.projectionMatrix 
        * globalUniforms.worldTransformMatrix 
        * localUniforms.uTransformMatrix;
    return vec4<f32>(mvp * vec3<f32>(aPosition, 1.0), 1.0);
};

@fragment
fn main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}