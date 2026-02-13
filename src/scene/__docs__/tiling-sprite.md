---
title: Tiling Sprite
description: Learn how to use the TilingSprite class in PixiJS for rendering repeating textures efficiently across a defined area.
category: scene
---

# Tiling Sprite

`TilingSprite` repeats a texture across a rectangular area instead of stretching it. Scrolling the tile offset each frame creates parallax backgrounds; scaling the tiles creates zoom effects. Common uses: scrolling backgrounds, terrain, tiled floors, and repeating UI patterns.

```ts
import { TilingSprite, Texture } from 'pixi.js';

const tilingSprite = new TilingSprite({
  texture: Texture.from('assets/tile.png'),
  width: 400,
  height: 300,
});

app.stage.addChild(tilingSprite);
```

## How it works

- `width` and `height` control the visible area. Making them larger shows more tiles, not bigger tiles.
- `tilePosition` offsets the pattern. Animate it to create scrolling effects.
- `tileScale` resizes each tile. `tileScale.set(2)` makes tiles twice as large (so fewer fit).
- `tileRotation` rotates the pattern independently of the sprite's own rotation.

## Key properties

| Property               | Description                                                            |
| ---------------------- | ---------------------------------------------------------------------- |
| `texture`              | The texture being repeated                                             |
| `tilePosition`         | `ObservablePoint` controlling offset of the tiling pattern             |
| `tileScale`            | `ObservablePoint` controlling scaling of each tile                     |
| `tileRotation`         | Number controlling the rotation of the tile pattern                    |
| `width` / `height`     | The size of the area to be filled by tiles                             |
| `anchor`               | Adjusts origin point of the TilingSprite                               |
| `applyAnchorToTexture` | If `true`, the anchor affects the starting point of the tiling pattern |
| `clampMargin`          | Margin adjustment to avoid edge artifacts (default: `0.5`)             |

### Width and height vs scale

Unlike `Sprite`, setting `width` and `height` in a `TilingSprite` directly changes the visible tiling area. It **does not affect the scale** of the tiles.

```ts
// Makes the tiling area bigger
tilingSprite.width = 800;
tilingSprite.height = 600;

// Keeps tiles the same size, just tiles more of them
```

To scale the tile pattern itself, use `tileScale`:

```ts
// Makes each tile appear larger
tilingSprite.tileScale.set(2, 2);
```

### Scrolling background example

```ts
const bg = new TilingSprite({
  texture: Texture.from('sky.png'),
  width: app.screen.width,
  height: app.screen.height,
});

app.stage.addChild(bg);

app.ticker.add(() => {
  bg.tilePosition.x -= 1; // Scroll left each frame
});
```

### Anchor and `applyAnchorToTexture`

- `anchor` sets the pivot/origin point for positioning the TilingSprite.
- If `applyAnchorToTexture` is `true`, the anchor also affects where the tile pattern begins.
- By default, the tile pattern starts at (0, 0) in local space regardless of anchor.

---

## API reference

- {@link TilingSprite}
- {@link Texture}
