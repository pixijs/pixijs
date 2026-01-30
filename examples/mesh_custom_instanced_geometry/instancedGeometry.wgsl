struct GlobalUniforms {
    uProjectionMatrix:mat3x3<f32>,
    uWorldTransformMatrix:mat3x3<f32>,
    uWorldColorAlpha: vec4<f32>,
    uResolution: vec2<f32>,
}

struct LocalUniforms {
    uTransformMatrix:mat3x3<f32>,
    uColor:vec4<f32>,
    uRound:f32,
}


@group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
@group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) vUV: vec2<f32>,
};


@vertex
fn mainVert(
    @location(0) aPosition : vec2<f32>,
    @location(1) aUV : vec2<f32>,
    @location(2) aPositionOffset : vec2<f32>,
) -> VertexOutput {     
    var mvp = globalUniforms.uProjectionMatrix 
        * globalUniforms.uWorldTransformMatrix 
        * localUniforms.uTransformMatrix;
    
    var output: VertexOutput;

    output.position = vec4<f32>(mvp * vec3<f32>(aPosition+aPositionOffset, 1.0), 1.0);
    output.vUV = aUV;

    return output; 
};

struct WaveUniforms {
    time:f32,
}

@group(2) @binding(1) var uTexture : texture_2d<f32>;
@group(2) @binding(2) var uSampler : sampler;
@group(2) @binding(3) var<uniform> waveUniforms : WaveUniforms;

@fragment
fn mainFrag(
    @location(0) vUV: vec2<f32>,
) -> @location(0) vec4<f32> {
    return textureSample(uTexture, uSampler, vUV + sin( (waveUniforms.time + (vUV.x) * 14.) ) * 0.1);
};