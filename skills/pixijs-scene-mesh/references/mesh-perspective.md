# PerspectiveMesh

A mesh that renders a textured plane with perspective projection via four corner points. The UV interpolation is computed per vertex in a subdivided grid, so the more vertices you allocate, the smoother the projection. Use `PerspectiveMesh` for 2D billboards, floor planes, angled cards, fake 3D layouts, or anywhere you want a texture to appear tilted into the scene.

## Quick Start

```ts
const texture = await Assets.load("card.png");

const mesh = new PerspectiveMesh({
  texture,
  verticesX: 20,
  verticesY: 20,
  x0: 0,
  y0: 0, // top-left
  x1: 300,
  y1: 30, // top-right (raised)
  x2: 280,
  y2: 300, // bottom-right
  x3: 20,
  y3: 280, // bottom-left
});

app.stage.addChild(mesh);
```

The four corner coordinates define a quadrilateral in local space; the mesh warps the texture to fit it with perspective-correct UVs.

## Constructor options

`new PerspectiveMesh(options: PerspectivePlaneOptions)`

> Note: the interface is `PerspectivePlaneOptions`, not `PerspectiveMeshOptions`. It extends `MeshPlaneOptions`.

| Option      | Type      | Default         | Description                                                                                                           |
| ----------- | --------- | --------------- | --------------------------------------------------------------------------------------------------------------------- |
| `texture`   | `Texture` | `Texture.WHITE` | Texture warped onto the quad. Inherited from `MeshPlaneOptions`; also drives the geometry's initial `width`/`height`. |
| `verticesX` | `number`  | `10`            | Grid columns. More vertices yield smoother perspective at higher draw cost.                                           |
| `verticesY` | `number`  | `10`            | Grid rows. More vertices yield smoother perspective at higher draw cost.                                              |
| `x0`        | `number`  | `0`             | Top-left corner x.                                                                                                    |
| `y0`        | `number`  | `0`             | Top-left corner y.                                                                                                    |
| `x1`        | `number`  | `100`           | Top-right corner x.                                                                                                   |
| `y1`        | `number`  | `0`             | Top-right corner y.                                                                                                   |
| `x2`        | `number`  | `100`           | Bottom-right corner x.                                                                                                |
| `y2`        | `number`  | `100`           | Bottom-right corner y.                                                                                                |
| `x3`        | `number`  | `0`             | Bottom-left corner x.                                                                                                 |
| `y3`        | `number`  | `100`           | Bottom-left corner y.                                                                                                 |

Corners must be listed clockwise from the top-left. Defaults form a 100x100 square with `Texture.WHITE`; `PerspectiveMesh.defaultOptions` overrides them globally. The constructor omits `geometry` (it builds its own `PerspectivePlaneGeometry`). Other `MeshOptions` fields (`shader`, `state`, `roundPixels`) are inherited from `mesh.md`.

All `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

Call `mesh.setCorners(x0, y0, x1, y1, x2, y2, x3, y3)` at runtime to animate the warp.

## Core Patterns

### Corner order

```ts
mesh.setCorners(
  0,
  0, // top-left    (x0, y0)
  200,
  0, // top-right   (x1, y1)
  200,
  200, // bottom-right(x2, y2)
  0,
  200, // bottom-left (x3, y3)
);
```

Corners must be specified clockwise starting from the top-left. `setCorners` updates the geometry in place; use it for animation.

### Animated perspective

```ts
const mesh = new PerspectiveMesh({
  texture,
  verticesX: 20,
  verticesY: 20,
});

app.ticker.add(() => {
  const t = performance.now() / 1000;
  const wave = Math.sin(t) * 30;

  mesh.setCorners(0, wave, 200, -wave, 200, 200, 0, 200);
});
```

Call `setCorners` each frame to animate the warp. The geometry recalculates perspective-correct UVs automatically.

### Vertex density vs quality

```ts
const coarse = new PerspectiveMesh({ texture, verticesX: 5, verticesY: 5 });
const smooth = new PerspectiveMesh({ texture, verticesX: 30, verticesY: 30 });
```

The number of vertices controls how smooth the perspective projection looks. A 5×5 grid shows obvious triangular stretching; 20×20 is a good default; 30×30+ is smooth but adds draw overhead. Each axis defaults to `10`.

### Fake floor

```ts
const floor = new PerspectiveMesh({
  texture: floorTex,
  verticesX: 20,
  verticesY: 20,
  x0: 200,
  y0: 300, // near left on screen
  x1: 600,
  y1: 300, // near right
  x2: 800,
  y2: 200, // far right
  x3: 0,
  y3: 200, // far left
});

app.stage.addChild(floor);
```

Put the "far" corners higher on the screen and closer together than the "near" corners to create a floor-extending-into-the-distance effect. Use with a scrolling TilingSprite above for a stylized 2D driving game.

### Updating the texture

```ts
mesh.texture = await Assets.load("new-card.png");
```

Changing the texture rebuilds the geometry to match the new dimensions while keeping the current corner positions. The perspective projection persists through texture swaps.

## Common Mistakes

### [HIGH] Expecting true 3D

`PerspectiveMesh` is a 2D mesh with UV correction to simulate perspective. There is no Z axis, no depth buffer, and no camera. For real 3D, use a full WebGL/WebGPU library on top of PixiJS, or drive vertex positions through a manual transform.


### [MEDIUM] Too few vertices for a noticeable tilt

Wrong:

```ts
const mesh = new PerspectiveMesh({
  texture,
  verticesX: 2,
  verticesY: 2,
  x0: 0,
  y0: 0,
  x1: 300,
  y1: 50,
  x2: 280,
  y2: 250,
  x3: 20,
  y3: 200,
});
```

Correct:

```ts
const mesh = new PerspectiveMesh({
  texture,
  verticesX: 20,
  verticesY: 20,
  x0: 0,
  y0: 0,
  x1: 300,
  y1: 50,
  x2: 280,
  y2: 250,
  x3: 20,
  y3: 200,
});
```

A 2×2 grid has only two triangles; the texture stretches linearly with no perspective correction. Bump density above 10×10 for any visible tilt.


### [MEDIUM] Non-convex corners

If your four corners form a non-convex (self-intersecting or bow-tie) quadrilateral, the UV interpolation produces visual artifacts. Keep the corners in consistent clockwise order and check that the quad is convex.


## API Reference

- [PerspectiveMesh](https://pixijs.download/release/docs/scene.PerspectiveMesh.html.md)
- [PerspectivePlaneOptions](https://pixijs.download/release/docs/scene.PerspectivePlaneOptions.html.md)
- [MeshPlane](https://pixijs.download/release/docs/scene.MeshPlane.html.md)
