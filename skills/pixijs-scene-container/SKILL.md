---
name: pixijs-scene-container
description: "Use this skill when grouping, positioning, or transforming display objects in PixiJS v8. Covers Container constructor options (isRenderGroup, sortableChildren, boundsArea), addChild/removeChild/addChildAt/swapChildren/setChildIndex, position/scale/rotation/pivot/skew/alpha/tint, getBounds/getGlobalPosition/toLocal/toGlobal, zIndex sorting, cullable, onRender per-frame callback, destroy. Triggers on: Container, addChild, removeChild, addChildAt, swapChildren, sortableChildren, zIndex, position, scale, rotation, pivot, getBounds, toGlobal, toLocal, onRender, destroy, constructor options, ContainerOptions."
license: MIT
---

`Container` is the general-purpose node of the PixiJS v8 scene graph. It holds children and applies transforms, alpha, tint, and blend mode to its whole subtree. Every display object you make will either be a `Container` you're building a branch on, or a leaf (`Sprite`, `Graphics`, `Text`, `Mesh`) that you nest inside one.

Assumes familiarity with `pixijs-scene-core-concepts`.

## Quick Start

```ts
const group = new Container({
  label: "hero-group",
  x: 200,
  y: 150,
  sortableChildren: true,
});

const body = new Sprite(await Assets.load("body.png"));
const head = new Sprite(await Assets.load("head.png"));
head.position.set(0, -40);
head.zIndex = 1;

group.addChild(body, head);
group.pivot.set(group.width / 2, group.height / 2);
group.scale.set(1.5);

app.stage.addChild(group);
```

**Related skills:** `pixijs-scene-core-concepts` (scene graph mental model, masking, layers, render groups), `pixijs-scene-sprite` / `pixijs-scene-graphics` / `pixijs-scene-text` / `pixijs-scene-mesh` (leaf objects that go inside containers), `pixijs-events` (`eventMode`, hit testing), `pixijs-math` (Matrix, toGlobal/toLocal detail), `pixijs-performance` (`cacheAsTexture`, culling, render groups).

## Core Patterns

### Constructor options

```ts
const container = new Container({
  label: "world",
  x: 100,
  y: 50,
  scale: 2,
  rotation: Math.PI / 4,
  alpha: 0.8,
  visible: true,
  tint: 0xffaa00,
  blendMode: "add",
  sortableChildren: true,
  isRenderGroup: true,
  origin: { x: 0, y: 0 },
  boundsArea: new Rectangle(0, 0, 1920, 1080),
});
```

All `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

The `Container` constructor uses `assignWithIgnore` to bulk-copy every field in the options object onto the instance except `children`, `parent`, and `effects`. Any public property of `Container` is a valid constructor option: `cullable`, `cullArea`, `mask`, `filterArea`, `eventMode`, `hitArea`, and so on. The options block above groups the most common ones; see the shared reference above for the full list.

`isRenderGroup: true` promotes the container to its own render group so its transforms are applied on the GPU rather than recomputed per-child on the CPU. Use it on stable sub-trees (large static worlds, UI layers). Don't overuse; most scenes don't need explicit render groups and too many hurts performance. Profile before promoting. See `pixijs-scene-core-concepts/references/scene-management.md`.

`sortableChildren: true` causes children to be re-sorted by `zIndex` at the next render. See `zIndex` below.

`origin` is a first-class v8 transform helper: an `ObservablePoint` that acts as a rotation/scale center **without** moving the container. Where `pivot` shifts the projection of the local origin in parent space (so changing it displaces the object), `origin` leaves position alone and simply rotates/scales around the specified local point. Accepts `PointData`, a single number (applied to both axes), or can be set live via `container.origin.set(x, y)`. Setting both `pivot` and `origin` on the same container produces compounding behavior and is discouraged; pick one.

`boundsArea` forces `getBounds()` to return a fixed rectangle instead of recursively measuring children; it is a performance win for containers with hundreds of cheap, predictable children.

`cullable` and `cullArea` are valid constructor options (the `assignWithIgnore` pass copies them like any other field), but they are documented in `pixijs-performance` because culling setup is a performance concern rather than a scene-graph concern.

### Leaves vs containers

```ts
const parent = new Container();
const sprite = new Sprite(texture);

parent.addChild(sprite);
```

Only `Container` (and subclasses intended to hold children, like `RenderLayer`) should have children. `Sprite`, `Graphics`, `Text`, `Mesh`, `ParticleContainer` particles, and `DOMContainer` content are leaves by convention in PixiJS v8. Wrap them in a `Container` whenever you need to group things: give the container the layout logic and keep the leaves pure visual data. Adding children to a leaf logs a deprecation warning and is scheduled to become a hard error.

### Adding and removing children

```ts
const parent = new Container();

parent.addChild(a, b, c);
parent.addChildAt(d, 0);
parent.swapChildren(a, b);
parent.setChildIndex(c, 0);

parent.removeChild(b);
parent.removeChildAt(0);
parent.removeChildren();

parent.removeChildren(0, 2);
```

`addChild` accepts any number of children and returns the first one. Children render in array order: index 0 is drawn first (behind), the last index is drawn last (in front). `addChildAt` inserts at a specific index; `setChildIndex` moves an existing child; `swapChildren` exchanges two children's positions.

`removeChildren(beginIndex?, endIndex?)` removes a slice and returns the removed array.

Calling `addChildAt` with a child that already belongs to the same container silently moves it to the new index. No `added` / `childAdded` / `removed` / `childRemoved` events fire, because the parent-child relationship didn't change. Events only fire when the child comes from a different parent (or from no parent).

For reparenting that preserves world transform (so the child doesn't visually jump), use `reparentChild` / `reparentChildAt`. For swapping a child in place while copying the old child's local transform, use `replaceChild`.

### Transform properties

```ts
const obj = new Container();

obj.x = 100;
obj.y = 200;
obj.position.set(100, 200);

obj.scale.set(2);
obj.scale = 2;

obj.rotation = Math.PI / 4;
obj.angle = 45;

obj.pivot.set(50, 50);
obj.skew.set(0.1, 0.2);

obj.alpha = 0.5;
obj.tint = 0xff0000;
obj.visible = false;
obj.renderable = false;
```

- `position`, `scale`, `pivot`, `skew` are `ObservablePoint`s. Assigning `scale = 2` is valid and sets both axes.
- `rotation` is radians; `angle` is degrees; they are aliases that stay in sync.
- `pivot` sets the point in local space that maps to `position` in parent space; changing it both moves and rotates the container.
- `alpha` and `tint` multiply down through children. `blendMode` applies to this container's draw instructions.
- `visible = false` skips rendering and transform updates. `renderable = false` skips rendering but still updates transforms (use when you need `getBounds()` or hit-testing without drawing).

### zIndex and sortableChildren

```ts
const world = new Container({ sortableChildren: true });

const ground = new Sprite(groundTexture);
ground.zIndex = 0;

const player = new Sprite(playerTexture);
player.zIndex = 10;

const ui = new Sprite(uiTexture);
ui.zIndex = 100;

world.addChild(ground, player, ui);
```

When `sortableChildren` is `true`, the container re-sorts its children by `zIndex` before the next render. Changing any child's `zIndex` automatically re-marks the parent as needing sort. Sort only what you need to sort; leaving `sortableChildren` off is cheaper. If you want full manual control, call `container.sortChildren()` yourself after changing `zIndex` values.

For render-order control that is decoupled from the hierarchy (children keep their logical parent for transforms but render at a different z), use `RenderLayer`. See `pixijs-scene-core-concepts/references/scene-management.md`.

### Bounds and coordinate conversion

```ts
const bounds = container.getBounds();
console.log(bounds.x, bounds.y, bounds.width, bounds.height);

const rect = container.getBounds().rectangle;

const local = new Point(10, 20);
const world = container.toGlobal(local);
const backToLocal = container.toLocal(world);

const selfPos = container.getGlobalPosition();
```

`getBounds()` returns a `Bounds` object (not a `Rectangle`); it exposes `x`, `y`, `width`, `height`, and a `.rectangle` getter for APIs that need an actual `Rectangle`. The signature is `getBounds(skipUpdate?: boolean, bounds?: Bounds)` — pass `true` as the first arg to skip the forced transform update, and an optional `Bounds` instance as the second arg to avoid allocating a new one.

`toGlobal(point)` converts a point in this container's local space to scene-root space. `toLocal(point, from?)` converts from another container's local space (or global space if `from` is omitted). `getGlobalPosition()` is shorthand for `parent.toGlobal(this._position)`.

### Sizing

```ts
const sprite = new Sprite(texture);

sprite.setSize(200, 100);
const { width, height } = sprite.getSize();
```

`setSize` adjusts `scale` so the container's bounds fit the requested pixel size, in one operation. Setting `.width` and `.height` individually works, but each assignment triggers a separate bounds recomputation; prefer `setSize` when changing both axes.

### Container events

```ts
const parent = new Container();

parent.on("childAdded", (child, container, index) => {
  console.log("added at", index, child.label);
});

parent.on("childRemoved", (child, container, index) => {
  console.log("removed from", index);
});

const child = new Container();
child.on("added", (newParent) => console.log("entered", newParent.label));
child.on("removed", (oldParent) => console.log("left", oldParent.label));
child.on("visibleChanged", (visible) => console.log("visible:", visible));
child.on("destroyed", (destroyed) => console.log("gone", destroyed.label));

parent.addChild(child);
```

| Event            | Fires on                              | Arguments                   |
| ---------------- | ------------------------------------- | --------------------------- |
| `childAdded`     | the parent receiving the child        | `(child, container, index)` |
| `childRemoved`   | the parent losing the child           | `(child, container, index)` |
| `added`          | the child that was attached           | `(parent)`                  |
| `removed`        | the child that was detached           | `(parent)`                  |
| `destroyed`      | the destroyed container               | `(container)`               |
| `visibleChanged` | the container whose `visible` flipped | `(visible)`                 |

These are emitted on the `EventEmitter` side of `Container`; do not confuse them with pointer events from `pixijs-events`.

`destroyed` fires after internal cleanup but before listeners are removed, so by the time your handler runs `position`, `scale`, `pivot`, `origin`, `skew`, and `parent` have already been nulled, and `children` has been emptied (length 0, but the array reference itself is not nulled). Capture any data you need from the container _before_ calling `destroy()`, not inside the handler.

### Per-frame updates with onRender

```ts
const container = new Container();

container.onRender = (renderer) => {
  container.rotation += 0.01;
};

container.onRender = null;
```

`onRender` runs every frame while the container is being rendered, and receives the active `Renderer`. Use it for lightweight animation or per-frame updates tied to a specific container. In v7 this pattern was done by overriding `updateTransform`, which no longer runs every frame in v8. Set `onRender = null` to detach the callback.

### Finding and removing from parent

```ts
const player = world.getChildByLabel("player");
const enemies = world.getChildrenByLabel(/enemy-\d+/, true);

const bounds = hud.getLocalBounds();

oldSprite.removeFromParent();
```

- `getChildByLabel(label, deep?)` — first match by string or `RegExp`. Pass `true` for a recursive search.
- `getChildrenByLabel(label, deep?, out?)` — all matches. Accepts an optional reusable output array.
- `getLocalBounds()` — bounds in this container's own coordinate space, ignoring parent transforms. Cheaper than `getBounds()` for self-contained layout math.
- `removeFromParent()` — detaches `this` from its current parent (no-op if already orphaned).

### Destroy

```ts
container.destroy();

container.destroy({
  children: true,
  texture: true,
  textureSource: true,
});

console.log(container.destroyed);
```

By default `destroy()` unlinks this container from its parent and tears down its own state. Pass `{ children: true }` to recursively destroy every descendant; this is the usual call for killing a whole subtree. `texture: true` and `textureSource: true` additionally destroy the GPU resources referenced by leaf children (useful for sprites whose textures you loaded just for them). If `cacheAsTexture` is on, disable it with `container.cacheAsTexture(false)` before destroying.

## Common Mistakes

### [CRITICAL] Adding children to leaf scene objects

Wrong:

```ts
const sprite = new Sprite(texture);
const overlay = new Sprite(overlayTexture);
sprite.addChild(overlay);
```

Correct:

```ts
const group = new Container();
const sprite = new Sprite(texture);
const overlay = new Sprite(overlayTexture);
group.addChild(sprite, overlay);
```

Sprites, Graphics, Text, and Mesh are leaves. Adding children to them logs a deprecation warning now and will be an error in a future version. Always wrap them in a `Container` when you need grouping.

### [HIGH] Expecting getBounds() to return a Rectangle

Wrong:

```ts
const rect = container.getBounds();
rect.contains(x, y); // TypeError: contains is not a function
```

Correct:

```ts
const rect = container.getBounds().rectangle;
rect.contains(x, y);

const bounds = container.getBounds();
console.log(bounds.width, bounds.height);
```

`getBounds()` returns a `Bounds` instance in v8. Its basic getters (`x`, `y`, `width`, `height`) work, but for `Rectangle`-specific methods like `.contains()` or passing to APIs that require a `Rectangle`, read the `.rectangle` property.

### [HIGH] Using cacheAsBitmap instead of cacheAsTexture

Wrong:

```ts
container.cacheAsBitmap = true;
```

Correct:

```ts
container.cacheAsTexture(true);
```

`cacheAsBitmap` (v7 property) was renamed to `cacheAsTexture()` (a method) in v8. Always disable it with `cacheAsTexture(false)` before calling `destroy()`.

### [MEDIUM] Using container.name instead of container.label

`name` was renamed to `label` in v8. The old property still works as a deprecated alias; `getChildByLabel` is the v8 way to look up children by name.

### [MEDIUM] Setting both pivot and origin on the same container

Pivot shifts the projection of the local origin in parent space (moves the object as a side-effect of changing the rotation center). Origin changes the rotation/scale center without displacement. Setting both on the same container produces unexpected compounding; pick one.

## API Reference

- [Container](https://pixijs.download/release/docs/scene.Container.html.md)
- [ContainerOptions](https://pixijs.download/release/docs/scene.ContainerOptions.html.md)
- [ViewContainer](https://pixijs.download/release/docs/scene.ViewContainer.html.md)
- [Bounds](https://pixijs.download/release/docs/rendering.Bounds.html.md)
- [Point](https://pixijs.download/release/docs/maths.Point.html.md)
- [ObservablePoint](https://pixijs.download/release/docs/maths.ObservablePoint.html.md)
- [RenderGroup](https://pixijs.download/release/docs/rendering.RenderGroup.html.md)
