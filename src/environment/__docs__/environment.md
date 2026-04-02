---
title: Overview
category: environment
description: Learn how to configure PixiJS for different environments including browsers, Web Workers, and custom platforms using the DOMAdapter system.
---

# Environment

Most PixiJS users run in a browser and can ignore this page. The environment system matters if you're running PixiJS in a **Web Worker** (for offscreen rendering) or a **custom environment** like Node.js (for server-side rendering or testing). Adapters abstract platform-specific APIs so the same PixiJS code works everywhere.

## Browser environment (default)

PixiJS auto-detects the browser environment and uses `BrowserAdapter` to access native APIs like `CanvasRenderingContext2D` and `WebGLRenderingContext`. No configuration is needed.

```ts
import { Application } from 'pixi.js';

const app = new Application();

await app.init({
    width: 800,
    height: 600,
});

document.body.appendChild(app.canvas);
```

## Web Worker environment

PixiJS can run in Web Workers using `WebWorkerAdapter`, which renders to an `OffscreenCanvas`. Transfer an `OffscreenCanvas` from the main thread to the worker, then set the adapter and initialize PixiJS:

```ts
// main.js
const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

const offscreen = canvas.transferControlToOffscreen();
const worker = new Worker('worker.js', { type: 'module' });
worker.postMessage({ canvas: offscreen }, [offscreen]);
```

```ts
// worker.js
import { Application, DOMAdapter, WebWorkerAdapter } from 'pixi.js';

// Must be set before creating any PixiJS objects
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

> [!WARNING]
> Accessibility and user interaction features are unavailable in Web Workers because they have no DOM access.

## Custom environment

You can create custom adapters for non-standard environments like Node.js or headless testing frameworks. The adapter must satisfy the full {@link Adapter} interface:

```typescript
import { DOMAdapter } from 'pixi.js';
import type { Adapter } from 'pixi.js';

// Example: a minimal Node.js adapter using node-canvas
import { createCanvas, Image } from 'canvas';

const CustomAdapter: Adapter = {
    createCanvas: (width, height) => createCanvas(width, height),
    createImage: () => new Image(),
    getCanvasRenderingContext2D: () => CanvasRenderingContext2D,
    getWebGLRenderingContext: () => null, // no WebGL in this environment
    getNavigator: () => ({ userAgent: 'Node.js', gpu: null }),
    getBaseUrl: () => process.cwd(),
    getFontFaceSet: () => null,
    fetch: async (url, options) => globalThis.fetch(url, options),
    parseXML: (xml) => new (require('xmldom').DOMParser)().parseFromString(xml),
};

DOMAdapter.set(CustomAdapter);
```

## Adapter defaults

PixiJS uses `BrowserAdapter` by default. For Web Worker environments, you must call `DOMAdapter.set(WebWorkerAdapter)` before creating any PixiJS objects. The environment extension system detects `WorkerGlobalScope` and loads compatible rendering modules, but it does not set the adapter automatically.

## API reference

- {@link Adapter} - The interface all adapters must satisfy
- {@link BrowserAdapter} - Default browser adapter
- {@link WebWorkerAdapter} - Web Worker adapter using `OffscreenCanvas`
- {@link DOMAdapter} - Getter/setter for the active adapter
- {@link ICanvas} - Canvas abstraction used across environments
