---
sidebar_position: 5
title: Environments
description: Learn how PixiJS adapts to different environments like browsers, Web Workers, and custom execution contexts, and how to configure it for your needs.
category: core-concepts
---

# Using PixiJS in Different Environments

PixiJS runs in browsers by default with zero configuration. You only need this page if you're running PixiJS in a **Web Worker**, **Node.js**, or another non-browser environment. In those cases, you'll set a custom adapter before creating any PixiJS objects.

## Running PixiJS in the Browser

PixiJS uses the `BrowserAdapter` by default. No configuration is needed:

```typescript
import { Application } from 'pixi.js';

const app = new Application();

await app.init({
  width: 800,
  height: 600,
});

document.body.appendChild(app.canvas);
```

If you need to check or override the current adapter, use `DOMAdapter.get()` and `DOMAdapter.set()`.

## Running PixiJS in Web Workers

Web Workers can't access the DOM, so PixiJS uses `OffscreenCanvas` instead. You must set the `WebWorkerAdapter` before creating any PixiJS objects.

Transfer an `OffscreenCanvas` from your main thread to the worker, then pass it to PixiJS:

```typescript
// main.js
const canvas = document.createElement('canvas');
const offscreen = canvas.transferControlToOffscreen();
worker.postMessage({ canvas: offscreen }, [offscreen]);

// worker.js
import { Application, DOMAdapter, WebWorkerAdapter } from 'pixi.js';

DOMAdapter.set(WebWorkerAdapter); // Must be set before creating anything

self.onmessage = async (event) => {
  const app = new Application();
  await app.init({
    canvas: event.data.canvas, // The transferred OffscreenCanvas
    width: 800,
    height: 600,
  });
};
```

## Custom Environments

For non-standard environments (Node.js, headless testing, SSR), create a custom adapter implementing the `Adapter` interface. Every method must be implemented; PixiJS calls these instead of accessing browser globals directly.

### Example Custom Adapter:

```typescript
import { DOMAdapter } from 'pixi.js';

const CustomAdapter = {
  createCanvas: (width, height) => {
    /* custom implementation */
  },
  createImage: () => {
    /* custom implementation */
  },
  getCanvasRenderingContext2D: () => {
    /* custom implementation */
  },
  getWebGLRenderingContext: () => {
    /* custom implementation */
  },
  getNavigator: () => ({ userAgent: 'Custom', gpu: null }),
  getBaseUrl: () => 'custom://',
  getFontFaceSet: () => null,
  fetch: async (url, options) => {
    /* custom fetch */
  },
  parseXML: (xml) => {
    /* custom XML parser */
  },
};

DOMAdapter.set(CustomAdapter);
```
