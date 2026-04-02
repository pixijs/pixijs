---
name: performance
description: >
  Optimize PixiJS applications for frame rate and GPU memory. Destroy
  patterns: cacheAsTexture(false) before destroy, releaseGlobalResources
  on app destroy. GCSystem configuration (time-based garbage collection). PrepareSystem for GPU
  upload. Object pooling over destroy/recreate. Batching: group similar
  object types to reduce draw calls. Spritesheets over individual
  textures. BitmapText over Text for dynamic content (scores, timers).
  Graphics performance: small shapes batch, complex shapes to textures.
  Culling for off-screen objects. Resolution and antialias tradeoffs.
  Use when the user asks about frame rate, FPS drops, memory leaks, GPU
  memory, draw calls, batching, object pooling, texture garbage collection,
  cacheAsTexture, destroy patterns, PrepareSystem, culling, performance
  optimization, lag, jank, or slow rendering. Covers GCSystem,
  PrepareSystem, Culler, CullerPlugin, cacheAsTexture.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  requires: "pixijs, core-concepts"
  sources: "pixijs/pixijs:src/__docs__/concepts/performance-tips.md, pixijs/pixijs:src/__docs__/concepts/garbage-collection.md, pixijs/pixijs:src/prepare/PrepareSystem.ts"
---

## When to Use This Skill

Apply when the user needs to optimize frame rate, reduce GPU memory usage, fix memory leaks, minimize draw calls, implement object pooling, or troubleshoot rendering performance in a PixiJS application.

**Related skills:** For container hierarchy and destroy options use **core-concepts**; for render groups and culling setup use **scene-management**; for dynamic text performance use **text**; for spritesheet atlasing use **spritesheet**; for custom batching use **custom-rendering**.

This skill builds on pixijs and core-concepts. Read them first.

## Setup

Profile before optimizing. PixiJS handles a lot of content well out of the box. Use browser DevTools Performance tab and GPU profiling to identify actual bottlenecks before applying any of these patterns.

## Core Patterns

### Proper destroy with cleanup

```ts
import { Sprite, Assets } from 'pixi.js';

const texture = await Assets.load('character.png');
const sprite = new Sprite(texture);

// Destroy sprite only (preserve texture for reuse)
sprite.destroy();

// Destroy sprite AND its texture
sprite.destroy({ children: true, texture: true, textureSource: true });
```

When done with a loaded asset entirely:

```ts
Assets.unload('character.png');
```

This removes it from the cache and unloads the GPU resource.

### Application destroy/recreate cycle

```ts
import { Application } from 'pixi.js';

// Correct destroy that cleans global pools
app.destroy({ releaseGlobalResources: true });

const newApp = new Application();
await newApp.init({ width: 800, height: 600 });
```

Without `releaseGlobalResources: true`, pooled objects (batches, textures) from the old app leak into the new one, causing flickering and corruption.

### Texture garbage collection

PixiJS auto-collects unused textures and GPU resources via `GCSystem`. Defaults: checks every 30 seconds, removes resources idle for 60 seconds. These are time-based (milliseconds).

```ts
import { Application } from 'pixi.js';

const app = new Application();

await app.init({
    gcActive: true,
    gcMaxUnusedTime: 120000, // idle time before cleanup in ms (default: 60000)
    gcFrequency: 60000,      // check interval in ms (default: 30000)
});
```

For manual control:

```ts
texture.source.unload(); // immediate GPU memory release
```

### PrepareSystem for GPU upload

Upload textures and graphics to GPU before rendering to avoid first-frame hitches:

```ts
import 'pixi.js/prepare';
import { Application, Assets } from 'pixi.js';

const app = new Application();
await app.init();

// Don't render until assets are uploaded
app.stop();

const texture = await Assets.load('large-scene.png');

// Upload to GPU ahead of time
await app.renderer.prepare.upload(app.stage);

// Now rendering won't hitch on first frame
app.start();
```

`prepare.upload()` accepts a Container (uploads all textures, text, and graphics in the subtree) or individual resources.

### cacheAsTexture for performance

`cacheAsTexture()` renders a container's subtree to a single texture, reducing draw calls for complex static content. Internally it creates a render group and caches the result.

**When to use:**
- Many static children (UI panels, decorative backgrounds, complex Graphics)
- Containers with expensive filters (cache the filter result)
- Large subtrees that rarely change

**Tradeoffs:**
- Uses GPU memory for the cached texture (larger containers = more memory)
- Max texture size is GPU-dependent (typically 4096x4096; check `renderer.texture.maxTextureSize`)
- Must call `updateCacheTexture()` after modifying children
- Combining with masks is fragile (see the masking skill)

```ts
import { Container, Sprite } from 'pixi.js';

const panel = new Container();
// ... add many static children ...

panel.cacheAsTexture(true);

// With options
panel.cacheAsTexture({ resolution: 2, antialias: true });

// Refresh after changes
panel.updateCacheTexture();

// MUST disable before destroying (see Common Mistakes below)
panel.cacheAsTexture(false);
panel.destroy();
```

**Avoid:** toggling on/off repeatedly (constant re-caching negates benefits), caching sparse containers (negligible gain), caching containers larger than 4096x4096.

### Object recycling

Reuse objects by changing their properties instead of destroy/recreate:

```ts
import { Sprite, Container, Texture } from 'pixi.js';

class BulletPool {
    private _pool: Sprite[] = [];
    private _container: Container;

    constructor(container: Container) {
        this._container = container;
    }

    public get(texture: Texture): Sprite {
        let bullet = this._pool.pop();

        if (!bullet) {
            bullet = new Sprite(texture);
            this._container.addChild(bullet);
        }

        bullet.texture = texture;
        bullet.visible = true;
        return bullet;
    }

    public release(bullet: Sprite): void {
        bullet.visible = false;
        this._pool.push(bullet);
    }
}
```

Destroying and recreating is significantly more expensive than toggling `visible` and updating properties. GPU resources stay allocated; only scene graph visibility changes.

### Batching optimization

PixiJS batches similar consecutive objects into single draw calls. Batch breaks occur on:
- Object type change (Sprite vs Graphics)
- Texture source change (beyond the per-batch texture limit, typically 16)
- Blend mode change
- Topology change

Optimize draw order:

```ts
import { Sprite, Graphics, Container } from 'pixi.js';

// 4 draw calls: type alternates
const bad = new Container();
bad.addChild(new Sprite(t1));
bad.addChild(new Graphics().rect(0, 0, 10, 10).fill(0xff0000));
bad.addChild(new Sprite(t2));
bad.addChild(new Graphics().rect(0, 0, 10, 10).fill(0x00ff00));

// 2 draw calls: types grouped
const good = new Container();
good.addChild(new Sprite(t1));
good.addChild(new Sprite(t2));
good.addChild(new Graphics().rect(0, 0, 10, 10).fill(0xff0000));
good.addChild(new Graphics().rect(0, 0, 10, 10).fill(0x00ff00));
```

Same principle applies to blend modes: `screen/normal/screen/normal` = 4 draws; `screen/screen/normal/normal` = 2 draws.

### Spritesheets over individual textures

```ts
import { Assets, Sprite } from 'pixi.js';

// Load a spritesheet (single texture atlas)
const sheet = await Assets.load('game-atlas.json');

// All frames share one GPU texture; enables batching
const hero = new Sprite(sheet.textures['hero.png']);
const enemy = new Sprite(sheet.textures['enemy.png']);
const coin = new Sprite(sheet.textures['coin.png']);
```

Individual textures each require their own GPU upload and break batches when the texture limit is exceeded. Spritesheets consolidate many frames into one atlas texture.

Use `@0.5x` filename suffix on half-resolution sheets so PixiJS auto-scales them.

### Text performance

Text and HTMLText re-render to a canvas and re-upload to the GPU on every change. Never update them per frame unconditionally:

```ts
import { BitmapText, Text } from 'pixi.js';

// Wrong: re-renders canvas + GPU upload every frame
app.ticker.add(() => {
    scoreText.text = `Score: ${score}`;
});

// Correct: use BitmapText for frequently changing content
const scoreText = new BitmapText({
    text: 'Score: 0',
    style: { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff },
});

app.ticker.add(() => {
    scoreText.text = `Score: ${score}`;
});
```

BitmapText renders from a pre-generated glyph atlas. Updates only reposition quads; no canvas re-render or GPU upload. Use it for scores, timers, counters, and anything that changes frequently.

If you must use canvas Text, guard updates so they only happen when the value changes:

```ts
app.ticker.add(() => {
    const next = `Score: ${score}`;
    if (scoreText.text !== next) {
        scoreText.text = next;
    }
});
```

Text resolution matches the renderer resolution by default. Lower it independently via `text.resolution = 1` to reduce GPU memory on high-DPI displays.

### Graphics performance

Graphics objects are fastest when their shape doesn't change (transforms, alpha, and tint are fine). Small Graphics (under ~100 points) are batched like Sprites. Complex Graphics with hundreds of shapes are slow; convert them to textures instead:

```ts
import { Graphics, Sprite } from 'pixi.js';

const complex = new Graphics();
// ... draw complex shape ...

// Render once to texture, use as Sprite
const texture = app.renderer.generateTexture(complex);
const sprite = new Sprite(texture);
```

### Culling

PixiJS skips rendering objects outside the visible area when `cullable` is set. Disabled by default because it trades CPU cost (bounds checking) for GPU savings.

```ts
// Enable on objects that may be off-screen
sprite.cullable = true;

// Set a custom cull area (defaults to renderer screen)
sprite.cullArea = new Rectangle(0, 0, 800, 600);
```

Use culling when you're GPU-bound (many objects, complex scenes). Avoid it when you're CPU-bound, as the per-object bounds check adds overhead.

### Resolution and antialias tradeoffs

```ts
import { Application } from 'pixi.js';

const app = new Application();

// Mobile-friendly: lower resolution, no antialias
await app.init({
    resolution: 1,
    antialias: false,
    backgroundAlpha: 1, // opaque background is faster
});
```

`resolution: 2` quadruples the pixel count. On mobile, this can halve frame rate. Profile to find the right balance.

### Stagger bulk texture destruction

```ts
function staggerDestroy(textures: Texture[], perFrame: number = 5): void {
    let index = 0;
    const ticker = app.ticker;

    const destroy = () => {
        const end = Math.min(index + perFrame, textures.length);

        for (let i = index; i < end; i++) {
            textures[i].destroy(true);
        }
        index = end;

        if (index >= textures.length) {
            ticker.remove(destroy);
        }
    };

    ticker.add(destroy);
}
```

Destroying many textures in one frame causes a freeze. Spread the cost across frames.

### Filters and masks cost

- Set `container.filterArea = new Rectangle(x, y, w, h)` when you know the bounds. Without it, PixiJS measures bounds every frame.
- Release filter memory: `container.filters = null`.
- Mask cost (cheapest to most expensive): StencilMask (Graphics) < AlphaMask (Sprite, uses filter pipeline).
- Set `interactiveChildren = false` on containers with no interactive children.
- Set `hitArea` on large containers to skip recursive child hit testing.

### Safe destroy order

Remove from scene before destroying:

```ts
parent.removeChild(sprite);
sprite.destroy();
```

Destroying while the render pipeline still holds a reference causes null-pointer crashes. If destruction must happen mid-frame, defer it:

```ts
app.ticker.addOnce(() => {
    parent.removeChild(sprite);
    sprite.destroy();
});
```

## Common Mistakes

### [CRITICAL] App destroy without releaseGlobalResources

Wrong:
```ts
app.destroy();
const newApp = new Application();
```

Correct:
```ts
app.destroy({ releaseGlobalResources: true });
const newApp = new Application();
```

Without this flag, stale pooled batches and textures from the old app persist in global pools and get reused by the new app, causing flickering and visual corruption.

Source: GitHub issue #11765

### [HIGH] Interleaving object types in scene graph

`sprite / graphic / sprite / graphic` = 4 draw calls.
`sprite / sprite / graphic / graphic` = 2 draw calls.

Group same object types together in the child order to minimize batch breaks. Same applies to blend mode ordering.

Source: src/__docs__/concepts/performance-tips.md

### [HIGH] Destroying and recreating objects instead of recycling

Destroy/recreate is expensive: it deallocates GPU resources, triggers garbage collection, and requires fresh GPU uploads. Reuse objects by updating `texture`, `position`, `visible`, and other properties. Use an object pool pattern for frequently spawned/despawned entities.

Source: performance-tips.md

### [HIGH] Loading many individual textures instead of spritesheets

Each separate texture consumes its own GPU memory slot and breaks batching when the per-batch texture limit is reached. Spritesheets consolidate textures into atlases. Also avoid textures exceeding 4096px on either axis, as they fail on some mobile GPUs.

Source: performance-tips.md

### [HIGH] Updating Text or HTMLText every frame

Each update re-renders the full string to a canvas and uploads to the GPU. At 60fps this creates massive overhead. Use BitmapText for dynamic content (scores, timers, counters). If canvas Text is required, only update when the value actually changes. Source: src/__docs__/concepts/performance-tips.md

### [HIGH] Using complex Graphics instead of textures

Hundreds of complex Graphics objects are slow to render. Small Graphics (under ~100 points) batch efficiently like Sprites, but complex ones do not. Render complex static shapes to a texture with `renderer.generateTexture()` and display as a Sprite. Source: src/__docs__/concepts/performance-tips.md

### [MEDIUM] Not staggering bulk texture destruction

Destroying dozens of textures in a single frame causes a visible freeze. Spread destruction across multiple frames (e.g., 5 per frame via a ticker callback). Source: src/__docs__/concepts/garbage-collection.md

### [MEDIUM] Not using PrepareSystem for large scenes

Without `renderer.prepare.upload()`, textures upload to the GPU on first render, causing frame hitches. For loading screens or scene transitions, upload before displaying. Requires `import 'pixi.js/prepare'` (not included by default with `manageImports: false`). Source: src/prepare/PrepareSystem.ts

### [MEDIUM] Using high resolution or antialias without profiling

`resolution: 2` quadruples the pixel count. `antialias: true` adds GPU cost. Both degrade performance on mobile devices. Always profile on target hardware before enabling. Source: performance-tips.md

---

See also: getting-started (resolution and antialias setup), core-concepts (destroy options), scene-management (render groups and culling for perf), graphics (avoid dynamic redraw), text (BitmapText for dynamic content)

## Learn More

- [GCSystem](https://pixijs.download/release/docs/rendering.GCSystem.html.md)
- [PrepareSystem](https://pixijs.download/release/docs/rendering.PrepareSystem.html.md)
- [Culler](https://pixijs.download/release/docs/scene.Culler.html.md)
- [CullerPlugin](https://pixijs.download/release/docs/app.CullerPlugin.html.md)
