---
name: scene-management
description: >
  Organize PixiJS scenes with Container hierarchy, RenderLayer for
  decoupled render order, render groups (isRenderGroup) for GPU-level
  transforms, culling (cullable, cullArea, CullerPlugin), boundsArea
  optimization, sortableChildren, and zIndex sorting. Use when the user asks
  about render order, z-index, sorting children, render layers, culling,
  off-screen optimization, render groups, GPU transforms, y-sorting,
  or organizing a scene into layers. Covers RenderLayer, isRenderGroup,
  enableRenderGroup, Culler, CullerPlugin, cullable, cullArea, boundsArea,
  sortableChildren, zIndex, attach, detach.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  requires: "pixijs, core-concepts"
  sources: "pixijs/pixijs:src/scene/layers/RenderLayer.ts, pixijs/pixijs:src/culling/Culler.ts, pixijs/pixijs:src/__docs__/concepts/render-groups.md"
---

## When to Use This Skill

Apply when the user needs to control render order independently of the scene graph, organize a scene into layers, enable GPU-level transforms via render groups, cull off-screen objects, or sort children by zIndex or custom criteria.

**Related skills:** For container transforms and child management use **core-concepts**; for batching and frame rate optimization use **performance**; for filter interaction with layers use **filters**.

This skill builds on pixijs. Read it first for foundational concepts.

## Setup

```ts
import { Application, Container, Sprite, RenderLayer, Rectangle } from 'pixi.js';

const app = new Application();
await app.init({ width: 800, height: 600 });
document.body.appendChild(app.canvas);

const world = new Container({ isRenderGroup: true });
const hud = new Container({ isRenderGroup: true });
app.stage.addChild(world, hud);
```

## Core Patterns

### Render groups for GPU-level transforms

A render group is a container whose transform (position, scale, rotation, alpha, tint) is applied on the GPU as a single operation rather than being recalculated per-child on the CPU. The root container passed to `renderer.render()` is automatically a render group.

```ts
import { Container, Sprite } from 'pixi.js';

const gameWorld = new Container({ isRenderGroup: true });
const uiLayer = new Container({ isRenderGroup: true });

scene.addChild(gameWorld, uiLayer);

// Moving gameWorld is near-zero CPU cost regardless of child count
gameWorld.x += 10;

// Can also enable after construction
const panel = new Container();
panel.enableRenderGroup();
```

Use render groups for large stable sub-trees (the structure stays the same even though children move/rotate). Children inside can still animate freely; "stable" means children are not being constantly added/removed.

The scene has three matrix levels:
1. `localTransform` - based on the container's own position/scale/rotation
2. `groupTransform` - relative to the render group it belongs to
3. `worldTransform` - relative to the scene root

### RenderLayer for decoupled render order

RenderLayer separates render order from scene graph hierarchy. Objects keep their logical parent for transforms but render at the layer's position in the scene.

```ts
import { Container, Sprite, RenderLayer } from 'pixi.js';

const bgLayer = new RenderLayer();
const entityLayer = new RenderLayer();
const uiLayer = new RenderLayer();

// Layer order in scene graph determines render order
app.stage.addChild(bgLayer, entityLayer, uiLayer);

// Objects maintain scene graph parent for transforms
const player = new Sprite(texture);
const world = new Container();
world.addChild(player);          // scene graph parent
entityLayer.attach(player);      // render order via layer

// Use attach/detach, NOT addChild/removeChild
entityLayer.detach(player);      // stop rendering via layer
entityLayer.detachAll();         // remove all from layer

// Sorting within a layer
const sortedLayer = new RenderLayer({
    sortableChildren: true,                          // auto-sort each frame
    sortFunction: (a, b) => a.position.y - b.position.y, // y-sort
});
```

Key constraints:
- `addChild()` / `removeChild()` on RenderLayer throws an error. Use `attach()` / `detach()`.
- Objects removed from their scene graph parent via `removeChild()` are automatically detached from their layer.
- Re-adding an object to the scene graph does NOT automatically re-attach it to the layer. You must call `attach()` again.
- Layers and their children must belong to the same render group.

### Culling

Culling skips rendering objects outside the visible area. In v8, culling is manual; it does not happen automatically during render.

```ts
import { Container, Sprite, Culler, Rectangle } from 'pixi.js';

const stage = new Container();

// Mark containers as cullable
for (let i = 0; i < 1000; i++) {
    const sprite = Sprite.from('bunny.png');
    sprite.x = Math.random() * 5000;
    sprite.y = Math.random() * 5000;
    sprite.cullable = true;
    stage.addChild(sprite);
}

// Manual culling before render
const view = { x: 0, y: 0, width: 800, height: 600 };
Culler.shared.cull(stage, view);
renderer.render(stage);
```

For automatic culling with Application, register CullerPlugin:

```ts
import { Application, extensions, CullerPlugin } from 'pixi.js';

extensions.add(CullerPlugin);

const app = new Application();
await app.init({ width: 800, height: 600 });
// Culling now runs automatically each frame using the renderer's screen as view
```

Set `cullArea` on a container to define a custom cull region instead of computing bounds:

```ts
container.cullArea = new Rectangle(0, 0, 1000, 1000);
container.cullable = true;
```

### zIndex sorting

```ts
import { Container, Sprite } from 'pixi.js';

const parent = new Container({ sortableChildren: true });

const bg = new Sprite(bgTexture);
bg.zIndex = 0;

const player = new Sprite(playerTexture);
player.zIndex = 10;

const fg = new Sprite(fgTexture);
fg.zIndex = 20;

parent.addChild(fg, bg, player); // render order follows zIndex, not add order
```

Setting `zIndex` on a child automatically enables `sortableChildren` on its parent, so the explicit constructor option is only needed when you want sorting enabled before any child sets a zIndex.

### boundsArea optimization

Setting `boundsArea` on a container prevents recursive bounds measurement of all children. Useful for containers with many children whose aggregate bounds are known.

```ts
import { Container, Rectangle } from 'pixi.js';

const particles = new Container();
particles.boundsArea = new Rectangle(0, 0, 800, 600);
// Renderer uses this rectangle instead of measuring 1000 children
```

## Common Mistakes

### MEDIUM: Overusing render groups

Wrong:
```ts
for (const child of children) {
    child.isRenderGroup = true; // every single child
}
```

Correct:
```ts
const worldGroup = new Container({ isRenderGroup: true });
worldGroup.addChild(...children);
```

Each render group has its own instruction set and cannot batch with other groups. Use render groups at a broad level (game world, HUD) not per-child. Profile before adding them; most scenes do not need any explicit render groups beyond the auto-created root.

Source: src/__docs__/concepts/render-groups.md

### HIGH: Expecting automatic culling

Wrong:
```ts
container.cullable = true;
renderer.render(container); // nothing is culled
```

Correct:
```ts
container.cullable = true;
Culler.shared.cull(container, { x: 0, y: 0, width: 800, height: 600 });
renderer.render(container);
```

v8 culling is explicit. Setting `cullable=true` only marks the container as eligible. You must call `Culler.shared.cull()` before rendering, or register `CullerPlugin` for automatic culling with Application.

Source: src/__docs__/migrations/v8.md

### MEDIUM: Expecting filters on ancestors to apply to layer children

Wrong:
```ts
import { BlurFilter, Container, Sprite, RenderLayer } from 'pixi.js';

const parent = new Container();
parent.filters = [new BlurFilter()];

const layer = new RenderLayer();
app.stage.addChild(parent, layer);

const sprite = new Sprite(texture);
parent.addChild(sprite);
layer.attach(sprite);
// sprite renders WITHOUT blur despite parent having BlurFilter
```

Correct:
```ts
// Apply filter directly to the sprite or use a different approach
sprite.filters = [new BlurFilter()];
```

RenderLayer children are rendered outside their parent's filter scope. Filters capture children into a texture via push/pop, but layer-attached children skip their parent's collection and render at the layer's position instead.

Source: src/scene/layers/RenderLayer.ts

### HIGH: Using addChild on RenderLayer

Wrong:
```ts
const layer = new RenderLayer();
layer.addChild(sprite); // throws Error
```

Correct:
```ts
const layer = new RenderLayer();
container.addChild(sprite);  // scene graph parent
layer.attach(sprite);        // render order via layer
```

RenderLayer overrides `addChild`, `removeChild`, and related methods to throw errors. Use `attach()` and `detach()` for layer membership. The object still needs a scene graph parent via `addChild` on a regular Container for transforms.

Source: src/scene/layers/RenderLayer.ts

### MEDIUM: Layer child without scene graph parent

Wrong:
```ts
const layer = new RenderLayer();
const sprite = new Sprite(texture);
layer.attach(sprite);
// Warning: Container must be added to both layer and scene graph
```

Correct:
```ts
const layer = new RenderLayer();
const sprite = new Sprite(texture);
someContainer.addChild(sprite); // scene graph for transforms
layer.attach(sprite);           // layer for render order
```

Layers only handle render order. Without a scene graph parent, the object has no transform context and a warning is emitted during rendering.

Source: src/scene/layers/RenderLayer.ts

See also: core-concepts (Container transform fundamentals), performance (render group profiling and batching), filters (filter interaction with layers)

## Learn More

- [RenderLayer](https://pixijs.download/release/docs/scene.RenderLayer.html.md)
- [Container](https://pixijs.download/release/docs/scene.Container.html.md)
- [Culler](https://pixijs.download/release/docs/scene.Culler.html.md)
- [CullerPlugin](https://pixijs.download/release/docs/app.CullerPlugin.html.md)
