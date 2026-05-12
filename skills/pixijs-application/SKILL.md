---
name: pixijs-application
description: "Use this skill when creating and configuring a PixiJS v8 Application. Covers new Application() + async app.init() options (width, height, background, antialias, resolution, autoDensity, preference, resizeTo, autoStart, sharedTicker, canvas, useBackBuffer, powerPreference, eventFeatures, accessibilityOptions, gcActive, bezierSmoothness, webgl/webgpu/canvasOptions per-renderer overrides), app.stage/renderer/canvas/screen/domContainerRoot access, ResizePlugin, TickerPlugin, CullerPlugin (cullable, cullArea), custom ApplicationPlugin creation via ExtensionType.Application, start/stop lifecycle, and app.destroy() with releaseGlobalResources. Triggers on: Application, app.init, app.stage, app.renderer, app.canvas, app.screen, app.domContainerRoot, ApplicationOptions, ApplicationPlugin, ExtensionType.Application, resizeTo, preference, autoStart, sharedTicker, useBackBuffer, powerPreference, skipExtensionImports, preferWebGLVersion, preserveDrawingBuffer, cullable, CullerPlugin, app.start, app.stop, app.destroy, releaseGlobalResources."
license: MIT
---

`Application` is the convenience wrapper that owns a renderer, a root `stage` Container, a canvas, and the Ticker/Resize plugins. In v8 the constructor takes no arguments; all configuration is passed to the async `app.init()` call which instantiates the renderer via `autoDetectRenderer`.

## Quick Start

```ts
import { Application } from "pixi.js";

const app = new Application();

await app.init({
  resizeTo: window,
  background: "#1099bb",
  antialias: true,
  preference: "webgl",
  autoDensity: true,
  resolution: window.devicePixelRatio,
});

document.body.appendChild(app.canvas);
```

**Related skills:** `pixijs-core-concepts` (renderers, render pipeline), `pixijs-ticker` (render loop detail), `pixijs-scene-container` (working with `app.stage`), `pixijs-environments` (non-browser setups).

## Core Patterns

### Lifecycle: construct, init, render, destroy

```ts
import { Application } from "pixi.js";

const app = new Application();

await app.init({ width: 800, height: 600 });
document.body.appendChild(app.canvas);

// ... run scene, ticker drives app.render() automatically ...

app.destroy(
  { removeView: true, releaseGlobalResources: true },
  { children: true, texture: true, textureSource: true },
);
```

- `new Application()` allocates the instance but creates nothing. Options passed here are ignored with a v8 deprecation warning.
- `app.init(options)` is async. It builds the renderer, wires up plugins, and must complete before you can use `app.canvas`, `app.renderer`, or `app.screen`.
- The TickerPlugin calls `app.render()` every frame once init resolves (unless `autoStart: false`).
- `app.destroy(rendererDestroyOptions, stageDestroyOptions)` — the first argument forwards to `renderer.destroy()`. Pass `true` or `{ removeView: true }` to remove the canvas from the DOM. Add `releaseGlobalResources: true` to drain global pools (batches, texture caches) when tearing down and re-creating an app in the same tab; omitting it is the usual cause of flickering and stale textures after a re-init (see `pixijs-performance`).

### Key init options

```ts
await app.init({
  width: 800,
  height: 600,
  background: 0x1099bb,
  backgroundAlpha: 1,

  antialias: true,
  resolution: window.devicePixelRatio,
  autoDensity: true,

  preference: "webgpu",

  autoStart: true,
  sharedTicker: false,

  resizeTo: window,

  canvas: document.querySelector("#game-canvas") as HTMLCanvasElement,
});
```

For every option — view/canvas, background, renderer preference (including the array form), ticker, resize, culler, events, accessibility, WebGL/WebGPU context flags, Graphics bezier smoothness, GC, and per-renderer overrides (`webgl` / `webgpu` / `canvasOptions`) — see [references/application-options.md](references/application-options.md).

### Application properties

```ts
app.stage; // root Container; add all display objects here
app.renderer; // the WebGL/WebGPU/Canvas renderer instance
app.canvas; // the HTMLCanvasElement (insert it into the DOM yourself)
app.screen; // Rectangle describing the visible area in CSS pixels
app.domContainerRoot; // HTMLDivElement that holds DOMContainer overlays
```

`app.stage` is a plain `Container`. For scene graph detail (transforms, addChild, destroy) see `pixijs-scene-container`. For renderer-level operations (extract, generateTexture, custom systems) see `pixijs-core-concepts` and `pixijs-custom-rendering`. `app.domContainerRoot` is the `<div>` that the renderer uses to host `DOMContainer` overlays; append it next to `app.canvas` when you need DOM elements pinned to scene nodes (see `pixijs-scene-dom-container`).

### ResizePlugin

Set `resizeTo` at init (or reassign `app.resizeTo` later) to have the plugin listen for the `resize` event and call `renderer.resize()` with the target element's client size. Combine with `autoDensity: true` and `resolution: window.devicePixelRatio` for high-DPI output.

```ts
await app.init({ resizeTo: window });

app.resizeTo = document.querySelector("#game-container") as HTMLElement;

app.resize(); // immediate resize to the target's current size
app.queueResize(); // defer the resize to the next animation frame
app.cancelResize(); // drop a pending queueResize
```

The plugin keeps the canvas matched to the target. `app.screen` and `app.canvas.width/height` update in response; read them after the resize to place UI.

- `app.resize()` — immediate synchronous resize.
- `app.queueResize()` — coalesces rapid calls by deferring to the next frame; internally used by the `window.resize` listener to avoid redundant work.
- `app.cancelResize()` — cancels a queued resize. Call this before tearing down your own layout code that triggered `queueResize`.

### Ticker basics

The TickerPlugin creates `app.ticker` and registers `app.render()` on it at `UPDATE_PRIORITY.LOW`. Control the loop with `app.start()`/`app.stop()` and add callbacks with `app.ticker.add` / `app.ticker.addOnce`:

```ts
app.ticker.add((ticker) => {
  sprite.rotation += 0.01 * ticker.deltaTime;
});

app.ticker.addOnce(() => {
  console.log("runs once on the next frame, then removes itself");
});

app.stop(); // pause the render loop (e.g. tab hidden)
app.start(); // resume
```

The callback receives the `Ticker` instance; read `ticker.deltaTime` for a frame-rate-independent multiplier (~1.0 at 60fps), `ticker.deltaMS` for real milliseconds, or `ticker.FPS` for the current frame rate. See `pixijs-ticker` for priorities, FPS capping, `onRender`, shared vs private tickers, and the v8 callback signature change.

### Manual render loop

```ts
await app.init({ autoStart: false, width: 800, height: 600 });
document.body.appendChild(app.canvas);

function frame() {
  updateScene();
  app.render();
  requestAnimationFrame(frame);
}
frame();
```

`autoStart: false` prevents the TickerPlugin from starting the ticker automatically. Call `app.render()` yourself (or `app.renderer.render({ container: app.stage })` for the same effect). If you still want registered ticker callbacks to fire, call `app.ticker.update()` inside your loop before `app.render()`.

### CullerPlugin (opt-in)

The CullerPlugin skips rendering containers that fall outside `app.renderer.screen`. It isn't registered by default; add it before creating your app:

```ts
import {
  Application,
  Container,
  Sprite,
  extensions,
  CullerPlugin,
  Rectangle,
} from "pixi.js";

extensions.add(CullerPlugin);

const app = new Application();
await app.init({ width: 800, height: 600 });

const world = new Container();
world.cullable = true; // this container is culled when its bounds leave the screen
world.cullableChildren = true; // default; set `false` to skip recursing into children

const tile = Sprite.from("tile.png");
tile.cullable = true;
world.addChild(tile);
app.stage.addChild(world);
```

Containers are not culled unless `cullable` is set. Override the default bounds check with `container.cullArea = new Rectangle(x, y, w, h)` when child bounds are expensive to compute. The plugin wraps `app.render()` so `Culler.shared.cull(app.stage, app.renderer.screen)` runs before every frame. See `pixijs-performance` for when culling pays off.

### Custom Application plugins

Extend `Application` by registering a class with `static init`, `static destroy`, and `static extension = ExtensionType.Application`. Both methods are called with `this` bound to the Application instance, so `this.renderer` and `this.stage` are available.

```ts
import {
  Application,
  ExtensionType,
  extensions,
  type ApplicationOptions,
} from "pixi.js";

class FpsOverlay {
  public static extension = ExtensionType.Application;

  public static init(this: Application, options: Partial<ApplicationOptions>) {
    // runs inside app.init() after the renderer is created
    // attach props/methods to `this` to expose them on the app
  }

  public static destroy(this: Application) {
    // runs inside app.destroy() — tear down anything you attached
  }
}

extensions.add(FpsOverlay);
```

Plugins initialize in registration order and destroy in reverse. To add typed options for your plugin, extend `PixiMixins.ApplicationOptions`:

```ts
declare global {
  namespace PixiMixins {
    interface ApplicationOptions {
      fpsOverlay?: { visible?: boolean };
    }
  }
}

await app.init({ fpsOverlay: { visible: true } });
```

The built-in `ResizePlugin`, `TickerPlugin`, and opt-in `CullerPlugin` all use this same contract. If you set `skipExtensionImports: true`, register the built-ins you need yourself (`extensions.add(ResizePlugin, TickerPlugin)`).

## Common Mistakes

### [CRITICAL] Passing options to the constructor

Wrong:

```ts
const app = new Application({ width: 800, height: 600 });
document.body.appendChild(app.canvas);
```

Correct:

```ts
const app = new Application();
await app.init({ width: 800, height: 600 });
document.body.appendChild(app.canvas);
```

In v8 the `Application` constructor takes no arguments. Options passed there are ignored and log a deprecation warning; the renderer is only created inside the async `init()` call.


### [HIGH] Using app.view instead of app.canvas

Wrong:

```ts
document.body.appendChild(app.view);
```

Correct:

```ts
document.body.appendChild(app.canvas);
```

`app.view` was renamed to `app.canvas` in v8. The old getter still works but emits a deprecation warning.


### [MEDIUM] Touching app.canvas or app.renderer before init resolves

Wrong:

```ts
const app = new Application();
document.body.appendChild(app.canvas);
app.init({ width: 800, height: 600 });
```

Correct:

```ts
const app = new Application();
await app.init({ width: 800, height: 600 });
document.body.appendChild(app.canvas);
```

`app.renderer`, `app.canvas`, and `app.screen` are only populated once the `init()` promise resolves. Accessing them earlier returns `undefined`.


## API Reference

- [Application](https://pixijs.download/release/docs/app.Application.html.md)
- [ApplicationOptions](https://pixijs.download/release/docs/app.ApplicationOptions.html.md)
- [ApplicationPlugin](https://pixijs.download/release/docs/app.ApplicationPlugin.html.md)
- [ResizePlugin](https://pixijs.download/release/docs/app.ResizePlugin.html.md)
- [ResizePluginOptions](https://pixijs.download/release/docs/app.ResizePluginOptions.html.md)
- [TickerPlugin](https://pixijs.download/release/docs/app.TickerPlugin.html.md)
- [TickerPluginOptions](https://pixijs.download/release/docs/app.TickerPluginOptions.html.md)
- [CullerPlugin](https://pixijs.download/release/docs/app.CullerPlugin.html.md)
- [autoDetectRenderer](https://pixijs.download/release/docs/rendering.autoDetectRenderer.html.md)
