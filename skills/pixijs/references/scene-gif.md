# scene-gif

Animated GIFs: the `pixi.js/gif` import, loading a `GifSource` and its load options, `GifSprite` playback, sharing, and cleanup.

```ts
import "pixi.js/gif";
import { Application, Assets } from "pixi.js";
import { GifSprite, type GifSource } from "pixi.js/gif";

declare const app: Application;

const source = await Assets.load<GifSource>({ src: "animation.gif", data: { fps: 12, scaleMode: "nearest" } });

const gif = new GifSprite({ source, anchor: 0.5, animationSpeed: 1 });
gif.position.set(app.screen.width / 2, app.screen.height / 2);
app.stage.addChild(gif);
```

## The side-effect import

`pixi.js/gif` calls `extensions.add(GifAsset)`, registering `.gif` (and `data:image/gif` URLs) with the asset loader. Without it, `Assets.load` warns "could not be loaded" and resolves `null`. `GifSprite` and `GifSource` are exported from `pixi.js/gif`, not `pixi.js`.

Keep the bare `import "pixi.js/gif";` line. A named import registers the loader only if a value from it survives compilation: TypeScript and bundlers delete `import { GifSource } from "pixi.js/gif"` when `GifSource` is used only as a type annotation, so the loader is never registered and `source.textures` throws on `null`.

## Loading

`Assets.load` on a GIF returns a `GifSource` (frame textures plus timing), not a `Texture`: pass it to `GifSprite`, or read `source.textures[0]` for a still frame. Each frame is a separate canvas texture; for long, performance-critical animations a spritesheet with `AnimatedSprite` uses one atlas and batches better.

Options in `data` go to `GifSource.from` (`GifBufferOptions`, which extends `CanvasSourceOptions`, so any canvas-source field works):

| Option                | Default    | Purpose |
| --------------------- | ---------- | ------- |
| `fps`                 | `30`       | Sets the delay, `1000 / fps` ms, for every frame the file gives no delay. The only place this fallback can be set; it is baked into the source at load, so a GIF already in the cache keeps its old timing (load it under a different alias or `Assets.unload` it first) |
| `scaleMode`           | `'linear'` | `'nearest'` for pixel art |
| `resolution`          | `1`        | Resolution of the decoded frame textures |
| `autoGenerateMipmaps` | `false`    | Mipmaps for downscaling |

The loader matches `.gif` extensions and `data:image/gif` URIs. A GIF URL without an extension needs the parser forced: `Assets.load({ src, parser: "gif", data: { fps: 24 } })` (see [assets](assets.md#forcing-a-parser-with-parser)).

## GifSprite options and playback

`new GifSprite(source)` is shorthand for `new GifSprite({ source })`. `GifSpriteOptions` extends `Omit<SpriteOptions, 'texture'>` (the texture is set from `source.textures[0]` and swapped per frame), so `anchor`, `tint`, `roundPixels` and the rest apply.

| Option           | Default    | Notes |
| ---------------- | ---------- | ----- |
| `source`         | —          | Required. Shareable across many `GifSprite`s, each with independent playback. |
| `autoPlay`       | `true`     | `false` waits for `gif.play()`. |
| `loop`           | `true`     | `false` stops on the last frame and fires `onComplete`. |
| `animationSpeed` | `1`        | Multiplier on the GIF's frame timing (elapsed ticker ms × speed). |
| `autoUpdate`     | `true`     | Plays on `Ticker.shared` (not `app.ticker`), so `app.ticker.stop()` does not pause a GIF. With `false`, call `gif.update(ticker)` yourself, e.g. from `app.ticker` so pausing the app pauses the GIF. |
| `fps`            | `30`       | No effect: stored but never read. Set the fallback frame rate with `Assets.load({ src, data: { fps } })`. |
| `onComplete`, `onLoop`, `onFrameChange(frame)` | `null` | End of a non-looping run; each wrap; each displayed-frame change. |
| `scaleMode`      | `'linear'` | Deprecated since 8.13.0; pass `scaleMode` in the load `data`. |

`play()`, `stop()`; `currentFrame` is zero-based and writable; `playing` (readonly), `progress` (0-1), `totalFrames`, `duration` (ms). For a still frame, construct with `autoPlay: false` (or `stop()`) and set `currentFrame`.

`clone()` copies `source`, `autoUpdate`, `loop`, `autoPlay`, `animationSpeed` and the callbacks only; it starts at frame 0 and does not copy position, scale, anchor, tint or other Sprite state.

## Cleanup

```ts
import { Assets } from "pixi.js";
import type { GifSprite } from "pixi.js/gif";

declare const gif: GifSprite;

gif.destroy();
await Assets.unload("animation.gif");
```

`gif.destroy()` (or `destroy(false)`) destroys the sprite but keeps the `GifSource` and its decoded frames. `Assets.unload("animation.gif")` destroys the source and drops it from the cache; it does no reference counting, so call it only after the last `GifSprite` using the source is destroyed. Prefer it over `destroy(true)` for loaded GIFs: `destroy(true)` destroys the shared source (breaking every other `GifSprite` on it) and leaves it cached, so a later `Assets.load` of the same URL returns it and `new GifSprite(source)` throws "Cannot read properties of null (reading '0')". Never do both: `Assets.unload` after `destroy(true)` throws.
