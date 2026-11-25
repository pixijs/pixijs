# scene-container

`Container`: children, transforms, hiding, `zIndex`, bounds and coordinate conversion, sizing, container events, and `destroy` options.

Only a `Container` holds children; `Sprite`, `Graphics`, `Text` and `Mesh` are leaves (see [scene-core-concepts](scene-core-concepts.md#container-vs-leaf)). Constructor options, including `isRenderGroup` and `boundsArea`, and the ones that misbehave as options (`cacheAsTexture`, `width` before `children`): [constructor-options](scene-core-concepts/constructor-options.md). `cullable` / `cullArea`: [performance](performance.md#culling). v7 names: `cacheAsBitmap = true` is the method `cacheAsTexture(true)` ([performance](performance.md#cacheastexture-for-performance)); `name` / `getChildByName` are deprecated aliases of `label` / `getChildByLabel`.

## Adding and removing children

- `addChild(a, b, c)` accepts any number of children and returns the first one. Children render in array order: index 0 is drawn first (behind).
- `removeChildren(beginIndex?, endIndex?)` removes `[beginIndex, endIndex)` and returns the removed array. In 8.22 it is only correct with `beginIndex = 0`: with a non-zero start it splices `endIndex` items instead of `endIndex - beginIndex`, dropping extra children from the array without events while their `parent` still points here. For a middle range, loop `removeChildAt(beginIndex)` (endIndex - beginIndex) times.
- `addChildAt` with a child that already belongs to the same container silently moves it to the new index. No `added` / `childAdded` / `removed` / `childRemoved` events fire, because the parent-child relationship didn't change.
- `reparentChild` / `reparentChildAt` move a child while preserving its world transform, but they read `worldTransform`, which only a render updates; if either container was created or moved since the last render, the child jumps. Then compute it yourself (position only; rotation/scale are not carried):

  ```ts
  const g = child.getGlobalPosition();
  newParent.addChild(child);
  newParent.toLocal(g, undefined, child.position);
  ```

- `replaceChild(old, next)` swaps a child in place, copying the old child's local transform. `child.removeFromParent()` detaches a child without a parent reference.
- `getChildByLabel(label, deep?)` returns the first match by string or `RegExp` (`true` searches recursively); it is typed `Container | null`, so under strict TS null-check it and cast before using leaf members. `getChildAt<Sprite>(i)` takes a type argument instead. `getChildrenByLabel(label, deep?, out?)` returns all matches.

## Transform properties

```ts
obj.position.set(100, 200);
obj.scale = 2; // sets both axes
obj.angle = 45; // degrees; rotation is radians, and they stay in sync
obj.origin.set(50, 50);
```

- `position`, `scale`, `pivot`, `origin`, `skew` are `ObservablePoint`s; copy into them with `set` / `copyFrom` (see [math](math.md#point-and-observablepoint)).
- `pivot` sets the point in local space that maps to `position` in parent space; rotation and scale happen around it, and changing it shifts the drawing.
- `origin` (v8.11+) rotates and scales around a local point without that shift: the object stays where `position` puts it. Set one of `pivot` or `origin` on a container, never both; they compound.
- `alpha` and `tint` multiply down through children. `blendMode`: [blend-modes](blend-modes.md). The three matrices and cumulative alpha: [transforms](scene-core-concepts/transforms.md).

## Hiding

What each way of hiding keeps (transforms still update in every case):

| Setting             | Drawn | Counted in `getBounds()` | Hit-tested / pointer events | Accessibility element |
| ------------------- | ----- | ------------------------ | --------------------------- | --------------------- |
| `visible = false`   | no    | no                       | no                          | no                    |
| `renderable = false`| no    | yes                      | no                          | yes                   |
| `alpha = 0`         | no    | yes                      | yes                         | yes                   |

For an invisible click target use `alpha = 0`, or a `hitArea` on an interactive container; `renderable = false` silently stops pointer events.

## zIndex and sortableChildren

```ts
ground.zIndex = 0;
player.zIndex = 10; // world re-sorts before the next render; no sortableChildren needed
world.addChild(ground, player);
```

Assigning a non-zero `zIndex` to a child (or adding a child that already has one) sets `sortableChildren = true` and marks the parent for a re-sort before the next render; you do not need to set `sortableChildren` yourself. The flag only matters if you want sorting on before any child has a `zIndex`. Equal `zIndex` values keep their insertion order. The sort happens during the next render: until then `children` (and `getChildIndex`) still show the old order, so call `sortChildren()` first if you read the order right after changing `zIndex`. `sortChildren()` does nothing unless a `zIndex` changed since the last sort; to reorder without `zIndex`, use `setChildIndex`, `addChildAt` or `swapChildren`.

`zIndex` orders siblings only. A sprite with `zIndex = 1000` inside container A still draws below every child of a container B that comes after A. For one depth order across different parents (e.g. y-sorting units from several groups), attach them to a `RenderLayer` created with `sortableChildren: true` and set `obj.zIndex = obj.y` every frame; see [layers](scene-core-concepts/layers.md).

## Bounds and coordinate conversion

```ts
container.getBounds().rectangle.contains(x, y);
const global = container.toGlobal(new Point(10, 20));
const fromOther = container.toLocal({ x: 0, y: 0 }, otherSprite);
```

`getBounds()` returns a `Bounds` object, not a `Rectangle`: `x`, `y`, `width`, `height` work, but `contains` and APIs that need a `Rectangle` take `.rectangle` (`getBounds().contains` throws "is not a function"). The signature is `getBounds(skipUpdate?: boolean, bounds?: Bounds)`; pass a `Bounds` as the second arg to avoid allocating. `getLocalBounds()` measures in the container's own space.

`toGlobal(point)` converts this container's local space to scene-root space. `toLocal(point, from?)` converts from another container's local space (or global space if `from` is omitted). `getGlobalPosition()` is `parent.toGlobal(position)`: the global location of the pivot point, which differs from `toGlobal({ x: 0, y: 0 })` when `pivot` or `origin` is set. All three accept an output point and compute fresh values even before the first render. `worldTransform` (and anything passed `skipUpdate = true`, `reparentChild`, hit testing) reflects only the last render: before the first render it is identity, and after a move it lags until the next frame.

## Sizing

`setSize(w, h)` adjusts `scale` so the container's current bounds fit the requested pixel size, in one operation; `getSize()` reads it back. It is a one-time scale calculation, not a stored size: on an empty container (or one whose content is added later, including `width`/`height` passed in the constructor options alongside `children`) the scale stays 1 and the content shows at natural size. Add the content first, then call `setSize` (again after content changes). Setting `.width` and `.height` individually works the same way, but each assignment re-measures; prefer `setSize` when changing both axes.

## Container events

These need no `eventMode`; they are not pointer events.

| Event            | Fires on                              | Arguments                   |
| ---------------- | ------------------------------------- | --------------------------- |
| `childAdded`     | the parent receiving the child        | `(child, container, index)` |
| `childRemoved`   | the parent losing the child           | `(child, container, index)` |
| `added`          | the child that was attached           | `(parent)`                  |
| `removed`        | the child that was detached           | `(parent)`                  |
| `destroyed`      | the destroyed container               | `(container)`               |
| `visibleChanged` | the container whose `visible` flipped | `(visible)`                 |

`destroyed` fires after internal cleanup but before listeners are removed, so by the time your handler runs `position`, `scale`, `pivot`, `origin`, `skew`, and `parent` have already been nulled, and `children` has been emptied (length 0, but the array reference itself is not nulled). Capture any data you need from the container _before_ calling `destroy()`, not inside the handler. With `{ children: true }` the parent's `destroyed` fires before any child is destroyed (each child's own `destroyed` follows), and on a Sprite the `texture` is still set inside the handler; the texture options run after it.

## Per-frame updates

`container.onRender = (renderer) => { ... }` runs once per render while the container is attached to the rendered scene, even when `visible = false`, `renderable = false` or culled; it stops when the container leaves the rendered scene and resumes when re-added. Set it to `null` to stop. In a subclass, assign it in the constructor. It replaces v7 `updateTransform` overrides; rules and naming traps: [ticker](ticker.md#per-object-onrender-hook).

## Destroy

```ts
container.destroy(); // this node only; children are orphaned, not destroyed

container.destroy({ children: true }); // whole subtree; shared textures survive

container.destroy({
  children: true,
  texture: true, // only when no other object uses these textures
  textureSource: true,
});
```

By default `destroy()` unlinks this container from its parent and removes (but does not destroy) its children: they become parentless and stay alive if you still reference them. `{ children: true }` recursively destroys every descendant and keeps textures, graphics contexts and text styles; it is the safe call for killing a subtree. Add `texture: true` / `textureSource: true` only for textures nothing else uses (`generateTexture` results, canvases you made). Any options object, `{ children: true }` included, also skips the `GraphicsContext` each Graphics built for itself (only a no-argument `graphics.destroy()` frees it); add `context: true` when no Graphics in the subtree shares a context. A `cacheAsTexture` cache is released by `destroy()` automatically. Do not destroy objects from inside `onRender` or other render-time callbacks; defer with `app.ticker.addOnce(() => obj.destroy())`.

`destroy(true)` is not a shorthand for `{ children: true }`: a boolean sets every option, and it is passed down to every descendant, so it equals `{ children: true, texture: true, textureSource: true, context: true, style: true }`. Every Sprite in the subtree (including `AnimatedSprite`, `TilingSprite`, `NineSliceSprite`) destroys its texture and the texture's source (a whole spritesheet atlas, or a texture from `Assets.load`), every Graphics its `GraphicsContext` (even one shared through `new Graphics(context)`), every Text its `TextStyle`. The `destroy` call raises nothing; then every render throws `Cannot read properties of null` while another object still uses a destroyed texture or context, a loaded `Spritesheet` stays cached with a dead atlas, and text sharing a destroyed style draws wrong. For textures loaded through `Assets`, destroy the nodes with `{ children: true }` and release the files with `Assets.unload(url)` once nothing draws from them.
