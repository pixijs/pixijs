# Container Hierarchy

The PixiJS scene graph is a tree of `Container` subclasses rooted at `app.stage`. Every node has a single parent, zero or more children, and a local transform. Use this reference for mental model and fine-grained parent/child management; for full Container API (constructor options, lifecycle methods), see the top-level `pixijs-scene-container` skill.

## Quick Start

```ts
const world = new Container({ label: "world" });
app.stage.addChild(world);

const hero = new Container({ label: "hero" });
hero.addChild(new Sprite(bodyTexture));
hero.addChild(new Sprite(weaponTexture));
world.addChild(hero);

const enemies = new Container({ label: "enemies" });
world.addChild(enemies);

enemies.addChild(new Sprite(enemyTexture), new Sprite(enemyTexture));
```

Every display object in v8 is a `Container` subclass. Leaves (Sprite, Graphics, Text, Mesh, ParticleContainer, DOMContainer, GifSprite) have `allowChildren = false` and must not have children. Use a plain `Container` to group leaves.

## Core Patterns

### Add, remove, swap

```ts
// Add (variadic, returns the first added child)
parent.addChild(child1, child2, child3);

// Insert at index
parent.addChildAt(child, 0);

// Remove
parent.removeChild(child);
parent.removeChildAt(0);
parent.removeChildren();
parent.removeChildren(0, 3); // first three

// Swap
parent.swapChildren(childA, childB);
```

`addChild` with an existing parent first removes the child from its old parent (no explicit `removeChild` needed). Returned value is the first added child for chaining.

When `addChildAt` moves a child that is **already** in the same container, the move is silent: no `added` / `removed` / `childAdded` / `childRemoved` events fire, because the parent-child relationship hasn't changed.

### Replacing a child

```ts
parent.replaceChild(oldChild, newChild);
```

`replaceChild` swaps `oldChild` for `newChild` at the same index and copies the old child's local transform (position, rotation, scale, etc.) onto the replacement. Use this when you want a drop-in replacement to inherit the old child's placement without copying fields by hand.

### Child queries

```ts
const count = parent.children.length;
const first = parent.getChildAt(0);
const index = parent.getChildIndex(child);

const hero = parent.getChildByLabel("hero");
const heroDeep = parent.getChildByLabel("weapon", true); // recursive

const enemies = parent.getChildrenByLabel("enemy");
const waves = parent.getChildrenByLabel(/^wave-\d+/);
const buttonsDeep = parent.getChildrenByLabel("button", true);
```

`label` can be a `string` or a `RegExp` (e.g., `parent.getChildByLabel(/^hero-/)`). `getChildByLabel` returns the first match; `getChildrenByLabel` returns every match. Both walk the immediate children and recurse when the second argument is `true`. For more complex queries, iterate `parent.children` manually.

### Iterating children

```ts
for (const child of parent.children) {
  child.alpha = 0.5;
}

parent.children.forEach((child, i) => {
  child.y = i * 32;
});
```

`children` is a plain array. It's safe to iterate, but mutating it during iteration (via `addChild` / `removeChild`) is not; snapshot first with `[...parent.children]` if you need to modify the list.

### Reparenting with transform preservation

```ts
newParent.reparentChild(child);

newParent.reparentChildAt(child, 0);

newParent.reparentChild(childA, childB, childC);
```

`reparentChild` and `reparentChildAt` move children to a new parent while preserving their **world** transform, so the visuals don't jump. `reparentChild` appends to the end and accepts multiple children; `reparentChildAt` inserts at a specific index and accepts one child.

If you must do this manually (for example, to batch with other transform work), convert through `getGlobalPosition` and `toLocal`:

```ts
const globalPos = child.getGlobalPosition();
newParent.addChild(child);
child.position = newParent.toLocal(globalPos);
```

Plain `addChild` keeps the local transform, which means the visual position changes; `reparentChild` is almost always what you want.

### Destroying sub-trees

```ts
branch.destroy({ children: true });
```

`destroy()` unlinks a single node. `destroy({ children: true })` recursively tears down the entire sub-tree. Always use `{ children: true }` when removing a branch; otherwise you leak the child nodes and their textures.

### Label-based tree navigation

```ts
const panel = new Container({ label: "panel" });
panel.addChild(new Container({ label: "header" }));
panel.addChild(new Container({ label: "body" }));

const header = panel.getChildByLabel("header");
```

Use `label` for debug tooling and light-weight tree navigation. Don't use it for hot-path code; the `getChildByLabel` walk is O(n) per call.

### Lifecycle events

Containers emit events for hierarchy changes, visibility changes, and destruction.

**Parent-side events** fire on the container whose children changed:

```ts
group.on("childAdded", (child, parent, index) => {
  /* ... */
});
group.on("childRemoved", (child, parent, index) => {
  /* ... */
});
```

**Child-side events** fire on the child itself when its parent changes:

```ts
sprite.on("added", (parent) => {
  /* ... */
});
sprite.on("removed", (oldParent) => {
  /* ... */
});
```

**Property and lifecycle events:**

```ts
container.on("visibleChanged", (visible) => {
  /* ... */
});
container.on("destroyed", (container) => {
  /* ... */
});
```

`visibleChanged` fires whenever `container.visible` flips. `destroyed` fires inside `destroy()` after internal cleanup but before listeners are removed. By the time `destroyed` runs, `position`, `scale`, `pivot`, `origin`, `skew`, and `parent` have already been nulled, and `children` has been emptied (length 0, but the array reference itself is not nulled). Capture any container state you need **before** calling `destroy()`, not inside the event handler.

## Common Mistakes

### [CRITICAL] Adding children to a leaf

Wrong:

```ts
sprite.addChild(otherSprite);
```

Correct:

```ts
const group = new Container();
group.addChild(sprite, otherSprite);
```

Sprite, Graphics, Text, Mesh, ParticleContainer, DOMContainer, and GifSprite all set `allowChildren = false`. Adding children logs a deprecation warning and will become a hard error. Use a plain `Container` to group.


### [HIGH] Destroying the parent without `children: true`

Wrong:

```ts
levelContainer.destroy();
```

Correct:

```ts
levelContainer.destroy({ children: true });
```

Plain `destroy()` only removes the parent. Its children become orphans; still in memory, still referencing textures. For a clean teardown, always pass `{ children: true }`, and include `texture: true` / `textureSource: true` when you also want to release GPU memory.


### [MEDIUM] Mutating `children` during iteration

Wrong:

```ts
parent.children.forEach((child) => {
  if (shouldRemove(child)) parent.removeChild(child);
});
```

Correct:

```ts
for (const child of [...parent.children]) {
  if (shouldRemove(child)) parent.removeChild(child);
}
```

`removeChild` splices the array, shifting indices. Iterating the live array misses elements or processes some twice. Snapshot before iterating.


## API Reference

- [Container](https://pixijs.download/release/docs/scene.Container.html.md)
- [ContainerOptions](https://pixijs.download/release/docs/scene.ContainerOptions.html.md)
- [ContainerChild](https://pixijs.download/release/docs/scene.ContainerChild.html.md)
- [ChildrenHelperMixin](https://pixijs.download/release/docs/scene.ChildrenHelperMixin.html.md)
