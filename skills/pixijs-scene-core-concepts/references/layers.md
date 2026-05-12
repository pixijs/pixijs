# RenderLayer

`RenderLayer` decouples render order from the scene graph hierarchy. Objects keep their logical parent (for transforms) but render at the layer's position in the scene. Use layers to pull specific objects to a specific z-depth without reparenting; the classic "character is parented to the world, but draws on the UI overlay" problem.

## Quick Start

```ts
const bgLayer = new RenderLayer();
const entityLayer = new RenderLayer();
const uiLayer = new RenderLayer();

app.stage.addChild(bgLayer, entityLayer, uiLayer);

const world = new Container();
app.stage.addChild(world);

const player = new Sprite(texture);
world.addChild(player); // logical parent for transforms
entityLayer.attach(player); // render position
```

The player lives in `world` for transform purposes (so moving the world moves the player), but the renderer draws it in the order determined by `entityLayer`'s position in the stage.

## Core Patterns

### attach / detach

```ts
layer.attach(sprite);
layer.attach(sprite1, sprite2, sprite3);

layer.detach(sprite);
layer.detachAll();
```

Use `attach()` / `detach()` for layer membership; not `addChild` / `removeChild`. RenderLayer overrides the scene graph methods to throw errors.

### Sorted layers

```ts
const sortedLayer = new RenderLayer({
  sortableChildren: true,
  sortFunction: (a, b) => a.position.y - b.position.y,
});

sortedLayer.attach(sprite1, sprite2, sprite3);
```

Set `sortableChildren: true` on the layer (not the object) and optionally pass a custom `sortFunction`. The default sort is by `zIndex`. Common use: y-sort for 2D top-down games so objects draw in depth order based on world y-position.

### Manual sort

```ts
const layer = new RenderLayer({ sortableChildren: false });
layer.attach(sprite1, sprite2, sprite3);

layer.sortRenderLayerChildren();
```

If you turn off automatic sorting, call `sortRenderLayerChildren()` manually when you want the sort to happen. Useful when the sort order changes less often than every frame.

### Layer + logical parent

```ts
const world = new Container();
const hud = new RenderLayer();
app.stage.addChild(world, hud);

const player = new Sprite(playerTexture);
world.addChild(player);
hud.attach(player);

world.x = 100; // player still moves with world
```

The player's transform chain goes through `world`; moving `world.x` moves the player visually. But the renderer places the player's draw call at `hud`'s position in the scene graph, so the player renders on top of everything else.

### Removing from scene graph auto-detaches

```ts
world.removeChild(player);
// player is automatically detached from entityLayer
```

When you remove an object from its scene graph parent (via `removeChild`), the render layer attachment is cleared automatically. Re-adding the object to a scene graph parent does NOT re-attach it; you must call `layer.attach(player)` again.

## Common Mistakes

### [CRITICAL] Using `addChild` on a RenderLayer

Wrong:

```ts
const layer = new RenderLayer();
layer.addChild(sprite);
```

Correct:

```ts
const layer = new RenderLayer();
container.addChild(sprite);
layer.attach(sprite);
```

`RenderLayer` throws on `addChild`. The object still needs a real scene graph parent (via `addChild` on a Container) for transforms; use `layer.attach()` to control render order.


### [HIGH] Layer and attached children in different render groups

Wrong:

```ts
const renderGroup = new Container({ isRenderGroup: true });
const layer = new RenderLayer();

renderGroup.addChild(sprite);
app.stage.addChild(layer);
layer.attach(sprite);
```

Correct:

```ts
const renderGroup = new Container({ isRenderGroup: true });
const layer = new RenderLayer();

renderGroup.addChild(sprite);
renderGroup.addChild(layer);
layer.attach(sprite);
```

A layer and the objects it attaches must be in the same render group. Otherwise the attached child renders without its correct transform composition.


### [MEDIUM] Expecting parent filters to apply to layer children

Filters on an ancestor Container are applied by capturing the container's children into a texture via push/pop. Layer-attached children skip this capture; they're collected separately and drawn at the layer's position. If you need a filter on a layer-attached object, apply the filter directly to the object (not the ancestor).


## API Reference

- [RenderLayer](https://pixijs.download/release/docs/scene.RenderLayer.html.md)
- [RenderLayerOptions](https://pixijs.download/release/docs/scene.RenderLayerOptions.html.md)
- [Container](https://pixijs.download/release/docs/scene.Container.html.md)
