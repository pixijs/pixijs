# MeshPlane

A mesh that maps a texture onto a subdivided plane with configurable vertex density. Use `MeshPlane` for distortion effects, wave simulations, cloth, heat haze, or any effect that needs per-vertex deformation of a flat textured rectangle.

## Quick Start

```ts
const texture = await Assets.load("background.png");

const plane = new MeshPlane({
  texture,
  verticesX: 10,
  verticesY: 10,
});

app.stage.addChild(plane);
```

`verticesX` / `verticesY` control the grid density (each defaults to `10`). More vertices give smoother deformation at higher draw overhead. The plane sizes itself to the texture by default.

## Constructor options

`new MeshPlane(options: MeshPlaneOptions)`

| Option      | Type      | Default | Description                                                                        |
| ----------- | --------- | ------- | ---------------------------------------------------------------------------------- |
| `texture`   | `Texture` | —       | Texture mapped onto the plane. Required; also drives the initial `width`/`height`. |
| `verticesX` | `number`  | `10`    | Grid columns. Higher values yield smoother deformation at higher draw cost.        |
| `verticesY` | `number`  | `10`    | Grid rows. Higher values yield smoother deformation at higher draw cost.           |

`MeshPlane` builds its own `PlaneGeometry`, so you cannot pass `geometry` — it is omitted from the options type. Other `MeshOptions` fields (`shader`, `state`, `roundPixels`) are inherited from `mesh.md` and behave identically.

All `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

`autoResize` is a runtime property set to `true` by the constructor, not a constructor option. Toggle it after construction to control whether texture changes rebuild the plane geometry.

## Core Patterns

### Deforming the vertex grid

```ts
const { buffer } = plane.geometry.getAttribute("aPosition");

app.ticker.add(() => {
  for (let i = 0; i < buffer.data.length; i++) {
    buffer.data[i] += Math.sin(performance.now() / 1000 + i) * 0.3;
  }
  buffer.update();
});
```

Grab the position buffer via `getAttribute('aPosition')`, mutate the `data` array, then call `buffer.update()` to push changes to the GPU. The texture UVs are fixed once the plane is built, so as long as you only move vertices (not change the grid topology), the texture stretches to follow.

### Auto-resize on texture change

```ts
plane.texture = await Assets.load("new-background.png");
```

`autoResize` defaults to `true`. When the plane's texture changes (or emits an `'update'` event), the geometry rebuilds to match the new texture dimensions. Set `autoResize = false` to keep the original size regardless of the new texture.

### Fixed-size plane

```ts
const fixedPlane = new MeshPlane({
  texture,
  verticesX: 20,
  verticesY: 20,
});
fixedPlane.autoResize = false;

const geometry = fixedPlane.geometry;
geometry.width = 500;
geometry.height = 300;
geometry.build({});
```

For a plane whose size is decoupled from the texture, disable `autoResize` and set the geometry's `width` / `height` explicitly. Call `build({})` to regenerate vertex positions at the new size.

### Higher vertex density for smooth distortion

```ts
const smooth = new MeshPlane({
  texture,
  verticesX: 40,
  verticesY: 40,
});
```

Vertex density directly controls how smoothly the plane can deform. A 10×10 grid is fine for coarse ripples; for waves, cloth, or fine distortion, bump density to 20×20 or higher. Density above ~50×50 starts to affect draw overhead on lower-end devices.

### Wave animation

```ts
const plane = new MeshPlane({ texture, verticesX: 30, verticesY: 30 });
const { buffer } = plane.geometry.getAttribute("aPosition");
const original = new Float32Array(buffer.data);

app.ticker.add((ticker) => {
  const t = performance.now() / 500;
  for (let i = 0; i < buffer.data.length; i += 2) {
    buffer.data[i] = original[i];
    buffer.data[i + 1] = original[i + 1] + Math.sin(t + original[i] * 0.1) * 5;
  }
  buffer.update();
});
```

Cache the original positions once, then offset from them each frame. Resetting to the base positions each frame avoids cumulative drift.

## Common Mistakes

### [HIGH] Using the old `SimplePlane` name

Wrong:

```ts
import { SimplePlane } from "pixi.js";
const plane = new SimplePlane(texture, 10, 10);
```

Correct:

```ts
import { MeshPlane } from "pixi.js";
const plane = new MeshPlane({ texture, verticesX: 10, verticesY: 10 });
```

`SimplePlane` was renamed to `MeshPlane` in v8 and switched to an options-object constructor.


### [MEDIUM] Mutating positions without calling `buffer.update()`

Wrong:

```ts
buffer.data[1] = 50;
```

Correct:

```ts
buffer.data[1] = 50;
buffer.update();
```

The buffer does not observe its own `data` array. Without `update()`, the changes stay on the CPU and the next render draws stale vertex data.


### [MEDIUM] High vertex density on pixel-art textures

A dense grid on a small pixel-art texture can cause visible UV interpolation artifacts. Use fewer vertices (10×10 or less) for pixel art, or set `roundPixels: true` on the mesh.


## API Reference

- [MeshPlane](https://pixijs.download/release/docs/scene.MeshPlane.html.md)
- [MeshPlaneOptions](https://pixijs.download/release/docs/scene.MeshPlaneOptions.html.md)
- [PlaneGeometry](https://pixijs.download/release/docs/scene.PlaneGeometry.html.md)
