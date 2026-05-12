---
name: pixijs-scene-gif
description: "Use this skill when displaying animated GIFs in PixiJS v8. Covers the pixi.js/gif side-effect import, Assets.load returning a GifSource, GifSprite playback (play/stop/currentFrame/animationSpeed), autoPlay/loop options, onComplete/onLoop/onFrameChange callbacks, GifSource sharing, clone, destroy. Triggers on: GifSprite, GifSource, pixi.js/gif, animationSpeed, currentFrame, autoPlay, onComplete, onFrameChange, constructor options, GifSpriteOptions."
license: MIT
---

`GifSprite` plays an animated GIF as a display object. `Assets.load('animation.gif')` returns a `GifSource` (not a `Texture`), and you wrap that in a `GifSprite`. Requires a side-effect `import 'pixi.js/gif'` to register the loader extension.

Assumes familiarity with `pixijs-scene-core-concepts`. `GifSprite` extends `Sprite`, so it is a leaf: do not nest children inside it. Wrap multiple `GifSprite` instances in a `Container` to group them.

## Quick Start

```ts
import "pixi.js/gif";
import { GifSprite } from "pixi.js/gif";

const source = await Assets.load("animation.gif");

const gif = new GifSprite({
  source,
  autoPlay: true,
  loop: true,
  animationSpeed: 1,
});

gif.anchor.set(0.5);
gif.x = app.screen.width / 2;
gif.y = app.screen.height / 2;

app.stage.addChild(gif);
```

> [!NOTE]
> GIFs decode every frame into a separate canvas texture. For performance-critical animations with many frames, prefer a spritesheet with `AnimatedSprite` — it uses a single atlas texture and batches better on the GPU.

**Related skills:** `pixijs-scene-core-concepts` (scene graph basics), `pixijs-scene-sprite` (`AnimatedSprite` for spritesheet-based animation), `pixijs-assets` (`Assets.load`, caching, unloading), `pixijs-ticker` (frame timing), `pixijs-performance` (texture memory).

## Constructor options

`GifSpriteOptions` extends `Omit<SpriteOptions, 'texture'>`; `texture` is managed internally (set from `source.textures[0]` and swapped per frame). All other `Sprite` options (`anchor`, `scale`, `tint`, `roundPixels`, etc.) are valid, and all `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

Leaf-specific options added by `GifSpriteOptions`:

| Option           | Type                              | Default    | Description                                                                                                                |
| ---------------- | --------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| `source`         | `GifSource`                       | —          | Required. The parsed GIF data returned by `Assets.load('file.gif')`. Can be shared across multiple `GifSprite` instances.  |
| `autoPlay`       | `boolean`                         | `true`     | Start playback immediately on construction. If `false`, you must call `gif.play()` to begin.                               |
| `loop`           | `boolean`                         | `true`     | Repeat the animation on reaching the last frame. When `false`, the sprite stops at the final frame and fires `onComplete`. |
| `animationSpeed` | `number`                          | `1`        | Multiplier on the GIF's native frame timing. `2` runs at double speed; `0.5` runs at half.                                 |
| `autoUpdate`     | `boolean`                         | `true`     | Connect playback to `Ticker.shared`. Set to `false` to drive updates yourself via `gif.update(ticker)`.                    |
| `fps`            | `number`                          | `30`       | Fallback frame rate for GIFs that do not specify per-frame delays.                                                         |
| `onComplete`     | `() => void \| null`              | `null`     | Called when a non-looping animation reaches the last frame.                                                                |
| `onLoop`         | `() => void \| null`              | `null`     | Called each time a looping animation wraps around.                                                                         |
| `onFrameChange`  | `(frame: number) => void \| null` | `null`     | Called every time the displayed frame index changes.                                                                       |
| `scaleMode`      | `SCALE_MODE`                      | `'linear'` | Deprecated since 8.13.0 — pass `scaleMode` via `Assets.load(..., { data: { scaleMode } })` instead.                        |

The constructor also accepts a bare `GifSource` as its sole argument (`new GifSprite(source)`), which is shorthand for `new GifSprite({ source })` using the defaults above.

## Core Patterns

### Setup and the side-effect import

```ts
import "pixi.js/gif";
import { Assets } from "pixi.js";
import { GifSprite } from "pixi.js/gif";

const source = await Assets.load("animation.gif");
const gif = new GifSprite({ source });
```

`pixi.js/gif` calls `extensions.add(GifAsset)`, registering `.gif` with the asset loader. Without it, `Assets.load` does not recognize GIF files. `GifSprite` and `GifSource` are exported from `pixi.js/gif`, not `pixi.js`.

Importing a named export from `pixi.js/gif` also triggers the side effect, so a bare `import 'pixi.js/gif'` is only needed when you don't import anything from that path.

### Playback control

```ts
const gif = new GifSprite({ source });

gif.play();
gif.stop();

gif.currentFrame = 5;
gif.animationSpeed = 2;
gif.animationSpeed = 0.5;

gif.playing; // read-only
gif.progress; // 0-1 playback position
gif.totalFrames; // number of frames
gif.duration; // total duration in ms
```

`autoPlay: true` (default) starts playback immediately; `loop: true` (default) repeats. `animationSpeed` is a multiplier on the GIF's native frame timing. `currentFrame` is zero-based.

### Loading options

```ts
const source = await Assets.load({
  src: "animation.gif",
  data: {
    fps: 12,
    scaleMode: "nearest",
    resolution: 2,
  },
});

const fromDataUri = await Assets.load("data:image/gif;base64,R0lGODlh...");
```

Options in `data` are passed to `GifSource.from`. `fps` sets the fallback frame delay for GIFs that don't specify timing. `scaleMode` and `resolution` control the canvas textures created for each frame. The loader matches both `.gif` file extensions and `data:image/gif` URIs.

### Callbacks

```ts
const gif = new GifSprite({
  source,
  loop: false,
  onComplete: () => console.log("animation finished"),
  onLoop: () => console.log("loop completed"),
  onFrameChange: (frame) => console.log("now on frame", frame),
});
```

- `onComplete` fires when a non-looping animation reaches the last frame.
- `onLoop` fires each time a looping animation wraps around.
- `onFrameChange` fires every time the displayed frame changes.

### Manual update mode

```ts
const gif = new GifSprite({ source, autoUpdate: false });

app.ticker.add((ticker) => {
  gif.update(ticker);
});
```

`autoUpdate: false` disconnects from `Ticker.shared`. You call `gif.update(ticker)` yourself, passing any `Ticker` instance. Useful when animation should be driven by a private ticker (e.g., a pause-aware game ticker).

### Sharing source data and cloning

```ts
const source = await Assets.load("animation.gif");

const gif1 = new GifSprite({ source, autoPlay: true });
const gif2 = new GifSprite({ source, autoPlay: false });

const gif3 = gif1.clone();
gif3.animationSpeed = 0.5;
```

`GifSource` can be shared across multiple `GifSprite` instances; each sprite has independent playback state. `clone()` copies all playback settings but creates an independent instance.

## Common Mistakes

### [HIGH] Not importing pixi.js/gif

Wrong:

```ts
import { Assets } from "pixi.js";
const gif = await Assets.load("animation.gif");
```

Correct:

```ts
import "pixi.js/gif";
import { Assets } from "pixi.js";
const source = await Assets.load("animation.gif");
```

The GIF loader extension must be registered before loading. Without the side-effect import, the loader does not recognize `.gif` files and the load either fails or returns raw data.


### [MEDIUM] Expecting Assets.load to return a Texture

Wrong:

```ts
const texture = await Assets.load("animation.gif");
const sprite = new Sprite(texture);
```

Correct:

```ts
const source = await Assets.load("animation.gif");
const gif = new GifSprite({ source });
```

`Assets.load` on a GIF returns a `GifSource` containing frame textures and timing data. Pass the source to `GifSprite`; for a single still frame, read `source.textures[0]`.


### [MEDIUM] GIF memory not released on destroy

Wrong:

```ts
gif.destroy();
// GifSource and frame textures remain in memory
```

Correct:

```ts
gif.destroy(true);
// or
await Assets.unload("animation.gif");
```

GIF frames hold decoded pixel data as individual canvas textures. `gif.destroy()` (or `destroy(false)`) destroys the sprite but keeps the `GifSource` intact. Pass `true` to also destroy the source. For shared sources, only destroy when the last consumer is done, or call `Assets.unload` to let the asset cache handle it.


### [LOW] Do not nest children inside a GifSprite

`GifSprite` extends `Sprite`, which sets `allowChildren = false`. It is a leaf. To group a GIF with other display objects, wrap them all in a plain `Container`:

```ts
const group = new Container();
group.addChild(gif, label);
```


## API Reference

- [GifSprite](https://pixijs.download/release/docs/gif.GifSprite.html.md)
- [GifSpriteOptions](https://pixijs.download/release/docs/gif.GifSpriteOptions.html.md)
- [GifSource](https://pixijs.download/release/docs/gif.GifSource.html.md)
- [GifAsset](https://pixijs.download/release/docs/gif.GifAsset.html.md)
- [GifBufferOptions](https://pixijs.download/release/docs/gif.GifBufferOptions.html.md)
- [GifFrame](https://pixijs.download/release/docs/gif.GifFrame.html.md)
