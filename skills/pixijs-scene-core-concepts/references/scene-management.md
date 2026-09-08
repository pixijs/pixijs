# Scene Management: Render Groups, Layers, and Culling

Organize PixiJS scenes with render groups (GPU-level transforms), RenderLayer (decoupled render order), culling (offscreen optimization), zIndex sorting, and boundsArea optimization.

## Quick Start

```ts
const world = new Container({ isRenderGroup: true });
const hud = new Container({ isRenderGroup: true });
app.stage.addChild(world, hud);

const bgLayer = new RenderLayer();
const entityLayer = new RenderLayer();
const uiLayer = new RenderLayer();
app.stage.addChild(bgLayer, entityLayer, uiLayer);

const player = new Sprite(texture);
world.addChild(player);
entityLayer.attach(player);
```

## Core Patterns

### Render groups for GPU-level transforms

A render group is a container whose transform (position, scale, rotation, alpha, tint) is applied on the GPU as a single operation rather than being recalculated per-child on the CPU. The root container passed to `renderer.render()` is automatically a render group.

```ts
const gameWorld = new Container({ isRenderGroup: true });
const uiLayer = new Container({ isRenderGroup: true });

scene.addChild(gameWorld, uiLayer);

gameWorld.x += 10;

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
const bgLayer = new RenderLayer();
const entityLayer = new RenderLayer();
const uiLayer = new RenderLayer();

app.stage.addChild(bgLayer, entityLayer, uiLayer);

const player = new Sprite(texture);
const world = new Container();
world.addChild(player);
entityLayer.attach(player);

entityLayer.detach(player);
entityLayer.detachAll();

const sortedLayer = new RenderLayer({
  sortableChildren: true,
  sortFunction: (a, b) => a.position.y - b.position.y,
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
const stage = new Container();

for (let i = 0; i < 1000; i++) {
  const sprite = Sprite.from("bunny.png");
  sprite.x = Math.random() * 5000;
  sprite.y = Math.random() * 5000;
  sprite.cullable = true;
  stage.addChild(sprite);
}

const view = { x: 0, y: 0, width: 800, height: 600 };
Culler.shared.cull(stage, view);
renderer.render(stage);
```

For automatic culling with Application, register CullerPlugin:

```ts
import { extensions, CullerPlugin } from "pixi.js";
extensions.add(CullerPlugin);

const app = new Application();
await app.init({ width: 800, height: 600 });
```

Set `cullArea` on a container to define a custom cull region instead of computing bounds:

```ts
container.cullArea = new Rectangle(0, 0, 1000, 1000);
container.cullable = true;
```

### zIndex sorting

```ts
const parent = new Container({ sortableChildren: true });

const bg = new Sprite(bgTexture);
bg.zIndex = 0;

const player = new Sprite(playerTexture);
player.zIndex = 10;

const fg = new Sprite(fgTexture);
fg.zIndex = 20;

parent.addChild(fg, bg, player);
```

Setting `zIndex` on a child automatically enables `sortableChildren` on its parent, so the explicit constructor option is only needed when you want sorting enabled before any child sets a zIndex.

### boundsArea optimization

Setting `boundsArea` on a container prevents recursive bounds measurement of all children. Useful for containers with many children whose aggregate bounds are known.

```ts
const particles = new Container();
particles.boundsArea = new Rectangle(0, 0, 800, 600);
```

## Common Mistakes

### MEDIUM: Overusing render groups

Each render group has its own instruction set and cannot batch with other groups. Use render groups at a broad level (game world, HUD), not per-child. Profile before adding them; most scenes do not need any explicit render groups beyond the auto-created root.

### HIGH: Expecting automatic culling

v8 culling is explicit. Setting `cullable=true` only marks the container as eligible. You must call `Culler.shared.cull()` before rendering, or register `CullerPlugin` for automatic culling with Application.

### MEDIUM: Expecting filters on ancestors to apply to layer children

RenderLayer children are rendered outside their parent's filter scope. Filters capture children into a texture via push/pop, but layer-attached children skip their parent's collection and render at the layer's position instead. Apply filters directly to the child when using RenderLayer.

### HIGH: Using addChild on RenderLayer

RenderLayer overrides `addChild`, `removeChild`, and related methods to throw errors. Use `attach()` and `detach()` for layer membership. The object still needs a scene graph parent via `addChild` on a regular Container for transforms.

## API Reference

- [RenderLayer](https://pixijs.download/release/docs/scene.RenderLayer.html.md)
- [Container](https://pixijs.download/release/docs/scene.Container.html.md)
- [Culler](https://pixijs.download/release/docs/scene.Culler.html.md)
- [CullerPlugin](https://pixijs.download/release/docs/app.CullerPlugin.html.md)
- [RenderGroup](https://pixijs.download/release/docs/rendering.RenderGroup.html.md)
