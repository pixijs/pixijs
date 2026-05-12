# Renderers: WebGPU, WebGL, and Canvas

PixiJS v8 ships three renderers: `WebGPURenderer` (fastest where available), `WebGLRenderer` (broad compatibility, WebGL2), and `CanvasRenderer` (a last-resort 2D Canvas backend). `autoDetectRenderer` (used internally by `Application.init`) picks the best available backend based on a preference list.

**Status:** `WebGLRenderer` is recommended for production. `WebGPURenderer` is feature-complete but still experimental; browser implementations have inconsistencies. `CanvasRenderer` is a fallback for environments without WebGL/WebGPU and supports a reduced feature set.

## Quick Start

```ts
const app = new Application();

await app.init({
  preference: ["webgpu", "webgl"],
  width: 800,
  height: 600,
  background: 0x222233,
  antialias: true,
});

document.body.appendChild(app.canvas);
```

`preference` can be a single string (try that first, fall back to default order) or an array (use only these, in this order; others are excluded). Default priority when `preference` is not set: `webgl`, `webgpu`, `canvas`.

## Core Patterns

### Preference forms

```ts
// Single string: try webgpu first, fall back through defaults
await app.init({ preference: "webgpu" });

// Array: only try listed backends in order
await app.init({ preference: ["webgpu", "webgl"] });

// Array acts as a blocklist; anything not listed is excluded
await app.init({ preference: ["webgl"] }); // never uses webgpu or canvas

// Force canvas (legacy-only environments)
await app.init({ preference: ["canvas"] });
```

A string form falls through to defaults if the preferred backend isn't available. An array form excludes any backend not in the list, even if the preferred one fails.

### Per-renderer options

```ts
await app.init({
  width: 800,
  height: 600,
  webgpu: { antialias: true, powerPreference: "high-performance" },
  webgl: { antialias: true, premultipliedAlpha: false },
  canvasOptions: { backgroundAlpha: 0 },
});
```

Common options live at the top level; renderer-specific options go in `webgpu`, `webgl`, or `canvasOptions`. Only the options for the selected renderer apply; the others are discarded.

### Systems and pipes

Each renderer is composed of a fixed set of `System`s (lifecycle services: textures, buffers, state, events, filters, masks) and a set of `RenderPipe`s (per-renderable instruction builders: sprite, graphics, mesh, particle, text, tiling-sprite).

- `Systems` run once per renderer lifecycle and manage GPU state.
- `RenderPipes` run every frame, one per renderable type. They batch instructions for their object class and flush them to the GPU.

Writing a custom renderable means implementing a `RenderPipe`, a `BatchableX` class, and registering both via the extensions system. See `pixijs-custom-rendering`.

### Direct renderer construction

```ts
import { WebGLRenderer } from "pixi.js";

const renderer = new WebGLRenderer();
await renderer.init({ width: 800, height: 600 });
```

Most apps use `Application.init` or `autoDetectRenderer()`, but you can instantiate a specific renderer directly when the target environment is known (tests, tooling, editor integrations).

### `renderer.render()` options

The `.render()` method accepts either a `Container` or an options object:

```ts
// shorthand: just render the stage
renderer.render(app.stage);

// options form: control clearing, transform, or a render target
renderer.render({
  container: app.stage,
  clear: true,
  transform: new Matrix(),
});

// render into a specific mip level of a RenderTexture
renderer.render({
  container: myContainer,
  target: renderTexture,
  mipLevel: 1,
});
```

`container` is the scene root to draw. `target` is a separate destination (e.g. a `RenderTexture`). `mipLevel > 0` is useful for custom LOD systems or manual mipmap generation.

### Resizing, texture generation, and interop

```ts
renderer.resize(window.innerWidth, window.innerHeight);

const texture = renderer.generateTexture(displayObject);

// Mixing PixiJS with Three.js (or any other WebGL/WebGPU library)
threeRenderer.resetState();
threeRenderer.render(scene, camera);

pixiRenderer.resetState();
pixiRenderer.render({ container: stage });
```

Call `resetState()` before each library renders. Both libraries leave GPU state (bound textures, blend modes, active shaders) that conflicts with the other; without `resetState()`, objects can disappear or blend incorrectly.

### Destroying a renderer

```ts
renderer.destroy();
```

Releases GPU resources, systems, pipes, and event listeners. A destroyed renderer cannot be used for further rendering.

### Manual rendering

```ts
await app.init({ autoStart: false, width: 800, height: 600 });

function frame() {
  app.renderer.render(app.stage);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```

Disable the automatic ticker plugin with `autoStart: false`, then call `app.renderer.render(app.stage)` yourself. Useful for integrating with an external game loop.

### Renderer selection at runtime

```ts
console.log(app.renderer.name); // 'webgl', 'webgpu', or 'canvas'
```

After `init`, `app.renderer` is the concrete class. Use `app.renderer.name` (a string) to branch on backend; `app.renderer.type` exists but is a numeric id meant for internal dispatch — prefer `name` in user code.

### Supports check

```ts
if (await isWebGPUSupported()) {
  // ok to prefer webgpu
}

if (isWebGLSupported()) {
  // ok to prefer webgl
}
```

Both helpers are exported from `pixi.js`. Useful if you want to tell the user which backend is about to be used before calling `app.init`.

## Common Mistakes

### [HIGH] Expecting WebGPU everywhere

Wrong:

```ts
await app.init({ preference: ["webgpu"] });
```

Correct:

```ts
await app.init({ preference: ["webgpu", "webgl"] });
```

WebGPU is not yet available on all browsers. An array-form preference of only `['webgpu']` will fail init on unsupported browsers (no fallback). Always include `'webgl'` as a fallback unless you've verified WebGPU support upstream.


### [MEDIUM] Assuming CanvasRenderer supports everything

CanvasRenderer does not support filters, masks beyond basic clipping, compressed textures, or custom shaders. It's intended as a last-resort for environments that can't run WebGL. If you need full feature parity, target WebGL or WebGPU.


### [MEDIUM] Calling render before init

Wrong:

```ts
const app = new Application();
app.renderer.render(app.stage);
await app.init();
```

Correct:

```ts
const app = new Application();
await app.init();
app.renderer.render(app.stage);
```

`app.renderer` is populated only after `init()` resolves. Any access before that is `undefined`.


## API Reference

- [autoDetectRenderer](https://pixijs.download/release/docs/rendering.autoDetectRenderer.html.md)
- [AbstractRenderer](https://pixijs.download/release/docs/rendering.AbstractRenderer.html.md)
- [WebGLRenderer](https://pixijs.download/release/docs/rendering.WebGLRenderer.html.md)
- [WebGPURenderer](https://pixijs.download/release/docs/rendering.WebGPURenderer.html.md)
- [CanvasRenderer](https://pixijs.download/release/docs/rendering.CanvasRenderer.html.md)
