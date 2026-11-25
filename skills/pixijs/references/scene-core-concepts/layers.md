# layers

`RenderLayer`: drawing an object at a different place in the render order than its scene-graph parent, including depth sorting across parents.

## Attach, don't add

An object keeps its logical parent (for transforms) and is drawn at the layer's position in the scene instead of its parent's:

```ts
const world = new Container();
const hud = new RenderLayer();
app.stage.addChild(world, hud);

const player = new Sprite(playerTexture);
world.addChild(player); // logical parent: moving world moves the player
hud.attach(player); // draw order: drawn where hud sits, on top of world

world.x = 100; // player still moves with world
```

- Membership is `layer.attach(a, b, ...)`, `layer.detach(obj)`, `layer.detachAll()`. `RenderLayer` overrides `addChild` / `removeChild` to throw; the object still needs a real `Container` parent.
- A layer and the objects it attaches must be in the same render group; otherwise an attached object renders without its correct transform composition. With `world` as `new Container({ isRenderGroup: true })`, add the layer to `world`, not to `app.stage`.

## What the layer does not control

An attached object takes its transform, `alpha`, `tint` and `visible` from its logical parent chain, never from the layer. Setting `visible = false`, `renderable = false`, `alpha`, `tint`, a position or `filters` on the `RenderLayer` itself silently does nothing to what it draws. To hide a whole layer, put it inside a plain `Container` and toggle that container (an invisible ancestor of the layer does hide its attached objects), or toggle the objects themselves:

```ts
const uiRoot = new Container();
const uiLayer = new RenderLayer();
uiRoot.addChild(uiLayer);
app.stage.addChild(uiRoot);
uiRoot.visible = false; // hides everything attached to uiLayer
```

Filters on an ancestor `Container` capture its children into a texture, but layer-attached children skip that capture: they are drawn at the layer's position. Put the filter on the attached object itself.

## Reparenting detaches

Removing an object from its scene-graph parent (`removeChild`) clears its layer attachment. Moving it to a different parent with `addChild` or `reparentChild` removes it from the old parent first, so it is silently detached too and draws at its new place in the scene graph. Re-adding does not re-attach it; call `layer.attach(obj)` again after every reparent.

## Sorted layers (depth / y-sort across parents)

```ts
import { Application, Container, Graphics, RenderLayer } from "pixi.js";

declare const app: Application;

const heroes = new Container();
const monsters = new Container();
const depthLayer = new RenderLayer({ sortableChildren: true });
app.stage.addChild(heroes, monsters, depthLayer);

const knight = heroes.addChild(new Graphics().rect(-20, -60, 40, 60).fill(0x3366cc));
const orc = monsters.addChild(new Graphics().rect(-25, -70, 50, 70).fill(0x669933));
knight.position.set(120, 180);
orc.position.set(140, 160);
depthLayer.attach(knight, orc);

// Larger y draws in front. Re-run every frame so later moves re-sort.
app.ticker.add(() => {
  for (const unit of depthLayer.renderLayerChildren) unit.zIndex = unit.y;
});
```

This replaces the tempting `sortFunction: (a, b) => a.y - b.y` plus a per-frame `sortRenderLayerChildren()`, which never re-sorts the drawing:

- Sorting is off by default (`RenderLayer` `sortableChildren` defaults to `false`); without it attached objects draw in attach order and their `zIndex` is ignored by the layer.
- The layer sorts only when its render group rebuilds the draw list. Assigning a new `zIndex` to an attached object triggers that rebuild; changing `x` / `y` does not. Drive the order through `zIndex`; the default `sortFunction` compares `zIndex`.
- A custom `sortFunction` runs only at a rebuild, so it goes stale for moving objects. `sortRenderLayerChildren()` reorders `renderLayerChildren`, but the draw order changes only at the next rebuild (attach/detach, add/remove, a `zIndex` change).
- A non-zero `zIndex` on an attached object (set before or after it is added to its logical parent) also sets `sortableChildren = true` on that parent; harmless.
- If all the objects share one parent, skip the layer: `child.zIndex = child.y` on that parent's children sorts them (see [scene-container](../scene-container.md#zindex-and-sortablechildren)).
