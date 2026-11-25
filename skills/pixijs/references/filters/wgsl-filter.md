# WGSL filter skeleton

A filter needs a `gpu` program to run on WebGPU ([filters](../filters.md#webgpu-needs-a-wgsl-program-too)). There is no default WGSL vertex shader, so one WGSL source supplies both entry points. This desaturates by `uStrength` (0 = unchanged, 1 = grey):

```ts
import { Filter, defaultFilterVert } from "pixi.js";

declare const glFragment: string; // the GLSL version of the same effect

const source = /* wgsl */ `
struct GlobalFilterUniforms {
  uInputSize: vec4<f32>,
  uInputPixel: vec4<f32>,
  uInputClamp: vec4<f32>,
  uOutputFrame: vec4<f32>,
  uGlobalFrame: vec4<f32>,
  uOutputTexture: vec4<f32>,
};
struct GreyUniforms { uStrength: f32 };

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler: sampler;
@group(1) @binding(0) var<uniform> greyUniforms: GreyUniforms;

struct VSOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn mainVertex(@location(0) aPosition: vec2<f32>) -> VSOutput {
  var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;
  position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
  position.y = position.y * (2.0 * gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;
  return VSOutput(vec4(position, 0.0, 1.0), aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw));
}

@fragment
fn mainFragment(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
  let c = textureSample(uTexture, uSampler, uv);
  let luma = dot(c.rgb, vec3(0.299, 0.587, 0.114));
  return vec4(mix(c.rgb, vec3(luma), greyUniforms.uStrength), c.a);
}`;

const grey = Filter.from({
  gl: { vertex: defaultFilterVert, fragment: glFragment },
  gpu: {
    vertex: { source, entryPoint: "mainVertex" },
    fragment: { source, entryPoint: "mainFragment" },
  },
  resources: { greyUniforms: { uStrength: { value: 1, type: "f32" } } },
});

grey.resources.greyUniforms.uniforms.uStrength = 0.5;
```

Rules:

- Keep `@group(0)` exactly as shown: the filter system binds the globals, the input texture and its sampler there. The struct must list all six fields in this order.
- Your uniform groups start at `@group(1)`. Each resource key must equal the WGSL variable name (`greyUniforms`); a key that matches no binding is never bound.
- `uv` has the same range as GLSL `vTextureCoord`: it is not 0..1 across the object. Normalise with `uv * gfu.uInputSize.xy / gfu.uOutputFrame.zw`.
- A `blendRequired` filter reads the content behind it from `@group(0) @binding(3) var uBackTexture: texture_2d<f32>;`.
- An extra texture is a resource keyed by its variable name, with its sampler under another key: `resources: { uMap: texture.source, uMapSampler: texture.source.style }`, declared after your uniforms in the same group: `@group(1) @binding(1) var uMap: texture_2d<f32>; @group(1) @binding(2) var uMapSampler: sampler;`.
