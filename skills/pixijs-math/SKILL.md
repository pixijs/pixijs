---
name: pixijs-math
description: >
  PixiJS math primitives: Point, ObservablePoint, Matrix (2D transform),
  Rectangle, Circle, Ellipse, Polygon, RoundedRectangle, Triangle.
  Coordinate transforms, hit testing, matrix decomposition.
  Import pixi.js/math-extras for vector math, projection, reflection,
  and Rectangle intersection/union utilities. Use when the user asks about
  points, vectors, matrices, coordinate conversion, toGlobal, toLocal,
  hit testing, shapes, collision detection, rectangle intersection, distance
  calculation, angle math, or DEG_TO_RAD. Covers Point, ObservablePoint,
  Matrix, Rectangle, Circle, Ellipse, Polygon, RoundedRectangle, Triangle,
  PointData, toGlobal, toLocal, math-extras.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  sources: "pixijs/pixijs:src/maths/point/Point.ts, pixijs/pixijs:src/maths/matrix/Matrix.ts, pixijs/pixijs:src/maths/shapes/Rectangle.ts"
---

## When to Use This Skill

Apply when the user needs to work with coordinates, vectors, matrices, shapes, hit testing, coordinate conversion between containers, or extended math utilities like dot product, normalization, and rectangle intersection.

**Related skills:** For transform properties on containers use **core-concepts**; for interaction hit areas use **events**; for culling with Rectangle use **scene-management**.

## Setup

```ts
import { Point, Matrix, Rectangle, Circle, Polygon } from 'pixi.js';

const point = new Point(100, 200);
const matrix = new Matrix();
const rect = new Rectangle(0, 0, 800, 600);
```

## Core Patterns

### Point and ObservablePoint

Point is a simple {x, y} value type. ObservablePoint fires a callback when x or y changes; it is used internally by Container's position, scale, pivot, origin, and skew.

```ts
import { Point } from 'pixi.js';

const p = new Point(10, 20);
p.set(30, 40);           // set both
p.set(50);               // x=50, y=50

const clone = p.clone();
console.log(p.equals(clone)); // true

p.copyFrom({ x: 1, y: 2 });  // accepts any PointData

// Point.shared: temporary point, reset to (0,0) on each access
const temp = Point.shared;
temp.set(100, 200);
// do not store a reference to Point.shared
```

Container properties like `position`, `scale`, `pivot`, `origin`, and `skew` are ObservablePoints. Setting `.x` or `.y` on them triggers transform recalculation automatically.

```ts
import { Container } from 'pixi.js';

const obj = new Container();
obj.position.set(100, 200);   // triggers observer -> marks transform dirty
obj.position.x = 150;         // also triggers observer
```

### Matrix (2D affine transform)

Matrix represents a 3x3 affine transform: `| a c tx | b d ty | 0 0 1 |`. It supports translate, scale, rotate, append, prepend, invert, and decompose.

```ts
import { Matrix, Point } from 'pixi.js';

// Build a transform
const m = new Matrix()
    .translate(100, 50)
    .rotate(Math.PI / 4)
    .scale(2, 2);

// Transform a point (local -> parent space)
const local = new Point(10, 20);
const world = m.apply(local);

// Inverse transform (parent -> local space)
const backToLocal = m.applyInverse(world);

// Combine matrices
const a = new Matrix().translate(50, 0);
const b = new Matrix().rotate(Math.PI / 2);
a.append(b);  // a = a * b

// Decompose into position/scale/rotation/skew
const transform = {
    position: new Point(),
    scale: new Point(),
    pivot: new Point(),
    skew: new Point(),
    rotation: 0,
};
m.decompose(transform);
console.log(transform.rotation); // ~0.785 (PI/4)

// Shared temporary matrix (reset on each access)
const temp = Matrix.shared;
// IDENTITY is read-only reference
const isDefault = m.equals(Matrix.IDENTITY);
```

### Coordinate transforms via Container

Containers provide `toGlobal`, `toLocal`, and `getGlobalPosition` for coordinate conversion.

```ts
import { Container, Point } from 'pixi.js';

const parent = new Container();
parent.position.set(100, 100);
parent.scale.set(2);

const child = new Container();
child.position.set(50, 50);
parent.addChild(child);

// Local point in child's space -> global (world) space
const globalPt = child.toGlobal(new Point(0, 0));
// globalPt = { x: 200, y: 200 } (100 + 50*2, 100 + 50*2)

// Global point -> child's local space
const localPt = child.toLocal(new Point(200, 200));
// localPt = { x: 0, y: 0 }

// Convert between two containers
const other = new Container();
other.position.set(300, 300);
const ptInOther = child.toLocal(new Point(10, 10), other);
```

### Shapes and hit testing

Rectangle, Circle, Ellipse, Polygon, RoundedRectangle, and Triangle all implement `contains(x, y)` for point-in-shape tests. They can be used as `hitArea` on containers for custom interaction regions.

```ts
import { Rectangle, Circle, Polygon, Container } from 'pixi.js';

const rect = new Rectangle(0, 0, 200, 100);
console.log(rect.contains(50, 50));  // true
console.log(rect.contains(300, 50)); // false

// Rectangle edge accessors
console.log(rect.left, rect.right, rect.top, rect.bottom);

const circle = new Circle(100, 100, 50);
console.log(circle.contains(120, 120)); // true

const poly = new Polygon([0, 0, 100, 0, 50, 100]);
console.log(poly.contains(50, 50)); // true

// Use as hit area for interaction
const button = new Container();
button.hitArea = new Rectangle(0, 0, 200, 50);
button.eventMode = 'static';
button.on('pointerdown', () => { /* clicked */ });
```

### Constants

```ts
import { DEG_TO_RAD, RAD_TO_DEG, PI_2 } from 'pixi.js';

const angle = 45 * DEG_TO_RAD;  // 0.785...
const degrees = angle * RAD_TO_DEG; // 45
const fullCircle = PI_2; // Math.PI * 2
```

### Types

`PointData` is the minimal `{x, y}` interface accepted by most APIs. `PointLike` extends it with `set()`, `copyFrom()`, `copyTo()`, `equals()`. Use `PointData` when typing function parameters that only need to read coordinates.

```ts
import type { PointData } from 'pixi.js';

function distance(a: PointData, b: PointData): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}
```

### math-extras (side-effect import)

`import 'pixi.js/math-extras'` adds methods to Point, ObservablePoint, and Rectangle via prototype extension. Not included in the default bundle.

```ts
import 'pixi.js/math-extras';
import { Point } from 'pixi.js';
```

#### Point / ObservablePoint vector methods

All methods accept an optional `out` parameter to avoid allocations. Without `out`, a new Point is returned.

```ts
const a = new Point(3, 4);
const b = new Point(1, 2);

// Arithmetic
const sum = a.add(b);              // Point(4, 6)
const diff = a.subtract(b);        // Point(2, 2)
const prod = a.multiply(b);        // Point(3, 8) - component-wise
const scaled = a.multiplyScalar(2); // Point(6, 8)

// Dot and cross product
const dot = a.dot(b);    // 11
const cross = a.cross(b); // 2 (z-component of 3D cross)

// Length
const len = a.magnitude();        // 5
const lenSq = a.magnitudeSquared(); // 25 (faster for comparisons)

// Normalize to unit vector
const unit = a.normalize(); // Point(0.6, 0.8)

// Projection and reflection
const proj = a.project(b);           // project a onto b
const refl = a.reflect(new Point(0, 1)); // reflect across normal

// Rotation
const rotated = a.rotate(Math.PI / 2); // rotate 90 degrees

// Reuse existing point to avoid allocation
const out = new Point();
a.add(b, out); // result written to out
```

#### Rectangle extended methods

```ts
import 'pixi.js/math-extras';
import { Rectangle } from 'pixi.js';

const r1 = new Rectangle(0, 0, 100, 100);
const r2 = new Rectangle(50, 50, 100, 100);

r1.containsRect(r2);       // false (r2 extends beyond r1)
r1.equals(r2);              // false

const overlap = r1.intersection(r2); // Rectangle(50, 50, 50, 50)
const envelope = r1.union(r2);       // Rectangle(0, 0, 150, 150)

// Optional out parameter
const out = new Rectangle();
r1.intersection(r2, out);
```

#### Geometry utility functions

These functions are exported from `pixi.js/math-extras`, not the main `pixi.js` entry.

```ts
import { floatEqual, lineIntersection, segmentIntersection } from 'pixi.js/math-extras';
import { Point } from 'pixi.js';

// Epsilon-based float comparison (default epsilon: Number.EPSILON)
floatEqual(0.1 + 0.2, 0.3, 1e-10); // true with reasonable epsilon
floatEqual(1.0, 1.001, 0.01); // true (custom epsilon)

// Unbounded line intersection (returns {x: NaN, y: NaN} if parallel)
const hit = lineIntersection(
    new Point(0, 0), new Point(10, 10), // line A
    new Point(10, 0), new Point(0, 10), // line B
); // Point(5, 5)
if (isNaN(hit.x)) { /* lines are parallel */ }

// Bounded segment intersection (returns {x: NaN, y: NaN} if segments don't cross)
const segHit = segmentIntersection(
    new Point(0, 0), new Point(10, 10),
    new Point(10, 0), new Point(0, 10),
); // Point(5, 5)
if (isNaN(segHit.x)) { /* segments don't intersect */ }
```

## Common Mistakes

### HIGH: Importing from @pixi/math

Wrong:
```ts
import { Point } from '@pixi/math';
```

Correct:
```ts
import { Point } from 'pixi.js';
```

v8 uses a single `pixi.js` package. All sub-packages like `@pixi/math`, `@pixi/core`, etc. were removed.

Source: src/__docs__/migrations/v8.md

### MEDIUM: Mutating ObservablePoint without triggering observer

Wrong:
```ts
// Replacing the reference loses observation
let pos = container.position;
pos = new Point(100, 200); // container.position unchanged
```

Correct:
```ts
// Mutate in place to trigger the observer
container.position.set(100, 200);
// or
container.position.x = 100;
container.position.y = 200;
// or copy from another point
container.position.copyFrom(new Point(100, 200));
```

Container's position, scale, pivot, origin, and skew are ObservablePoints. Setting `.x` or `.y` on them triggers the container's transform update. Reassigning the variable reference does not modify the container. Always mutate the existing ObservablePoint via `.set()`, `.copyFrom()`, or direct property assignment on the original object.

Source: src/maths/point/ObservablePoint.ts

### MEDIUM: Not importing math-extras for extended methods

Wrong:
```ts
import { Point } from 'pixi.js';
const p = new Point(1, 2);
p.add(new Point(3, 4)); // TypeError: p.add is not a function
```

Correct:
```ts
import 'pixi.js/math-extras';
import { Point } from 'pixi.js';
const p = new Point(1, 2);
const sum = p.add(new Point(3, 4)); // works
```

Extended math utilities (add, subtract, multiply, magnitude, normalize, dot, cross, etc. on Point; intersection methods on shapes) require an explicit `import 'pixi.js/math-extras'`. These are not included in the default bundle.

Source: src/__docs__/migrations/v8.md

### MEDIUM: Storing references to shared/temporary objects

Wrong:
```ts
const myPoint = Point.shared;
myPoint.set(100, 200);
// ... later ...
console.log(myPoint.x); // 0 (reset on next access)
```

Correct:
```ts
const myPoint = new Point();
myPoint.copyFrom(Point.shared.set(100, 200));
// or just
const myPoint = new Point(100, 200);
```

`Point.shared` and `Matrix.shared` are reset to zero/identity every time they are accessed. They exist for one-off calculations within a single expression. Never store a reference to them.

Source: src/maths/point/Point.ts, src/maths/matrix/Matrix.ts

See also: core-concepts (pivot/origin transform semantics), events (hitArea usage with shapes), scene-management (cullArea with Rectangle)

## Learn More

- [Point](https://pixijs.download/release/docs/maths.Point.html.md)
- [ObservablePoint](https://pixijs.download/release/docs/maths.ObservablePoint.html.md)
- [Matrix](https://pixijs.download/release/docs/maths.Matrix.html.md)
- [Rectangle](https://pixijs.download/release/docs/maths.Rectangle.html.md)
- [Circle](https://pixijs.download/release/docs/maths.Circle.html.md)
- [Polygon](https://pixijs.download/release/docs/maths.Polygon.html.md)
