---
name: gif
description: >
  Load and display animated GIFs with PixiJS. Requires pixi.js/gif import.
  GifSprite extends Sprite with play/stop/currentFrame controls.
  GifSource for loaded data. Options: autoPlay, loop, animationSpeed,
  onComplete, onLoop, onFrameChange callbacks. Use when the user asks about
  loading GIF files, displaying animated GIFs, GIF playback control, GIF
  frame timing, GIF memory management, or converting GIFs to sprites.
  Covers GifSprite, GifSource, pixi.js/gif, autoPlay, loop, animationSpeed,
  onComplete, onLoop, onFrameChange, clone, destroy.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  requires: "pixijs, asset-loading"
  sources: "pixijs/pixijs:src/gif/GifSprite.ts, pixijs/pixijs:src/gif/GifSource.ts"
---

## When to Use This Skill

Apply when the user needs to load and display animated GIF files, control GIF playback, or manage GIF memory.

**Related skills:** For spritesheet-based frame animation use **sprite** (AnimatedSprite); for loading assets use **asset-loading**; for frame timing control use **ticker**; for texture memory use **performance**.

This skill builds on pixijs and asset-loading. Read them first for foundational concepts.

## Setup

```ts
import { Assets } from 'pixi.js';
import { GifSprite } from 'pixi.js/gif';

const source = await Assets.load('animation.gif');
const gif = new GifSprite({ source });
// Or shorthand: new GifSprite(source)

app.stage.addChild(gif);
```

Key points:
- Importing from `'pixi.js/gif'` registers the GIF asset loader extension as a side effect. Without it, `Assets.load` will not handle `.gif` files. A bare `import 'pixi.js/gif'` is only needed if you don't import any named exports from that path.
- `Assets.load('file.gif')` returns a `GifSource`, not a `Texture`.
- `GifSprite` extends `Sprite`. It displays one frame at a time from the GifSource.
- `GifSprite` and `GifSource` are exported from `pixi.js/gif`, not from `pixi.js` directly.

## Core Patterns

### Playback control

```ts
import 'pixi.js/gif';
import { Assets } from 'pixi.js';
import { GifSprite } from 'pixi.js/gif';

const source = await Assets.load('animation.gif');

const gif = new GifSprite({
    source,
    autoPlay: true,
    loop: true,
    animationSpeed: 1,
});

app.stage.addChild(gif);

// Pause and resume
gif.stop();
gif.play();

// Jump to a specific frame (zero-based)
gif.currentFrame = 5;

// Speed up or slow down
gif.animationSpeed = 2;    // 2x speed
gif.animationSpeed = 0.5;  // half speed

// Read-only state
gif.playing;     // true if currently animating
gif.progress;    // 0-1 playback position
gif.totalFrames; // number of frames
gif.duration;    // total duration in ms
```

`autoPlay: true` (default) starts playback immediately. `loop: true` (default) repeats the animation. `animationSpeed` is a multiplier on the GIF's native frame timing.

### Loading options

```ts
const source = await Assets.load({
    src: 'animation.gif',
    data: {
        fps: 12,            // fallback FPS when GIF has no delay info (default: 30)
        scaleMode: 'nearest', // forwarded to CanvasSourceOptions
        resolution: 2,
    },
});
```

Options in `data` are passed to `GifSource.from(buffer, options)`. `fps` sets the fallback frame delay for GIFs that don't specify timing. `scaleMode` and `resolution` control the canvas textures created for each frame.

### Callbacks

```ts
const gif = new GifSprite({
    source,
    loop: false,
    onComplete: () => {
        console.log('animation finished');
    },
    onLoop: () => {
        console.log('loop completed');
    },
    onFrameChange: (frame) => {
        console.log('now on frame', frame);
    },
});
```

- `onComplete` fires when a non-looping animation reaches the last frame, then playback stops.
- `onLoop` fires each time a looping animation wraps around.
- `onFrameChange` fires every time the displayed frame changes.

### Manual update mode

```ts
const gif = new GifSprite({
    source,
    autoUpdate: false,
});

app.ticker.add((ticker) => {
    gif.update(ticker);
});
```

Set `autoUpdate: false` to disconnect from `Ticker.shared`. You then call `gif.update(ticker)` yourself, passing any Ticker instance. This gives control over which tick drives the animation.

### Sharing source data and cloning

```ts
const source = await Assets.load('animation.gif');

const gif1 = new GifSprite({ source, autoPlay: true });
const gif2 = new GifSprite({ source, autoPlay: false });

// Or clone an existing GifSprite
const gif3 = gif1.clone();
gif3.animationSpeed = 0.5;
```

`GifSource` can be shared across multiple `GifSprite` instances. Each sprite has independent playback state. `clone()` copies all playback settings but creates an independent instance.

## Common Mistakes

### [HIGH] Not importing pixi.js/gif extension

Wrong:
```ts
import { Assets } from 'pixi.js';
const gif = await Assets.load('animation.gif');
```

Correct:
```ts
import 'pixi.js/gif';
import { Assets } from 'pixi.js';
const source = await Assets.load('animation.gif');
```

The GIF loader extension must be registered before loading. The side-effect import `'pixi.js/gif'` calls `extensions.add(GifAsset)` which registers the `.gif` format with the asset system. Without it, the loader does not recognize GIF files and the load may fail or return raw data.

Source: src/gif/init.ts

### [MEDIUM] Expecting GIF to be a Texture

Wrong:
```ts
import 'pixi.js/gif';
import { Assets, Sprite } from 'pixi.js';

const texture = await Assets.load('animation.gif');
const sprite = new Sprite(texture); // texture is actually a GifSource
```

Correct:
```ts
import 'pixi.js/gif';
import { Assets } from 'pixi.js';
import { GifSprite } from 'pixi.js/gif';

const source = await Assets.load('animation.gif');
const gif = new GifSprite({ source });
```

`Assets.load` for a GIF returns a `GifSource` object containing frame textures and timing data. It is not a `Texture`. To display it, create a `GifSprite` and pass the source. If you need a single static frame, access `source.textures[0]`.

Source: src/gif/GifSprite.ts

### [MEDIUM] GIF memory not released on destroy

Wrong:
```ts
gif.destroy();
// GifSource and its frame textures remain in memory
```

Correct:
```ts
gif.destroy(true);
// Destroys the GifSprite AND the GifSource with all frame textures
```

GIF frames hold decoded pixel data as individual canvas textures. Calling `gif.destroy()` or `gif.destroy(false)` destroys the sprite but keeps the `GifSource` intact (useful if shared). Pass `true` to also destroy the source and free all frame textures. For shared sources, only destroy the source when the last consumer is done. Alternatively, `await Assets.unload('animation.gif')` destroys the cached GifSource via the loader's unload handler.

Source: src/gif/GifSource.ts

---

See also: asset-loading (Assets.load, caching), sprite (AnimatedSprite for spritesheet-based animation), ticker (frame timing), performance (texture memory management)

## Learn More

- [GifSprite](https://pixijs.download/release/docs/gif.GifSprite.html.md)
- [GifSource](https://pixijs.download/release/docs/gif.GifSource.html.md)
