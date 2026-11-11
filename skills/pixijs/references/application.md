# application

`new Application()` and async `app.init()`, `app.stage`/`renderer`/`canvas`/`screen`, resizing and resolution, plugins, and `app.destroy()`.

## Lifecycle: construct, init, render, destroy

```ts
import { Application } from "pixi.js";

const app = new Application();

await app.init({
  resizeTo: window,
  background: "#1099bb",
  antialias: true,
  autoDensity: true,
  resolution: window.devicePixelRatio,
});

document.body.appendChild(app.canvas);

app.destroy(
  { removeView: true, releaseGlobalResources: true },
  { children: true, texture: true, textureSource: true },
);
```

- The constructor takes no arguments; v7's `new Application({ ... })` options are ignored with a deprecation warning. All options go to the async `app.init()`, which creates the renderer via `autoDetectRenderer`. Every option with its default: [application-options](application/application-options.md).
- `app.renderer` is `undefined` until `init()` resolves, and `app.canvas` / `app.screen` read through it, so they throw a `TypeError` until then.
- v7's `app.view` is `app.canvas`; the old getter still works but warns.
- `app.screen` is the visible area in CSS pixels. `app.domContainerRoot` is the `<div>` that hosts `DOMContainer` overlays; the renderer attaches it next to `app.canvas` automatically when a `DOMContainer` renders, so read it only to style or inspect it (see [scene-dom-container](scene-dom-container.md)).
- `app.destroy()` throws if `init()` has not resolved yet (the plugins it tears down are not installed). In component cleanup (React StrictMode, fast unmounts) keep the init promise and destroy after it: `initPromise.then(() => app.destroy(true))`.
- `app.destroy(rendererDestroyOptions, stageDestroyOptions)`: the first argument forwards to `renderer.destroy()`. Pass `true` or `{ removeView: true }` to remove the canvas from the DOM. Add `releaseGlobalResources: true` to drain global pools (batches, texture caches) when tearing down and re-creating an app in the same tab; without it the new app reuses the old app's pooled batches and textures, which shows as flickering and corrupted or stale textures.
- Stage textures on teardown: `texture: true, textureSource: true` frees textures your code created (`generateTexture`, canvases). Textures from `Assets.load` stay in the `Assets` cache (`releaseGlobalResources` does not clear it), so destroying them leaves dead entries that the next app's `Assets.load` returns; release those with `Assets.unload(...)` instead, or skip the texture flags if the next app reuses them.
- There is no teardown event to hook: `Application` is not an event emitter, and `app.renderer` emits only `resize`, so `app.renderer.once("destroy", ...)` fails TypeScript (TS2345). Stop and destroy the `Ticker`s, observers and DOM listeners you created in the same cleanup function that calls `app.destroy()`.

## ResizePlugin

Set `resizeTo` at init (or reassign `app.resizeTo` later) to have the plugin call `renderer.resize()` with the target's size (`innerWidth`/`innerHeight` for `window`, `clientWidth`/`clientHeight` for an element). Assigning `resizeTo` resizes immediately.

The plugin listens only to the window `resize` event. An element target that changes size without a window resize (layout change, sidebar toggle, CSS change) leaves the canvas at its old size unless you observe the element:

```ts
import type { Application } from "pixi.js";

declare const app: Application;

const container = document.querySelector("#game-container") as HTMLElement;
app.resizeTo = container;

const observer = new ResizeObserver(() => app.queueResize());
observer.observe(container);
// before app.destroy(): observer.disconnect();

app.resize(); // immediate resize to the target's current size
app.queueResize(); // resize on the next animation frame; repeated calls coalesce
```

A window resize is applied on the next animation frame, so your own `window` `resize` listener still reads the old `app.screen`. Lay out from the renderer's event, which fires after every resize (plugin, `app.resize()` or `renderer.resize()`):

```ts
import type { Application, Container } from "pixi.js";

declare const app: Application;
declare const title: Container;

app.renderer.on("resize", (width, height) => {
  title.position.set(width / 2, height / 2); // logical (CSS) pixels, same as app.screen
});
```

`resizeTo` does not work inside a Web Worker; resize by message there (see [environments](environments.md#web-worker-with-offscreencanvas)). `app.cancelResize()` is declared in the typings but does not exist at runtime in 8.22 (calling it throws); `queueResize()` already cancels a pending request.

## Changing resolution after init

```ts
import type { Application } from "pixi.js";

declare const app: Application;

app.renderer.view.autoDensity = true; // the runtime flag lives on the view system
app.renderer.resize(app.screen.width, app.screen.height, window.devicePixelRatio);
// or: app.renderer.resolution = window.devicePixelRatio;
```

`autoDensity` is an init option, but `app.renderer.autoDensity` does not exist (TS2339); read or toggle it at `app.renderer.view.autoDensity`. `renderer.resize(w, h, resolution)` sets the backing store to `w * resolution` while `app.screen` stays in logical pixels, and emits the renderer's `resize` event. The `renderer.resolution` setter does the same without emitting `resize`. The CSS size stays logical only with `autoDensity` on; without it the canvas element displays at backing-store size (2x larger at resolution 2). Later `ResizePlugin` resizes keep the new resolution. Lay out with `app.screen`, not `app.canvas.width` (device pixels).

## Render loop

The `TickerPlugin` creates `app.ticker`, registers `app.render()` on it, and adds `app.start()` / `app.stop()`. Callbacks receive the `Ticker`, not a delta. `autoStart: false` only leaves the ticker stopped, so a manual loop calls either `app.ticker.update(time)` or `app.render()`, never both. All of it: [ticker](ticker.md).

## CullerPlugin (opt-in)

`extensions.add(CullerPlugin)` before `app.init()` makes every render cull `app.stage` against the screen; only objects with `cullable = true` are culled, and by default with last frame's transforms. Setup and the one-frame lag: [performance](performance.md#culling).

## Custom Application plugins

Register a class with `static extension = ExtensionType.Application` and static `init` / `destroy`. Both run with `this` bound to the Application, so `this.renderer` and `this.stage` are available.

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
    // runs inside app.init() after the renderer exists; attach props/methods to `this`
  }

  public static destroy(this: Application) {
    // runs inside app.destroy(); tear down what init attached
  }
}

extensions.add(FpsOverlay);
```

Plugins initialize in descending `extension.priority` (registration order breaks ties; the built-ins use the default) and destroy in reverse. A plugin that wraps `this.render` must initialize before `TickerPlugin`, which captures `render` when it adds it to the ticker; give it a positive priority (`static extension = { type: ExtensionType.Application, priority: 10 }`), as `CullerPlugin` does. Typed plugin options extend `PixiMixins.ApplicationOptions`:

```ts
import type { Application } from "pixi.js";

declare const app: Application;

declare global {
  namespace PixiMixins {
    interface ApplicationOptions {
      fpsOverlay?: { visible?: boolean };
    }
  }
}

await app.init({ fpsOverlay: { visible: true } });
```

The built-in `ResizePlugin`, `TickerPlugin` and `CullerPlugin` use this same contract. Importing `Application` registers `ResizePlugin` and `TickerPlugin`, so they keep working with `skipExtensionImports: true` (see [environments: custom builds](environments.md#custom-builds)).
