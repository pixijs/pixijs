---
description: Create and configure a PixiJS Application with WebGL, WebGPU, or Canvas rendering, built-in plugins, and custom application plugins.
category: app
title: Overview
children:
  - ./ticker-plugin.md
  - ./resize-plugin.md
  - ./culler-plugin.md
---

# Application

The {@link Application} class is the starting point for most PixiJS projects. It sets up a renderer, creates a scene graph, and runs a frame loop so you can focus on building your game or visualization. It supports WebGL, WebGPU, and Canvas2D through async initialization.

## Creating an application

Creating an application requires two steps: constructing an instance, then initializing it with `.init()`:

```ts
import { Application } from 'pixi.js';

const app = new Application();

await app.init({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
});

document.body.appendChild(app.canvas);
```

## Core features

### Scene management

The application provides a root container (`stage`) where you add all your visual elements:

```ts
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('image.png');
app.stage.addChild(sprite);
```

### Automatic updates

By default, the {@link TickerPlugin} handles the rendering loop:

```ts
import { Application, Ticker } from 'pixi.js';

await app.init({
  autoStart: true,
  sharedTicker: false,
});

// Start/stop the rendering loop
app.start();
app.stop();

// Access ticker properties
console.log(app.ticker.FPS);
console.log(app.ticker.deltaMS);

// Add update callbacks
app.ticker.add(() => {
  // Animation logic here
});

app.ticker.addOnce(() => {
  // Runs once after the next frame
});
```

### Responsive design

The {@link ResizePlugin} enables automatic resizing to fit different containers or the window:

```ts
// Auto-resize to window
await app.init({ resizeTo: window });

// Auto-resize to a container element
await app.init({ resizeTo: document.querySelector('#game') });

// Manual resize control
app.resize();
app.queueResize();
app.cancelResize();
```

### Multiple canvases (multiView)

One {@link Application} can drive several canvases from a single renderer. Initialize with `multiView: true`
(required for WebGL; the WebGPU renderer ignores it), then add a {@link RenderView} per extra canvas with
{@link Application#addView}. Every view has its own `stage`, optional `clearColor`, optional `resizeTo`, and
an `enabled` flag, and is rendered automatically each frame alongside the primary view. Events, DOM
containers, and accessibility all work independently per canvas.

The application's main canvas is wrapped automatically as {@link Application#primaryView}, which is always
`app.views[0]` and whose `stage` is the same container as `app.stage`. Views you add follow it in `app.views`.

```ts
const app = new Application();

await app.init({ multiView: true });
document.body.appendChild(app.canvas); // the primary view renders app.stage here

// add a second canvas with its own scene
const minimapCanvas = document.querySelector('#minimap');
const minimap = app.addView({ canvas: minimapCanvas, clearColor: 0x222222 });

minimap.stage.addChild(mapSprite);

// app.views // [app.primaryView, minimap]
// app.removeView(minimap) // stop rendering it (the primary view cannot be removed)
```

If you omit `canvas`, a fresh one is created but not attached to the DOM; append `view.canvas` yourself so
events, DOM overlays, and accessibility work. Toggle `view.enabled` to cheaply pause a view without removing it.

`app.addView` wraps the renderer's lower-level {@link AbstractRenderer#addView | renderer.addView} primitive,
which registers a canvas with the renderer for per-canvas events, accessibility, and DOM, and exposes
`renderer.views`. The application layer adds the scene-level concerns on top: `stage`, `clearColor`,
`resizeTo`, and `enabled`. Reach for `renderer.addView` directly only when working with a bare renderer (no
`Application`).

Per-view `antialias` and `alpha` are not offered. On WebGL these are context-global, fixed when the renderer
is created, so they're set once via the renderer init options and shared by every view.

---

## ApplicationOptions reference

The `.init()` method accepts a `Partial<ApplicationOptions>` object:

| Option                   | Type                                | Default     | Description                                                                                                        |
| ------------------------ | ----------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `autoStart`              | `boolean`                           | `true`      | Start rendering after initialization. Setting to `false` won't stop the shared ticker if it's running. |
| `resizeTo`               | `Window \| HTMLElement`             | -           | Element to auto-resize the renderer to match.                                                                      |
| `sharedTicker`           | `boolean`                           | `false`     | Use the shared ticker instance if `true`; otherwise a private ticker is created.                                   |
| `preference`             | `RendererPreference \| RendererPreference[]` | `webgl` | Preferred renderer type(s). Pass an array to restrict to specific renderers.                                        |
| `useBackBuffer`          | `boolean`                           | `false`     | _(WebGL only)_ Use the back buffer when required.                                                                  |
| `forceFallbackAdapter`   | `boolean`                           | `false`     | _(WebGPU only)_ Force usage of fallback adapter.                                                                   |
| `canvasOptions`          | `Partial<CanvasOptions>`            | -           | Options passed only to the Canvas renderer.                                                                        |
| `powerPreference`        | `'high-performance' \| 'low-power'` | `undefined` | Hint for GPU power preference (WebGL and WebGPU).                                                                  |
| `antialias`              | `boolean`                           | -           | Enable anti-aliasing. May impact performance.                                                                      |
| `autoDensity`            | `boolean`                           | -           | Adjust canvas size based on `resolution`. Applies only to `HTMLCanvasElement`.                                     |
| `background`             | `ColorSource`                       | -           | Alias for `backgroundColor`.                                                                                       |
| `backgroundAlpha`        | `number`                            | `1`         | Alpha transparency for background (0 = transparent, 1 = opaque).                                                  |
| `backgroundColor`        | `ColorSource`                       | `'black'`   | Color used to clear the canvas. Accepts hex, CSS color, or array.                                                  |
| `canvas`                 | `ICanvas`                           | -           | A custom canvas instance.                                                                                          |
| `clearBeforeRender`      | `boolean`                           | `true`      | Clear the canvas each frame before rendering.                                                                      |
| `context`                | `WebGL2RenderingContext \| null`    | `null`      | User-supplied rendering context (WebGL).                                                                           |
| `depth`                  | `boolean`                           | -           | Enable a depth buffer in the main view. Always `true` for WebGL.                                                   |
| `height`                 | `number`                            | `600`       | Height of the renderer in pixels.                                                                                  |
| `width`                  | `number`                            | `800`       | Width of the renderer in pixels.                                                                                   |
| `hello`                  | `boolean`                           | `false`     | Log renderer info and version to the console.                                                                      |
| `multiView`              | `boolean`                           | `false`     | Enable rendering to multiple canvases from one renderer (WebGL; WebGPU needs no option). Events work per canvas.   |
| `premultipliedAlpha`     | `boolean`                           | `true`      | Assume alpha is premultiplied in color buffers.                                                                    |
| `preserveDrawingBuffer`  | `boolean`                           | `false`     | Preserve buffer between frames. Needed for `toDataURL`.                                                            |
| `resolution`             | `number`                            | `1`         | Pixel ratio for rendering. Set to `window.devicePixelRatio` for crisp output on high-DPI screens. Use with `autoDensity: true`. |
| `skipExtensionImports`   | `boolean`                           | `false`     | Prevent automatic import of default PixiJS extensions.                                                             |
| `textureGCActive`        | `boolean`                           | `true`      | _(Deprecated)_ Enable garbage collection for GPU textures. Use `gcActive`.                                         |
| `textureGCCheckCountMax` | `number`                            | `600`       | _(Deprecated)_ Frame interval between GC runs. Use `gcFrequency`.                                                 |
| `textureGCMaxIdle`       | `number`                            | `3600`      | _(Deprecated)_ Max idle frames before destroying a texture. Use `gcMaxUnusedTime`.                                 |
| `webgl`                  | `Partial<WebGLOptions>`             | -           | Override options applied only when using the WebGL renderer.                                                        |
| `webgpu`                 | `Partial<WebGPUOptions>`            | -           | Override options applied only when using the WebGPU renderer.                                                       |

### Customizing options per renderer type

You can override properties per renderer using the `webgl`, `webgpu`, or `canvasOptions` keys:

```ts
const app = new Application();
await app.init({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
  webgl: {
    antialias: true,
  },
  webgpu: {
    antialias: false,
  },
  canvasOptions: {
    // Canvas2D-specific options
  },
});
document.body.appendChild(app.canvas);
```

### Using the Canvas2D renderer

Set `preference` to `'canvas'` to use the HTML Canvas 2D context instead of WebGL or WebGPU:

```ts
const app = new Application();
await app.init({
  width: 800,
  height: 600,
  preference: 'canvas',
});
```

The Canvas renderer is a fallback for environments where neither WebGL nor WebGPU is available. If you don't set a `preference`, PixiJS tries WebGL first, then WebGPU, then Canvas.

> [!NOTE]
> The Canvas renderer supports a subset of PixiJS features. Filters, advanced blend modes, and some shader-based effects are unavailable.

---

## Cleanup

When you're done with the application, clean up resources:

```ts
// Basic cleanup
app.destroy();

// Full cleanup with options
app.destroy(
  { removeView: true },    // removes the canvas element from the DOM
  {
    children: true,        // destroy all children in the stage
    texture: true,         // destroy textures used by children
    textureSource: true,   // destroy the underlying GPU texture sources
  },
);
```

---

## Built-in plugins

PixiJS includes these plugins:

- **Ticker Plugin** - Updates every frame. [Guide](./ticker-plugin.md)
- **Resize Plugin** - Resizes renderer/canvas. [Guide](./resize-plugin.md)
- **Culler Plugin** (optional) - Culls offscreen objects. [Guide](./culler-plugin.md)

---

## Creating a custom application plugin

Custom plugins for `Application` must be classes with static `init()` and `destroy()` methods, plus a static `extension` property set to `ExtensionType.Application`.

Both methods are called with `this` set to the `Application` instance, so `this.renderer` and `this.stage` are available.

```ts
import { ExtensionType, extensions } from 'pixi.js';
import type { ApplicationOptions } from 'pixi.js';

class MyPlugin {
    public static extension = ExtensionType.Application;

    public static init(options: Partial<ApplicationOptions>) {
        console.log('Custom plugin init:', this, options);
    }

    public static destroy() {
        console.log('Custom plugin destroy');
    }
}

extensions.add(MyPlugin);
```

### Adding types

If you're using TypeScript or providing a plugin for others, extend the `ApplicationOptions` interface to include your plugin's options:

```ts
declare global {
  namespace PixiMixins {
    interface ApplicationOptions {
      myPlugin?: import('./myPlugin').PluginOptions | null;
    }
  }
}

await app.init({
  myPlugin: {
    customOption: true,
  },
});
```

---

## API reference

- {@link Application}
- {@link ApplicationOptions}
  - {@link AutoDetectOptions}
  - {@link WebGLOptions}
  - {@link WebGPUOptions}
  - {@link CanvasOptions}
  - {@link SharedRendererOptions}
- {@link RenderView}
  - {@link RenderViewOptions}
- {@link TickerPlugin}
- {@link ResizePlugin}
- {@link CullerPlugin}
