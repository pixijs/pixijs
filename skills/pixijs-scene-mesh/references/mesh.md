# Mesh

The base mesh class. Combines a `Geometry` (vertex positions, UVs, indices, topology) with a `Texture` or custom `Shader` to render arbitrary 2D (or perspective-projected) graphics. Use `Mesh` when you need vertex-level control, custom shaders, or batched draw calls for geometry that doesn't fit the Sprite / Graphics / Particle model.

## Quick Start

```ts
const texture = await Assets.load("pattern.png");

const geometry = new MeshGeometry({
  positions: new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]),
  uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
  indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
  topology: "triangle-list",
});

const mesh = new Mesh({
  geometry,
  texture,
  roundPixels: false,
});
app.stage.addChild(mesh);
```

`Mesh` is a leaf; `allowChildren` is `false`. It owns a reference to its geometry (shareable across meshes) and either a texture or a custom shader.

## Constructor options

`new Mesh<GEOMETRY, SHADER>(options: MeshOptions<GEOMETRY, SHADER>)`

| Option        | Type                            | Default         | Description                                                                                             |
| ------------- | ------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------- |
| `geometry`    | `GEOMETRY extends Geometry`     | —               | Vertex buffers, indices, UVs, and topology. Required. Shareable across meshes.                          |
| `shader`      | `SHADER extends Shader \| null` | `null`          | Custom vertex/fragment shader. When set, the mesh skips batching and the shader decides what to sample. |
| `state`       | `State`                         | `State.for2d()` | GPU state (blend, depth, culling). Depth or culling flags disable batching.                             |
| `texture`     | `Texture`                       | `Texture.WHITE` | Texture sampled by the default shader. Ignored if a custom `shader` provides its own texture.           |
| `roundPixels` | `boolean`                       | `false`         | Snap `x`/`y` to integer pixels at render time.                                                          |

All `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

The constructor assigns `texture` from `shader.texture` when a custom shader is passed without an explicit `texture` option. Passing `null`/`undefined` to the `texture` setter at runtime coerces it to `Texture.EMPTY`.

## Core Patterns

### MeshGeometry anatomy

```ts
const geometry = new MeshGeometry({
  positions: new Float32Array([
    0,
    0, // vertex 0: x, y
    100,
    0, // vertex 1
    100,
    100, // vertex 2
    0,
    100, // vertex 3
  ]),
  uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
  indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
  topology: "triangle-list",
});
```

- `positions`: flat x,y pairs in local space.
- `uvs`: flat u,v pairs in `[0, 1]` texture space. If omitted, defaults to zero-filled.
- `indices`: triangle indices. If omitted, defaults to a quad `[0, 1, 2, 0, 2, 3]`.
- `topology`: how indices are interpreted (see below).

After construction, read or replace the typed arrays via the getters `geometry.positions`, `geometry.uvs`, `geometry.indices`. They return the underlying buffers' `data` directly; mutating in place is equivalent to mutating `getBuffer('aPosition').data`.

### Topology

```ts
new MeshGeometry({ positions, uvs, indices, topology: "triangle-list" });
```

Five topology types:

| Topology                    | Meaning                                          |
| --------------------------- | ------------------------------------------------ |
| `'triangle-list'` (default) | Every 3 indices form one triangle                |
| `'triangle-strip'`          | Each new index extends the strip by one triangle |
| `'line-list'`               | Pairs of indices form independent lines          |
| `'line-strip'`              | Connected line segments                          |
| `'point-list'`              | Each index renders a point                       |

Topology is set on the **geometry**, not the mesh. The default is `'triangle-list'`; any other data layout needs an explicit topology or the mesh renders garbage.

### Batching

```ts
geometry.batchMode = "auto"; // default
geometry.batchMode = "batch"; // always batched
geometry.batchMode = "no-batch"; // never batched
```

A mesh is batched (combined with other draw calls) only when:

- It uses `MeshGeometry` (not a custom geometry subclass).
- It has no custom `shader`.
- Its `state` has no depth test or culling.
- The `'auto'` rule: geometry has 100 or fewer vertices.

Custom shaders always render independently. For large static meshes, set `batchMode = 'no-batch'` to skip the batch-eligibility check overhead.

### Custom shader

```ts
import { Shader } from "pixi.js";

const shader = Shader.from({
  gl: { vertex: vertSrc, fragment: fragSrc },
  resources: { uTexture: texture.source, uSampler: texture.source.style },
});

const mesh = new Mesh({ geometry, shader });
```

When a shader is provided, `texture` is optional; the shader decides what to sample. Custom shaders bypass batching entirely. See the `pixijs-custom-rendering` skill for full shader authoring detail.

### Shared geometry

```ts
const sharedGeom = new MeshGeometry({ positions, uvs, indices });

const mesh1 = new Mesh({ geometry: sharedGeom, texture: tex1 });
const mesh2 = new Mesh({ geometry: sharedGeom, texture: tex2 });
```

Geometry is reference-counted. Multiple meshes can share one geometry, saving memory for instances that share a shape but differ in transform or texture.

### Updating vertices at runtime

```ts
mesh.geometry.positions[1] = Math.sin(performance.now() / 500) * 20;
mesh.geometry.getBuffer("aPosition").update();
```

`MeshGeometry` exposes `positions`, `uvs`, and `indices` getters that return the underlying `Float32Array` / `Uint32Array` directly; they point at the same data as `getBuffer('aPosition').data` / `getBuffer('aUV').data` / `getIndex().data`. Mutate in place for the common case, or assign a whole new array via the setter (the setters do `buffer.data = value` with no length check; the real invariant is `uvs.length >= positions.length` so every vertex has a UV).

Call `update()` on the buffer after mutating its `data` array to push changes to the GPU. For auto-update behavior, use `MeshSimple` which handles this for you.

## Common Mistakes

### [HIGH] Positional constructor args

Wrong:

```ts
const mesh = new Mesh(geometry, shader);
```

Correct:

```ts
const mesh = new Mesh({ geometry, shader });
```

v8 uses an options object. The positional form is deprecated and logs a warning. Note also that the `drawMode` argument was removed; use `geometry.topology` instead.


### [HIGH] `vertices` instead of `positions`

Wrong:

```ts
const geometry = new MeshGeometry({
  vertices: new Float32Array([0, 0, 100, 0, 50, 100]),
});
```

Correct:

```ts
const geometry = new MeshGeometry({
  positions: new Float32Array([0, 0, 100, 0, 50, 100]),
});
```

The `MeshGeometry` option is `positions`. `vertices` is the convenience name used only by `MeshSimple`, where it's converted internally.


### [MEDIUM] Forgetting to set topology

Wrong:

```ts
const geometry = new MeshGeometry({
  positions: stripPositions,
  indices: stripIndices,
});
```

Correct:

```ts
const geometry = new MeshGeometry({
  positions: stripPositions,
  indices: stripIndices,
  topology: "triangle-strip",
});
```

The default topology is `'triangle-list'`. If your data is organized as a strip or line list, the mesh renders garbage without an explicit topology.


## API Reference

- [Mesh](https://pixijs.download/release/docs/scene.Mesh.html.md)
- [MeshOptions](https://pixijs.download/release/docs/scene.MeshOptions.html.md)
- [MeshGeometry](https://pixijs.download/release/docs/scene.MeshGeometry.html.md)
- [MeshGeometryOptions](https://pixijs.download/release/docs/scene.MeshGeometryOptions.html.md)
