---
title: Overview
category: environment
---

# Environment

PixiJS is designed to work across different JavaScript environments through its environment adapter system. This system abstracts platform-specific APIs, allowing PixiJS to run in browsers, Web Workers, and custom environments.

## Environment Types

### Browser Environment (Default)
PixiJS is primarily designed for web browsers, leveraging the `BrowserAdapter` to access native browser APIs like `CanvasRenderingContext2D` and `WebGLRenderingContext`. This is the default environment when using PixiJS.

```ts
import { Application } from 'pixi.js';

const app = new Application();

await app.init({
    width: 800,
    height: 600,
});

document.body.appendChild(app.canvas);
```

### Web Worker Environment
PixiJS can also run in Web Workers, which allows for parallel processing and offloading rendering tasks from the main thread. The `WebWorkerAdapter` provides the necessary APIs to create and manage an `OffscreenCanvas`.

```ts
import { DOMAdapter, WebWorkerAdapter, Application } from 'pixi.js';

// Configure the environment before creating any PixiJS objects
DOMAdapter.set(WebWorkerAdapter);

const app = new Application();

await app.init({
    width: 800,
    height: 600,
});

// Returns an OffscreenCanvas
const canvas = app.canvas;

// Post the canvas back to main thread
postMessage({ canvas }, [canvas]);
```

> [!WARNING]
> Accessibility and user interaction features are not available in Web Workers, as they do not have access to the DOM.

## Custom Environment
PixiJS allows you to create custom adapters for non-standard environments, such as Node.js or headless testing frameworks. This is done by implementing the `Adapter` interface, which defines methods for creating canvases, fetching resources, and accessing environment-specific APIs.

```typescript
import { DOMAdapter } from 'pixi.js';

const CustomAdapter = {
    createCanvas: (width, height) => {/* custom implementation */},
    getCanvasRenderingContext2D: () => {/* custom implementation */},
    getWebGLRenderingContext: () => {/* custom implementation */},
    getNavigator: () => ({ userAgent: 'Custom', gpu: null }),
    getBaseUrl: () => 'custom://',
    fetch: async (url, options) => {/* custom fetch */},
    parseXML: (xml) => {/* custom XML parser */},
};

DOMAdapter.set(CustomAdapter);
```

## Best Practices

- Set the environment adapter before creating any PixiJS objects
- Use environment-specific features through the adapter interface

## Related Documentation

- See {@link Adapter} for the adapter interface
- See {@link BrowserAdapter} for browser-specific implementation
- See {@link WebWorkerAdapter} for Web Worker support
- See {@link DOMAdapter} for adapter management
- See {@link ICanvas} for canvas interface
- See {@link ExtensionType.Environment} for plugin system
