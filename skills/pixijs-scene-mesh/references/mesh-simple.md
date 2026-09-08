# MeshSimple

A thin `Mesh` subclass that handles geometry construction for you. Pass `vertices`, optional `uvs`, and optional `indices`, and it builds the `MeshGeometry` internally and auto-updates the vertex buffer each frame. Use `MeshSimple` for quick textured quads, triangles, or any shape where you plan to animate vertex positions.

## Quick Start

```ts
const texture = await Assets.load("sprite.png");

const triangle = new MeshSimple({
  texture,
  vertices: new Float32Array([0, 0, 100, 0, 50, 100]),
  uvs: new Float32Array([0, 0, 1, 0, 0.5, 1]),
  topology: "triangle-list",
});

app.stage.addChild(triangle);
```

`MeshSimple` wraps `MeshGeometry` creation, exposes `vertices` directly, and auto-updates the position buffer each frame via `onRender`.

## Constructor options

`new MeshSimple(options: SimpleMeshOptions)`

| Option     | Type           | Default           | Description                                                                                                           |
| ---------- | -------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| `texture`  | `Texture`      | —                 | Texture sampled by the mesh. Required.                                                                                |
| `vertices` | `Float32Array` | `undefined`       | Flat `x, y` pairs for each vertex. Passed through to `MeshGeometry` as `positions`.                                   |
| `uvs`      | `Float32Array` | `undefined`       | Flat `u, v` pairs matching `vertices`. Without UVs the geometry fills zeros and the mesh samples only pixel `(0, 0)`. |
| `indices`  | `Uint32Array`  | `undefined`       | Triangle indices into `vertices`. Omit for unindexed rendering in vertex order.                                       |
| `topology` | `Topology`     | `'triangle-list'` | `'triangle-list' \| 'triangle-strip' \| 'line-list' \| 'line-strip' \| 'point-list'`.                                 |

`MeshSimple` builds its own `MeshGeometry`, so `geometry` is omitted from the options type. Note the option is named `vertices` here (converted to `positions` internally), matching the `mesh.vertices` getter. Other `MeshOptions` fields (`shader`, `state`, `roundPixels`) are inherited from `mesh.md` and behave identically.

All `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

`autoUpdate` is a runtime property (defaults to `true`), not a constructor option. Set `mesh.autoUpdate = false` after construction to suppress the per-frame position-buffer upload.

## Core Patterns

### Animated vertices

```ts
app.ticker.add(() => {
  const verts = triangle.vertices;
  verts[5] = 100 + Math.sin(performance.now() / 500) * 20;
  triangle.vertices = verts;
});
```

Because `autoUpdate` defaults to `true`, assigning to `vertices` or mutating the array in place is enough; the buffer is pushed to the GPU automatically during the next render pass.

### Indexed quad

```ts
const quad = new MeshSimple({
  texture,
  vertices: new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]),
  uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
  indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
});
```

Indices are optional; omit them and the mesh uses unindexed vertex order. Useful for a small, simple shape where explicit indexing adds no value.

### Manual update mode

```ts
triangle.autoUpdate = false;

app.ticker.add(() => {
  const verts = triangle.vertices;
  verts[1] = Math.sin(performance.now() / 1000) * 20;
  triangle.vertices = verts;
  triangle.geometry.getBuffer("aPosition").update();
});
```

Set `autoUpdate = false` when you want explicit control over when the GPU sees new vertex data; for example, when you only update once per several frames, or when you want to batch multiple vertex mutations before a single upload.

### Alternative topologies

```ts
const lineStrip = new MeshSimple({
  texture,
  vertices: new Float32Array([0, 0, 50, 50, 100, 0, 150, 50]),
  topology: "line-strip",
});
```

`MeshSimple` accepts any topology supported by `MeshGeometry` (`'triangle-list'`, `'triangle-strip'`, `'line-list'`, `'line-strip'`, `'point-list'`). The default is `'triangle-list'`.

## Common Mistakes

### [HIGH] Using the old `SimpleMesh` name

Wrong:

```ts
import { SimpleMesh } from "pixi.js";
const mesh = new SimpleMesh(texture, vertices, uvs, indices);
```

Correct:

```ts
import { MeshSimple } from "pixi.js";
const mesh = new MeshSimple({ texture, vertices, uvs, indices });
```

`SimpleMesh` was renamed to `MeshSimple` in v8. The old name is not exported; the class also switched to an options-object constructor.


### [MEDIUM] Forgetting UVs on a textured mesh

Wrong:

```ts
const mesh = new MeshSimple({
  texture,
  vertices: new Float32Array([0, 0, 100, 0, 50, 100]),
});
```

Correct:

```ts
const mesh = new MeshSimple({
  texture,
  vertices: new Float32Array([0, 0, 100, 0, 50, 100]),
  uvs: new Float32Array([0, 0, 1, 0, 0.5, 1]),
});
```

Omitting `uvs` makes the underlying `MeshGeometry` fill a zero array, sampling only pixel `(0, 0)` of the texture. Always provide UVs when you want the texture to map across the geometry.


## API Reference

- [MeshSimple](https://pixijs.download/release/docs/scene.MeshSimple.html.md)
- [SimpleMeshOptions](https://pixijs.download/release/docs/scene.SimpleMeshOptions.html.md)
- [Mesh](https://pixijs.download/release/docs/scene.Mesh.html.md)
- [MeshGeometry](https://pixijs.download/release/docs/scene.MeshGeometry.html.md)
