# custom-rendering

Custom shaders on meshes: `Shader.from`, GLSL/WGSL programs, `UniformGroup`, textures as resources, UBOs.

## Custom-shader mesh

```ts
import { Mesh, MeshGeometry, Shader, UniformGroup } from "pixi.js";
import type { Application } from "pixi.js";

declare const app: Application;

const vertex = `
in vec2 aPosition;
in vec2 aUV;
out vec2 vUV;

uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;
uniform mat3 uTransformMatrix;

void main() {
  mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
  gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
  vUV = aUV;
}`;

const fragment = `
in vec2 vUV;
out vec4 finalColor;

uniform vec4 uColor;           // mesh tint and alpha, premultiplied
uniform vec4 uWorldColorAlpha; // render group tint and alpha
uniform float uTime;

void main() {
  finalColor = vec4(vUV, 0.5 + 0.5 * sin(uTime), 1.0) * uColor * uWorldColorAlpha;
}`;

const shader = Shader.from({
  gl: { vertex, fragment },
  resources: {
    uniforms: new UniformGroup({ uTime: { value: 0, type: "f32" } }),
  },
});

const geometry = new MeshGeometry({
  positions: new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]),
  uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
  indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
});

const mesh = new Mesh({ geometry, shader });
app.stage.addChild(mesh);

app.ticker.add(() => {
  shader.resources.uniforms.uniforms.uTime = performance.now() / 1000;
});
```

v7's positional `Shader.from(vertex, fragment, uniforms)` is gone; pass the options object above.

A `Mesh` supplies the attributes `aPosition` and `aUV` (from `MeshGeometry`; a plain `Geometry` uses whatever attribute names you give it) and these uniforms: `uProjectionMatrix`, `uWorldTransformMatrix`, `uWorldColorAlpha` (global) and `uTransformMatrix`, `uColor` (per mesh). The v7 names `projectionMatrix`, `translationMatrix`, `aVertexPosition` and `aTextureCoord` are not provided, so a v7 shader draws nothing. `mesh.tint` and `mesh.alpha` reach a custom shader only through `uColor`; multiply by it or they are ignored.

Write premultiplied colour: the default blend is `ONE, ONE_MINUS_SRC_ALPHA`, and textures are premultiplied on upload. `vec4(1.0, 0.0, 0.0, 0.5)` adds full red on top of half the background (too bright); half-transparent red is `vec4(vec3(1.0, 0.0, 0.0) * 0.5, 0.5)`.

`mesh.texture` (and the `texture` option) feeds only the default mesh shader. With a custom `shader` it is never bound, and the sampler reads whatever texture was last bound to unit 0. Pass it as resources ([below](#textures-as-resources)).

`geometry.indexCount = n` draws a prefix of the index buffer on the unbatched path only; a custom-shader mesh is never batched, so it always applies ([mesh](scene-mesh/mesh.md#drawing-part-of-the-index-buffer)).

In WGSL the same values are `@group(0) @binding(0) var<uniform> globalUniforms: GlobalUniforms;` (`uProjectionMatrix`, `uWorldTransformMatrix`: `mat3x3<f32>`, `uWorldColorAlpha`: `vec4<f32>`, `uResolution`: `vec2<f32>`) and `@group(1) @binding(0) var<uniform> localUniforms: LocalUniforms;` (`uTransformMatrix`: `mat3x3<f32>`, `uColor`: `vec4<f32>`, `uRound`: `f32`), with those struct fields in that order. Your own resources start at `@group(2)`.

## WebGL and WebGPU programs

```ts
import { Shader } from "pixi.js";

declare const glVertex: string;
declare const glFragment: string;
declare const wgslSource: string; // one source holding both entry points

const shader = Shader.from({
  gl: { vertex: glVertex, fragment: glFragment },
  gpu: {
    vertex: { entryPoint: "mainVert", source: wgslSource }, // must match the @vertex function name
    fragment: { entryPoint: "mainFrag", source: wgslSource },
  },
  resources: {},
});
```

With only `gl`, the shader is WebGL only: under WebGPU a `Mesh` using it is skipped without an error (dev builds warn "Mesh shader has no gpuProgram"). With only `gpu`, it is WebGPU only. The `compatibleRenderers` bitmask is set automatically.

**GLSL version.** `GlProgram` does **not** auto-inject `#version 300 es`; it picks the dialect from the **fragment** source alone. If the fragment contains `#version 300 es` (anywhere; leading whitespace is fine), PixiJS removes the line from both stages and re-inserts it first, so both compile as GLSL ES 3.0; `defaultFilterVert` and other version-less vertex shaders are promoted with it. Otherwise both stages get WebGL1 compat macros (`in` to `attribute`/`varying`, `texture` to `texture2D`, `finalColor` to `gl_FragColor`) and compile as GLSL ES 1.0, where `texelFetch`, integer samplers, `uint`, `layout` and multiple outputs fail. Write `#version 300 es` as the first line of both shaders. With it in the vertex shader but missing from the fragment, compilation fails ("#version directive must occur before anything else").

**Precision.** `GlProgram` always injects a default precision (`highp` vertex, `mediump` fragment) and the program name. It also declares `highp` for sampler types GLSL ES 3.0 gives no default (`usampler2D`, `isampler2D`, `sampler2DArray`, `sampler3D`, and others), so you don't need a precision line for them; one you write yourself is kept. `sampler2D` and `samplerCube` keep their `lowp` default.

## Uniforms

Every uniform needs an explicit `{ value, type }` pair: `new UniformGroup({ uTime: 1 })` is a type error and throws a `TypeError` at construction ("Cannot create property 'name' on number"). Type strings and value formats: [custom-rendering/uniform-types.md](custom-rendering/uniform-types.md). A plain object in `resources` (`myUniforms: { uTime: { value: 0, type: "f32" } }`) is auto-wrapped into a `UniformGroup`.

Update through `shader.resources.{group}.uniforms.{name}`. A group created with `isStatic: true` uploads only when you call `group.update()` after changing values.

### UBO mode (Uniform Buffer Objects)

`ubo: true` makes WebGL upload the group as a uniform block (WebGL2), so the GLSL must declare a matching `uniform Block { ... };`; plain `uniform float` declarations stop receiving values. WebGPU always uploads a `UniformGroup` as a uniform buffer, so plain groups work on both renderers; you don't need `ubo: true` for WebGPU.

```ts
import { UniformGroup } from "pixi.js";

const ubo = new UniformGroup(
  {
    uProjection: { value: new Float32Array(16), type: "mat4x4<f32>" },
    uAlpha: { value: 1.0, type: "f32" },
  },
  { ubo: true, isStatic: true },
);

ubo.uniforms.uAlpha = 0.5;
ubo.update();
```

- `f32`, `i32` and `u32` scalars and vectors are supported. Matrices are float-only.
- Samplers/textures cannot go in a UBO.
- The UniformGroup name in resources must exactly match the UBO block name in the shader.
- Structure and order must exactly match the shader layout; a mismatch garbles rendering with no error.

Uniform sync code is generated with `new Function`: under a CSP without `unsafe-eval`, creating any renderer (WebGL or WebGPU) throws unless `import "pixi.js/unsafe-eval"` runs first ([environments](environments.md)).

## Textures as resources

Textures are resources, not uniforms (v7 put them in the uniforms object). Pass the texture's `source` and `style` as separate top-level entries:

```ts
import { Shader, UniformGroup } from "pixi.js";
import type { Texture } from "pixi.js";

declare const vertSrc: string;
declare const fragSrc: string;
declare const texture: Texture;
declare const otherTexture: Texture;

const shader = Shader.from({
  gl: { vertex: vertSrc, fragment: fragSrc },
  resources: {
    uTexture: texture.source,
    uSampler: texture.source.style,
    myUniforms: new UniformGroup({ uAlpha: { value: 1.0, type: "f32" } }),
  },
});

shader.resources.uTexture = otherTexture.source; // swap at runtime
```

Resources are a flat key-value map. In WGSL every key must equal a binding variable name (`var<uniform> myUniforms`, `var uTexture`); an unmatched key is never bound. In GLSL a texture key must equal the sampler uniform name, a plain `UniformGroup` key is free (its member names must match the `uniform` declarations), and a UBO group's key must equal the uniform block name.

## Custom filter

A filter is a shader drawn over a container's rendered output: `Filter.from({ gl: { vertex: defaultFilterVert, fragment }, resources })`. Its traps (no default vertex shader, `vTextureCoord` range, `highp` uniforms, a gl-only filter on WebGPU, premultiplied colour, sampling the backdrop with `blendRequired`) are in [filters](filters.md#custom-filter).

## Advanced GPU features

Read [custom-rendering/advanced-gpu.md](custom-rendering/advanced-gpu.md) when the task needs one of these:

- **Partial uploads**: `buffer.update(sizeInBytes, offsetInBytes)`; `bufferImageSource.update(startTexel, endTexel)`.
- **Vertex/index counts, winding, culling**: `geometry.vertexCount` (replaces the deprecated `getSize()`), `geometry.indexCount` with `batchMode`, `state.clockwiseFrontFace`, `cullMode`.
- **WGSL override constants** (WebGPU): `Shader.from({ gpu, resources, overrides: { STEPS: 8 } })`.
- **Custom bind group layouts** (WebGPU): `gpuLayout` from `generateGpuLayoutGroups(extractStructAndGroups(source))`.
- **Depth sampling** (WebGPU): `new TextureView(depth, { aspect: "depth-only" })` with a `depthReadOnly` attachment.
- **Integer textures**: `rgba32uint` etc., `usampler2D`/`texelFetch`, `texture_2d<u32>`/`textureLoad`.
- **Several color attachments**: `colorAttachments` with mixed formats (`rgba16float`, `rg16float`, `r32uint`); a draw writes only the attachments its shader has `@location(n)` / `layout(location = n) out` outputs for, integer attachments never blend, each attachment clears to its own `clearValue` unless it says `loadOp: "load"`.
- **3D and array textures**: `depth` / `arrayLayerCount`, `sampler3D`/`texture_3d<f32>`, `sampler2DArray`, rendering into one slice with `layer`.
- **Storage textures** (WebGPU): `storage: true`, `getGpuSource(source).createView()`.
- **Render bundles** (WebGPU): `encoder.beginBundle()` / `endBundle()` / `executeBundle()`, `isBundleValid()`.
- **Pooled scratch textures**: `TexturePool.getOptimalTexture({ width, height, ... })`, `returnTexture()`.
- **Custom `Batcher`** and **custom `InstructionPipe`** (`destroyInstructionSet`) registered via extensions.
