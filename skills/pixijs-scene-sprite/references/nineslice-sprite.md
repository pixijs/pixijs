# NineSliceSprite

A sprite variant that stretches a texture using 9-slice scaling. The four corner regions stay unscaled, the top and bottom edges stretch horizontally, the left and right edges stretch vertically, and the center stretches both ways. Use this for resizable UI panels, buttons, and dialog frames where you want the border art to remain crisp at any size.

## Quick Start

```ts
const texture = await Assets.load("panel.png");

const panel = new NineSliceSprite({
  texture,
  leftWidth: 20,
  topHeight: 20,
  rightWidth: 20,
  bottomHeight: 20,
  width: 400,
  height: 200,
});

app.stage.addChild(panel);
```

All four border values default to `10`. Assign `width` / `height` on the sprite (not the texture) to control the stretch region.

## Construction

```ts
const panel = new NineSliceSprite({
  texture,
  leftWidth: 20,
  topHeight: 20,
  rightWidth: 20,
  bottomHeight: 20,
  width: 400,
  height: 200,
  anchor: 0.5,
});
```

### NineSliceSpriteOptions

| Option         | Type                  | Default                       | Description                                                        |
| -------------- | --------------------- | ----------------------------- | ------------------------------------------------------------------ |
| `texture`      | `Texture`             | `Texture.EMPTY`               | Source texture for the 9-slice.                                    |
| `leftWidth`    | `number`              | `10`                          | Width of the left border column that stays unscaled.               |
| `topHeight`    | `number`              | `10`                          | Height of the top border row that stays unscaled.                  |
| `rightWidth`   | `number`              | `10`                          | Width of the right border column that stays unscaled.              |
| `bottomHeight` | `number`              | `10`                          | Height of the bottom border row that stays unscaled.               |
| `width`        | `number`              | `texture.width` (else `100`)  | Width of the stretched sprite region; modifies vertices, not UVs.  |
| `height`       | `number`              | `texture.height` (else `100`) | Height of the stretched sprite region; modifies vertices, not UVs. |
| `anchor`       | `PointData \| number` | `0`                           | Normalized draw origin in `[0, 1]`.                                |
| `roundPixels`  | `boolean`             | `false`                       | Snap rendering coordinates to integers for crisp pixel art.        |

All `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

Border values fall back to `texture.defaultBorders` if set on the texture; see the Texture-defined borders section below.

## Core Patterns

### The 9-slice grid

```
         leftWidth                rightWidth
    +---+--------------------+---+
    | 1 |         2          | 3 |   topHeight
    +---+--------------------+---+
    |   |                    |   |
    | 4 |         5          | 6 |
    |   |                    |   |
    +---+--------------------+---+
    | 7 |         8          | 9 |   bottomHeight
    +---+--------------------+---+
```

- Corners (1, 3, 7, 9): unscaled
- Top and bottom edges (2, 8): stretched horizontally
- Left and right edges (4, 6): stretched vertically
- Center (5): stretched both ways

### Runtime resize

```ts
panel.width = 600;
panel.height = 300;

panel.setSize(600, 300);
const size = panel.getSize();
```

Setting `width` / `height` modifies the sprite's vertices directly. It does not scale the underlying texture. The corners stay fixed-size regardless of how small or large you make the panel. `setSize(value, height?)` and `getSize(out?)` are the override pair used to avoid recomputing bounds twice when both axes change.

### Texture-defined borders

```ts
const texture = new Texture({
  source: baseSource,
  defaultBorders: { left: 15, top: 15, right: 15, bottom: 15 },
});

const panel = new NineSliceSprite({ texture, width: 400, height: 200 });
```

`defaultBorders` is a readonly Texture property. Pass it in the constructor options (or set it on the spritesheet data so `Assets.load` bakes it into the loaded texture). If the texture has borders set, the sprite picks them up automatically when no explicit border values are passed to the `NineSliceSprite` constructor. Define them once per texture and reuse across multiple panels.


### Border updates

```ts
panel.leftWidth = 25;
panel.rightWidth = 25;
panel.topHeight = 15;
panel.bottomHeight = 15;
```

All four border values are mutable at runtime. The sprite rebuilds its geometry on the next render.

### Source texture dimensions

```ts
console.log(panel.originalWidth, panel.originalHeight);
panel.setSize(panel.originalWidth, panel.originalHeight);
```

`originalWidth` and `originalHeight` are readonly getters that return the underlying `texture.width` / `texture.height`. Use them to reset a panel to its source size or to compute scaled sizes relative to the unstretched texture.

### Global defaults

```ts
NineSliceSprite.defaultOptions.texture = Texture.from("defaultPanel.png");
```

`NineSliceSprite.defaultOptions` is a mutable static object, but only its `texture` field is read as a fallback. Border defaults come from `texture.defaultBorders` (per-texture) or `NineSliceGeometry.defaultOptions` (global), and size defaults fall back to `texture.width` / `texture.height` or `NineSliceGeometry.defaultOptions.width` / `.height`.

### Round pixels for crisp borders

```ts
const panel = new NineSliceSprite({
  texture,
  leftWidth: 10,
  topHeight: 10,
  rightWidth: 10,
  bottomHeight: 10,
  roundPixels: true,
});
```

Use with pixel-art UI textures to avoid sub-pixel seams at the slice boundaries.

## Common Mistakes

### [HIGH] Using the old `NineSlicePlane` name

Wrong:

```ts
import { NineSlicePlane } from "pixi.js";
const panel = new NineSlicePlane(texture, 10, 10, 10, 10);
```

Correct:

```ts
import { NineSliceSprite } from "pixi.js";
const panel = new NineSliceSprite({
  texture,
  leftWidth: 10,
  topHeight: 10,
  rightWidth: 10,
  bottomHeight: 10,
});
```

`NineSlicePlane` was renamed in v8 and switched to an options-object constructor. The old `NineSlicePlane` name is deprecated — use `NineSliceSprite` instead.


### [HIGH] Setting `texture.scale` to resize the panel

Wrong:

```ts
panel.scale.set(2);
```

Correct:

```ts
panel.width = 400;
panel.height = 200;
```

`scale` stretches the entire geometry including corners, defeating the purpose of 9-slice. Always use `width` / `height` to resize a `NineSliceSprite`; this preserves corner art.


### [MEDIUM] Borders larger than half the texture

If `leftWidth + rightWidth > texture.width`, the corners overlap and the center strip disappears. Keep the sum of opposing borders less than the corresponding texture dimension.


## API Reference

- [NineSliceSprite](https://pixijs.download/release/docs/scene.NineSliceSprite.html.md)
- [NineSliceGeometry](https://pixijs.download/release/docs/scene.NineSliceGeometry.html.md)
