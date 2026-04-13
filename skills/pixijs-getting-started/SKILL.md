---
name: pixijs-getting-started
description: >
  Initialize a PixiJS v8 Application with async app.init(), configure
  the canvas, set up responsive resizing with resizeTo, choose WebGL or
  WebGPU renderer preference (string or array), and build custom bundles
  with skipExtensionImports. Use when the user asks about creating a PixiJS app,
  setting up a project, initializing the renderer, responsive canvas sizing,
  high-DPI or retina displays, choosing between WebGL and WebGPU, tree-shaking,
  custom bundles, or cleaning up an application. Covers Application, app.init(),
  app.canvas, app.stage, resizeTo, autoDensity, autoDetectRenderer, preference,
  skipExtensionImports, app.destroy().
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  sources: "pixijs/pixijs:src/app/Application.ts, pixijs/pixijs:src/rendering/renderers/autoDetectRenderer.ts, pixijs/pixijs:src/__docs__/concepts/architecture.md, pixijs/pixijs:src/__docs__/migrations/v8.md"
---

## When to Use This Skill

Apply when the user needs to create a new PixiJS application, configure the canvas or renderer, handle responsive resizing, select a rendering backend, or set up custom bundles for tree-shaking.

**Related skills:** For scene graph and transforms use **core-concepts**; for the render loop use **ticker**; for non-browser setups use **environments**.

## Setup

```ts
import { Application, Sprite, Assets } from 'pixi.js';

const app = new Application();

await app.init({
    width: 800,
    height: 600,
    backgroundColor: 0x1099bb,
});

document.body.appendChild(app.canvas);

const texture = await Assets.load('bunny.png');
const sprite = new Sprite(texture);
app.stage.addChild(sprite);
```

Key points:
- `new Application()` takes no arguments. All config goes to `app.init()`.
- `app.init()` is async; it creates the renderer via `autoDetectRenderer`.
- `app.canvas` is the HTMLCanvasElement. Insert it into the DOM yourself.
- `app.stage` is the root Container. Add display objects as children.
- `app.screen` is the renderer's screen Rectangle (width/height in CSS pixels). Useful for filter areas and hit areas.

## Core Patterns

### Responsive resizing

```ts
import { Application } from 'pixi.js';

const app = new Application();

await app.init({
    resizeTo: window,
    autoDensity: true,
    resolution: window.devicePixelRatio,
});

document.body.appendChild(app.canvas);
```

`resizeTo` accepts `window` or any `HTMLElement`. The ResizePlugin listens for the `resize` event and calls `renderer.resize()` automatically. Set `autoDensity: true` with a `resolution` to handle high-DPI displays.

You can also change the target at runtime:

```ts
app.resizeTo = document.querySelector('#game-container');
```

### Choosing a renderer

```ts
import { Application } from 'pixi.js';

const app = new Application();

await app.init({
    preference: 'webgpu',
    width: 800,
    height: 600,
});
```

`preference` accepts a string or an array. Default priority (no preference set) is webgl, then webgpu, then canvas.

**String** (e.g. `'webgpu'`): tries that renderer first, falls back to the remaining renderers in default priority order.

**Array** (e.g. `['webgpu', 'webgl']`): tries only the listed renderers, in the given order. Unlisted types are excluded entirely, so this doubles as a blocklist.

```ts
// Only allow WebGPU and WebGL; never fall back to Canvas
await app.init({
    preference: ['webgpu', 'webgl'],
});

// Force Canvas only
await app.init({
    preference: ['canvas'],
});
```

You can also pass renderer-specific options via `webgpu`, `webgl`, or `canvasOptions` keys:

```ts
import { Application } from 'pixi.js';

const app = new Application();

await app.init({
    webgpu: {
        antialias: true,
        backgroundColor: 0xff0000,
    },
    webgl: {
        antialias: true,
        backgroundColor: 0x00ff00,
    },
});
```

### Manual rendering (no ticker)

```ts
import { Application } from 'pixi.js';

const app = new Application();

await app.init({
    autoStart: false,
    width: 800,
    height: 600,
});

document.body.appendChild(app.canvas);

function customLoop() {
    requestAnimationFrame(customLoop);
    app.render();
}
customLoop();
```

Set `autoStart: false` to disable the TickerPlugin's automatic render loop. Then call `app.render()` yourself.

### Cleanup

```ts
app.destroy(true, { children: true, texture: true, textureSource: true });
```

First argument controls canvas removal (`true` removes it from DOM). Second argument controls stage cleanup depth.

### Custom bundles

By default, PixiJS auto-imports environment extensions (accessibility, DOM overlay, events, filters, etc.) when the renderer initializes. To take full control of what's included, disable this with `skipExtensionImports`:

```ts
// Import only what you need
import 'pixi.js/events';
import 'pixi.js/graphics';
import 'pixi.js/text';

import { Application } from 'pixi.js';

const app = new Application();

await app.init({
    skipExtensionImports: true,
    width: 800,
    height: 600,
});
```

When `skipExtensionImports: true`, the browser environment's dynamic imports are skipped. You must manually import what your app uses.

**Auto-imported by default** (skipped when `skipExtensionImports: true`):
- `pixi.js/accessibility` - screen reader and keyboard navigation
- `pixi.js/dom` - DOM overlay for HTML elements in the scene
- `pixi.js/events` - pointer/mouse/touch interaction
- `pixi.js/filters` - built-in filter effects

**Bundled in main `pixi.js`** (available via `import { ... } from 'pixi.js'` with no extra import):
- `pixi.js/sprite-tiling` - tiling sprites
- `pixi.js/text` - canvas-based text rendering
- `pixi.js/text-html` - HTML/CSS text rendering
- `pixi.js/graphics` - vector drawing API
- `pixi.js/mesh` - custom mesh geometry
- `pixi.js/sprite-nine-slice` - nine-slice sprites
- `pixi.js/particle-container` - high-performance particle rendering

**Always opt-in** (require explicit `import 'pixi.js/...'` even with the default bundle):
- `pixi.js/text-bitmap` - bitmap font text (also registers its Assets loader)
- `pixi.js/gif` - GIF animation support
- `pixi.js/advanced-blend-modes` - extra GPU blend modes
- `pixi.js/unsafe-eval` - shader compilation without CSP eval restrictions
- `pixi.js/prepare` - pre-upload textures to GPU
- `pixi.js/math-extras` - extra math utilities on Point/Rectangle
- `pixi.js/dds`, `pixi.js/ktx`, `pixi.js/ktx2`, `pixi.js/basis` - compressed texture formats

> **Note:** `pixi.js/text-bitmap` must be imported before `Assets.load()` if you load bitmap fonts before renderer init, since it registers the font asset parser.

## Common Mistakes

### [CRITICAL] Passing options to Application constructor

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

v8 requires async `app.init()` for renderer creation. The constructor ignores options and logs a deprecation warning.

Source: src/__docs__/migrations/v8.md

### [HIGH] Using app.view instead of app.canvas

Wrong:
```ts
document.body.appendChild(app.view);
```

Correct:
```ts
document.body.appendChild(app.canvas);
```

`app.view` was renamed to `app.canvas` in v8. The old property still works but emits a deprecation warning.

Source: src/__docs__/migrations/v8.md

---

See also: ticker (render loop control), environments (non-browser setups), core-concepts (scene graph basics), pixijs-migration (upgrading from v7)

## Learn More

- [Application](https://pixijs.download/release/docs/app.Application.html.md)
- [ApplicationOptions](https://pixijs.download/release/docs/app.ApplicationOptions.html.md)
- [ResizePlugin](https://pixijs.download/release/docs/app.ResizePlugin.html.md)
- [autoDetectRenderer](https://pixijs.download/release/docs/rendering.autoDetectRenderer.html.md)
