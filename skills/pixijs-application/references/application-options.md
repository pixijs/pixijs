# ApplicationOptions reference

Every option accepted by `app.init(options)`. Options come from three type sources merged into a single interface:

- `AutoDetectOptions` → base renderer options (width/height/resolution/etc.)
- `PixiMixins.ApplicationOptions` → plugin options (`resizeTo`, `autoStart`, `sharedTicker`, `culler`)
- System defaults → each renderer system (background, view, hello, GC, context, backbuffer, events, graphics) contributes its own options

Options with no default are unset unless you pass them. `Partial<ApplicationOptions>` means everything is optional.


## View / canvas

Configures the main canvas and how it maps to CSS pixels.

| Option        | Type      | Default | Description                                                                                                                                                                                 |
| ------------- | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `width`       | `number`  | `800`   | Initial width in CSS pixels.                                                                                                                                                                |
| `height`      | `number`  | `600`   | Initial height in CSS pixels.                                                                                                                                                               |
| `canvas`      | `ICanvas` | —       | Existing `HTMLCanvasElement` (or `OffscreenCanvas`) to render into instead of creating one.                                                                                                 |
| `view`        | `ICanvas` | —       | **Deprecated since 8.0.0.** Alias for `canvas`.                                                                                                                                             |
| `resolution`  | `number`  | `1`     | Device pixel ratio. Set to `window.devicePixelRatio` for HiDPI.                                                                                                                             |
| `autoDensity` | `boolean` | `false` | Scale CSS dimensions of the canvas so `width`/`height` stay in CSS pixels while the backing store matches `resolution`. Only honored on `HTMLCanvasElement` (ignored on `OffscreenCanvas`). |
| `antialias`   | `boolean` | `false` | GPU MSAA where supported. On WebGL, this only affects the main context — use `useBackBuffer: true` if you need antialiased filtering.                                                       |
| `depth`       | `boolean` | —       | Allocate a depth buffer for the main view. Always on for WebGL; needed for z-ordered rendering.                                                                                             |

```ts
await app.init({
  width: 1280,
  height: 720,
  resolution: window.devicePixelRatio,
  autoDensity: true,
  antialias: true,
});
```

## Background

Controls the clear color applied each frame.

| Option              | Type          | Default    | Description                                                                                                                                                                                  |
| ------------------- | ------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `backgroundColor`   | `ColorSource` | `0x000000` | Canvas clear color. Accepts hex, CSS string, `[r, g, b, a]`, or any `ColorSource`.                                                                                                           |
| `background`        | `ColorSource` | —          | Alias for `backgroundColor`. If both are set, `background` wins.                                                                                                                             |
| `backgroundAlpha`   | `number`      | `1`        | Clear alpha, `0`–`1`. **Cannot be changed after init** — the backing canvas is allocated with or without alpha support based on this value. Set `< 1` now if you may ever need transparency. |
| `clearBeforeRender` | `boolean`     | `true`     | Clear the target before each frame. Disable only if you're drawing a full-frame background yourself (e.g. a full-screen sprite).                                                             |

```ts
await app.init({
  backgroundColor: 0x1099bb,
  backgroundAlpha: 1,
});
```

## Renderer preference

Picks which renderer gets created.

| Option          | Type                                                      | Default   | Description                                                                                                                                                                                                                                                                                |
| --------------- | --------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `preference`    | `'webgl' \| 'webgpu' \| 'canvas' \| RendererPreference[]` | `'webgl'` | Pick a preferred renderer. String = try first, then fall back through the default priority (`webgl` → `webgpu` → `canvas`). Array = try only the listed renderers, in order (acts as a blocklist too — anything not listed is excluded). See ["Array form"](#preference-array-form) below. |
| `webgl`         | `Partial<WebGLOptions>`                                   | —         | Options applied **only** when the WebGL renderer is selected. Merged over the top-level options.                                                                                                                                                                                           |
| `webgpu`        | `Partial<WebGPUOptions>`                                  | —         | Options applied **only** when the WebGPU renderer is selected.                                                                                                                                                                                                                             |
| `canvasOptions` | `Partial<CanvasOptions>`                                  | —         | Options applied **only** when the Canvas2D renderer is selected.                                                                                                                                                                                                                           |

### preference: array form

Passing an array to `preference` restricts `autoDetectRenderer` to exactly the listed renderers, in the given order. Any renderer not in the array is **excluded entirely** — the array doubles as a blocklist.

```ts
// Try WebGPU first, then fall back to WebGL. Never use Canvas2D.
await app.init({ preference: ["webgpu", "webgl"] });

// Only ever use Canvas2D (e.g. in a WebGL-disabled environment).
await app.init({ preference: ["canvas"] });

// Skip WebGPU entirely while keeping the default webgl → canvas fallback order.
await app.init({ preference: ["webgl", "canvas"] });
```

Contrast with the string form, which falls through the **full** default priority if the first choice fails:

```ts
// Tries webgpu, then webgl, then canvas — all three are candidates.
await app.init({ preference: "webgpu" });
```

Use the array when you need to guarantee a renderer is never picked (e.g. WebGPU is broken on a target device, or you want to forbid Canvas2D's feature subset).


## Shared rendering

Apply to every renderer type.

| Option                         | Type      | Default | Description                                                                                                                                                                                                          |
| ------------------------------ | --------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `roundPixels`                  | `boolean` | `false` | Round vertex positions to whole pixels at shader time. Eliminates subpixel shimmer for pixel-art but blurs smooth motion.                                                                                            |
| `skipExtensionImports`         | `boolean` | `false` | Disable automatic import of default extensions. With `true`, import the subsystems you need manually (`import 'pixi.js/accessibility'`, `'pixi.js/app'`, `'pixi.js/events'`, …). Used for custom tree-shaken builds. |
| `hello`                        | `boolean` | `false` | Log the PixiJS version and renderer type banner to the console on init.                                                                                                                                              |
| `failIfMajorPerformanceCaveat` | `boolean` | `false` | Fail WebGL context creation if the browser reports major performance issues (blocklisted GPU, software fallback). Set `true` for high-performance apps that should refuse slow paths.                                |

```ts
await app.init({
  roundPixels: true,
  hello: true,
});
```

## Graphics

Graphics rendering options.

| Option             | Type     | Default | Description                                                                                |
| ------------------ | -------- | ------- | ------------------------------------------------------------------------------------------ |
| `bezierSmoothness` | `number` | `0.5`   | Controls curve tessellation for Graphics bezier paths. Higher = smoother (more triangles). |

```ts
await app.init({
  bezierSmoothness: 0.75,
});
```

## Ticker (TickerPluginOptions)

Controls the built-in render loop.

| Option         | Type      | Default | Description                                                                                                                                                                                                    |
| -------------- | --------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `autoStart`    | `boolean` | `true`  | Start the render loop automatically after `init()` resolves. Setting `false` disables `app.render()` being called each frame, but **does not** stop `Ticker.shared` if you've opted into `sharedTicker: true`. |
| `sharedTicker` | `boolean` | `false` | Use `Ticker.shared` instead of creating a per-Application ticker. Useful for syncing multiple apps; loses per-app control over start/stop.                                                                     |

See `pixijs-ticker` for the ticker API itself.

```ts
await app.init({
  autoStart: false,
  sharedTicker: false,
});

function loop() {
  app.renderer.render(app.stage);
  requestAnimationFrame(loop);
}
loop();
```

## Resize (ResizePluginOptions)

| Option     | Type                    | Default | Description                                                                                                                                                               |
| ---------- | ----------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resizeTo` | `Window \| HTMLElement` | `null`  | Element the renderer should auto-resize to match. `window` resizes to the viewport; an element uses `clientWidth`/`clientHeight`. Leave `null` to opt out of auto-resize. |

The plugin listens for `resize` events on `window` and calls `renderer.resize()`. You can reassign `app.resizeTo` at runtime, and call `app.resize()`, `app.queueResize()`, or `app.cancelResize()` from user code.

```ts
await app.init({
  resizeTo: window,
});
```

## Culler (CullerPluginOptions)

Opt-in plugin (must `extensions.add(CullerPlugin)` to activate).

| Option                   | Type      | Default                                              | Description                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------ | --------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `culler.updateTransform` | `boolean` | `false` (effectively) | Must be explicitly set to `true` to run transform updates before culling. Otherwise PixiJS skips transform updates, and cull bounds may lag one frame for moving objects. |

```ts
import { CullerPlugin, extensions } from "pixi.js";

extensions.add(CullerPlugin);

await app.init({
  culler: { updateTransform: true },
});
```

## Events

| Option                     | Type                                                     | Default     | Description                                                                                                                      |
| -------------------------- | -------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `eventMode`                | `'none' \| 'passive' \| 'auto' \| 'static' \| 'dynamic'` | `'passive'` | Default interaction mode for every container. See `pixijs-events`.                                                               |
| `eventFeatures.move`       | `boolean`                                                | `true`      | Fire `pointermove`/`mousemove`/`touchmove` + `pointerover`/`pointerout`.                                                         |
| `eventFeatures.globalMove` | `boolean`                                                | `true`      | Fire `globalpointermove`/`globalmousemove`/`globaltouchmove` regardless of hit target. Expensive; turn off if you don't need it. |
| `eventFeatures.click`      | `boolean`                                                | `true`      | Fire `pointerdown`/`pointerup`/`click`/`tap`.                                                                                    |
| `eventFeatures.wheel`      | `boolean`                                                | `true`      | Fire `wheel`.                                                                                                                    |

```ts
await app.init({
  eventMode: "static",
  eventFeatures: {
    move: true,
    globalMove: false,
    click: true,
    wheel: true,
  },
});
```

## Accessibility

Accessibility options. Pass these on the top-level init options.

| Option                                       | Type      | Default | Description                                                                   |
| -------------------------------------------- | --------- | ------- | ----------------------------------------------------------------------------- |
| `accessibilityOptions.enabledByDefault`      | `boolean` | `false` | Enable accessibility overlays immediately instead of waiting for the Tab key. |
| `accessibilityOptions.debug`                 | `boolean` | `false` | Show the accessibility overlay divs visibly for debugging.                    |
| `accessibilityOptions.activateOnTab`         | `boolean` | `true`  | Activate overlays when the user presses Tab.                                  |
| `accessibilityOptions.deactivateOnMouseMove` | `boolean` | `true`  | Deactivate overlays when the mouse moves.                                     |

See `pixijs-accessibility` for the full accessibility API.

```ts
await app.init({
  accessibilityOptions: {
    enabledByDefault: true,
    activateOnTab: true,
    deactivateOnMouseMove: true,
  },
});
```

## WebGL-only options

Applied when the WebGL renderer is selected.

| Option                  | Type                                | Default     | Description                                                                                                                                                                                                              |
| ----------------------- | ----------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `context`               | `WebGL2RenderingContext \| null`    | `null`      | Use this existing WebGL context instead of creating one. Useful for hand-managing the context or integrating with other renderers.                                                                                       |
| `powerPreference`       | `'high-performance' \| 'low-power'` | `undefined` | Hint the browser which GPU to pick on multi-GPU systems. If omitted, PixiJS internally passes `'default'` to the GPU context; `'default'` is not settable from user code.                                                |
| `premultipliedAlpha`    | `boolean`                           | `true`      | Tell the compositor the drawing buffer contains premultiplied-alpha colors. Changing this affects blending math.                                                                                                         |
| `preserveDrawingBuffer` | `boolean`                           | `false`     | Keep the drawing buffer between frames. Required if you need `canvas.toDataURL()` or `canvas.toBlob()` to capture arbitrary frames.                                                                                      |
| `preferWebGLVersion`    | `1 \| 2`                            | `2`         | Preferred WebGL version. PixiJS v8 was designed for WebGL2 — WebGL1 is a legacy fallback.                                                                                                                                |
| `multiView`             | `boolean`                           | `false`     | Enable rendering to multiple canvases from one renderer.                                                                                                                                                                 |
| `useBackBuffer`         | `boolean`                           | `false`     | Render to an intermediate texture instead of directly to the canvas. Required for advanced blend modes and filters that sample the backdrop. Enables `antialias` on the back buffer independently from the main context. |

```ts
await app.init({
  preference: "webgl",
  webgl: {
    preferWebGLVersion: 2,
    useBackBuffer: true,
    powerPreference: "high-performance",
  },
});
```

## WebGPU-only options

| Option                 | Type                                | Default     | Description                                                                                     |
| ---------------------- | ----------------------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| `powerPreference`      | `'high-performance' \| 'low-power'` | `undefined` | Hint for `requestAdapter()`.                                                                    |
| `forceFallbackAdapter` | `boolean`                           | `false`     | Force the software/fallback adapter. For testing only.                                          |
| `gpu`                  | `{ adapter, device }`               | —           | Use a pre-created `GPUAdapter` + `GPUDevice` pair. Useful for sharing a device between engines. |

```ts
await app.init({
  preference: ["webgpu", "webgl"],
  webgpu: {
    powerPreference: "high-performance",
  },
});
```

## Garbage collection

All time values are milliseconds.

| Option            | Type      | Default | Description                                                  |
| ----------------- | --------- | ------- | ------------------------------------------------------------ |
| `gcActive`        | `boolean` | `true`  | Enable the unified renderer garbage collector.               |
| `gcMaxUnusedTime` | `number`  | `60000` | How long a resource can go unused before the GC collects it. |
| `gcFrequency`     | `number`  | `30000` | How often the GC sweep runs.                                 |

### Deprecated (GC — prefer the unified options above)

`TextureGCSystem` and `RenderableGCSystem` still accept these, but they've been deprecated since 8.15.0 in favor of `gcActive`/`gcMaxUnusedTime`/`gcFrequency`. Passing them still works for the deprecation window but logs warnings.

| Option                      | Deprecated since | Replacement                                                 |
| --------------------------- | ---------------- | ----------------------------------------------------------- |
| `textureGCActive`           | 8.15.0           | `gcActive`                                                  |
| `textureGCMaxIdle`          | 8.15.0           | `gcMaxUnusedTime` (note: this is frames; the new API is ms) |
| `textureGCCheckCountMax`    | 8.15.0           | `gcFrequency` (frames → ms)                                 |
| `textureGCAMaxIdle`         | 8.3.0            | `textureGCMaxIdle` (typo fix) → now `gcMaxUnusedTime`       |
| `renderableGCActive`        | 8.15.0           | `gcActive`                                                  |
| `renderableGCMaxUnusedTime` | 8.15.0           | `gcMaxUnusedTime`                                           |
| `renderableGCFrequency`     | 8.15.0           | `gcFrequency`                                               |

```ts
await app.init({
  gcActive: true,
  gcMaxUnusedTime: 60_000,
  gcFrequency: 30_000,
});
```

## Per-renderer overrides

`webgl`, `webgpu`, and `canvasOptions` are merged over the top-level options once the selected renderer is known:

```ts
await app.init({
  antialias: false,
  webgl: { antialias: true, useBackBuffer: true },
  webgpu: { antialias: true },
  canvasOptions: {
    /* canvas-specific */
  },
});
```

If WebGL wins, the renderer sees `antialias: true` + `useBackBuffer: true`. If WebGPU wins, just `antialias: true`. The three sub-keys are stripped before the options reach the renderer.
