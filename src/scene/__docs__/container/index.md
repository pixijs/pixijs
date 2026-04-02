---
title: Container
description: Learn how to create and manage Containers in PixiJS, including adding/removing children, sorting, and caching as textures.
category: scene
children:
  - ./cache-as-texture.md
---

# Container

A `Container` groups display objects together. Moving, rotating, or scaling a container applies to everything inside it. Containers themselves are invisible; only their children render.

Containers can hold other containers, letting you build nested hierarchies (e.g., a game world container holding level containers, each holding sprite containers).

```ts
import { Container, Sprite } from 'pixi.js';

const group = new Container();
const sprite = Sprite.from('bunny.png');

group.addChild(sprite);
```

## Managing children

PixiJS provides an API for adding, removing, reordering, and swapping children in a container:

```ts
const container = new Container();
const child1 = new Container();
const child2 = new Container();

container.addChild(child1, child2);
container.removeChild(child1);
container.addChildAt(child1, 0);
container.swapChildren(child1, child2);
```

You can also remove a child by index or remove all children within a range:

```ts
container.removeChildAt(0);
container.removeChildren(0, 2);
```

To move a child to another container while keeping its current position on screen (preserving its world transform), use `reparentChild` or `reparentChildAt`:

```ts
otherContainer.reparentChild(child);
```

To replace an existing child with a new one, copying the old child's local transform (position, rotation, scale) to the replacement:

```ts
container.replaceChild(oldChild, newChild);
```

### Events

Containers emit lifecycle events you can listen to. There are two perspectives: events on the **parent** and events on the **child**.

#### Parent-side events

`childAdded` and `childRemoved` fire on the container whose children changed:

```ts
group.on('childAdded', (child, parent, index) => { ... });
group.on('childRemoved', (child, parent, index) => { ... });
```

#### Child-side events

`added` and `removed` fire on the child itself when its parent changes:

```ts
const sprite = Sprite.from('bunny.png');

sprite.on('added', (parent) => {
    console.log('Added to:', parent.label);
});
sprite.on('removed', (oldParent) => {
    console.log('Removed from:', oldParent.label);
});
```

> [!NOTE]
> When using `addChildAt` to reposition a child that is **already in the same container**, the child is moved silently. None of the add/remove events fire, since the parent-child relationship hasn't changed.

#### Property and lifecycle events

`visibleChanged` fires whenever a container's `visible` property changes:

```ts
container.on('visibleChanged', (visible) => {
    console.log('Visibility:', visible);
});
```

`destroyed` fires when `destroy()` is called, after internal cleanup but before listeners are removed:

```ts
container.on('destroyed', (container) => {
    console.log('Destroyed:', container.label);
});
```

### Finding children

Containers support searching children by `label` using helper methods:

```ts
const child = new Container({ label: 'enemy' });
container.addChild(child);
container.getChildByLabel('enemy');
container.getChildrenByLabel(/^enemy/); // all children whose label starts with "enemy"
```

Set `deep = true` to search recursively through all descendants.

```ts
container.getChildByLabel('ui', true);
```

### Sorting children

Use `zIndex` and `sortableChildren` to control render order within a container:

```ts
child1.zIndex = 1;
child2.zIndex = 10;
container.sortableChildren = true;
```

Call `sortChildren()` to manually re-sort if needed:

```ts
container.sortChildren();
```

> [!NOTE]
> Use this feature sparingly, as sorting can be expensive for large numbers of children.

## Optimizing with render groups

A render group isolates a container's rendering instructions from its parent, so the GPU can transform the entire group without recalculating each child. Promote a container by setting `isRenderGroup = true` or calling `enableRenderGroup()`.

Good candidates: UI layers that overlay the game world, large subtrees that move as a unit, or particle systems.
See the [Render Groups guide](../../../__docs__/concepts/render-groups.md) for details.

```ts
const uiLayer = new Container({ isRenderGroup: true });
```

## Cache as texture

`cacheAsTexture` optimizes rendering by drawing a container and its children to a single texture. Subsequent renders reuse this texture instead of rendering each child individually. This is useful for containers with many static elements, as it reduces the rendering workload.

> [!NOTE]
> `cacheAsTexture` is PixiJS v8's equivalent of the previous `cacheAsBitmap` functionality. If you're migrating from v7 or earlier, replace `cacheAsBitmap` with `cacheAsTexture` in your code.

```ts
const container = new Container();
const sprite = Sprite.from('bunny.png');
container.addChild(sprite);

// enable cache as texture
container.cacheAsTexture();

// update the texture if the container changes
container.updateCacheTexture();

// disable cache as texture
container.cacheAsTexture(false);
```

For more advanced usage, including setting cache options and handling dynamic content, refer to the [Cache as Texture guide](./cache-as-texture.md).

---

## API reference

- {@link Container}
- {@link ContainerOptions}
- {@link RenderContainer}
