# Animated GIFs

PixiJS loads animated GIFs through `Assets.load()` and returns a `GifSource` containing all decoded frames. Pass the source to `GifSprite` for playback, looping, and frame control. GIF support is opt-in via the `'pixi.js/gif'` side-effect import.

## Quick Start

```ts
import "pixi.js/gif";
import { Assets, GifSprite } from "pixi.js";

const source = await Assets.load("explosion.gif");
const gif = new GifSprite(source);
app.stage.addChild(gif);
```

Without `'pixi.js/gif'`, the `.gif` loader parser isn't registered and `Assets.load()` won't know what to do with the file.

## Core Patterns

### Load options via `data`

```ts
const source = await Assets.load({
  src: "pixel-art.gif",
  data: {
    fps: 12,
    scaleMode: "nearest",
    resolution: 2,
    autoGenerateMipmaps: false,
  },
});
```

`data` accepts `GifBufferOptions`, which extends `CanvasSourceOptions`:

| Option                | Default    | Purpose                                                          |
| --------------------- | ---------- | ---------------------------------------------------------------- |
| `fps`                 | `30`       | Fallback frame rate when the GIF has no per-frame delay metadata |
| `scaleMode`           | `'linear'` | `'nearest'` for pixel art, `'linear'` for smooth scaling         |
| `resolution`          | `1`        | Render resolution of the decoded frames                          |
| `autoGenerateMipmaps` | `false`    | Generate mipmaps for downscaling                                 |

Any other `CanvasSourceOptions` field works here too.

### GifSprite options

```ts
const gif = new GifSprite({
  source,
  autoPlay: true,
  loop: true,
  animationSpeed: 0.5,
  autoUpdate: true,
  fps: 30,
  onComplete: () => console.log("done"),
  onLoop: () => console.log("looped"),
  onFrameChange: (frame) => console.log(frame),
});
```

Construction options control playback behavior; they're independent of the load-time `data` options.

### Loading from a data URI

```ts
const source = await Assets.load(
  "data:image/gif;base64,R0lGODlhAQABAAAAACw...",
);
```

The parser matches both `.gif` file extensions and `data:image/gif` URIs. No extra configuration needed.

### Playback control

```ts
gif.play();
gif.stop();
gif.currentFrame = 5;
gif.animationSpeed = 0.5;
gif.loop = false;

console.log(gif.totalFrames);
console.log(gif.playing);
console.log(gif.progress);
console.log(gif.duration);
```

### Sharing a source across sprites

```ts
const source = await Assets.load("spin.gif");

const a = new GifSprite(source);
const b = new GifSprite(source);

a.animationSpeed = 1;
b.animationSpeed = 0.25;
```

Multiple `GifSprite` instances can share the same `GifSource`; each gets independent playback state. The underlying textures are shared, so this is cheap.

### Cleanup

```ts
gif.destroy(); // destroys the sprite, not the source
gif.destroy(true); // destroys the sprite AND the source (breaks other sprites using it)
await Assets.unload("explosion.gif"); // unload through the Assets system
```

Prefer `Assets.unload` unless you know no other sprite shares the same `GifSource`.

## Forcing the GIF parser

If your GIF URL lacks an extension, force the parser:

```ts
const source = await Assets.load({
  src: "https://cdn.example.com/gif/abc123",
  parser: "gif",
  data: { fps: 24 },
});
```

See the main `SKILL.md` section on "Forcing a parser with `parser`" for the full list of parser IDs.

## Common Mistakes

### [CRITICAL] Missing the GIF import

Wrong:

```ts
import { Assets } from "pixi.js";
await Assets.load("explosion.gif");
```

Correct:

```ts
import "pixi.js/gif";
import { Assets } from "pixi.js";
await Assets.load("explosion.gif");
```

Without `'pixi.js/gif'`, the loader parser isn't registered. The call fails or returns undefined.


### [MEDIUM] Using GIF when a spritesheet would be cheaper

GIF decoding creates one texture per frame. For a 30-frame animation that's 30 separate uploads. A spritesheet packs all frames into a single atlas texture, which batches better and uses less GPU memory. Prefer spritesheets for performance-critical game animations; use GIFs for convenience and one-off effects.


### [MEDIUM] destroy(true) when other sprites share the source

```ts
const source = await Assets.load("spin.gif");
const a = new GifSprite(source);
const b = new GifSprite(source);

a.destroy(true); // WRONG: also destroys source, breaking sprite b
```

Pass `true` to `destroy` only if you know nothing else references the `GifSource`. Otherwise call plain `destroy()` and `Assets.unload()` when the source is no longer needed.


## API Reference

- [GifSource](https://pixijs.download/release/docs/gif.GifSource.html.md)
- [GifSprite](https://pixijs.download/release/docs/gif.GifSprite.html.md)
- [GifBufferOptions](https://pixijs.download/release/docs/gif.GifBufferOptions.html.md)
- [GifAsset](https://pixijs.download/release/docs/gif.GifAsset.html.md)
