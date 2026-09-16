---
title: Overview
category: rendering
description: Learn how PixiJS renderers draw scenes using WebGL, WebGPU, and Canvas 2D, including renderer selection, systems, and render targets.
children:
  - ./textures.md
---

# Rendering

PixiJS renderers draw your scene to a canvas using **WebGL/WebGL2**, **WebGPU**, or the **Canvas 2D** API. They're GPU-accelerated engines composed of modular systems that manage texture uploads, rendering pipelines, and more.

All renderers inherit from a common base, providing consistent methods like `.render()`, `.resize()`, and `.clear()`, along with shared systems for canvas management, texture GC, and events.

## Renderer types

| Renderer         | Description                                                       | Status          |
| ---------------- | ----------------------------------------------------------------- | --------------- |
| `WebGLRenderer`  | Default renderer using WebGL/WebGL2. Stable and widely supported. | Recommended     |
| `WebGPURenderer` | Uses the WebGPU API. Faster in many cases, still maturing.        | Experimental    |
| `CanvasRenderer` | Fallback renderer using the HTML Canvas 2D context.               | Experimental    |

> [!NOTE]
> The WebGPU renderer is feature-complete, but inconsistencies in browser implementations may cause unexpected behavior. Use the WebGL renderer for production applications.

## Creating a renderer

Use `autoDetectRenderer()` to pick the best renderer for the current environment:

```ts
import { autoDetectRenderer } from 'pixi.js';

const renderer = await autoDetectRenderer({
    preference: 'webgpu', // or 'webgl' or 'canvas'
});

// Only allow specific renderers (acts as a blocklist for any type not listed)
const renderer = await autoDetectRenderer({
    preference: ['webgl', 'canvas'], // webgpu is excluded entirely
});
```

Or construct one directly when you need a specific renderer type (e.g., for testing or when you know the target environment):

```ts
import { WebGLRenderer } from 'pixi.js';

const renderer = new WebGLRenderer();
await renderer.init(options);
```

> [!NOTE]
> Most applications should use `autoDetectRenderer()` and let PixiJS pick the best backend. Use direct construction only when you have a specific reason.

Both paths run the same `init()`: environment extensions load first, then any `WebGLLoader`/`WebGPULoader`/`CanvasLoader` extensions registered for that backend are awaited, and only then are the renderer's systems and pipes created. See the [extensions guide](../../extensions/__docs__/extensions.md) for registering a loader.

## Rendering a scene

Call `render()` with a `Container` to draw it to the screen:

```ts
import { Container } from 'pixi.js';

const container = new Container();
renderer.render(container);
```

You can also pass an options object for more control:

```ts
import { Matrix } from 'pixi.js';

renderer.render({
    container: myContainer,
    clear: true,
    transform: new Matrix(),
});
```

The `container` property is the scene root to draw. `target` is a separate property that specifies a render destination (e.g., a {@link RenderTexture}).

### Flipping the output (advanced)

By default a texture render is stored in PixiJS's Y-down orientation, which the 2D pipeline samples upright but 3D UV conventions read upside down. Pass `flipY: true` to invert the Y orientation of the render. Back-face culling stays correct because the winding order flips together with the projection. The default is `false` and leaves existing renders unchanged on both WebGL and WebGPU.

```ts
renderer.render({
    container: scene3d,
    target: renderTexture,
    flipY: true,
});
```

## Rendering to mip levels (advanced)

When rendering to a texture-backed target, you can specify `mipLevel` to render into a specific mip level of the target's underlying texture storage. Most applications won't need this; it's useful for custom LOD (level of detail) systems or manual mipmap generation.

```ts
import { RenderTexture } from 'pixi.js';

const rt = RenderTexture.create({
    width: 256,
    height: 256,
    mipLevelCount: 4,
    autoGenerateMipmaps: false,
});

// Render into mip 1 (128x128)
renderer.render({
    container,
    target: rt,
    mipLevel: 1,
});
```

If your `target` is a {@link Texture} with a `frame` (e.g. an atlas sub-texture), that frame is interpreted in **mip 0** pixel space and is scaled/clamped when rendering to `mipLevel > 0`.

## Render targets (advanced)

Every texture you render to gets a {@link RenderTarget} behind the scenes. Create one yourself when you need multiple color attachments, an explicit depth or stencil texture, or per-attachment load and store behavior.

```ts
import { RenderTarget, TextureSource } from 'pixi.js';

const color = new TextureSource({ width: 512, height: 512 });
const depth = new TextureSource({ width: 512, height: 512, format: 'depth24plus-stencil8' });

const target = new RenderTarget({
    colorAttachments: [{ texture: color, loadOp: 'clear', clearValue: [0, 0, 0, 1] }],
    depthStencilAttachment: { texture: depth, depthLoadOp: 'clear', depthClearValue: 1 },
});

renderer.render({ container, target });
```

The attachment objects mirror the WebGPU render pass descriptors, with `texture` in place of `view`. The `clear` option you pass to `render()` overrides the attachments' load ops for that call. The older `colorTextures`, `depth`, `stencil`, and `depthStencilTexture` options still work and are converted to attachments internally.

### Depth-only targets

Pass `colorTextures: 0` with `depth: true`, or hand a depth-format `TextureSource` to `depthStencilTexture`. Rendering directly to a depth-format `TextureSource` also works; PixiJS wraps it in a depth-only target.

```ts
const shadowMap = new RenderTarget({ width: 1024, height: 1024, colorTextures: 0, depth: true });
```

Supported depth and stencil formats are `stencil8`, `depth16unorm`, `depth24plus`, `depth24plus-stencil8`, `depth32float`, and `depth32float-stencil8`. A depth-only format cannot be used for stencil masks.

### Binding targets directly

Custom rendering code binds surfaces through `renderer.renderTarget`. Pass an options object; the positional form is deprecated since 8.20.0 and warns once.

```ts
import { CLEAR } from 'pixi.js';

// bind: replaces the current binding
renderer.renderTarget.bind({ target: renderTexture, clear: true, clearColor: [0, 0, 0, 0] });

// push/pop: save and restore the previous binding
renderer.renderTarget.push({ target: scratch, clear: CLEAR.COLOR, mipLevel: 1 });
// ... draw ...
renderer.renderTarget.pop(); // returns the restored RenderTarget, throws if the stack is empty

// capture and replay a binding without clearing it
const saved = renderer.renderTarget.getBindState();
renderer.renderTarget.bind({ target: scratch, clear: true });
renderer.renderTarget.bind(saved);
```

Available options are `target`, `clear`, `clearColor`, `frame` (in mip 0 pixel space), `mipLevel`, `layer`, and `flipY`. Binding the same target again with no clear reuses the open render pass and only updates the viewport.

### Copying between targets

```ts
// copy color pixels from any texture, canvas, or render target into a texture
renderer.renderTarget.copyToTexture(source, destTexture, { x: 0, y: 0 }, { width: 256, height: 256 }, { x: 0, y: 0 });

// copy the depth attachment into a depth-format texture (WebGL2 and WebGPU)
renderer.renderTarget.copyDepthTexture(sourceTarget, destDepthTexture, { x: 0, y: 0 }, { width: 256, height: 256 });

// then render into the destination without clearing the copied depth
renderer.render({ container, target: destTarget, clear: CLEAR.COLOR });
```

`copyDepthTexture` warns and does nothing when the source has no depth attachment or the destination texture is not a depth or stencil format. Clear only the color buffer afterwards, or the copied depth is lost.

When writing 3D code that needs to know the resolved winding of the current target, read `renderer.renderTarget.frontFaceInverted` instead of deriving it from `flipY`, `isRoot`, and the backend.

### Destroying targets

A `RenderTarget` you construct is yours to destroy. `destroy()` emits a `destroy` event before the attachments are released, and every renderer that drew into the target frees the framebuffers, renderbuffers, and MSAA textures it built for it. Destroying the renderer frees those backend objects as well, without destroying your target.

```ts
import { RenderTarget } from 'pixi.js';

const target = new RenderTarget({ colorTextures: [texture] });

renderer.render({ container, target });

target.destroy(); // the GPU objects built for it go with it
```

## WebGPU-only features (advanced)

These have no effect on the WebGL renderer. Branch on `renderer.name === 'webgpu'` before relying on them.

### Shader override constants

WGSL `override` declarations can be set per shader without recompiling the source. Values are baked into the pipeline, so each distinct set of overrides creates a separate pipeline. Keep the number of combinations small.

```ts
import { Shader } from 'pixi.js';

const shader = Shader.from({
    gpu: { vertex: { source, entryPoint: 'vsMain' }, fragment: { source, entryPoint: 'fsMain' } },
    resources: { uniforms },
    overrides: { BLUR_STEPS: 8 },
});
```

Browsers without pipeline constant support (Safari) get the values substituted into the source instead. `renderer.limits.supportsOverrideConstants` reports which path is in use.

### Render bundles

A render bundle records a sequence of draw calls once and replays them on later frames, cutting CPU cost for static content drawn through `renderer.encoder`. A bundle bakes the render target it was recorded against, so check it before replaying and re-record when the check fails.

```ts
let bundle;

if (!bundle || !renderer.encoder.isBundleValid(bundle)) {
    renderer.encoder.beginBundle('static-props');
    renderer.encoder.draw({ geometry, shader, state });
    bundle = renderer.encoder.endBundle();
}

renderer.encoder.executeBundle(bundle);
```

Pass an array to `executeBundle` to replay several bundles in one call. A bundle is also invalid after a WebGPU device loss, because it was recorded on the device that was lost; `isBundleValid` reports that too.

### Transient MSAA render textures

An antialiased render texture that is drawn in a single pass and never loaded back can mark its multisample buffer as scratch memory. Set `transient: true` when creating it; PixiJS then discards the MSAA buffer at the end of the pass, and tile-based GPUs skip allocating it entirely where the browser supports `GPUTextureUsage.TRANSIENT_ATTACHMENT`. Do not set it on a texture that is rendered into again with `clear: false`, or on one used with filters.

```ts
import { RenderTexture } from 'pixi.js';

const rt = RenderTexture.create({ width: 1024, height: 1024, antialias: true, transient: true });
```

`renderer.device.extensions.transientAttachment` reports whether the usage bit is available.

### Device loss

When the browser reports the GPU device as lost (a GPU process crash, for example), the WebGPU renderer requests a new adapter and device, runs `contextChange` on every system, and recreates textures, buffers, shader modules, pipelines, and bind groups on the next render. `Text` and `HTMLText` regenerate their textures. You do not need to handle it yourself. The one thing that cannot survive is a render bundle recorded on the old device: `renderer.encoder.isBundleValid(bundle)` returns `false` for it, so re-record it as you would after a render target change.

A device you hand in through the `gpu` option belongs to the engine that created it, so PixiJS neither restores nor destroys it. A device PixiJS created is destroyed by `renderer.destroy()`.

The WebGL renderer already restores itself after `webglcontextlost` / `webglcontextrestored`; `Text` and `HTMLText` regenerate their textures there too.

## Resizing the renderer

```ts
renderer.resize(window.innerWidth, window.innerHeight);
```

## Generating textures

Create textures from any display object with `generateTexture()`:

```ts
import { Sprite } from 'pixi.js';

const sprite = new Sprite();
const texture = renderer.generateTexture(sprite);
```

## Resetting state

When mixing PixiJS with other WebGL/WebGPU libraries (e.g., Three.js), each library may leave GPU state (bound textures, blend modes, active shaders) that conflicts with the other. Call `resetState()` before each library renders to avoid visual glitches, missing objects, or incorrect blending:

```ts
function render() {
    threeRenderer.resetState();
    threeRenderer.render(scene, camera);

    pixiRenderer.resetState();
    pixiRenderer.render({ container: stage });

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
```

## Destroying renderers

Call `destroy()` to clean up all GPU resources, systems, event listeners, and internal state:

```ts
renderer.destroy();
```

This removes all `EventEmitter` listeners attached to the renderer and nullifies internal systems and pipes. On WebGPU it also destroys the `GPUDevice` the renderer created (a device passed in through the `gpu` option is left alone). A destroyed renderer cannot be used for further rendering.

---

## API reference

- {@link AbstractRenderer}
- {@link WebGLRenderer}
- {@link WebGPURenderer}
- {@link CanvasRenderer}
- {@link autoDetectRenderer}
- {@link ExtractSystem}
- {@link GenerateTextureSystem}
- {@link RenderTexture}
- {@link Texture}
- {@link RenderTarget}
- {@link RenderTargetSystem}
- {@link TextureView}
- {@link ShaderOverrides}
- {@link GpuEncoderSystem}
- {@link RenderBundle}
