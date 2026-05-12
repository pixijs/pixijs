# Sprite

The core image-drawing leaf. Displays a single `Texture` at a transform. Use `Sprite` whenever you want to draw a static image that isn't animated (`AnimatedSprite`), repeating (`TilingSprite`), or resizable with borders (`NineSliceSprite`).

## Quick Start

```ts
const texture = await Assets.load("bunny.png");

const sprite = new Sprite({
  texture,
  anchor: 0.5,
  tint: 0xff8888,
});
sprite.x = app.screen.width / 2;
sprite.y = app.screen.height / 2;

app.stage.addChild(sprite);
```

`Sprite` is a leaf; `allowChildren` is `false`. Wrap sprites in a `Container` if you need to group or nest them.

Position is set after construction because `app.screen.width / 2` depends on the live renderer; literal positions can go directly in the options as `x`/`y`.

## Core Patterns

### Construction

```ts
const fromTexture = new Sprite(texture);

const fromCache = Sprite.from("bunny.png");

const fromCanvasNoCache = Sprite.from(canvas, true);

const withOptions = new Sprite({
  texture,
  anchor: 0.5,
  x: 100,
  y: 200,
  tint: 0xffcc00,
  alpha: 0.8,
  roundPixels: true,
});
```

#### SpriteOptions

| Option        | Type                  | Default         | Description                                                                           |
| ------------- | --------------------- | --------------- | ------------------------------------------------------------------------------------- |
| `texture`     | `Texture`             | `Texture.EMPTY` | Texture to draw.                                                                      |
| `anchor`      | `PointData \| number` | `0`             | Normalized draw origin in `[0, 1]`; falls back to `texture.defaultAnchor` when unset. |
| `roundPixels` | `boolean`             | `false`         | Snap rendering coordinates to integers for crisp pixel art.                           |

All `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

`Sprite.from(source, skipCache?)` accepts a `Texture` or a `TextureSourceLike` (canvas, video, URL). With a cached alias it only reads the cache and returns `Texture.EMPTY` if the texture was not loaded first; always `await Assets.load(...)` for images. The optional second `skipCache` argument forwards to `Texture.from` to avoid storing ephemeral textures in the global cache.

Video and canvas elements work as texture sources too. Load a video file via `await Assets.load('clip.mp4')` and pass the returned texture to `new Sprite(texture)`; on mobile platforms, start playback from a user gesture to satisfy autoplay policies.

### Sizing helpers

```ts
sprite.setSize(200); // square: both axes
sprite.setSize(200, 120); // width and height
sprite.setSize({ width: 200, height: 120 });

const size = sprite.getSize(); // { width, height }
const reused = { width: 0, height: 0 };
sprite.getSize(reused); // write into an existing object
```

`setSize` avoids the double bounds recalculation of setting `width` and `height` separately. `getSize(out?)` returns the current drawn size and optionally writes into a passed object.

### Visual vs source bounds

```ts
const drawn = sprite.visualBounds; // minX, maxX, minY, maxY of the drawn region (anchor-aware)
```

`sprite.visualBounds` is the rectangle the sprite actually draws in local space, accounting for anchor and texture trim. It differs from `getLocalBounds()` when the texture has padding/trim or a non-zero anchor.

### Anchor

```ts
sprite.anchor.set(0.5); // center both axes
sprite.anchor.set(0, 0); // top-left (default)
sprite.anchor.set(1, 0); // top-right
sprite.anchor = { x: 0.5, y: 1 }; // bottom-center
```

`anchor` is normalized `[0, 1]` relative to the texture dimensions. It shifts where the texture draws relative to the sprite's `(x, y)` without offsetting the sprite's position. If omitted, falls back to `texture.defaultAnchor`. Anchor is Sprite-only; it differs from `pivot` (inherited from `Container`, in pixel space); pivot shifts both transform origin and visual position.

### Tint and alpha

```ts
sprite.tint = 0xff0000; // multiply against the texture colors
sprite.alpha = 0.5; // parent-combined transparency
```

`tint` multiplies pixel values; white (`0xffffff`) is a no-op. `alpha` is combined with ancestor alpha up the tree.

### Round pixels

```ts
const sprite = new Sprite({ texture, roundPixels: true });
```

Snaps rendering coordinates to integers for crisp pixel-art. Apply per-sprite, or globally via `TextureStyle.defaultOptions.scaleMode = 'nearest'` + `roundPixels: true` on the renderer.

### Dynamic textures

```ts
texture.dynamic = true;
texture.frame.width /= 2;
texture.update();
```

v8 removed event-based change notification. Set `texture.dynamic = true` once, then normal `texture.update()` calls propagate to all sprites that reference it. Without `dynamic`, you must call `sprite['onViewUpdate']()` manually after mutating the texture.

## Common Mistakes

### [HIGH] Using `Texture.from(url)` to load

Wrong:

```ts
const texture = Texture.from("https://example.com/image.png");
const sprite = new Sprite(texture);
```

Correct:

```ts
const texture = await Assets.load("https://example.com/image.png");
const sprite = new Sprite(texture);
```

In v8, `Texture.from()` only retrieves from the cache. It does not fetch. Use `Assets.load()` first; its return value is the texture, so you don't need a separate `Texture.from()` call.


### [HIGH] Confusing anchor with pivot

Wrong:

```ts
sprite.pivot.set(sprite.width / 2, sprite.height / 2);
```

Correct:

```ts
sprite.anchor.set(0.5);
```

`anchor` is normalized `[0, 1]` and shifts where the texture draws without offsetting position. `pivot` is in pixel space and offsets both the transform origin and the rendered position. For centering a sprite, always use `anchor`.


### [MEDIUM] Adding children to a Sprite

Wrong:

```ts
sprite.addChild(childSprite);
```

Correct:

```ts
const group = new Container();
group.addChild(sprite, childSprite);
```

`Sprite` sets `allowChildren = false`. Adding children logs a deprecation warning and will become a hard error. Group leaves inside a `Container`.


## API Reference

- [Sprite](https://pixijs.download/release/docs/scene.Sprite.html.md)
- [SpriteOptions](https://pixijs.download/release/docs/scene.SpriteOptions.html.md)
- [Texture](https://pixijs.download/release/docs/rendering.Texture.html.md)
