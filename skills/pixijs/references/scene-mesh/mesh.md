# Mesh

The base `Mesh`: constructor options, updating vertex buffers, drawing part of the index buffer, custom shaders. Geometry, UV, index and batching rules are in [scene-mesh](../scene-mesh.md).

## Constructor options

`new Mesh({ geometry, shader?, state?, texture?, roundPixels? })`

| Option        | Default         | Notes                                                                                 |
| ------------- | --------------- | ------------------------------------------------------------------------------------- |
| `geometry`    | —               | Required. Shareable across meshes.                                                    |
| `shader`      | `null`          | When set, the mesh skips batching and the shader decides what to sample.              |
| `state`       | `State.for2d()` | Blend, depth, culling. Depth or culling flags disable batching.                       |
| `texture`     | `Texture.WHITE` | Sampled by the default shader. Ignored if a custom `shader` provides its own texture. |
| `roundPixels` | `false`         |                                                                                       |

The constructor assigns `texture` from `shader.texture` when a custom shader is passed without an explicit `texture` option. Assigning `null`/`undefined` to `mesh.texture` at runtime coerces it to `Texture.EMPTY`.

## Updating vertices at runtime

```ts
declare const mesh: Mesh<MeshGeometry>;
mesh.geometry.positions[1] = Math.sin(performance.now() / 500) * 20;
mesh.geometry.getBuffer("aPosition").update();
```

The `positions`, `uvs` and `indices` getters return the underlying `Float32Array` / `Uint32Array` directly: the same data as `getBuffer('aPosition').data` / `getBuffer('aUV').data` / `getIndex().data`. Mutate in place, or assign a whole new array via the setter (the setters do `buffer.data = value` with no length check; the real invariant is `uvs.length >= positions.length` so every vertex has a UV).

Call `update()` on the buffer after mutating its `data` array to push changes to the GPU. The attribute names are `aPosition` and `aUV` (v7's `aVertexPosition`/`aTextureCoord` throw in `getBuffer`); a custom shader must declare the same names. `MeshSimple` uploads automatically.

## Drawing part of the index buffer

```ts
declare const pool: MeshGeometry; // indices for the largest number of quads
declare const activeQuads: number;

pool.batchMode = "no-batch"; // batched meshes ignore indexCount
pool.indexCount = activeQuads * 6; // 0 (default) draws every index
```

`geometry.indexCount` draws only the first `n` indices; it is read at draw time, so changing it uploads nothing. Only the direct (unbatched) draw honours it: a batched mesh always draws every index in `geometry.indices`. With the default shader and 100 or fewer vertices the mesh batches, so also set `batchMode = 'no-batch'` (a custom shader, or depth/culling state, already disables batching). `MeshGeometry` has no `indexCount` constructor option; assign the property.

## Custom shader

```ts
declare const geometry: MeshGeometry;
const shader = Shader.from({
  gl: { vertex: vertSrc, fragment: fragSrc },
  resources: { uTexture: tex.source, uSampler: tex.source.style },
});
const mesh = new Mesh({ geometry, shader });
```

With a shader, `texture` is optional and batching is bypassed. Shader authoring: [custom-rendering](../custom-rendering.md).
