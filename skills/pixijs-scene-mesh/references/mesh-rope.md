# MeshRope

A mesh that renders a texture along a path defined by points. Each segment bends the texture to follow the curve. Use `MeshRope` for ropes, chains, snakes, trails, whip effects, tentacles, and any effect where you want a textured ribbon that follows a moving polyline.

## Quick Start

```ts
const texture = await Assets.load("rope.png");

const points = [];
for (let i = 0; i < 20; i++) {
  points.push(new Point(i * 50, 0));
}

const rope = new MeshRope({
  texture,
  points,
  textureScale: 0,
  width: texture.height,
});
app.stage.addChild(rope);

app.ticker.add(() => {
  const t = performance.now() / 500;
  for (let i = 0; i < points.length; i++) {
    points[i].y = Math.sin(i * 0.5 + t) * 30;
  }
});
```

The rope uses the y-axis of the texture as its thickness and stretches the x-axis along the path. Move points each frame; with `autoUpdate` enabled (default), the geometry updates automatically.

## Constructor options

`new MeshRope(options: MeshRopeOptions)`

| Option         | Type          | Default          | Description                                                                                                                                                                                                                       |
| -------------- | ------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `texture`      | `Texture`     | —                | Texture sampled along the rope. Required.                                                                                                                                                                                         |
| `points`       | `PointData[]` | —                | Ordered path the rope follows. Required. Each entry bends the texture; more points yield smoother curves.                                                                                                                         |
| `textureScale` | `number`      | `0`              | `0` stretches the texture across the full length. Positive values repeat the texture while preserving aspect ratio and switch the source's `addressMode` to `'repeat'`. Values `< 1` with a larger source reduce alpha artifacts. |
| `width`        | `number`      | `texture.height` | Rope thickness. Defaults to the texture height when omitted.                                                                                                                                                                      |

`MeshRope` builds its own `RopeGeometry`, so `geometry` is omitted from the options type. Other `MeshOptions` fields (`shader`, `state`, `roundPixels`) are inherited from `mesh.md` and behave identically.

All `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

`autoUpdate` is a runtime property (defaults to `true`), not a constructor option. Set `rope.autoUpdate = false` after construction to control when the geometry recomputes from the points. `MeshRope.defaultOptions` overrides the `textureScale` default globally.

## Core Patterns

### `textureScale`: stretch vs repeat

```ts
// stretch (default); entire texture maps across the rope
const stretched = new MeshRope({ texture, points, textureScale: 0 });

// repeat; texture tiles along the rope, preserving aspect ratio
const repeated = new MeshRope({ texture, points, textureScale: 1 });

// higher resolution; downsample an HD texture for better quality
const sharp = new MeshRope({ texture: hdRope, points, textureScale: 0.5 });
```

- `textureScale: 0` (default): stretches the texture across the full rope length.
- `textureScale > 0`: repeats the texture while preserving its aspect ratio. The underlying texture source has its `addressMode` set to `'repeat'`. Power-of-two textures are recommended for WebGL compatibility.
- `textureScale < 1` with a larger source texture reduces alpha-channel artifacts.

### Rope width

```ts
const thick = new MeshRope({
  texture,
  points,
  width: 60,
});
```

`width` (thickness) defaults to `texture.height`. Override it for a rope narrower or wider than the source art.

### Manual update mode

```ts
const rope = new MeshRope({ texture, points });
rope.autoUpdate = false;

app.ticker.add(() => {
  for (let i = 0; i < points.length; i++) {
    points[i].y = Math.sin(i + performance.now() / 1000) * 30;
  }
  (rope.geometry as RopeGeometry).update();
});
```

Set `autoUpdate = false` to control when the geometry recomputes from the points. Useful when your point array only changes occasionally, or when you want to update once per multiple frames for performance.

### Trail effect

```ts
const trailPoints: Point[] = [];
for (let i = 0; i < 30; i++) {
  trailPoints.push(new Point(0, 0));
}

const trail = new MeshRope({
  texture: trailTex,
  points: trailPoints,
  textureScale: 0,
});
app.stage.addChild(trail);

app.ticker.add(() => {
  for (let i = trailPoints.length - 1; i > 0; i--) {
    trailPoints[i].x = trailPoints[i - 1].x;
    trailPoints[i].y = trailPoints[i - 1].y;
  }
  trailPoints[0].x = mouseX;
  trailPoints[0].y = mouseY;
});
```

A simple tail effect: shift all points one slot down each frame, then write the new head. Stretch texture mode (`textureScale: 0`) makes the full texture visible along the trail regardless of length.

## Common Mistakes

### [HIGH] Using the old `SimpleRope` or `Rope` name

Wrong:

```ts
import { SimpleRope } from "pixi.js";
const rope = new SimpleRope(texture, points);
```

Correct:

```ts
import { MeshRope } from "pixi.js";
const rope = new MeshRope({ texture, points });
```

`SimpleRope` was renamed to `MeshRope` in v8 and switched to an options-object constructor.


### [HIGH] Too few points for a smooth curve

Wrong:

```ts
const rope = new MeshRope({
  texture,
  points: [new Point(0, 0), new Point(400, 0)],
});
```

Correct:

```ts
const points = [];
for (let i = 0; i < 20; i++) points.push(new Point(i * 20, 0));
const rope = new MeshRope({ texture, points });
```

The rope only bends at point boundaries. Two points produce a straight segment; a curved rope needs many closely-spaced points (typically 15–30 for a visible bend).


### [MEDIUM] Non-power-of-two texture with `textureScale > 0`

When `textureScale` is positive, the rope sets the texture source's `addressMode` to `'repeat'`. Some WebGL drivers clamp non-power-of-two textures instead of wrapping, causing the tile pattern to stretch. Resize the source to power-of-two dimensions (128, 256, 512, etc.) for reliable wrapping.


## API Reference

- [MeshRope](https://pixijs.download/release/docs/scene.MeshRope.html.md)
- [MeshRopeOptions](https://pixijs.download/release/docs/scene.MeshRopeOptions.html.md)
- [RopeGeometry](https://pixijs.download/release/docs/scene.RopeGeometry.html.md)
