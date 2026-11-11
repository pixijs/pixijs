# application-options

Every option `app.init(options)` accepts, with its default and the v8 behaviour behind it. Options with no default are unset unless you pass them. They merge from `AutoDetectOptions` (renderer), `PixiMixins.ApplicationOptions` (plugins) and each renderer system's own options.

## View / canvas

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `width` / `height` | `number` | `800` / `600` | CSS pixels. |
| `canvas` | `ICanvas` | — | Existing `HTMLCanvasElement` or `OffscreenCanvas` to render into. `view` is its alias, deprecated since 8.0.0. |
| `resolution` | `number` | `1` | Device pixel ratio. Change later with `app.renderer.resize(w, h, resolution)` or `app.renderer.resolution = n`. |
| `autoDensity` | `boolean` | `false` | Sizes the canvas CSS so `width`/`height` stay in CSS pixels while the backing store matches `resolution`. Ignored on `OffscreenCanvas`. At runtime it is `app.renderer.view.autoDensity`; `app.renderer.autoDensity` does not exist. |
| `antialias` | `boolean` | `false` | MSAA where supported. On WebGL with `useBackBuffer: true` it applies to the back buffer instead of the context. |
| `depth` | `boolean` | — | Depth buffer for the main view. Always on for WebGL. |
| `transient` | `boolean` | `false` | WebGPU only, with `antialias`. Discards the canvas's multisample depth/stencil buffer at the end of each pass, and its colour buffer on GPUs that aren't tile-based (tile-based GPUs already discard colour). Only for apps that never reopen the canvas pass while still needing depth or stencil: no filters or masks popping back onto it, no render with `clear: false`. |
| `format` | `TEXTURE_FORMATS` | — | WebGPU only. Canvas format: `bgra8unorm`, `rgba8unorm` or `rgba16float`. Defaults to the browser's preferred format, as the other 8-bit format can cost an extra full-screen copy every frame. Use `rgba16float` for an HDR canvas. |

## Background

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `backgroundColor` | `ColorSource` | `0x000000` | Clear colour; any `ColorSource`. |
| `background` | `ColorSource` | — | Alias for `backgroundColor`; wins if both are set. |
| `backgroundAlpha` | `number` | `1` | **Cannot be changed after init**: the canvas is allocated with or without alpha from this value. Set `< 1` now if you may ever need transparency. |
| `clearBeforeRender` | `boolean` | `true` | Disable only if you draw a full-frame background yourself. |

## Renderer preference

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `preference` | `'webgl' \| 'webgpu' \| 'canvas' \| RendererPreference[]` | `'webgl'` | String = try first, then fall back through `webgl` → `webgpu` → `canvas`. Array = try only the listed renderers, in order; anything not listed is excluded. See [renderers](../core-concepts/renderers.md#preference-forms). |
| `webgl` / `webgpu` / `canvasOptions` | partial renderer options | — | Applied only when that renderer is selected; see [per-renderer overrides](#per-renderer-overrides). |

## Shared rendering

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `roundPixels` | `boolean` | `false` | Rounds vertex positions to whole pixels at shader time; slow sub-pixel motion then steps one pixel at a time. |
| `skipExtensionImports` | `boolean` | `false` | Skips the dynamic import of the environment extensions (events, filters, accessibility, `DOMContainer`) and renderer loaders; what then silently stops and the imports that restore it: [environments: custom builds](../environments.md#custom-builds). |
| `hello` | `boolean` | `false` | Logs the version and renderer banner on init. |
| `failIfMajorPerformanceCaveat` | `boolean` | `false` | Treats WebGL as unsupported on blocklisted or software GPUs, so `autoDetectRenderer` falls through to the next renderer in the preference order instead of failing. |
| `bezierSmoothness` | `number` | `0.5` | Graphics curve tessellation; higher = more triangles. |

## Ticker (TickerPluginOptions)

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `autoStart` | `boolean` | `true` | `false` leaves `app.ticker` stopped, but `app.render` stays registered on it, so `app.ticker.update()` or `app.start()` still renders. No effect with `sharedTicker: true` (`Ticker.shared` starts itself); call `app.stop()` after init instead. |
| `sharedTicker` | `boolean` | `false` | Use `Ticker.shared` instead of a per-app ticker; syncs several apps, loses per-app start/stop. |

Manual loops and the ticker API: [ticker](../ticker.md#app-lifecycle-and-manual-rendering).

## Resize (ResizePluginOptions)

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `resizeTo` | `Window \| HTMLElement` | `null` | `window` uses the viewport; an element uses `clientWidth`/`clientHeight`. |

The plugin listens only for `resize` on `window`; resizing to an element that changes size on its own, and laying out on resize: [application](../application.md#resizeplugin).

## Culler (CullerPluginOptions)

Opt-in: the option does nothing until `extensions.add(CullerPlugin)`.

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `culler.updateTransform` | `boolean` | `false` (effectively) | Must be `true` to update transforms before culling; otherwise cull bounds lag one frame for moving objects. |

```ts
import { Application, CullerPlugin, extensions } from "pixi.js";

declare const app: Application;

extensions.add(CullerPlugin);

await app.init({ culler: { updateTransform: true } });
```

## Events

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `eventMode` | `'none' \| 'passive' \| 'auto' \| 'static' \| 'dynamic'` | `'passive'` | Default interaction mode for every container. See [events](../events.md). |
| `eventFeatures.move` | `boolean` | `true` | `pointermove`/`mousemove`/`touchmove` and `pointerover`/`pointerout`. |
| `eventFeatures.globalMove` | `boolean` | `true` | `globalpointermove`/`globalmousemove`/`globaltouchmove` regardless of hit target. Expensive; turn off if unused. |
| `eventFeatures.click` | `boolean` | `true` | `pointerdown`/`pointerup`/`click`/`tap`. |
| `eventFeatures.wheel` | `boolean` | `true` | `wheel`. |

## Accessibility

Top-level `accessibilityOptions`; the full API is in [accessibility](../accessibility.md).

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `accessibilityOptions.enabledByDefault` | `boolean` | `false` | Enable overlays immediately instead of waiting for Tab. |
| `accessibilityOptions.debug` | `boolean` | `false` | Show the overlay divs. |
| `accessibilityOptions.activateOnTab` | `boolean` | `true` | Activate overlays on Tab. |
| `accessibilityOptions.deactivateOnMouseMove` | `boolean` | `true` | Deactivate overlays when the mouse moves. |

## WebGL-only options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `context` | `WebGL2RenderingContext \| null` | `null` | Use an existing context. |
| `powerPreference` | `'high-performance' \| 'low-power'` | `undefined` | Omitted, PixiJS passes `'default'` to the context; `'default'` is not settable from user code. |
| `premultipliedAlpha` | `boolean` | `true` | Tells the compositor the buffer is premultiplied; changes blending math. |
| `preserveDrawingBuffer` | `boolean` | `false` | Required for `canvas.toDataURL()` / `canvas.toBlob()` to capture arbitrary frames. |
| `preferWebGLVersion` | `1 \| 2` | `2` | WebGL1 is a legacy fallback. |
| `multiView` | `boolean` | `false` | Render to multiple canvases from one renderer. |
| `useBackBuffer` | `boolean` | `false` | Render to an intermediate texture. Required for advanced blend modes and filters that sample the backdrop; enables `antialias` on the back buffer independently of the context. |

## WebGPU-only options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `powerPreference` | `'high-performance' \| 'low-power'` | `undefined` | Hint for `requestAdapter()`. |
| `forceFallbackAdapter` | `boolean` | `false` | Software adapter; testing only. |
| `gpu` | `{ adapter, device }` | — | Pre-created `GPUAdapter` + `GPUDevice`, e.g. shared with another engine. |

## Garbage collection

Times in milliseconds.

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `gcActive` | `boolean` | `true` | Unified renderer garbage collector. |
| `gcMaxUnusedTime` | `number` | `60000` | How long a resource can go unused before collection. |
| `gcFrequency` | `number` | `30000` | How often the sweep runs. |

The older `TextureGCSystem` / `RenderableGCSystem` options still work but log deprecation warnings:

| Option | Deprecated since | Replacement |
| --- | --- | --- |
| `textureGCActive` | 8.15.0 | `gcActive` |
| `textureGCMaxIdle` | 8.15.0 | `gcMaxUnusedTime` (old value in frames; new in ms) |
| `textureGCCheckCountMax` | 8.15.0 | `gcFrequency` (frames → ms) |
| `textureGCAMaxIdle` | 8.3.0 | `textureGCMaxIdle` (typo fix) → now `gcMaxUnusedTime` |
| `renderableGCActive` | 8.15.0 | `gcActive` |
| `renderableGCMaxUnusedTime` | 8.15.0 | `gcMaxUnusedTime` |
| `renderableGCFrequency` | 8.15.0 | `gcFrequency` |

## Per-renderer overrides

`webgl`, `webgpu` and `canvasOptions` merge over the top-level options once the selected renderer is known, and are stripped before the options reach the renderer:

```ts
import type { Application } from "pixi.js";

declare const app: Application;

await app.init({
  antialias: false,
  webgl: { antialias: true, useBackBuffer: true },
  webgpu: { antialias: true },
});
```

If WebGL wins, the renderer sees `antialias: true` + `useBackBuffer: true`; if WebGPU wins, just `antialias: true`.
