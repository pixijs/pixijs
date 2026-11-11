# scene-mesh

`Mesh` and `MeshGeometry`, plus the `MeshSimple`, `MeshPlane`, `MeshRope` and `PerspectiveMesh` variants: geometry rules, UVs, batching and hit testing.

```ts
const texture = await Assets.load("pattern.png");

const geometry = new MeshGeometry({
  positions: new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]),
  uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
  indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
  topology: "triangle-list",
});
const mesh = new Mesh({ geometry, texture });
```

Every mesh class takes one options object. The base `Mesh` requires a `geometry`; the subclasses build their own geometry and require a `texture`. v7 → v8: `SimpleMesh` → `MeshSimple`, `SimplePlane` → `MeshPlane`, `SimpleRope` → `MeshRope` (the old names are not exported); `new MeshGeometry(vertices, uvs, indices)` → `new MeshGeometry({ positions, uvs, indices })` (the property is `positions`; `vertices` is only `MeshSimple`'s name); `new Mesh(geometry, shader)` is deprecated for `new Mesh({ geometry, shader })`, and its `drawMode` argument is gone: set `geometry.topology`.

## Variants

| Variant           | Use when                                                         | Reference                                       |
| ----------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| `Mesh`            | Custom geometry or a custom shader; indexed partial draws        | [mesh.md](scene-mesh/mesh.md)                   |
| `MeshSimple`      | Quick textured shape with per-frame vertex animation             | [mesh-simple.md](scene-mesh/mesh-simple.md)     |
| `MeshPlane`       | Subdivided textured rectangle for distortion (waves, cloth)      | [mesh-plane.md](scene-mesh/mesh-plane.md)       |
| `MeshRope`        | Texture following a polyline (ropes, trails); thickness is `texture.height` | [mesh-rope.md](scene-mesh/mesh-rope.md)         |
| `PerspectiveMesh` | 2D plane warped to four corners (tilted card, floor); not 3D, no depth buffer | [mesh-perspective.md](scene-mesh/mesh-perspective.md) |

A plain textured quad is a `Sprite` ([scene-sprite](scene-sprite.md)), not a mesh. Shader authoring is in [custom-rendering](custom-rendering.md).

## MeshGeometry owns the vertex data

`MeshGeometry` holds `positions`, `uvs`, `indices` and `topology` (`'triangle-list'` default, `'triangle-strip'`, `'line-list'`, `'line-strip'`, `'point-list'`; topology is a geometry property, not a mesh one). One geometry can be shared across meshes. It is not reference-counted and `mesh.destroy()` does not destroy it; call `geometry.destroy()` after the last mesh using it is gone.

`new MeshGeometry({ shrinkBuffersToFit: true })` reallocates the GPU buffers when you later assign a smaller `positions`/`uvs`/`indices` array. The default `false` keeps the larger allocation and reuses it, which is cheaper when sizes change often.

## Indices are never optional in practice

Omitted `indices` default to the quad list `[0, 1, 2, 0, 2, 3]`; there is no unindexed "draw in vertex order" mode. Pass `indices` for anything other than a 4-vertex quad drawn as `'triangle-list'`, whatever the topology: for a strip over `n` vertices pass `[0, 1, ..., n - 1]`. Without them a triangle reads a vertex that does not exist and a strip draws only its first quad.

## UVs are relative to the texture's frame

Mesh UVs `0..1` span the texture's frame, not its source image: the renderer multiplies them by `texture.textureMatrix`. For an atlas sub-texture use `0..1` UVs (or fractions of the frame). Feeding atlas-space UVs (such as `subTexture.uvs` values, or `frame.x / source.width`) to a sub-texture maps the frame twice and samples the wrong region. To address the whole atlas in atlas coordinates, use a texture of the full source (`new Texture({ source: sub.source })`) instead.

UVs above `1` tile only after `texture.source.addressMode = "repeat"`; the default `'clamp-to-edge'` smears the edge pixels instead. The setting changes every user of that source, and repeat wraps the whole source, so tile a standalone image, not an atlas frame. Omitted `uvs` are all zero, so the mesh samples one texel.

## Batching

A mesh batches only if its geometry is a `MeshGeometry` or subclass (a plain `Geometry` never batches), it has no custom shader and no depth or culling state, and `geometry.batchMode` allows it: `'auto'` (default) batches at 100 vertices or fewer, `'batch'` always, `'no-batch'` never.

`geometry.indexCount = n` draws only the first `n` indices, but only on the unbatched path: a batched mesh draws every index. Set `geometry.batchMode = "no-batch"` with it when the mesh uses the default shader (see [mesh](scene-mesh/mesh.md#drawing-part-of-the-index-buffer)).

## Hit testing and state

`Mesh.containsPoint(point)` (and so pointer events) tests the triangles in the index buffer. It works for a connected `'triangle-list'` (quads, `MeshPlane`, `MeshRope`). On a `'triangle-strip'` it tests only every third triangle, so most of the strip ignores the pointer; on a list holding separate pieces it also tests triangles straddling two neighbours, so the gaps between pieces register hits. Give those meshes a `hitArea` (a `Polygon` of the outline) or build strips as triangle lists.

`new Mesh({ geometry, state })` takes a `State` for blend, depth and culling (default `State.for2d()`); depth or culling flags disable batching.
