---
name: pixijs-custom-rendering
description: "Use this skill when writing custom shaders, uniforms, filters, or batchers in PixiJS v8. Covers Shader.from({gl, gpu, resources}), GlProgram/GpuProgram, UniformGroup with typed uniforms (f32, vec2, mat4x4), UBO mode, textures as resources, custom Filter via Filter.from, GLSL ES 3.0 conventions (in/out, finalColor, texture()), uBackTexture sampling, pixi.js/unsafe-eval for strict CSP, custom Batcher via extensions. Triggers on: Shader, GlProgram, GpuProgram, UniformGroup, Batcher, Filter, Filter.from, GLSL, WGSL, UBO, uniform, custom shader, finalColor, uBackTexture, blendRequired, unsafe-eval."
license: MIT
---

Custom shaders bind GLSL and WGSL programs to scene objects via `Shader.from({ gl, gpu, resources })`. Uniforms live in typed `UniformGroup`s, textures are passed as separate resources, and the same shader can target both WebGL and WebGPU.

## Quick Start

```ts
const uniforms = new UniformGroup({
  uTime: { value: 0, type: "f32" },
});

const shader = Shader.from({
  gl: { vertex: vertexSrc, fragment: fragmentSrc },
  resources: { uniforms },
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

**Related skills:** `pixijs-filters` (built-in filters), `pixijs-scene-mesh` (custom geometry), `pixijs-performance` (batch optimization), `pixijs-migration-v8` (shader API migration from v7).

## Core Patterns

### Dual-renderer shader (WebGL + WebGPU)

```ts
import { Shader, GlProgram, GpuProgram, UniformGroup } from "pixi.js";

const glVertex = `...`; // GLSL vertex (write `#version 300 es` yourself if you want WebGL2/GLSL ES 3.0)
const glFragment = `...`; // GLSL fragment
const wgslSource = `...`; // WGSL combined

const shader = Shader.from({
  gl: { vertex: glVertex, fragment: glFragment },
  gpu: {
    // entryPoint names are arbitrary; they must match the @vertex / @fragment
    // function names in your WGSL source. PixiJS ships examples using
    // 'mainVert' / 'mainFrag' but `main` is equally valid.
    vertex: { entryPoint: "mainVert", source: wgslSource },
    fragment: { entryPoint: "mainFrag", source: wgslSource },
  },
  resources: {
    myUniforms: new UniformGroup({
      uColor: { value: new Float32Array([1, 0, 0, 1]), type: "vec4<f32>" },
      uMatrix: { value: new Float32Array(16), type: "mat4x4<f32>" },
    }),
  },
});
```

If only `gl` is provided, the shader works with WebGL only. If only `gpu` is provided, it works with WebGPU only. The `compatibleRenderers` bitmask is set automatically.

`GlProgram` does **not** auto-inject `#version 300 es`. If you write `#version 300 es` yourself, PixiJS preserves it and treats the shader as GLSL ES 3.0; otherwise it injects WebGL1 compat macros (`#define in varying`, `#define texture texture2D`) and runs the shader as WebGL1-style GLSL. `GlProgram` always injects a default precision (`highp` vertex, `mediump` fragment) and the program name. For GLSL ES 3.0, use `in`/`out` instead of `attribute`/`varying`, `texture()` instead of `texture2D()`, and an `out vec4` instead of `gl_FragColor`.

### Textures as resources

Textures are resources, not uniforms. Pass the texture's `source` and `style` separately:

```ts
import { Shader, UniformGroup, Texture, Assets } from "pixi.js";

const texture = await Assets.load("myImage.png");

const shader = Shader.from({
  gl: { vertex: vertSrc, fragment: fragSrc },
  resources: {
    uTexture: texture.source,
    uSampler: texture.source.style,
    myUniforms: new UniformGroup({
      uAlpha: { value: 1.0, type: "f32" },
    }),
  },
});

// Swap texture at runtime
shader.resources.uTexture = otherTexture.source;
```

Resources are a flat key-value map. The key must match the uniform/binding name in the shader source.

Resources can also be plain objects (auto-wrapped into `UniformGroup`):

```ts
const shader = Shader.from({
  gl: { vertex: vertSrc, fragment: fragSrc },
  resources: {
    myUniforms: {
      uTime: { value: 0, type: "f32" },
    },
  },
});
```

### UBO mode (Uniform Buffer Objects)

UBO mode packs uniforms into a single GPU buffer. Required for WebGPU; optional (WebGL2+) for WebGL.

```ts
import { UniformGroup } from "pixi.js";

const ubo = new UniformGroup(
  {
    uProjection: { value: new Float32Array(16), type: "mat4x4<f32>" },
    uAlpha: { value: 1.0, type: "f32" },
  },
  { ubo: true, isStatic: true },
);

// Must call update() manually when isStatic is true
ubo.uniforms.uAlpha = 0.5;
ubo.update();
```

UBO rules:

- Only `f32` and `i32` based types are supported (no `u32`). Matrices are float-only.
- Samplers/textures cannot go in a UBO.
- The UniformGroup name in resources must exactly match the UBO block name in the shader.
- Structure and order must exactly match the shader layout.
- UBO sync uses `new Function` under the hood. In strict-CSP environments (no `unsafe-eval`), import `pixi.js/unsafe-eval` once at startup to swap in the fallback sync path; without it, UBO-backed shaders (and therefore WebGPU) will throw on first use.

### Custom filter

`Filter.from({ gl, resources })` is the shorthand. Pass only a fragment shader; PixiJS supplies a default vertex shader that handles output frame positioning.

```ts
import { Filter } from "pixi.js";

const filter = Filter.from({
  gl: {
    fragment: `
            in vec2 vTextureCoord;
            out vec4 finalColor;
            uniform sampler2D uTexture;
            uniform float uStrength;

            void main(void) {
                vec4 color = texture(uTexture, vTextureCoord);
                finalColor = mix(color, vec4(1.0 - color.rgb, color.a), uStrength);
            }
        `,
  },
  resources: {
    filterUniforms: {
      uStrength: { value: 0.5, type: "f32" },
    },
  },
});

filter.resources.filterUniforms.uniforms.uStrength = 1.0;
```

For a custom vertex shader, use `new Filter({ glProgram: new GlProgram({ vertex, fragment }), resources })`.

#### Filter shader conventions (GLSL ES 3.0)

- `in vec2 vTextureCoord;` instead of `varying vec2 vTextureCoord;`
- `out vec4 finalColor;` instead of `gl_FragColor`
- `texture(uTexture, uv)` instead of `texture2D(uTexture, uv)`
- The default vertex shader exposes `uInputSize`, `uOutputFrame`, `uOutputTexture` and helpers `filterVertexPosition()` / `filterTextureCoord()`

#### Sampling the render target behind the filter

Set `blendRequired: true` and sample `uBackTexture` in the fragment shader. PixiJS copies the destination pixels into that uniform before running the filter:

```ts
const blendFilter = Filter.from({
  gl: { fragment: blendFragSrc },
  resources: { uniforms: { uAmount: { value: 0.5, type: "f32" } } },
  blendRequired: true,
});
```

Only enable `blendRequired` when you need it; it forces an extra GPU copy every frame.

### Updating uniforms at runtime

```ts
// Access the UniformGroup via resources
shader.resources.myUniforms.uniforms.uTime = performance.now() / 1000;

// For isStatic UBOs, call update() after changing values
shader.resources.myUniforms.update();
```

### Uniform type reference

See [references/uniform-types.md](references/uniform-types.md) for the complete table of supported types, their WGSL/GLSL equivalents, and value formats.

### Custom Batcher (extension-based)

The `Batcher` abstract class enables custom batching for specialized rendering. Subclass it and register via extensions:

```ts
import { Batcher, extensions, ExtensionType } from "pixi.js";
import type {
  BatcherOptions,
  BatchableMeshElement,
  BatchableQuadElement,
  Geometry,
  Shader,
} from "pixi.js";

class MyBatcher extends Batcher {
  public static extension = {
    type: [ExtensionType.Batcher],
    name: "my-batcher",
  };

  public name = "my-batcher";
  protected vertexSize = 6; // floats per vertex
  public geometry: Geometry;
  public shader: Shader;

  constructor(options: BatcherOptions) {
    super(options);
    // Initialize geometry and shader
  }

  public packAttributes(
    element: BatchableMeshElement,
    float32View: Float32Array,
    uint32View: Uint32Array,
    index: number,
    textureId: number,
  ): void {
    // Pack mesh vertex attributes into the batch buffer
  }

  public packQuadAttributes(
    element: BatchableQuadElement,
    float32View: Float32Array,
    uint32View: Uint32Array,
    index: number,
    textureId: number,
  ): void {
    // Pack quad vertex attributes into the batch buffer
  }
}

extensions.add(MyBatcher);
```

Elements reference the batcher by `batcherName`. The `BatchableElement` interface requires: `batcherName`, `texture`, `blendMode`, `indexSize`, `attributeSize`, `topology`, and `packAsQuad`.

## Common Mistakes

### [CRITICAL] Old Shader.from(vertex, fragment, uniforms) constructor

Wrong:

```ts
const shader = Shader.from(vertex, fragment, { uTime: 1 });
```

Correct:

```ts
const shader = Shader.from({
  gl: { vertex, fragment },
  resources: {
    uniforms: new UniformGroup({
      uTime: { value: 1, type: "f32" },
    }),
  },
});
```

v8 requires an options object with `gl`/`gpu` programs and `resources`. The positional API was removed.


### [CRITICAL] UniformGroup without type annotation

Wrong:

```ts
new UniformGroup({ uTime: 1 });
```

Correct:

```ts
new UniformGroup({ uTime: { value: 1, type: "f32" } });
```

Every uniform requires an explicit `{ value, type }` pair. Omitting the type causes a runtime error: "Uniform type undefined is not supported."


### [HIGH] UBO with unsupported types or wrong structure

UBO mode supports `f32` and `i32` based types (scalars and vectors). `u32` is not in the supported `UniformGroup` type list and will throw. Matrices are float-only (`mat*<f32>`). Samplers cannot be placed in UBOs.

The struct name and field order must exactly match the shader's UBO declaration. Mismatches produce garbled rendering with no error.


### [HIGH] Putting textures in UniformGroup

Wrong:

```ts
new UniformGroup({
  uTexture: { value: texture, type: "f32" },
});
```

Correct:

```ts
const shader = Shader.from({
  gl: { vertex, fragment },
  resources: {
    uTexture: texture.source,
    uSampler: texture.source.style,
    myUniforms: new UniformGroup({
      uAlpha: { value: 1.0, type: "f32" },
    }),
  },
});
```

Textures are resources, not uniforms. Pass `texture.source` (TextureSource) and `texture.source.style` (TextureStyle) as top-level resource entries.


## API Reference

- [Shader](https://pixijs.download/release/docs/rendering.Shader.html.md)
- [GlProgram](https://pixijs.download/release/docs/rendering.GlProgram.html.md)
- [GpuProgram](https://pixijs.download/release/docs/rendering.GpuProgram.html.md)
- [UniformGroup](https://pixijs.download/release/docs/rendering.UniformGroup.html.md)
- [Filter](https://pixijs.download/release/docs/filters.Filter.html.md)
- [Batcher](https://pixijs.download/release/docs/rendering.Batcher.html.md)
- [BatcherPipe](https://pixijs.download/release/docs/rendering.BatcherPipe.html.md)
