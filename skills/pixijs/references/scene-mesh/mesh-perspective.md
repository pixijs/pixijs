# PerspectiveMesh

A textured plane warped to four corner points (tilted card, fake floor). It projects a subdivided vertex grid; UVs stay a regular grid and interpolate linearly per triangle, so density sets the quality. There is no Z axis, depth buffer or camera; real 3D needs a 3D library.

```ts
const card = new PerspectiveMesh({
  texture: tex,
  verticesX: 20,
  verticesY: 20,
  x0: 0, y0: 0, // texture top-left
  x1: 300, y1: 30, // top-right
  x2: 280, y2: 300, // bottom-right
  x3: 20, y3: 280, // bottom-left
});

app.ticker.add(() => {
  const wave = Math.sin(performance.now() / 1000) * 30;
  card.setCorners(0, wave, 200, -wave, 200, 200, 0, 200);
});
```

Corners go clockwise from the top-left: corner `0` receives the texture's top-left, `1` top-right, `2` bottom-right, `3` bottom-left, whatever their screen positions. For a floor, put corners 0 and 1 (the texture's top edge) higher and closer together. Keep the quad convex; a bow-tie or non-convex quad produces artifacts. `setCorners(x0, y0, x1, y1, x2, y2, x3, y3)` updates the geometry in place.

Options: the options type is `PerspectivePlaneOptions` (not `PerspectiveMeshOptions`), extending `MeshPlaneOptions`. Defaults: `texture` `Texture.WHITE`, `verticesX`/`verticesY` `10`, corners forming a 100x100 square (`x1`, `x2`, `y2`, `y3` = `100`, the rest `0`); `PerspectiveMesh.defaultOptions` overrides them globally. `geometry` is not an option (it builds a `PerspectivePlaneGeometry`); `shader`, `state` and `roundPixels` behave as on [Mesh](mesh.md).

Density: a 2×2 grid is two triangles and shows no perspective correction, 5×5 shows obvious triangular stretching, 20×20 is a good default; use more than 10×10 for any visible tilt.

Assigning a new `texture` rebuilds the geometry to the new dimensions and keeps the corners.
