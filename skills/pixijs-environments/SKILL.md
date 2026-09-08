---
name: pixijs-environments
description: "Use this skill when running PixiJS v8 outside a standard browser: Web Workers, OffscreenCanvas, Node/SSR, or CSP-restricted contexts. Covers DOMAdapter.set, BrowserAdapter, WebWorkerAdapter, custom Adapter interface, pixi.js/unsafe-eval for strict CSP. Triggers on: DOMAdapter, BrowserAdapter, WebWorkerAdapter, Web Worker, OffscreenCanvas, Node, headless, SSR, CSP, unsafe-eval, Adapter."
license: MIT
---

`DOMAdapter` abstracts every piece of DOM access PixiJS does (canvas creation, Image loading, fetch, XML parsing) so the library can run in non-browser contexts. Call `DOMAdapter.set(...)` before `app.init()` to swap in a different adapter.

## Quick Start

```ts
// worker.ts — OffscreenCanvas posted from main thread
DOMAdapter.set(WebWorkerAdapter);

self.onmessage = async (event) => {
  const app = new Application();
  await app.init({
    canvas: event.data.canvas,
    width: 800,
    height: 600,
  });
};
```

For CSP contexts that block `unsafe-eval`, import the polyfill before any renderer init:

```ts
import "pixi.js/unsafe-eval";
```

**Related skills:** `pixijs-application` (standard browser init), `pixijs-migration-v8` (settings removal, adapter changes).

## Core Patterns

### Web Worker with OffscreenCanvas

Transfer an OffscreenCanvas from the main thread, then initialize PixiJS in the worker:

```ts
// main.ts
const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

const offscreen = canvas.transferControlToOffscreen();
const worker = new Worker("worker.ts", { type: "module" });
worker.postMessage({ canvas: offscreen }, [offscreen]);
```

```ts
// worker.ts
import { Application, DOMAdapter, WebWorkerAdapter } from "pixi.js";

DOMAdapter.set(WebWorkerAdapter);

self.onmessage = async (event) => {
  const app = new Application();
  await app.init({
    canvas: event.data.canvas,
    width: 800,
    height: 600,
  });
};
```

`DOMAdapter.set(WebWorkerAdapter)` must happen before `new Application()`. The WebWorkerAdapter uses `OffscreenCanvas` instead of `document.createElement('canvas')` and `@xmldom/xmldom` for XML parsing.

Features that do **not** work inside a Web Worker (no DOM access):

- `DOMContainer` — there is no real DOM node to overlay.
- `AccessibilitySystem` — depends on live DOM focus and screen reader hooks.
- `FontFace` loading via the Font Loading API — use pre-converted bitmap fonts (`BitmapFont.install` or `.fnt` assets) instead.

### Environment-specific subpath imports

Instead of importing `pixi.js`, you can pull in a curated bundle for each environment:

```ts
import "pixi.js/browser"; // accessibility, dom, events, spritesheet, rendering, filters
import "pixi.js/webworker"; // spritesheet, rendering, filters (no DOM-only modules)
```

`pixi.js/webworker` deliberately omits `accessibility`, `dom`, and `events` because they require the DOM. Use these subpath entries when you want static, synchronous module registration instead of relying on `loadEnvironmentExtensions` to dynamic-import the right set at renderer init.

### loadEnvironmentExtensions

```ts
import { loadEnvironmentExtensions } from "pixi.js";

await loadEnvironmentExtensions(false); // false = load defaults; true = skip
```

`loadEnvironmentExtensions(skip)` replaces the deprecated `autoDetectEnvironment` helper (since 8.1.6). Pass `true` to opt out of auto-loading the default browser extensions when you are bootstrapping a custom environment. `autoDetectEnvironment(add)` still exists as a shim that forwards to `loadEnvironmentExtensions(!add)`.

### CSP-compliant setup

PixiJS uses `new Function()` internally for shader compilation and uniform syncing. In Content Security Policy environments that block `unsafe-eval`, import the polyfill:

```ts
import "pixi.js/unsafe-eval";
import { Application } from "pixi.js";

const app = new Application();
await app.init({ width: 800, height: 600 });
```

The `pixi.js/unsafe-eval` import replaces eval-based code generation with static polyfills for shader sync, UBO sync, uniform sync, and particle buffer updates. The import must come before any PixiJS renderer initialization.

**Tension note:** The name `pixi.js/unsafe-eval` is counterintuitive. It does not enable unsafe eval; it removes the need for it. The name refers to the CSP directive it works around.

### Custom adapter

For non-standard environments (Node.js, headless testing, SSR), implement the full Adapter interface:

```ts
import { DOMAdapter } from "pixi.js";
import type { Adapter } from "pixi.js";
import { createCanvas, Image } from "canvas";
import { DOMParser } from "@xmldom/xmldom";

const HeadlessAdapter: Adapter = {
  createCanvas: (width, height) => createCanvas(width ?? 0, height ?? 0),
  createImage: () => new Image(),
  getCanvasRenderingContext2D: () => CanvasRenderingContext2D,
  getWebGLRenderingContext: () => WebGLRenderingContext,
  getNavigator: () => ({ userAgent: "HeadlessAdapter", gpu: null }),
  getBaseUrl: () => "file://",
  getFontFaceSet: () => null,
  fetch: (url, options) => fetch(url, options),
  parseXML: (xml) => new DOMParser().parseFromString(xml, "text/xml"),
};

DOMAdapter.set(HeadlessAdapter);
```

The Adapter interface requires these methods: `createCanvas`, `createImage`, `getCanvasRenderingContext2D`, `getWebGLRenderingContext`, `getNavigator`, `getBaseUrl`, `getFontFaceSet`, `fetch`, `parseXML`.

### Checking the current adapter

```ts
import { DOMAdapter } from "pixi.js";

const adapter = DOMAdapter.get();
const canvas = adapter.createCanvas(256, 256);
const img = adapter.createImage();
```

`DOMAdapter.get()` returns whatever adapter is currently set. Use this for any DOM access within PixiJS-adjacent code instead of calling `document` or `Image` directly.

## Common Mistakes

### [CRITICAL] Not setting adapter before app.init()

Wrong:

```ts
const app = new Application();
await app.init({ width: 800, height: 600 });
DOMAdapter.set(WebWorkerAdapter); // too late; adapter already read during init
```

Correct:

```ts
DOMAdapter.set(WebWorkerAdapter);
const app = new Application();
await app.init({ width: 800, height: 600 });
```

`DOMAdapter.set()` must be called before `app.init()` in non-browser environments. PixiJS reads the adapter during `app.init()` when the renderer is created. `new Application()` itself only creates the stage Container and does not read the adapter.


### [HIGH] Using document or Image directly

Wrong:

```ts
const img = new Image();
img.src = "texture.png";
```

Correct:

```ts
import { DOMAdapter } from "pixi.js";

const img = DOMAdapter.get().createImage();
img.src = "texture.png";
```

All DOM access in PixiJS goes through DOMAdapter. Direct use of `document`, `Image`, or other browser globals breaks Web Worker and SSR compatibility.


### [HIGH] CSP unsafe-eval import name confusion

Wrong:

```ts
// CSP environment, omitting the import
import { Application } from "pixi.js";
// Throws: "Current environment does not allow unsafe-eval,
// please use pixi.js/unsafe-eval module to enable support."
```

Correct:

```ts
import "pixi.js/unsafe-eval";
import { Application } from "pixi.js";
```

The `pixi.js/unsafe-eval` import removes the need for `eval()` / `new Function()` in shader compilation. Despite the name suggesting it enables unsafe eval, it does the opposite: it installs static polyfills so PixiJS works under strict CSP.

PixiJS detects CSP blocking at renderer init and throws the error above. The browser may also log its own CSP violation before PixiJS reports; both point to the same fix.


### [HIGH] Using old settings.ADAPTER pattern

Wrong:

```ts
import { settings, WebWorkerAdapter } from "pixi.js";
settings.ADAPTER = WebWorkerAdapter;
```

Correct:

```ts
import { DOMAdapter, WebWorkerAdapter } from "pixi.js";
DOMAdapter.set(WebWorkerAdapter);
```

The `settings` object was removed in v8. All adapter configuration uses `DOMAdapter.set()`.


## API Reference

- [DOMAdapter](https://pixijs.download/release/docs/environment.DOMAdapter.html.md)
- [BrowserAdapter](https://pixijs.download/release/docs/environment.BrowserAdapter.html.md)
- [WebWorkerAdapter](https://pixijs.download/release/docs/environment.WebWorkerAdapter.html.md)
- [autoDetectEnvironment](https://pixijs.download/release/docs/environment.autoDetectEnvironment.html.md)
- [loadEnvironmentExtensions](https://pixijs.download/release/docs/environment.loadEnvironmentExtensions.html.md)
