# transforms

The three transform matrices, screen vs global coordinates, cumulative alpha, and scale 0. Transform properties, `pivot` vs `origin`, `toGlobal`/`toLocal` and `worldTransform` freshness are in [scene-container](../scene-container.md#transform-properties); matrix math is in [math](../math.md).

## The three matrices

```ts
container.localTransform; // from this node's own position/scale/rotation/pivot/skew
container.groupTransform; // relative to the nearest ancestor render group
container.worldTransform; // relative to the scene root; what the renderer consumes
```

Moving a render group's root leaves its descendants' `groupTransform` unchanged, which is what makes [render groups](render-groups.md) cheap. All three are recomputed during a render. For a live value call `getGlobalTransform()`, `toGlobal()` or `getGlobalPosition()`.

## Global, local, and screen coordinates

- **Local**: relative to the object's parent. `container.x` / `position.set()` always operate here.
- **Global** (world): relative to the scene root. `toGlobal()`, `toLocal()` and `getGlobalPosition()` convert between local and global.
- **Screen**: relative to the canvas element's top-left in CSS pixels.

Global and screen diverge when the canvas is CSS-scaled. The event system maps pointer events into canvas space, so `event.global` is already global. For raw DOM coordinates read `event.client` (or `event.nativeEvent`); for the last pointer position outside a handler read `app.renderer.events.pointer.global`.

## Cumulative alpha

`container.alpha` is local; the product with every ancestor's alpha is `container.getGlobalAlpha()`, which walks the parents and is always current. `getGlobalAlpha(true)` reads the render-time cached value instead.

## Scale 0

`scale.set(0)` collapses the matrix, so `toLocal` and every inverse transform divide by zero. Hide with `visible = false`, or animate to a tiny non-zero scale such as `0.01`.
