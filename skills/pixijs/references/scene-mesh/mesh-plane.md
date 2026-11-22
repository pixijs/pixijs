# MeshPlane

A texture mapped onto a subdivided grid for per-vertex distortion (waves, cloth, heat haze). v7's `SimplePlane(texture, 10, 10)` is `new MeshPlane({ texture, verticesX: 10, verticesY: 10 })`.

Options: `texture` (required; sets the initial `width`/`height`), `verticesX` and `verticesY` (each default `10`). `geometry` is not an option (it builds a `PlaneGeometry`); `shader`, `state` and `roundPixels` behave as on [Mesh](mesh.md).

Meshes batch only with 100 vertices or fewer, so the 10×10 default is the last batchable size; any denser plane costs its own draw call. Vertex density doesn't change how an undeformed plane samples its texture, and `roundPixels` only snaps the position: for blurry pixel art set `texture.source.scaleMode = "nearest"`.

## Deforming the grid

```ts
const plane = new MeshPlane({ texture: tex, verticesX: 30, verticesY: 30 });
const { buffer } = plane.geometry.getAttribute("aPosition");
const original = new Float32Array(buffer.data);

app.ticker.add(() => {
  const t = performance.now() / 500;
  for (let i = 0; i < buffer.data.length; i += 2) {
    buffer.data[i + 1] = original[i + 1] + Math.sin(t + original[i] * 0.1) * 5;
  }
  buffer.update();
});
```

The buffer does not observe its own `data` array: without `buffer.update()` the next render draws stale vertices. UVs are fixed once the plane is built, so moving vertices stretches the texture to follow.

## Size and autoResize

`autoResize` is a runtime property the constructor sets to `true`, not a constructor option. While it is on, changing the texture (or the texture emitting `'update'`) rebuilds the geometry to the new texture's dimensions. For a size decoupled from the texture:

```ts
declare const plane: MeshPlane;
plane.autoResize = false;
const geometry = plane.geometry as PlaneGeometry; // typed as MeshGeometry
geometry.width = 500;
geometry.height = 300;
geometry.build({});
```

`build()` keeps the geometry's current `verticesX`/`verticesY`/`width`/`height` and ignores the same keys in its argument, so `build({ verticesX: 20 })` changes nothing: assign the fields, then call `build({})`.
