---
sidebar_position: 7
title: Garbage Collection
description: Managing GPU resources and garbage collection in PixiJS for optimal performance.
category: core-concepts
---

# Managing Garbage Collection in PixiJS

PixiJS objects like textures and meshes consume GPU memory that JavaScript's garbage collector can't reclaim automatically. This page covers the three ways to manage that memory: calling `destroy()` explicitly, unloading textures manually, and configuring the automatic texture garbage collector.

## Explicit Resource Management with `destroy`

PixiJS objects, such as textures, meshes, and other GPU-backed data, hold references that consume memory. To explicitly release these resources, call the `destroy` method on objects you no longer need. For example:

```typescript
import { Sprite } from 'pixi.js';

const sprite = new Sprite(texture);

// Destroy the sprite only (texture is preserved for reuse)
sprite.destroy();

// Destroy the sprite AND its texture (frees GPU memory)
sprite.destroy({ children: true, texture: true, textureSource: true });
```

Calling `destroy` ensures that the object’s GPU resources are freed immediately, reducing the likelihood of memory leaks and improving performance.

## Managing Textures with `texture.unload`

In cases where PixiJS’s automatic texture garbage collection is insufficient, you can manually unload textures from the GPU using `texture.unload()`:

```javascript
import { Assets } from 'pixi.js';

const texture = await Assets.load('image.png');

// Use the texture

// When no longer needed
texture.source.unload();
```

This is particularly useful for applications that dynamically load large numbers of textures and require precise memory control.

## Automatic Texture Garbage Collection with `TextureGCSystem`

PixiJS also includes the `TextureGCSystem`, a system that manages GPU texture memory. By default:

- **Removes textures unused for 3600 frames** (~60 seconds at 60 FPS, ~120 seconds at 30 FPS).
- **Checks every 600 frames** (~10 seconds at 60 FPS) for unused textures.

> [!NOTE]
> These thresholds are frame-based, not time-based. If your app runs at a lower frame rate, textures will persist longer before being collected.

### Customizing `TextureGCSystem`

You can adjust the behavior of `TextureGCSystem` to suit your application:

- **`textureGCActive`**: Enable or disable garbage collection. Default: `true`.
- **`textureGCMaxIdle`**: Maximum idle frames before texture cleanup. Default: `3600` frames.
- **`textureGCCheckCountMax`**: Frequency of garbage collection checks (in frames). Default: `600` frames.

Example configuration:

```javascript
import { Application } from 'pixi.js';

const app = new Application();

await app.init({
  textureGCActive: true, // Enable texture garbage collection
  textureGCMaxIdle: 7200, // 2 hours idle time
  textureGCCheckCountMax: 1200, // Check every 20 seconds at 60 FPS
});
```

## Best Practices

1. **Explicitly destroy objects:** Call `destroy()` on objects you no longer need. Pass `{ texture: true, textureSource: true }` if the texture won't be reused.
2. **Use `Assets.unload()` for loaded assets:** If you loaded a texture via `Assets.load('image.png')`, use `Assets.unload('image.png')` to release it. This removes it from the cache and unloads the GPU resource.
3. **Use pooling for frequently created/destroyed objects:** Reuse sprites, particles, and other objects to reduce allocation overhead.
4. **Batch large texture cleanups:** If destroying many textures at once, stagger the calls across multiple frames (e.g., destroy 5 per frame) to avoid a single-frame hitch.

For more optimization strategies, see [Performance Tips](./performance-tips.md).
