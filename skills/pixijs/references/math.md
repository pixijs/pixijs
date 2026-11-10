# math

`Point` / `ObservablePoint`, `Matrix` (operation order, `decompose`, `setFromMatrix`), shapes and their hit tests, `Rectangle` helpers, and the `pixi.js/math-extras` vector methods.

Mapping a pointer or point between spaces: `container.toLocal(e.global)` / `toGlobal(p)` stay correct under rotation, scale and pivot and before the first render; see [scene-container](scene-container.md#bounds-and-coordinate-conversion). Using a shape as a `hitArea`: [events](events.md#hit-testing).

## Point and ObservablePoint

`position`, `scale`, `pivot`, `origin` and `skew` are `ObservablePoint`s: mutating `.x` / `.y` marks the transform dirty. Write into them with `set(x, y)` (`set(v)` sets both), `copyFrom(p)` (any `PointData`), or by assigning a point to the property (`container.position = p` copies). There is no `copy()` method on `Point` or `ObservablePoint` (`position.copy(p)` throws); use `copyFrom(p)`. Other members: `clone()`, `equals(p)`, `copyTo(p)`.

`Point.shared`, `Matrix.shared` and `Matrix.IDENTITY` are reset to zero/identity every time they are accessed, and every caller gets the same object. Use them only within a single expression (`m.equals(Matrix.IDENTITY)`); never keep a reference, since a stored `Point.shared` reads `0` on the next access.

Types: `PointData` is the minimal `{ x, y }` accepted by most APIs; `PointLike` adds `set()`, `copyFrom()`, `copyTo()`, `equals()` and is implemented by both point classes; `Size` is `{ width, height }`. Constants `DEG_TO_RAD`, `RAD_TO_DEG` and `PI_2` (`Math.PI * 2`) are exported from `pixi.js`.

## Matrix

`Matrix` is a 2D affine `| a c tx | b d ty | 0 0 1 |`. `apply(p)` maps local → parent space, `applyInverse(p)` the reverse; `invert()`, `clone()`, `equals()`.

**Call order.** `translate`, `rotate` and `scale` each apply after what the matrix already does, so points are transformed in call order, and `rotate`/`scale` also rotate/scale any translation already in the matrix. `new Matrix().translate(100, 50).rotate(r).scale(2, 2)` moves the point first, then rotates and scales that offset too; it does not match a Container at (100, 50). For Container-style TRS write `scale().rotate().translate()` or `setTransform(x, y, pivotX, pivotY, scaleX, scaleY, rotation, skewX, skewY)`. Positive rotation is clockwise on screen (y points down).

```ts
const m = new Matrix().scale(2, 2).rotate(Math.PI / 4).translate(100, 50); // same as a Container

const a = new Matrix().translate(50, 0);
const b = new Matrix().rotate(Math.PI / 2);
a.clone().append(b); // points get b first, then a: (10, 0) -> (50, 10)
a.clone().prepend(b); // points get a first, then b: (10, 0) -> (0, 60)
```

Transform about a point P: `.translate(-P.x, -P.y).scale(s, s).translate(P.x, P.y)` (same with `rotate`). Chain several such steps in the order they should happen, then put the result on a display object with `container.setFromMatrix(m)` (it decomposes into `position`/`scale`/`rotation`/`skew` and keeps the current `pivot`).

`m.decompose(t)` writes into `{ position, scale, pivot, skew, rotation }` (`Point`s plus a number). A mirrored matrix (one axis flipped, axes still perpendicular) decomposes into rotation + negative `scale.x` with zero skew. `scale.y` is never negative: a y-axis flip comes back as `scale.x = -1` plus a half turn. Either way the parts rebuild the matrix.

```ts
const transform = { position: new Point(), scale: new Point(), pivot: new Point(), skew: new Point(), rotation: 0 };
new Matrix().rotate(Math.PI / 6).scale(-1, 1).decompose(transform);
transform.scale.x; // -1
transform.skew.x; // 0
```

## Shapes and hit testing

`Rectangle`, `Circle`, `Ellipse`, `Polygon`, `RoundedRectangle` and `Triangle` all have `contains(x, y)`, `getBounds(out?)` (returns a `Rectangle`) and `strokeContains(x, y, width, alignment?)`, and each exposes `type` (`'rectangle' | 'circle' | 'ellipse' | 'polygon' | 'roundedRectangle' | 'triangle'`, the `SHAPE_PRIMITIVE` union) for branching without `instanceof`.

`strokeContains` follows the drawn stroke: `alignment` 1 = inner, 0.5 = centered (default), 0 = outer, independent of polygon winding order. `Triangle` ignores `alignment` and always tests a centered stroke. A stroke that reaches past the shape's centre covers the whole interior; there is no hole.

```ts
rect.strokeContains(0, 50, 4); // on a 4px centered stroke?
new Ellipse(0, 0, 10, 10).strokeContains(0, 0, 40, 1); // true: inner stroke wider than the radius
const outer = new Polygon([0, 0, 100, 0, 100, 100, 0, 100]);
outer.strokeContains(-5, 50, 20); // true (centered stroke extends 10px outward)
outer.strokeContains(-5, 50, 20, 1); // false (inner stroke stays inside)
outer.strokeContains(5, 50, 20, 0); // false (outer stroke stays outside)
```

### Rectangle

- `left`/`right`/`top`/`bottom`, `isEmpty()`. `Rectangle.EMPTY` returns a new empty rect on each access.
- Native (no math-extras): `containsRect(other)` is true when `other` is fully inside, a flush edge or an identical rect included; `intersects(other)` returns a `boolean`, and `intersects(other, matrix)` tests overlap after transforming `other`. Do not confuse it with math-extras `intersection(other)`, which returns the overlap `Rectangle`.
- Mutating helpers that return `this`: `pad(5)` grows all sides (`(10, 10, 100, 50)` → `(5, 5, 110, 60)`), `pad(10, 4)` horizontal/vertical; `scale(2)` multiplies x, y, width and height; `fit(viewport)` shrinks this to lie inside another rect (`(150, 150, 200, 200).fit((0, 0, 200, 200))` → `(150, 150, 50, 50)`); `enlarge(other)` grows this to include another rect; `ceil(resolution?)` snaps outward to a pixel grid (1 = whole pixels, 2 = half pixels); `copyFromBounds(container.getBounds())` copies a `Bounds` into a `Rectangle`.

### Polygon

```ts
new Polygon([0, 0, 100, 0, 50, 100]); // flat numbers
new Polygon([new Point(0, 0), new Point(100, 0), new Point(50, 100)]); // PointData[]
new Polygon(0, 0, 100, 0, 50, 100); // spread numbers
new Polygon(new Point(0, 0), new Point(100, 0), new Point(50, 100)); // spread points
```

`points` is the mutable flat array; `closePath` is `true` by default (`false` produces an open path); `startX`/`startY` and `lastX`/`lastY` give the first and last vertex. `isClockwise()` is a shoelace winding test, and `outer.containsPolygon(hole)` tests polygon-in-polygon containment (both useful for SVG hole detection).

## math-extras

`import "pixi.js/math-extras"` once in the entry file adds methods to `Point`, `ObservablePoint` and `Rectangle` by prototype extension; it is not in the default bundle. The types are always visible, so tsc does not catch a missing import: `p.add(q)` compiles, then throws `TypeError: p.add is not a function` at runtime.

Point / ObservablePoint gain `add`, `subtract`, `multiply` (component-wise), `multiplyScalar`, `dot`, `cross` (z-component), `magnitude`, `magnitudeSquared`, `normalize`, `project`, `reflect` (across a normal) and `rotate`. None of them mutates `this`: methods that return a Point write into the optional `out` argument, or a new Point without it; `dot`, `cross`, `magnitude` and `magnitudeSquared` return numbers. To update in place, pass the target as `out`:

```ts
import "pixi.js/math-extras";
import { Point, Sprite } from "pixi.js";

declare const sprite: Sprite;
const velocity = new Point(2, 1);

sprite.position.add(velocity); // result discarded: the sprite does not move
sprite.position.add(velocity, sprite.position); // moves the sprite
velocity.normalize(velocity); // normalizes velocity itself
velocity.copyFrom(velocity.rotate(Math.PI / 2)); // rotate cannot write into itself
```

`rotate` is the exception: with `out` equal to `this` it overwrites `x` before computing `y`, so `p.rotate(a, p)` returns a wrong `y`. Rotate into another point and copy it back.

Rectangle gains `equals(other)`, `intersection(other, out?)` (the overlap rect: `(0, 0, 100, 100)` ∩ `(50, 50, 100, 100)` → `(50, 50, 50, 50)`) and `union(other, out?)` (the envelope: `(0, 0, 150, 150)`).

### Line and segment intersection

`floatEqual`, `lineIntersection` and `segmentIntersection` are not importable from the npm package in 8.22: `pixi.js/math-extras` only patches prototypes and exports nothing, and a named import from it fails both tsc and the browser. Write the helper yourself:

```ts
import { Point, type PointData } from "pixi.js";

// Intersection of segments a1-a2 and b1-b2, or null if they do not cross.
function segmentIntersection(a1: PointData, a2: PointData, b1: PointData, b2: PointData): Point | null {
  const d = (a2.x - a1.x) * (b2.y - b1.y) - (a2.y - a1.y) * (b2.x - b1.x);
  if (d === 0) return null; // parallel or collinear
  const t = ((b1.x - a1.x) * (b2.y - b1.y) - (b1.y - a1.y) * (b2.x - b1.x)) / d;
  const u = ((b1.x - a1.x) * (a2.y - a1.y) - (b1.y - a1.y) * (a2.x - a1.x)) / d;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return new Point(a1.x + t * (a2.x - a1.x), a1.y + t * (a2.y - a1.y));
}
```

Drop the `t`/`u` range check for infinite lines.
