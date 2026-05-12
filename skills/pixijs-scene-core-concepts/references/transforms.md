# Transforms and Coordinate Spaces

Every `Container` has a transform: position, scale, rotation, pivot, skew, and origin. These combine into a `localTransform` matrix, which compounds with ancestors to produce the `worldTransform`. Use this reference for coordinate-space conversion and the details of setting vs. animating transforms. For matrix math, see `pixijs-math`.

## Quick Start

```ts
const hero = new Container();
hero.x = 100;
hero.y = 200;
hero.scale.set(2);
hero.rotation = Math.PI / 4;

const worldPoint = hero.toGlobal({ x: 0, y: 0 });
const localPoint = hero.toLocal({ x: 300, y: 300 });
```

Transforms are local to the parent. `toGlobal` and `toLocal` convert between coordinate spaces.

## Core Patterns

### Position, scale, rotation

```ts
container.x = 100;
container.y = 200;
container.position.set(100, 200);

container.scale.set(2); // uniform
container.scale.set(1.5, 0.8); // non-uniform
container.scale.x = 2;

container.rotation = Math.PI / 4; // radians
container.angle = 45; // degrees (convenience)
```

`position`, `scale`, and `pivot` are `ObservablePoint` instances; direct assignment via `x` / `y` works, or call `set(x, y?)`. Setting them triggers the parent's transform update flag.

### Pivot

```ts
sprite.pivot.set(sprite.width / 2, sprite.height / 2);
sprite.x = 200;
sprite.y = 200;
sprite.rotation += 0.01;
```

`pivot` is the point around which rotation and scale apply; in the **container's own local pixel space**. A pivot of `(w/2, h/2)` rotates around the center.

For `Sprite`, prefer `anchor` (normalized 0–1) which only shifts the texture draw origin without offsetting the position. Pivot shifts the position too.

### Origin (new in v8)

```ts
container.origin.set(100, 50);
```

`origin` is an alternative transform origin that shifts the rotation/scale pivot **without offsetting the visual position**. Think of it as "pivot, but without the position shift." Useful when you want to spin a large container around an off-center point while keeping it visually anchored to its `x` / `y`.

### Skew

```ts
container.skew.set(0.1, 0);
```

Rarely used. Skew shears the coordinate space by `x` / `y` radians. Useful for fake perspective and isometric effects.

### Coordinate conversion

```ts
const globalPoint = container.toGlobal({ x: 10, y: 20 });

const localPoint = container.toLocal({ x: 400, y: 300 });

const localFromSprite = container.toLocal({ x: 0, y: 0 }, otherSprite);

const cached = container.getGlobalPosition();
```

- `toGlobal(localPoint)`: convert from this container's local space to global (scene root) space.
- `toLocal(point, from?)`: convert from global (or another container's) space to this container's local space.
- `getGlobalPosition()`: shortcut for `toGlobal({ x: 0, y: 0 })`; this container's origin in global space.

All three accept an optional `point` argument to write into (reduces allocation in hot paths) and a `skipUpdate` flag that uses the cached transform (faster but can be stale).

### The three matrices

```ts
container.localTransform; // from this node's own position/scale/rotation/pivot/skew
container.groupTransform; // relative to the render group it belongs to
container.worldTransform; // relative to the scene root
```

Each frame, PixiJS composes these three levels:

1. `localTransform`; derived from the container's own transform setters.
2. `groupTransform`; if an ancestor is a render group, this is the transform relative to that group.
3. `worldTransform`; relative to the scene root; what the renderer consumes.

For normal code, set `x` / `y` / `scale` / `rotation` and let the renderer compose the rest. Reading `worldTransform` directly is useful for hit testing, custom rendering, or integrating with physics.

### Sizing via width, height, setSize

```ts
container.width = 100;
container.height = 200;

container.setSize(100, 200);
const { width, height } = container.getSize();
```

Setting `width` and `height` scales the container to fit the requested dimensions; internally they assign `scale.x` / `scale.y` based on the measured bounds. Assigning the two setters independently re-measures the subtree twice, which is wasteful. Use `setSize(width, height?)` to assign both in a single pass, and `getSize()` to read them back as `{ width, height }`.

### Bounds in different spaces

```ts
const localBounds = container.getLocalBounds();
const globalBounds = container.getBounds();

const reusable = new Bounds();
container.getBounds(true, reusable); // skipUpdate + in-place

const rect = container.getBounds().rectangle;
rect.contains(pointerX, pointerY);
```

- `getLocalBounds()`: rectangle in the container's own local space.
- `getBounds(skipUpdate?, bounds?)`: rectangle in world space (accounts for all ancestor transforms). Pass `true` for `skipUpdate` to reuse the cached transform instead of forcing a fresh pass, and pass an existing `Bounds` instance as the second argument to avoid allocating a new one.

Both methods return a `Bounds` instance, not a `Rectangle`. `Bounds` exposes `x`, `y`, `width`, and `height` getters plus a `.rectangle` accessor for APIs like `Rectangle.contains()`.

Bounds are recalculated lazily. Call them sparingly; each call walks the container's sub-tree. For containers with many cheap children (particles, tile layers), set `container.boundsArea = new Rectangle(0, 0, w, h)` so `getBounds()` returns that rectangle directly without recursing.

### Global, local, and screen coordinates

PixiJS uses three coordinate spaces:

- **Local**: relative to the object's parent. This is what `container.x` / `container.y` and `position.set()` always operate on.
- **Global** (a.k.a. "world"): relative to the scene root. `toGlobal()`, `toLocal()`, and `getGlobalPosition()` convert between local and global space.
- **Screen** (a.k.a. "viewport"): relative to the top-left of the canvas element PixiJS is rendering into. DOM events and native mouse clicks use screen space.

Global and screen usually match, but they diverge when the canvas is CSS-scaled or rendered at a non-1 resolution. PixiJS's event system handles this conversion automatically for pointer events, so `onPointerDown` handlers always receive global coordinates. When you need raw screen coordinates, read `renderer.events.pointer`; use `toLocal` / `toGlobal` for the world side.

### Cumulative alpha (getGlobalAlpha)

`container.alpha` is local to the container; the cumulative alpha (parent × this × ancestors) is exposed via `container.getGlobalAlpha(skipUpdate?)`. It's computed during render, so reading it before the first frame returns 1 on a freshly-added subtree. Useful for custom render hooks that need to know how transparent the renderer will actually draw this node.

## Common Mistakes

### [HIGH] Setting scale to 0

Wrong:

```ts
container.scale.set(0);
```

Correct:

```ts
container.scale.set(0.01); // or use visible = false
container.visible = false;
```

Scale of exactly 0 collapses the transform matrix to zero, and any subsequent `toLocal` / `toGlobal` / inverse calculations divide by zero. Use `visible = false` to hide, or scale to a tiny non-zero value if you need an animation.


### [MEDIUM] Reading world transform before first render

Wrong:

```ts
const pos = container.getGlobalPosition();
console.log(pos); // { x: 0, y: 0 } even though container.x is set
```

Correct:

```ts
app.stage.addChild(container);
await new Promise((r) => requestAnimationFrame(r));
const pos = container.getGlobalPosition();
```

`worldTransform` is computed during render. Before the first render, it's identity. If you need a live position before rendering, use `container.toGlobal({x:0, y:0})` which walks the transforms explicitly.


### [MEDIUM] Confusing anchor and pivot

On `Sprite`, `anchor` is normalized (0–1) and shifts only the draw origin. `pivot` is in pixel space and shifts both the transform origin AND the visual position. For centering a sprite, use `anchor`. For off-center rotation of a Container (which has no `anchor`), use `pivot`.


## API Reference

- [Container](https://pixijs.download/release/docs/scene.Container.html.md)
- [ToLocalGlobalMixin](https://pixijs.download/release/docs/scene.ToLocalGlobalMixin.html.md)
- [Matrix](https://pixijs.download/release/docs/maths.Matrix.html.md)
- [ObservablePoint](https://pixijs.download/release/docs/maths.ObservablePoint.html.md)
