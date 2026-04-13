---
title: Overview
category: gif
description: Learn how to load, display, and control animated GIFs in PixiJS using GifSource and GifSprite.
---

# GIF

The GIF module adds animated GIF support to PixiJS. It handles decoding, frame management, and playback control. GIF support is not included in the base `pixi.js` import; you must import from `pixi.js/gif`.

## Loading and displaying a GIF

`Assets.load()` returns a {@link GifSource}, which holds all decoded frames. Pass it to {@link GifSprite} to display and animate it.

```ts
import 'pixi.js/gif'; // Must be imported before loading GIFs
import { Application, Assets, GifSprite } from 'pixi.js';

const app = new Application();
await app.init({ width: 800, height: 600 });

const source = await Assets.load('explosion.gif');
const gif = new GifSprite(source);

app.stage.addChild(gif);
```

> [!NOTE]
> GIFs are convenient but decode every frame into a separate texture. For performance-critical animations with many frames, consider using a spritesheet with {@link AnimatedSprite} instead; it uses a single atlas texture and is more GPU-friendly.

You can also pass an options object with the source and any {@link SpriteOptions}:

```ts
const gif = new GifSprite({
    source,
    x: 100,
    y: 200,
    anchor: 0.5,
});
```

## Loading options

The asset loader accepts configuration through the `data` property. These options are forwarded to {@link GifSource.from} and extend `CanvasSourceOptions`.

```ts
import { Assets } from 'pixi.js';
import 'pixi.js/gif';

// Load with custom frame rate and scale mode
const source = await Assets.load({
    src: 'pixel-art.gif',
    data: {
        fps: 12,
        scaleMode: 'nearest',
        resolution: 2,
    },
});

// Load from a base64 data URI
const source2 = await Assets.load('data:image/gif;base64,...');
```

The `fps` option (default: 30) sets the fallback frame delay for GIF frames that don't specify their own delay.

## Playback control

```ts
gif.play();
gif.stop();

// Jump to a specific frame
gif.currentFrame = 5;
gif.play();

// Read-only state
console.log(gif.totalFrames); // number of frames
console.log(gif.playing);     // true if animating
console.log(gif.progress);    // 0-1 playback progress
console.log(gif.duration);    // total duration in ms

// Speed and looping
gif.animationSpeed = 0.5;     // half speed
gif.loop = false;              // stop at the last frame
```

## Configuration options

All properties of {@link GifSpriteOptions}:

```ts
const gif = new GifSprite({
    source,
    autoPlay: true,            // start playing on creation (default: true)
    loop: true,                // loop the animation (default: true)
    animationSpeed: 1,         // playback speed multiplier (default: 1)
    autoUpdate: true,          // auto-update via Ticker.shared (default: true)
    fps: 30,                   // fallback frame rate (default: 30)

    // Callbacks
    onComplete: () => {
        console.log('animation finished');
    },
    onLoop: () => {
        console.log('animation looped');
    },
    onFrameChange: (frame) => {
        console.log(`frame: ${frame}`);
    },
});
```

Set `autoUpdate` to `false` to drive playback yourself by calling `gif.update(ticker)` each frame.

## Cloning and cleanup

`clone()` creates a new {@link GifSprite} sharing the same {@link GifSource}. The clone copies playback settings but gets its own playback state.

```ts
const clone = gif.clone();

// Destroy the sprite; the GifSource stays alive for other sprites
gif.destroy();

// Destroy the sprite AND its GifSource (destroys all frame textures).
// WARNING: this also breaks any other GifSprite using the same source.
gif.destroy(true);

// Or unload through the Assets system
await Assets.unload('explosion.gif');
```

## API reference

- {@link GifSprite} - animated sprite for GIF playback
- {@link GifSource} - decoded GIF frame data, created by the asset loader or `GifSource.from()`
- {@link GifSpriteOptions} - constructor options for GifSprite
- {@link GifAsset} - asset loader plugin (auto-registered on import)
- {@link GifFrame} - per-frame data (texture, start/end timing in ms)
- {@link GifBufferOptions} - options for `GifSource.from()` and the asset loader's `data` field
