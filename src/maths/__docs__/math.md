---
title: Overview
category: maths
description: Learn how to use PixiJS math utilities for 2D transformations, geometry, shapes, and hit testing.
---

# Math

PixiJS provides math utilities for 2D transformations, geometry, and shapes. You'll use these when positioning objects, defining hit areas for interaction, building custom animations, or working with the scene graph transforms directly. Most users interact with these indirectly through `Container` properties like `position`, `scale`, and `rotation`.

## Matrix

The `Matrix` class represents a 2D affine transformation matrix:

```text
| a  c  tx |
| b  d  ty |
| 0  0  1  |
```

Where `a`/`d` control scale, `b`/`c` control shear, and `tx`/`ty` control translation.

```ts
import { Matrix, Point } from 'pixi.js';

const matrix = new Matrix();
matrix.translate(10, 20).scale(2, 2);

const point = new Point(5, 5);
const result = matrix.apply(point); // (30, 50)
```

Transformation methods (`translate`, `scale`, `rotate`) return `this` for chaining:

```ts
const matrix = new Matrix();

matrix
    .translate(100, 100)
    .rotate(Math.PI / 2)
    .scale(2, 2);
```

Use `setTransform` to set position, pivot, scale, rotation, and skew in a single call:

```ts
matrix.setTransform(
    100, 100,    // position
    0, 0,        // pivot
    2, 2,        // scale
    Math.PI / 4, // rotation (radians)
    0, 0         // skew
);
```

Use `decompose` to extract components back out of a matrix, and `invert` to reverse a transformation.

---

## Point and ObservablePoint

### `Point`

Represents a location in 2D space with `x` and `y` coordinates. Many PixiJS functions also accept the `PointData` type, which only requires `x` and `y` properties.

```ts
import { Point } from 'pixi.js';

const point = new Point(5, 10);
point.set(20, 30);
```

### `ObservablePoint`

Implements the same `PointLike` interface as `Point`, but triggers a callback when its values change. Used internally for reactive systems like position and scale updates.

```ts
import { ObservablePoint } from 'pixi.js';

const observer = {
    _onUpdate: (point) => {
        console.log(`Point updated to: (${point.x}, ${point.y})`);
    },
};
const reactive = new ObservablePoint(observer, 1, 2);
reactive.set(3, 4); // triggers _onUpdate
```

---

## Shapes

PixiJS includes several 2D shape primitives for hit testing, rendering, and geometry computations. All shapes provide a `contains(x, y)` method.

### `Rectangle`

Axis-aligned rectangle defined by `x`, `y`, `width`, and `height`.

```ts
import { Rectangle } from 'pixi.js';

const rect = new Rectangle(10, 10, 100, 50);
rect.contains(20, 20); // true
```

### `Circle`

Defined by `x`, `y` (center) and `radius`.

```ts
import { Circle } from 'pixi.js';

const circle = new Circle(50, 50, 25);
circle.contains(50, 75); // true
```

### `Ellipse`

Like `Circle`, but with separate `halfWidth` and `halfHeight` radii.

```ts
import { Ellipse } from 'pixi.js';

const ellipse = new Ellipse(0, 0, 20, 10);
ellipse.contains(5, 0); // true
```

### `Polygon`

Defined by a flat array of point coordinates. Handles complex shapes and hit testing.

```ts
import { Polygon } from 'pixi.js';

const polygon = new Polygon([0, 0, 100, 0, 100, 100, 0, 100]);
polygon.contains(50, 50); // true
```

### `RoundedRectangle`

Rectangle with rounded corners, defined by a corner radius.

```ts
import { RoundedRectangle } from 'pixi.js';

const roundRect = new RoundedRectangle(0, 0, 100, 100, 10);
roundRect.contains(10, 10); // true
```

### `Triangle`

Defines a triangle with three coordinate pairs: `(x, y)`, `(x2, y2)`, `(x3, y3)`.

```ts
import { Triangle } from 'pixi.js';

const triangle = new Triangle(0, 0, 100, 0, 50, 100);
triangle.contains(50, 50); // true
```

---

## Optional: `math-extras`

Importing `pixi.js/math-extras` adds extra methods directly onto `Point`, `ObservablePoint`, and `Rectangle` via prototype extension. This is a side-effect import; you don't need to assign it to a variable.

```ts
import 'pixi.js/math-extras';

// Now all Point instances have .add(), .subtract(), .magnitude(), etc.
const p = new Point(3, 4);
console.log(p.magnitude()); // 5
```

### Enhanced `Point` / `ObservablePoint` methods

| Method                          | Description                                                  |
| ------------------------------- | ------------------------------------------------------------ |
| `add(other[, out])`             | Adds another point to this one.                              |
| `subtract(other[, out])`        | Subtracts another point from this one.                       |
| `multiply(other[, out])`        | Multiplies this point with another point component-wise.     |
| `multiplyScalar(scalar[, out])` | Multiplies the point by a scalar.                            |
| `dot(other)`                    | Computes the dot product of two vectors.                     |
| `cross(other)`                  | Computes the z-component of the 3D cross product.            |
| `normalize([out])`              | Returns a unit-length vector.                                |
| `magnitude()`                   | Returns the Euclidean length.                                |
| `magnitudeSquared()`            | Returns the squared length (faster for comparisons).         |
| `project(onto[, out])`          | Projects this vector onto another vector.                    |
| `reflect(normal[, out])`        | Reflects the vector across a given normal.                   |
| `rotate(radians[, out])`        | Rotates the vector by the given angle in radians.            |

### Enhanced `Rectangle` methods

| Method                       | Description                                           |
| ---------------------------- | ----------------------------------------------------- |
| `containsRect(other)`        | Returns true if this rectangle fully contains another. |
| `equals(other)`              | Checks if all properties are equal.                   |
| `intersection(other[, out])` | Returns a rectangle representing the overlap area.    |
| `union(other[, out])`        | Returns a rectangle encompassing both rectangles.     |

---

## API reference

- {@link Matrix}
- {@link Point}
- {@link ObservablePoint}
- {@link Rectangle}
- {@link Circle}
- {@link Ellipse}
- {@link Polygon}
- {@link RoundedRectangle}
- {@link Triangle}
- {@link Transform}
