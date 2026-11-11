# performance

FPS, draw calls and GPU memory: teardown, texture GC, `PrepareSystem`, `cacheAsTexture`, batching, culling, filter cost and low-level GPU wins.

## Teardown and memory

```ts
declare const badge: Container;

const sprite = new Sprite(await Assets.load<Texture>("character.png"));
sprite.destroy(); // keeps the texture for other sprites
await Assets.unload("character.png"); // once nothing uses it: drops the cache entry and the GPU texture

const baked = new Sprite(app.renderer.generateTexture(badge));
baked.destroy({ texture: true, textureSource: true }); // a texture you created and nothing else uses
```

Destroy options (`{ children: true }` vs `destroy(true)`) are in [scene-container](scene-container.md#destroy). Objects you build for custom rendering clean up the same way: call `geometry.destroy()` and `renderTarget.destroy()` on the ones you create. Destroying a container also destroys the batchers cached for its render group. Tear down an app you will re-create in the same tab with `app.destroy({ releaseGlobalResources: true })`; see [application](application.md#lifecycle-construct-init-render-destroy).

Destroying many textures in one frame causes a visible freeze; spread it across frames (e.g. 5 per frame from a ticker callback). Pool frequently spawned objects (toggle `visible`, reset properties) rather than destroying and recreating them.

### Texture garbage collection

`GCSystem` auto-collects unused textures and GPU resources (including WebGPU bind groups). Defaults, in milliseconds: checks every 30 000, removes resources idle for 60 000. Tune them on init; the `textureGC.*` properties are deprecated since 8.15.0:

```ts
await app.init({ gcActive: true, gcMaxUnusedTime: 120_000, gcFrequency: 60_000 });
```

`texture.source.unload()` releases a texture's GPU memory immediately.

### PrepareSystem

`renderer.prepare` exists only after `import "pixi.js/prepare"`: it is not in the default bundle, so always import it explicitly. Without it, textures upload on first render and the frame hitches.

```ts
import "pixi.js/prepare";

app.stop();
await app.renderer.prepare.upload(app.stage); // a Container (textures, text, graphics in the subtree) or individual resources
app.start();
```

## Render groups for large or panning scenes

A large world that pans, or a UI layer that slides or fades as a whole, goes in a `new Container({ isRenderGroup: true })`: moving its root costs one matrix, children stay sharp and can animate, unlike `cacheAsTexture`. Use a few large groups, not one per object. See [render-groups](scene-core-concepts/render-groups.md).

## cacheAsTexture for performance

`cacheAsTexture()` renders a container's subtree to one texture (internally it creates a render group), cutting draw calls for many static children, expensive filters, or large subtrees that rarely change.

```ts
panel.cacheAsTexture(true); // or cacheAsTexture({ resolution: 2, antialias: true })
panel.updateCacheTexture(); // required after modifying children
panel.destroy(); // releases the cached texture; no cacheAsTexture(false) needed first
```

It costs GPU memory for the texture. Toggling it on and off re-caches each time, and caching a sparse container gains little. Combining it with masks is fragile ([masking](scene-core-concepts/masking.md)). Keep cached containers under the GPU's max texture size (typically 4096 or larger; textures over 4096px on either axis fail on some mobile GPUs). No PixiJS property exposes the limit; query the backend:

```ts
const maxTextureSize = renderer.name === "webgpu"
  ? (renderer as WebGPURenderer).gpu.device.limits.maxTextureDimension2D
  : (renderer as WebGLRenderer).gl.getParameter(WebGL2RenderingContext.MAX_TEXTURE_SIZE);
```

## Batching optimization

Sprites, small Graphics, small Meshes (100 vertices or fewer), Text and BitmapText all share the default batcher, so mixing those types in the child order does **not** break a batch in v8. Batch breaks occur on:

- More distinct texture sources than the per-batch limit (`renderer.limits.maxBatchableTextures`, typically 16); spritesheet frames share one source.
- A blend mode change: `add / normal / add / normal` children cost 4 draw calls, `normal / normal / add / add` cost 2. Group by blend mode.
- A topology change.
- A non-batchable object: filters, masks, `ParticleContainer`, a custom-shader `Mesh`/`Graphics`, a large Graphics or Mesh, a render group boundary.

Name half-resolution sheets with the `@0.5x` suffix so PixiJS auto-scales them.

Per-frame strings belong in `BitmapText`; update costs per text class are in [scene-text](scene-text.md#update-cost-comparison). `text.resolution = 1` lowers a `Text`'s GPU memory on high-DPI displays.

### Graphics

A Graphics is fastest when its shape doesn't change (transforms, alpha and tint are fine). It batches like a Sprite while its tessellated geometry stays under 200 vertices (curves and strokes add many); `context.batchMode = 'batch' | 'no-batch'` forces either way. Bake complex static Graphics into a texture:

```ts
declare const complex: Graphics;
const sprite = new Sprite(app.renderer.generateTexture(complex));
// The texture is cropped to the local bounds: restore the offset.
const b = complex.getLocalBounds();
sprite.position.set(complex.x + b.x, complex.y + b.y);
```

When only vector shapes need smooth edges, `SmoothGraphics` anti-aliases them in the shader and lets the app keep `antialias: false`; see [smooth-graphics](scene-graphics/smooth-graphics.md#performance) for its batching costs.

## Culling

Nothing is culled by default: `cullable = true` only marks an object as eligible. Culling runs when the `CullerPlugin` is registered (it culls `app.stage` before every render) or when you call `Culler.shared.cull(...)` yourself:

```ts
declare const uiRoot: Container;
extensions.add(CullerPlugin); // before Application.init
await app.init({ culler: { updateTransform: true } }); // cull with this frame's transforms

sprite.cullable = true;
// Optional: a rectangle in the object's own local space (not the view) tested instead of
// its measured global bounds; saves per-frame bounds calculation.
sprite.cullArea = new Rectangle(0, 0, 800, 600);

uiRoot.cullableChildren = false; // don't recurse into a static, always-visible subtree

// Or cull manually without the plugin; false = recompute transforms now
Culler.shared.cull(app.stage, app.renderer.screen, false);
```

Both paths use the world transforms from the previous render unless told otherwise: the plugin by default, and `Culler.shared.cull(container, rect)` because its third argument `skipUpdateTransform` defaults to `true`. Culling then lags one frame: before the first render nothing off-screen is culled, and an object moving into view stays culled (invisible) for a frame. Pass `culler: { updateTransform: true }` to `app.init` (`updateTransform: false` behaves like the default), and `false` as the third argument of a manual `cull`.

Cull when GPU-bound; when CPU-bound the per-object bounds check adds overhead.

## Filters, masks and hit testing

- Set `container.filterArea = new Rectangle(x, y, w, h)` when you know the bounds; otherwise PixiJS measures bounds every frame.
- Release filter memory with `container.filters = null`.
- Full-screen filter textures are pooled at screen size, but padding (the `BlurFilter` default) pushes the request past the screen and up to the next power of two. Set `blur.repeatEdgePixels = true` (a property, not a constructor option) on full-screen blurs to keep them screen-sized.
- Graphics/Container masks use the stencil buffer, Sprite masks a filter pass ([masking](scene-core-concepts/masking.md)); hundreds of masks are slow regardless of type, so put one shared mask on a parent instead of one per child.
- `interactiveChildren = false` on containers with no interactive children, and a `hitArea` on large containers, skip recursive hit testing.

## Low-level GPU wins

```ts
declare const buffer: Buffer;
declare const bufferImageSource: BufferImageSource;
declare const changedBytes: number, offsetBytes: number;

// single-pass antialiased render texture: also discard its MSAA depth/stencil at end of pass
const rt = RenderTexture.create({ width: 1024, height: 1024, antialias: true, transient: true });

// upload only the changed byte range of a large buffer (also works on WebGL)
buffer.update(changedBytes, offsetBytes);

// upload only a texel range of a data texture (end is exclusive)
bufferImageSource.update(100, 116);
```

On a tile-based WebGPU GPU (`renderer.device.extensions.tileBased`: every phone GPU and Apple silicon) the multisample colour buffer of every antialiased target is already discarded instead of written back, and a pass that reopens the target restores it from the resolved image; the buffer may not be allocated at all when `renderer.device.extensions.transientAttachment` is true. `transient: true` additionally discards the multisample depth/stencil buffer, and the colour buffer on other GPUs. Only use it on textures rendered in a single pass and never re-entered with `clear: false` or wrapped by a filter or mask. For static custom draw sequences on WebGPU, record a render bundle once and replay it each frame; see [custom-rendering](custom-rendering.md).
