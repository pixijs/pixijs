# renderers

Choosing WebGL, WebGPU or Canvas; `renderer.render()` options and render targets; `generateTexture`; interop and context loss.

`WebGLRenderer` (WebGL2) is the production choice and the default. `WebGPURenderer` is feature-complete but experimental; browser implementations have inconsistencies. `CanvasRenderer` is a last-resort 2D backend with a reduced feature set. `autoDetectRenderer` (called by `app.init`) picks one from `preference`.

## Preference forms

```ts
import type { Application } from "pixi.js";

declare const app: Application;

await app.init({ preference: "webgpu" }); // string: try webgpu first, then the default order
await app.init({ preference: ["webgpu", "webgl"] }); // array: only these, in this order
await app.init({ preference: ["webgl"] }); // never webgpu or canvas
```

- Default order with `preference` unset: `webgl`, `webgpu`, `canvas`.
- A string is a hint: it falls through to the default order when that backend is unavailable, so check the result before using backend-specific features.
- An array excludes every backend not listed. `["webgpu"]` alone fails init on browsers without WebGPU; list `"webgl"` after it unless WebGPU support is verified upstream.
- Renderer-specific options go in `webgl`, `webgpu` or `canvasOptions` and apply only when that renderer is selected; see [application-options](../application/application-options.md#per-renderer-overrides).

## Checking the backend

```ts
import { isWebGLSupported, isWebGPUSupported, WebGPURenderer, type Renderer } from "pixi.js";

declare const renderer: Renderer;

if (await isWebGPUSupported()) {
  // safe to prefer webgpu
}
const hasWebGL = isWebGLSupported();

if (renderer instanceof WebGPURenderer) {
  renderer.device.extensions.transientAttachment; // PixiJS uses GPUTextureUsage.TRANSIENT_ATTACHMENT
  renderer.limits.supportsOverrideConstants; // pipeline constants vs. source-baked overrides
}
```

`isWebGPUSupported()` is async; `isWebGLSupported()` is sync. Branch on `renderer.name` (`'webgl' | 'webgpu' | 'canvas'`); `renderer.type` is a numeric id for internal dispatch. `name` is typed `string`, so `renderer.name === "webgpu"` does not narrow `Renderer`; use `instanceof WebGPURenderer` (or a cast) before touching WebGPU-only systems.

## What the Canvas renderer skips

The Canvas renderer has no filters, no masks beyond basic clipping, no compressed textures and no custom shaders, and these fail quietly: built-in filters are skipped with a console warning, and `Mesh` (including `MeshPlane`, `MeshRope`, `PerspectiveMesh`) draws nothing, with no error. Target WebGL or WebGPU when you need those.

## Systems and pipes

Each renderer is a set of `System`s (per-renderer lifecycle services: textures, buffers, state, events, filters, masks) and `RenderPipe`s (per-renderable instruction builders, one per type: sprite, graphics, mesh, particle, text, tiling-sprite, run every frame). A custom renderable is a `RenderPipe` plus a `BatchableX` class, both registered via extensions; see [custom-rendering](../custom-rendering.md).

### Lazy-loading backend-specific systems and pipes

Systems and pipes that only one backend needs can stay out of the main bundle. Register a renderer loader (`ExtensionType.WebGLLoader`, `ExtensionType.WebGPULoader`, or `ExtensionType.CanvasLoader`) whose `load()` dynamic-imports the module that registers them. During `init`, the renderer awaits every loader for its own backend after the environment extensions load and before it creates its systems and pipes; loaders for other backends never run.

```ts
import { extensions, ExtensionType } from "pixi.js";

extensions.add({
  extension: { type: ExtensionType.WebGLLoader, name: "my-plugin" },
  load: () => import("./gl/register"), // registers WebGL systems and pipes on import
});
```

Loader names are unique per backend; a second loader with the same name is ignored. Loaders run concurrently; registered systems and pipes are ordered by their own `priority`, not by loader completion. `skipExtensionImports: true` skips loaders too, so custom builds import backend modules directly.

## Direct renderer construction

```ts
import { WebGLRenderer } from "pixi.js";

const renderer = new WebGLRenderer();
await renderer.init({ width: 800, height: 600 });
```

Like `Application`, a renderer constructed directly (tests, tooling, editors) takes its options in the async `init()`.

## `renderer.render()` options

```ts
import { Matrix, type Container, type Renderer, type RenderTexture } from "pixi.js";

declare const renderer: Renderer;
declare const stage: Container;
declare const renderTexture: RenderTexture;

renderer.render(stage); // shorthand

renderer.render({ container: stage, clear: true, transform: new Matrix() });

// into a mip level, array layer, cube face or 3D slice of a texture
renderer.render({ container: stage, target: renderTexture, mipLevel: 1, layer: 0 });

// store the capture in screen orientation (for 3D UVs)
renderer.render({ container: stage, target: renderTexture, flipY: true });
```

`container` is the scene root; `target` is a separate destination such as a `RenderTexture`. `mipLevel > 0` serves custom LOD or manual mipmap generation. `flipY` defaults to `false`; set it to store a texture render un-flipped, with winding adjusted so back-face culling still works. `layer` selects an array layer, a cube face, or a depth slice of a 3D `TextureSource` (`depth`); pass the source itself as `target`.

## Render targets

```ts
import { CLEAR, RenderTarget, Texture, TextureSource, type Container, type Renderer } from "pixi.js";

declare const renderer: Renderer;
declare const container: Container;

const depthSource = new TextureSource({ width: 512, height: 512, format: "depth24plus-stencil8" });

const target = new RenderTarget({
  colorAttachments: [{ texture: new TextureSource({ width: 512, height: 512 }), clearValue: [0, 0, 0, 1] }],
  depthStencilAttachment: { texture: depthSource, depthLoadOp: "clear" },
});

renderer.render({ container, target });

// bind directly from custom render code; always use the options object
renderer.renderTarget.push({ target, clear: CLEAR.COLOR, mipLevel: 0 });
renderer.renderTarget.pop();

const saved = renderer.renderTarget.getBindState();
renderer.renderTarget.bind(saved); // replays without clearing

// copy the depth attachment into another depth-format texture (WebGL2 and WebGPU)
const depthCopy = new Texture({
  source: new TextureSource({ width: 512, height: 512, format: "depth24plus-stencil8" }),
});
renderer.renderTarget.copyDepthTexture(target, depthCopy, { x: 0, y: 0 }, { width: 512, height: 512 });
```

- `RenderTarget` takes WebGPU-style `colorAttachments`/`depthStencilAttachment` or the older `colorTextures`/`depth`/`stencil`/`depthStencilTexture` options. `colorTextures: 0` with `depth: true` makes a depth-only target.
- A target's color attachments can each have their own format (`rgba16float`, `rg16float`, `r32uint`, ...). A draw writes only the attachments its shader has outputs for; integer attachments never blend and can't be antialiased. The bind's `clear` decides whether anything clears; an attachment with `loadOp: "load"` keeps its contents anyway, and `clear: false` never clears. See [advanced-gpu](../custom-rendering/advanced-gpu.md#several-color-attachments) for writing several outputs.
- Positional `bind(target, clear, ...)` and `push(...)` are deprecated since 8.20.0. `pop()` throws when the stack is empty.
- `copyDepthTexture` needs WebGL2 or WebGPU and a depth-format destination. The next render into the destination target must clear color only (`clear: CLEAR.COLOR`), or the copied depth is lost.
- Destroy a target you constructed with `target.destroy()`; the renderer releases the GPU objects it built for it. An antialiased texture you passed in keeps its multisample memory until you destroy or unload the texture.

## Generating a texture from a container

```ts
import { Graphics, Rectangle, Sprite, type Renderer } from "pixi.js";

declare const renderer: Renderer;

const panel = new Graphics().roundRect(0, 0, 30, 30, 6).fill(0x3355ff);

const texture = renderer.generateTexture(panel); // 30x30, the panel's local bounds

const padded = renderer.generateTexture({
  target: panel,
  frame: new Rectangle(-10, -10, 50, 50), // local-space region; 10px margin on each side
  resolution: 2, // default: renderer.resolution
  antialias: true,
  clearColor: [0, 0, 0, 0], // default: transparent
  textureSourceOptions: { scaleMode: "nearest" },
});

const sprite = new Sprite(padded);
// when done: padded.destroy(true)
```

- Only the target's contents are captured, in its local space: its own `position`, `scale`, `rotation` and its parents are ignored. A 30x30 Graphics with `scale = 2` still gives a 30x30 texture; to bake a scale in, wrap the object in a `Container` and pass the wrapper, or raise `resolution`.
- `frame` must be a `Rectangle` instance. A plain `{ x, y, width, height }` fails TypeScript and throws `copyTo is not a function` at runtime. Without `frame` the region is the target's local bounds; width and height are truncated to integers.
- The texture's resolution defaults to the renderer's, so on a `resolution: 2` renderer it holds 2x the pixels while `texture.width` stays in logical units.
- The result is a new `RenderTexture` you own; destroy it with `texture.destroy(true)` when nothing uses it.

## Interop with other GPU libraries

```ts
import type { Container, Renderer } from "pixi.js";

declare const pixiRenderer: Renderer;
declare const stage: Container;
declare const threeRenderer: { resetState(): void; render(scene: unknown, camera: unknown): void };
declare const scene: unknown;
declare const camera: unknown;

threeRenderer.resetState();
threeRenderer.render(scene, camera);

pixiRenderer.resetState();
pixiRenderer.render({ container: stage });
```

Call each library's `resetState()` before it renders. Both leave GPU state (bound textures, blend modes, active shaders) that conflicts with the other; without it, objects disappear or blend incorrectly.

### Context and device loss

```ts
import { WebGPURenderer, type RenderBundle, type Renderer } from "pixi.js";

declare const renderer: Renderer;
declare let bundle: RenderBundle;
declare function record(): RenderBundle;

// both renderers recover on their own; only WebGPU render bundles need re-recording
if (renderer instanceof WebGPURenderer && !renderer.encoder.isBundleValid(bundle)) {
  bundle = record();
}
```

The WebGL renderer restores itself after `webglcontextrestored`. The WebGPU renderer requests a new device when the browser reports `GPUDevice.lost` and rebuilds its GPU resources on the next render. A device you pass through the WebGPU `gpu` option is neither restored nor destroyed by PixiJS. A render bundle recorded on a lost device fails `isBundleValid` and must be re-recorded.
