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

## Automatic Garbage Collection with `GCSystem`

PixiJS also includes the `GCSystem`, which unloads GPU resources (textures, buffers, graphics geometry, WebGPU bind groups, and other renderables) that have not been used recently. By default:

- **Unloads resources unused for 60 seconds** (`gcMaxUnusedTime: 60000`).
- **Checks every 30 seconds** (`gcFrequency: 30000`).

Resources that are still bound each frame are stamped as in use and are never collected mid-render. Unloaded resources are recreated automatically the next time they are drawn.

### Customizing `GCSystem`

- **`gcActive`**: Enable or disable garbage collection. Default: `true`.
- **`gcMaxUnusedTime`**: Idle time in milliseconds before a resource is unloaded. Default: `60000`.
- **`gcFrequency`**: How often the collector runs, in milliseconds. Default: `30000`.

Example configuration:

```javascript
import { Application } from 'pixi.js';

const app = new Application();

await app.init({
  gcActive: true,
  gcMaxUnusedTime: 120000, // 2 minutes idle
  gcFrequency: 60000, // check every minute
});
```

> [!NOTE]
> The older `textureGCActive`, `textureGCMaxIdle`, and `textureGCCheckCountMax` options are deprecated since 8.15.0. They were frame-based; the `gc*` options are time-based.

## Best Practices

1. **Explicitly destroy objects:** Call `destroy()` on objects you no longer need. Pass `{ texture: true, textureSource: true }` if the texture won't be reused.
2. **Destroy geometries and render targets you create:** `geometry.destroy()` and `renderTarget.destroy()` release the GPU objects built for them. Destroying a container also destroys the batchers cached for its render group.
3. **Use `Assets.unload()` for loaded assets:** If you loaded a texture via `Assets.load('image.png')`, use `Assets.unload('image.png')` to release it. This removes it from the cache and unloads the GPU resource.
4. **Use pooling for frequently created/destroyed objects:** Reuse sprites, particles, and other objects to reduce allocation overhead.
5. **Batch large texture cleanups:** If destroying many textures at once, stagger the calls across multiple frames (e.g., destroy 5 per frame) to avoid a single-frame hitch.

For more optimization strategies, see [Performance Tips](./performance-tips.md).
