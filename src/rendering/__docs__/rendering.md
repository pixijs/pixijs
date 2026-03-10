---
title: Overview
category: rendering
description: Learn how PixiJS renderers draw scenes using WebGL, WebGPU, and Canvas 2D, including renderer selection, systems, and render targets.
children:
  - ./textures.md
---

# Rendering

PixiJS renderers draw your scene to a canvas using **WebGL/WebGL2**, **WebGPU**, or the **Canvas 2D** API. They're GPU-accelerated engines composed of modular systems that manage texture uploads, rendering pipelines, and more.

All renderers inherit from a common base, providing consistent methods like `.render()`, `.resize()`, and `.clear()`, along with shared systems for canvas management, texture GC, and events.

## Renderer types

| Renderer         | Description                                                       | Status          |
| ---------------- | ----------------------------------------------------------------- | --------------- |
| `WebGLRenderer`  | Default renderer using WebGL/WebGL2. Stable and widely supported. | Recommended     |
| `WebGPURenderer` | Uses the WebGPU API. Faster in many cases, still maturing.        | Experimental    |
| `CanvasRenderer` | Fallback renderer using the HTML Canvas 2D context.               | Experimental    |

> [!NOTE]
> The WebGPU renderer is feature-complete, but inconsistencies in browser implementations may cause unexpected behavior. Use the WebGL renderer for production applications.

## Creating a renderer

Use `autoDetectRenderer()` to pick the best renderer for the current environment:

```ts
import { autoDetectRenderer } from 'pixi.js';

const renderer = await autoDetectRenderer({
    preference: 'webgpu', // or 'webgl' or 'canvas'
});

// Only allow specific renderers (acts as a blocklist for any type not listed)
const renderer = await autoDetectRenderer({
    preference: ['webgl', 'canvas'], // webgpu is excluded entirely
});
```

Or construct one directly when you need a specific renderer type (e.g., for testing or when you know the target environment):

```ts
import { WebGLRenderer } from 'pixi.js';

const renderer = new WebGLRenderer();
await renderer.init(options);
```

> [!NOTE]
> Most applications should use `autoDetectRenderer()` and let PixiJS pick the best backend. Use direct construction only when you have a specific reason.

## Rendering a scene

Call `render()` with a `Container` to draw it to the screen:

```ts
import { Container } from 'pixi.js';

const container = new Container();
renderer.render(container);
```

You can also pass an options object for more control:

```ts
import { Matrix } from 'pixi.js';

renderer.render({
    container: myContainer,
    clear: true,
    transform: new Matrix(),
});
```

The `container` property is the scene root to draw. `target` is a separate property that specifies a render destination (e.g., a {@link RenderTexture}).

## Rendering to mip levels (advanced)

When rendering to a texture-backed target, you can specify `mipLevel` to render into a specific mip level of the target's underlying texture storage. Most applications won't need this; it's useful for custom LOD (level of detail) systems or manual mipmap generation.

```ts
import { RenderTexture } from 'pixi.js';

const rt = RenderTexture.create({
    width: 256,
    height: 256,
    mipLevelCount: 4,
    autoGenerateMipmaps: false,
});

// Render into mip 1 (128x128)
renderer.render({
    container,
    target: rt,
    mipLevel: 1,
});
```

If your `target` is a {@link Texture} with a `frame` (e.g. an atlas sub-texture), that frame is interpreted in **mip 0** pixel space and is scaled/clamped when rendering to `mipLevel > 0`.

## Resizing the renderer

```ts
renderer.resize(window.innerWidth, window.innerHeight);
```

## Generating textures

Create textures from any display object with `generateTexture()`:

```ts
import { Sprite } from 'pixi.js';

const sprite = new Sprite();
const texture = renderer.generateTexture(sprite);
```

## Resetting state

When mixing PixiJS with other WebGL/WebGPU libraries (e.g., Three.js), each library may leave GPU state (bound textures, blend modes, active shaders) that conflicts with the other. Call `resetState()` before each library renders to avoid visual glitches, missing objects, or incorrect blending:

```ts
function render() {
    threeRenderer.resetState();
    threeRenderer.render(scene, camera);

    pixiRenderer.resetState();
    pixiRenderer.render({ container: stage });

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
```

## Destroying renderers

Call `destroy()` to clean up all GPU resources, systems, event listeners, and internal state:

```ts
renderer.destroy();
```

This removes all `EventEmitter` listeners attached to the renderer and nullifies internal systems and pipes. A destroyed renderer cannot be used for further rendering.

---

## API reference

- {@link AbstractRenderer}
- {@link WebGLRenderer}
- {@link WebGPURenderer}
- {@link CanvasRenderer}
- {@link autoDetectRenderer}
- {@link ExtractSystem}
- {@link GenerateTextureSystem}
- {@link RenderTexture}
- {@link Texture}
