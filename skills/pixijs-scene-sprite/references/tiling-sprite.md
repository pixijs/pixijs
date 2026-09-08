# TilingSprite

A sprite variant that repeats a texture across a given area. The texture can be scrolled, scaled, and rotated independently of the sprite itself. Use for scrolling backgrounds, parallax layers, repeating ground patterns, and any surface that tiles a single texture.

## Quick Start

```ts
const texture = await Assets.load("grass.png");

const bg = new TilingSprite({
  texture,
  width: app.screen.width,
  height: app.screen.height,
});

app.stage.addChild(bg);

app.ticker.add((ticker) => {
  bg.tilePosition.x -= 1 * ticker.deltaTime;
});
```

`width` / `height` define the visible tiling region. `tilePosition` scrolls the pattern within that region.

## Construction

```ts
const bg = new TilingSprite({
  texture,
  width: 800,
  height: 600,
  tilePosition: { x: 0, y: 0 },
  tileScale: { x: 1.5, y: 1.5 },
  anchor: 0.5,
  roundPixels: true,
});

const fromTexture = TilingSprite.from(texture, { width: 800, height: 600 });
const fromCache = TilingSprite.from("pattern.png", { width: 800, height: 600 });
```

`TilingSprite.from(source, options?)` accepts a `Texture` or a cached alias string. The alias form reads from the Assets cache only; `await Assets.load('pattern.png')` first or the returned sprite draws `Texture.EMPTY`.

### TilingSpriteOptions

| Option                 | Type                  | Default          | Description                                                                        |
| ---------------------- | --------------------- | ---------------- | ---------------------------------------------------------------------------------- |
| `texture`              | `Texture`             | `Texture.EMPTY`  | Texture repeated across the tiling region.                                         |
| `width`                | `number`              | `256`            | Width of the visible tiling region.                                                |
| `height`               | `number`              | `256`            | Height of the visible tiling region.                                               |
| `anchor`               | `PointData \| number` | `{ x: 0, y: 0 }` | Normalized origin of the tiling sprite itself (not the pattern).                   |
| `tilePosition`         | `PointData`           | `{ x: 0, y: 0 }` | Offset of the repeated pattern within the region; animate to scroll.               |
| `tileScale`            | `PointData`           | `{ x: 1, y: 1 }` | Scale applied to the tile pattern only; sprite region stays the same size.         |
| `tileRotation`         | `number`              | `0`              | Rotation in radians applied to the texture before tiling.                          |
| `applyAnchorToTexture` | `boolean`             | `false`          | Shift the texture origin by the anchor instead of locking `(0,0)` to the top-left. |
| `roundPixels`          | `boolean`             | `false`          | Snap the sprite's position (not the tile pattern) to integer coordinates.          |

All `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

## Core Patterns

### Scrolling pattern

```ts
app.ticker.add((ticker) => {
  bg.tilePosition.x -= 2 * ticker.deltaTime;
  bg.tilePosition.y -= 0.5 * ticker.deltaTime;
});
```

`tilePosition` is an `ObservablePoint`. Shifting it moves the pattern without moving the sprite. This is the cheapest way to scroll a background.

### Tile scale and rotation

```ts
bg.tileScale.set(2, 2);
bg.tileRotation = Math.PI / 4;
```

- `tileScale`: scales the pattern independently of the sprite. A value of `{ x: 2, y: 2 }` doubles each tile.
- `tileRotation`: rotates the tile pattern in radians. The rotation is applied to the texture before tiling, so the underlying sprite stays axis-aligned.

### Anchor on the tiling region

```ts
const bg = new TilingSprite({
  texture,
  width: 800,
  height: 600,
  anchor: 0.5,
});

bg.x = app.screen.width / 2;
bg.y = app.screen.height / 2;
```

`anchor` is the normalized origin of the tiling sprite itself (same semantics as `Sprite`), not of the repeated tile. The visible region is anchored, the tiles fill it.

### `applyAnchorToTexture`

```ts
const bg = new TilingSprite({
  texture,
  width: 800,
  height: 600,
  anchor: 0.5,
  applyAnchorToTexture: true,
});
```

By default, the top-left corner of the tiling region always maps to the `(0, 0)` texture coordinate. Set `applyAnchorToTexture: true` to shift the texture origin based on the anchor; useful when you want the pattern to stay centered on the sprite's anchor point as it scales.

### Parallax layers

```ts
const far = new TilingSprite({ texture: farTex, width: 800, height: 600 });
const near = new TilingSprite({ texture: nearTex, width: 800, height: 600 });

app.stage.addChild(far, near);

app.ticker.add((ticker) => {
  far.tilePosition.x -= 0.5 * ticker.deltaTime;
  near.tilePosition.x -= 2 * ticker.deltaTime;
});
```

Give each layer a different `tilePosition` scroll rate for a parallax effect. Scroll speeds are independent per sprite.

### Round pixels

```ts
const bg = new TilingSprite({
  texture,
  width: 800,
  height: 600,
  roundPixels: true,
});
```

Snaps the sprite's position (not the tile pattern) to integer coordinates. Useful for pixel-art tilesets to avoid shimmer.

### Hit testing

```ts
bg.eventMode = "static";
bg.on("pointertap", (e) => {
  console.log("tile clicked", bg.toLocal(e.global));
});
```

`TilingSprite` overrides `containsPoint` so hit testing respects the anchor-offset bounds of the tiling region (not the texture). Use it as a regular event target for clickable backgrounds.

### Global defaults

```ts
TilingSprite.defaultOptions.texture = Texture.from("defaultPattern.png");
TilingSprite.defaultOptions.tileScale = { x: 2, y: 2 };
```

`TilingSprite.defaultOptions` is a mutable static object merged with any options passed to the constructor. Override fields once at startup for project-wide defaults.

### Resizing the tiling region

```ts
bg.setSize(app.screen.width, app.screen.height);
const size = bg.getSize();
```

`setSize(value, height?)` accepts a square value, two numbers, or `{ width, height }`. `getSize(out?)` returns the current region and optionally writes into an existing object. Both override the base `Sprite` behavior so a single call avoids recomputing bounds twice.

## Common Mistakes

### [HIGH] Forgetting to pass a texture

Wrong:

```ts
const bg = new TilingSprite({ width: 800, height: 600 });
```

Correct:

```ts
const texture = await Assets.load("pattern.png");
const bg = new TilingSprite({ texture, width: 800, height: 600 });
```

The runtime default is `Texture.EMPTY` (set in `TilingSprite.defaultOptions`), so omitting the texture produces an invisible sprite with nothing to tile. Always pass a real texture.


### [HIGH] Scaling the sprite instead of the tile

Wrong:

```ts
bg.scale.set(2);
```

Correct:

```ts
bg.tileScale.set(2);
```

Scaling the sprite stretches everything; including the visible area. Use `tileScale` to make each tile larger while keeping the sprite's region the same size.


### [MEDIUM] Non-power-of-two textures with `tileScale`

Some WebGL implementations cannot repeat non-power-of-two textures in hardware. If you see the pattern clamp to the edge instead of wrapping, resize the source texture to power-of-two dimensions (128, 256, 512, etc.) or pre-bake the tile pattern into a larger texture.


## API Reference

- [TilingSprite](https://pixijs.download/release/docs/scene.TilingSprite.html.md)
- [TilingSpriteOptions](https://pixijs.download/release/docs/scene.TilingSpriteOptions.html.md)
