# MeshSimple

A `Mesh` that builds its own `MeshGeometry` from `vertices` and uploads the position buffer every frame. v7's `SimpleMesh` (positional args) is not exported.

```ts
const triangle = new MeshSimple({
  texture: tex,
  vertices: new Float32Array([0, 0, 100, 0, 50, 100]),
  uvs: new Float32Array([0, 0, 1, 0, 0.5, 1]),
  indices: new Uint32Array([0, 1, 2]),
});

app.ticker.add(() => {
  triangle.vertices[5] = 100 + Math.sin(performance.now() / 500) * 20;
});
```

| Option     | Default              | Notes                                                                                      |
| ---------- | -------------------- | ------------------------------------------------------------------------------------------ |
| `texture`  | —                    | Required.                                                                                  |
| `vertices` | `undefined`          | Flat `x, y` pairs, passed to `MeshGeometry` as `positions`; also the `mesh.vertices` getter. |
| `uvs`      | `undefined`          | Omitted UVs are zeros, so the mesh samples only pixel `(0, 0)`. Run `0..1` across the texture's frame, also for a spritesheet frame. |
| `indices`  | `[0, 1, 2, 0, 2, 3]` | The default is a quad; pass indices for any other vertex count or topology (a 3-vertex mesh without them reads a fourth vertex that does not exist; a line strip would follow `0-1-2-0-2-3`). |
| `topology` | `'triangle-list'`    | Any `MeshGeometry` topology.                                                               |

`geometry` is not an option; `shader`, `state` and `roundPixels` behave as on [Mesh](mesh.md).

`autoUpdate` is a runtime property (default `true`), not a constructor option: mutating `vertices` in place or assigning a new array reaches the GPU on the next render. Set `autoUpdate = false` to upload yourself with `mesh.geometry.getBuffer("aPosition").update()`.

The auto-update runs as the mesh's own `onRender` callback. Assigning `mesh.onRender = ...` replaces it, and vertex changes silently stop reaching the GPU. Animate from `app.ticker` instead, or call `mesh.geometry.getBuffer("aPosition").update()` inside your `onRender`.
