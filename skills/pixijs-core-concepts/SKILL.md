---
name: pixijs-core-concepts
description: "Use this skill when understanding how PixiJS v8 renders frames: the systems-and-pipes renderer, the render loop, and how the library adapts to different environments. Covers WebGLRenderer/WebGPURenderer/CanvasRenderer selection, renderer.render() pipeline, environment detection, and pointers to per-topic deep dives. Triggers on: renderer, WebGL, WebGPU, Canvas, render loop, render pipeline, systems, environments, autoDetectRenderer."
license: MIT
---

Foundational model for how PixiJS v8 gets pixels on the screen: the renderer decides which GPU backend to use, the render loop drives per-frame work, and the environment layer adapts the library to browser, Web Worker, or SSR contexts. For the scene graph itself (Containers, transforms, destroy), see `pixijs-scene-core-concepts`.

## Quick Start

```ts
console.log(app.renderer.name); // 'webgl' | 'webgpu' | 'canvas'

app.ticker.add((ticker) => {
  sprite.rotation += 0.01 * ticker.deltaTime;
});

const tex = app.renderer.extract.texture({ target: app.stage });

app.renderer.render({ container: app.stage });
```

`app.renderer` is the `WebGLRenderer`, `WebGPURenderer`, or `CanvasRenderer` chosen by `autoDetectRenderer`. The TickerPlugin drives `renderer.render()` automatically; call it manually only with `autoStart: false`. Backend selection happens in `Application.init({ preference })`; see `pixijs-application` for setup.

**Related skills:** `pixijs-application` (Application construction and lifecycle), `pixijs-ticker` (per-frame logic, priorities, FPS capping), `pixijs-environments` (Web Worker, SSR, strict CSP), `pixijs-custom-rendering` (writing a RenderPipe), `pixijs-scene-core-concepts` (scene graph basics).

## Topics

| Topic               | Reference                                              | When                                                      |
| ------------------- | ------------------------------------------------------ | --------------------------------------------------------- |
| Choosing a backend  | [references/renderers.md](references/renderers.md)     | Preference forms, per-renderer options, systems and pipes |
| Per-frame execution | [references/render-loop.md](references/render-loop.md) | Priority order, time units, manual rendering              |

For deep dives into any single topic, open the corresponding reference file. Non-browser targets (`DOMAdapter`, `WebWorkerAdapter`, custom adapters, strict CSP) are covered in the `pixijs-environments` skill.

## Decision guide

- **Setting up an Application?** Start with `pixijs-application`. This skill explains what the renderer does under the hood.
- **Choosing between WebGL and WebGPU?** Use `['webgpu', 'webgl']` as your preference array. WebGPU is fastest where available; WebGL is the reliable fallback. See `references/renderers.md`.
- **Running in a Web Worker?** Set `DOMAdapter.set(WebWorkerAdapter)` before `app.init`. See the `pixijs-environments` skill for complete setup.
- **Need manual control over when rendering happens?** Set `autoStart: false` and call `app.renderer.render(app.stage)` from your own loop. See `references/render-loop.md`.
- **Integrating with a physics library?** Add your update at `UPDATE_PRIORITY.HIGH` so physics runs before the render at `LOW`. See `references/render-loop.md`.
- **Writing a custom renderable?** Implement a `RenderPipe`. See `pixijs-custom-rendering` skill.
- **Running under strict CSP?** Import `'pixi.js/unsafe-eval'`. See the `pixijs-environments` skill.

## Quick concepts

### Renderer = systems + pipes

Each renderer is composed of `Systems` (lifecycle services: textures, buffers, state, filters, masks) and `RenderPipes` (per-renderable instruction builders: sprite, graphics, mesh, particle, text, tiling). Writing a custom renderable means implementing a `RenderPipe` and registering it via extensions.

### The render loop

`app.ticker.add(fn)` registers a callback that runs every frame. The `TickerPlugin` registers `app.render()` at `UPDATE_PRIORITY.LOW`, so ticker callbacks at `NORMAL` or `HIGH` run before the draw. Disable the plugin with `autoStart: false` for manual control.

### Environments

`DOMAdapter` abstracts every DOM call PixiJS makes (canvas creation, image loading, fetch, XML parsing). Swap with `DOMAdapter.set(WebWorkerAdapter)` for Workers or implement a custom `Adapter` for Node/SSR. Must be done before `Application.init`.

## Common Mistakes

### [HIGH] Accessing app.renderer before init() resolves

Wrong:

```ts
const app = new Application();
app.init({ width: 800, height: 600 });
console.log(app.renderer.name); // undefined — init() is async
```

Correct:

```ts
const app = new Application();
await app.init({ width: 800, height: 600 });
console.log(app.renderer.name); // 'webgl' | 'webgpu' | 'canvas'
```

`Application.init()` is async. `app.renderer`, `app.canvas`, and `app.screen` do not exist until after the promise resolves.

### [HIGH] Setting DOMAdapter after Application.init

Wrong:

```ts
const app = new Application();
await app.init({ width: 800, height: 600 });
DOMAdapter.set(WebWorkerAdapter); // too late — init already allocated resources
```

Correct:

```ts
DOMAdapter.set(WebWorkerAdapter);
const app = new Application();
await app.init({ width: 800, height: 600 });
```

The adapter abstracts DOM calls the renderer makes during construction (canvas creation, image loading, fetch). Swap it before `init()` or the wrong adapter is baked into the renderer.

### [MEDIUM] Treating `preference` as a guarantee

Wrong:

```ts
await app.init({ preference: "webgpu" });
// assume WebGPU is active
useWebGPUOnlyFeature(app.renderer);
```

Correct:

```ts
await app.init({ preference: "webgpu" });
if (app.renderer.name === "webgpu") {
  useWebGPUOnlyFeature(app.renderer);
}
```

`preference` is a hint, not a demand. If the browser lacks WebGPU support, PixiJS falls back to WebGL (or Canvas). Always branch on `renderer.name` for backend-specific code.

## API Reference

- [autoDetectRenderer](https://pixijs.download/release/docs/rendering.autoDetectRenderer.html.md)
- [AbstractRenderer](https://pixijs.download/release/docs/rendering.AbstractRenderer.html.md)
- [WebGLRenderer](https://pixijs.download/release/docs/rendering.WebGLRenderer.html.md)
- [WebGPURenderer](https://pixijs.download/release/docs/rendering.WebGPURenderer.html.md)
- [CanvasRenderer](https://pixijs.download/release/docs/rendering.CanvasRenderer.html.md)
- [Application](https://pixijs.download/release/docs/app.Application.html.md)
- [DOMAdapter](https://pixijs.download/release/docs/environment.DOMAdapter.html.md)
