---
title: Overview
category: gif
---

# GIF

PixiJS provides optional GIF support through its GIF module, enabling loading, displaying, and controlling animated GIFs. This module handles decoding, frame management, and playback control.

## Basic Usage

Import and use GIF support:

```ts
import { Assets } from 'pixi.js';
import { GifSprite } from 'pixi.js/gif';

// Load and create a GIF sprite
const source = await Assets.load('example.gif');
const gif = new GifSprite({ source });

// Add to stage
app.stage.addChild(gif);
```

## Loading GIFs

### Using Assets System

```ts
import { Assets } from 'pixi.js';
import { GifSource } from 'pixi.js/gif';

// Load from URL
const gif1 = await Assets.load<GifSource>('animation.gif');

// Load with options
const gif2 = await Assets.load<GifSource>({
    src: 'animation.gif',
    alias: 'myGif',
    data: { fps: 30 }
});

// Load from base64
const gif3 = await Assets.load<GifSource>({
    src: 'data:image/gif;base64,...',
    alias: 'base64Gif'
});
```

## Playback Control

Control GIF animation playback:

```ts
// Basic playback controls
gif.play();
gif.stop();
gif.gotoAndPlay(5);  // Go to frame 5 and play
gif.gotoAndStop(2);  // Go to frame 2 and stop

// Frame navigation
gif.currentFrame = 3;        // Set current frame
console.log(gif.totalFrames); // Get total frames

// Animation speed
gif.animationSpeed = 0.5;    // Half speed
gif.animationSpeed = 2;      // Double speed

// Loop control
gif.loop = true;             // Enable looping
gif.loop = false;            // Play once and stop
```

## Configuration Options

Configure GIF behavior during creation:

```ts
const gif = new GifSprite({
    source,                    // GIF source
    autoPlay: true,           // Start playing immediately
    loop: true,               // Loop the animation
    animationSpeed: 1,        // Playback speed multiplier
    autoUpdate: true,         // Update with ticker
    currentFrame: 0,          // Starting frame

    // Event callbacks
    onComplete: () => {},     // Animation complete
    onLoop: () => {},         // Loop complete
    onFrameChange: () => {},  // Frame changed
});
```

## Resource Management

Handle GIF resources properly:

```ts
// Clone a GIF sprite
const clone = gif.clone();

// Cleanup resources
gif.destroy();               // Destroy sprite only
gif.destroy(true);          // Destroy sprite and source

// Unload from Assets system
await Assets.unload('animation.gif');
```

## Best Practices

- Use `GifSprite` for animated GIFs, regular `Sprite` for static images
- Set `autoUpdate = false` when managing updates manually
- Clean up resources with `destroy()` when removing GIFs
- Use appropriate `animationSpeed` values for smooth playback
- Unload unused GIFs to free memory

## Related Documentation

- See {@link GifSprite} for sprite implementation
- See {@link GifSource} for GIF decoding and frame management
- See {@link GifAsset} for asset loading system integration
- See {@link Assets} for asset management
- See {@link GifSpriteOptions} for configuration options

For detailed implementation requirements and advanced usage, refer to the API documentation of individual classes and interfaces.
