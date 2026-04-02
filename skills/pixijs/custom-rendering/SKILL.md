---
name: custom-rendering
description: >
  Write custom shaders, uniforms, and batchers in PixiJS v8.
  Shader.from({gl, gpu, resources}). GlProgram and GpuProgram. UniformGroup
  with typed values (f32, vec2, mat4x4). Resources concept (textures are
  resources, not uniforms). UBO mode constraints. Custom Batcher via
  extensions (BatchableMeshElement interface). Use when the user asks about
  custom shaders, GLSL, WGSL, WebGPU shaders, uniform buffers, UBOs,
  shader resources, texture bindings in shaders, custom batching, render
  pipes, or writing a custom renderable. Covers Shader, GlProgram,
  GpuProgram, UniformGroup, Batcher, Filter.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  requires: "pixijs, core-concepts"
  sources: "pixijs/pixijs:src/rendering/renderers/shared/shader/Shader.ts, pixijs/pixijs:src/rendering/renderers/shared/shader/UniformGroup.ts, pixijs/pixijs:src/rendering/batcher/shared/Batcher.ts"
  references: references/uniform-types.md
---

## When to Use This Skill

Apply when the user needs to write custom shaders (GLSL or WGSL), create typed uniform groups, pass textures as shader resources, build custom batchers, or implement custom render pipes in PixiJS v8.

**Related skills:** For built-in filter effects use **filters**; for custom geometry and mesh use **mesh**; for batching and draw call optimization use **performance**; for shader API migration from v7 use **pixijs-migration**.

This skill builds on pixijs and core-concepts. Read them first.

## Setup

A minimal custom shader with a uniform:

```ts
import { Shader, GlProgram, UniformGroup, Mesh, MeshGeometry } from 'pixi.js';

const vertexSrc = `
  in vec2 aPosition;
  uniform mat3 uProjectionMatrix;
  uniform mat3 uWorldTransformMatrix;
  void main() {
    gl_Position = vec4((uProjectionMatrix * uWorldTransformMatrix * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
  }
`;

const fragmentSrc = `
  uniform float uTime;
  out vec4 fragColor;
  void main() {
    fragColor = vec4(sin(uTime), 0.0, 1.0, 1.0);
  }
`;

const uniforms = new UniformGroup({
    uTime: { value: 0, type: 'f32' },
});

const shader = Shader.from({
    gl: { vertex: vertexSrc, fragment: fragmentSrc },
    resources: {
        uniforms,
    },
});

const geometry = new MeshGeometry({
    positions: new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]),
    uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
    indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
    topology: 'triangle-list',
});

const mesh = new Mesh({ geometry, shader });
```

Key points:
- `Shader.from()` takes `{gl, gpu, resources}`, not positional args.
- Each uniform in `UniformGroup` requires `{ value, type }`.
- Textures are passed as separate resources, not inside `UniformGroup`.
- Provide both `gl` and `gpu` programs for cross-renderer compatibility.

## Core Patterns

### Dual-renderer shader (WebGL + WebGPU)

```ts
import { Shader, GlProgram, GpuProgram, UniformGroup } from 'pixi.js';

const glVertex = `...`; // GLSL vertex
const glFragment = `...`; // GLSL fragment
const wgslSource = `...`; // WGSL combined

const shader = Shader.from({
    gl: { vertex: glVertex, fragment: glFragment },
    gpu: {
        vertex: { entryPoint: 'mainVert', source: wgslSource },
        fragment: { entryPoint: 'mainFrag', source: wgslSource },
    },
    resources: {
        myUniforms: new UniformGroup({
            uColor: { value: new Float32Array([1, 0, 0, 1]), type: 'vec4<f32>' },
            uMatrix: { value: new Float32Array(16), type: 'mat4x4<f32>' },
        }),
    },
});
```

If only `gl` is provided, the shader works with WebGL only. If only `gpu` is provided, it works with WebGPU only. The `compatibleRenderers` bitmask is set automatically.

### Textures as resources

Textures are resources, not uniforms. Pass the texture's `source` and `style` separately:

```ts
import { Shader, UniformGroup, Texture, Assets } from 'pixi.js';

const texture = await Assets.load('myImage.png');

const shader = Shader.from({
    gl: { vertex: vertSrc, fragment: fragSrc },
    resources: {
        uTexture: texture.source,
        uSampler: texture.source.style,
        myUniforms: new UniformGroup({
            uAlpha: { value: 1.0, type: 'f32' },
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
            uTime: { value: 0, type: 'f32' },
        },
    },
});
```

### UBO mode (Uniform Buffer Objects)

UBO mode packs uniforms into a single GPU buffer. Required for WebGPU; optional (WebGL2+) for WebGL.

```ts
import { UniformGroup } from 'pixi.js';

const ubo = new UniformGroup({
    uProjection: { value: new Float32Array(16), type: 'mat4x4<f32>' },
    uAlpha: { value: 1.0, type: 'f32' },
}, { ubo: true, isStatic: true });

// Must call update() manually when isStatic is true
ubo.uniforms.uAlpha = 0.5;
ubo.update();
```

UBO rules:
- Only `f32` and `i32` based types are supported (no `u32`). Matrices are float-only.
- Samplers/textures cannot go in a UBO.
- The UniformGroup name in resources must exactly match the UBO block name in the shader.
- Structure and order must exactly match the shader layout.

### Custom filter

```ts
import { Filter, GlProgram, UniformGroup } from 'pixi.js';

const filter = new Filter({
    glProgram: GlProgram.from({
        vertex: defaultFilterVert,
        fragment: myFragmentSrc,
    }),
    resources: {
        filterUniforms: new UniformGroup({
            uStrength: { value: 0.5, type: 'f32' },
        }),
    },
});

// Update at runtime
filter.resources.filterUniforms.uniforms.uStrength = 1.0;
```

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
import { Batcher, extensions, ExtensionType } from 'pixi.js';
import type {
    BatcherOptions,
    BatchableMeshElement,
    BatchableQuadElement,
    Geometry,
    Shader,
} from 'pixi.js';

class MyBatcher extends Batcher {
    public static extension = {
        type: [ExtensionType.Batcher],
        name: 'my-batcher',
    };

    public name = 'my-batcher';
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
            uTime: { value: 1, type: 'f32' },
        }),
    },
});
```

v8 requires an options object with `gl`/`gpu` programs and `resources`. The positional API was removed.

Source: src/__docs__/migrations/v8.md

### [CRITICAL] UniformGroup without type annotation

Wrong:
```ts
new UniformGroup({ uTime: 1 });
```

Correct:
```ts
new UniformGroup({ uTime: { value: 1, type: 'f32' } });
```

Every uniform requires an explicit `{ value, type }` pair. Omitting the type causes a runtime error: "Uniform type undefined is not supported."

Source: src/__docs__/migrations/v8.md

### [HIGH] UBO with unsupported types or wrong structure

UBO mode supports `f32` and `i32` based types (scalars and vectors). `u32` is not in the supported `UniformGroup` type list and will throw. Matrices are float-only (`mat*<f32>`). Samplers cannot be placed in UBOs.

The struct name and field order must exactly match the shader's UBO declaration. Mismatches produce garbled rendering with no error.

Source: src/rendering/renderers/shared/shader/UniformGroup.ts

### [HIGH] Putting textures in UniformGroup

Wrong:
```ts
new UniformGroup({
    uTexture: { value: texture, type: 'f32' },
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
            uAlpha: { value: 1.0, type: 'f32' },
        }),
    },
});
```

Textures are resources, not uniforms. Pass `texture.source` (TextureSource) and `texture.source.style` (TextureStyle) as top-level resource entries.

Source: src/__docs__/migrations/v8.md

---

See also: filters (custom filter shaders), mesh (custom geometry), performance (batching optimization), migration-v8 (shader API changes from v7)

## Learn More

- [Shader](https://pixijs.download/release/docs/rendering.Shader.html.md)
- [GlProgram](https://pixijs.download/release/docs/rendering.GlProgram.html.md)
- [GpuProgram](https://pixijs.download/release/docs/rendering.GpuProgram.html.md)
- [UniformGroup](https://pixijs.download/release/docs/rendering.UniformGroup.html.md)
- [Batcher](https://pixijs.download/release/docs/rendering.Batcher.html.md)
