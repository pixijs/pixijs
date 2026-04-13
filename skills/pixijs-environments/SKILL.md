---
name: pixijs-environments
description: >
  Run PixiJS in browsers, Web Workers, or custom environments. Covers
  DOMAdapter.set(), BrowserAdapter, WebWorkerAdapter, OffscreenCanvas
  transfer, custom adapter interface, and pixi.js/unsafe-eval for CSP
  compliance. Use when the user asks about running PixiJS in a Web Worker,
  OffscreenCanvas, server-side rendering, Node.js, headless mode, Content
  Security Policy, CSP errors, unsafe-eval, custom environments, or
  the DOMAdapter. Covers DOMAdapter, BrowserAdapter, WebWorkerAdapter,
  Adapter interface, pixi.js/unsafe-eval.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  sources: "pixijs/pixijs:src/environment/adapter.ts, pixijs/pixijs:src/environment-browser/BrowserAdapter.ts, pixijs/pixijs:src/environment-webworker/WebWorkerAdapter.ts, pixijs/pixijs:src/__docs__/concepts/environments.md"
---

## When to Use This Skill

Apply when the user needs to run PixiJS outside a standard browser context, including Web Workers, Node.js, SSR, headless testing, or environments with Content Security Policy restrictions.

**Related skills:** For standard browser setup use **getting-started**; for migration from v7 settings use **pixijs-migration**.

## Setup

In a standard browser, no environment config is needed. BrowserAdapter is the default.

```ts
import { Application } from 'pixi.js';

const app = new Application();
await app.init({ width: 800, height: 600 });
document.body.appendChild(app.canvas);
```

For non-browser environments, set the adapter before creating any PixiJS objects.

## Core Patterns

### Web Worker with OffscreenCanvas

Transfer an OffscreenCanvas from the main thread, then initialize PixiJS in the worker:

```ts
// main.ts
const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

const offscreen = canvas.transferControlToOffscreen();
const worker = new Worker('worker.ts', { type: 'module' });
worker.postMessage({ canvas: offscreen }, [offscreen]);
```

```ts
// worker.ts
import { Application, DOMAdapter, WebWorkerAdapter } from 'pixi.js';

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

Accessibility and user interaction features are unavailable in Web Workers because they have no DOM access.

### CSP-compliant setup

PixiJS uses `new Function()` internally for shader compilation and uniform syncing. In Content Security Policy environments that block `unsafe-eval`, import the polyfill:

```ts
import 'pixi.js/unsafe-eval';
import { Application } from 'pixi.js';

const app = new Application();
await app.init({ width: 800, height: 600 });
```

The `pixi.js/unsafe-eval` import replaces eval-based code generation with static polyfills for shader sync, UBO sync, uniform sync, and particle buffer updates. The import must come before any PixiJS renderer initialization.

**Tension note:** The name `pixi.js/unsafe-eval` is counterintuitive. It does not enable unsafe eval; it removes the need for it. The name refers to the CSP directive it works around.

### Custom adapter

For non-standard environments (Node.js, headless testing, SSR), implement the full Adapter interface:

```ts
import { DOMAdapter } from 'pixi.js';
import type { Adapter } from 'pixi.js';
import { createCanvas, Image } from 'canvas';
import { DOMParser } from '@xmldom/xmldom';

const HeadlessAdapter: Adapter = {
    createCanvas: (width, height) => createCanvas(width ?? 0, height ?? 0),
    createImage: () => new Image(),
    getCanvasRenderingContext2D: () => CanvasRenderingContext2D,
    getWebGLRenderingContext: () => WebGLRenderingContext,
    getNavigator: () => ({ userAgent: 'HeadlessAdapter', gpu: null }),
    getBaseUrl: () => 'file://',
    getFontFaceSet: () => null,
    fetch: (url, options) => fetch(url, options),
    parseXML: (xml) => new DOMParser().parseFromString(xml, 'text/xml'),
};

DOMAdapter.set(HeadlessAdapter);
```

The Adapter interface requires these methods: `createCanvas`, `createImage`, `getCanvasRenderingContext2D`, `getWebGLRenderingContext`, `getNavigator`, `getBaseUrl`, `getFontFaceSet`, `fetch`, `parseXML`.

### Checking the current adapter

```ts
import { DOMAdapter } from 'pixi.js';

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

Source: src/__docs__/concepts/environments.md

### [HIGH] Using document or Image directly

Wrong:
```ts
const img = new Image();
img.src = 'texture.png';
```

Correct:
```ts
import { DOMAdapter } from 'pixi.js';

const img = DOMAdapter.get().createImage();
img.src = 'texture.png';
```

All DOM access in PixiJS goes through DOMAdapter. Direct use of `document`, `Image`, or other browser globals breaks Web Worker and SSR compatibility.

Source: src/__docs__/concepts/environments.md

### [HIGH] CSP unsafe-eval import name confusion

Wrong:
```ts
// CSP environment, omitting the import
import { Application } from 'pixi.js';
// Crashes with "Refused to evaluate a string as JavaScript"
```

Correct:
```ts
import 'pixi.js/unsafe-eval';
import { Application } from 'pixi.js';
```

The `pixi.js/unsafe-eval` import removes the need for `eval()` / `new Function()` in shader compilation. Despite the name suggesting it enables unsafe eval, it does the opposite: it installs static polyfills so PixiJS works under strict CSP.

Source: GitHub issue #7324

### [HIGH] Using old settings.ADAPTER pattern

Wrong:
```ts
import { settings, WebWorkerAdapter } from 'pixi.js';
settings.ADAPTER = WebWorkerAdapter;
```

Correct:
```ts
import { DOMAdapter, WebWorkerAdapter } from 'pixi.js';
DOMAdapter.set(WebWorkerAdapter);
```

The `settings` object was removed in v8. All adapter configuration uses `DOMAdapter.set()`.

Source: src/__docs__/migrations/v8.md

---

See also: getting-started (Application initialization), migration-v8 (settings removal, adapter changes)

## Learn More

- [DOMAdapter](https://pixijs.download/release/docs/environment.DOMAdapter.html.md)
- [BrowserAdapter](https://pixijs.download/release/docs/environment.BrowserAdapter.html.md)
- [WebWorkerAdapter](https://pixijs.download/release/docs/environment.WebWorkerAdapter.html.md)
- [Adapter](https://pixijs.download/release/docs/environment.Adapter.html.md)
