---
title: Overview
category: maths
---

# Maths

PixiJS provides a robust set of math utilities for 2D graphics operations, including transformations, geometry, and shape manipulation. These utilities form the foundation for positioning, collision detection, and visual effects.

## Basic Usage

```ts
import { Matrix, Point, Rectangle } from 'pixi.js';

// Create and transform a point
const point = new Point(100, 100);
const matrix = new Matrix();

matrix.rotate(Math.PI / 4) // 45 degrees
    .scale(2, 2)
    .translate(50, 50);

const transformed = matrix.apply(point);
```

## Core Components

### Matrix

The `Matrix` class handles 2D affine transformations:

```ts
import { Matrix } from 'pixi.js';

const matrix = new Matrix();

// Chain transformations
matrix
    .translate(100, 100)  // Move
    .rotate(Math.PI / 2)  // Rotate 90 degrees
    .scale(2, 2);        // Double size

// Set transformation directly
matrix.set(
    a, b,  // Scale and rotation
    c, d,  // Shear
    tx, ty // Translation
);

// Reset to identity
matrix.identity();
```

### Points and Vectors

```ts
import { Point, ObservablePoint } from 'pixi.js';

// Basic point
const point = new Point(10, 20);
point.set(30, 40);

// Observable point for reactive updates
const observer = {
    _onUpdate: () => console.log('Point changed!')
};
const reactive = new ObservablePoint(observer, 0, 0);
```

### Shapes

PixiJS includes several shape primitives for hit testing and rendering:

```ts
import {
    Rectangle,
    Circle,
    Ellipse,
    Polygon,
    RoundedRectangle
} from 'pixi.js';

// Rectangle
const rect = new Rectangle(0, 0, 100, 100);
rect.contains(50, 50); // true

// Circle
const circle = new Circle(0, 0, 50);
circle.contains(25, 25); // true

// Ellipse
const ellipse = new Ellipse(0, 0, 100, 50);
ellipse.contains(75, 25); // true

// Polygon
const polygon = new Polygon([0,0, 100,0, 50,100]);
polygon.contains(50, 50); // true

// Rounded Rectangle
const roundRect = new RoundedRectangle(0, 0, 100, 100, 20);
roundRect.contains(10, 10); // true
```

## Advanced Features

### Math Extras

Optional vector math operations are available through the math-extras extension:

```ts
import 'pixi.js/math-extras';
import { Point } from 'pixi.js';

const v1 = new Point(3, 4);
const v2 = new Point(1, 2);

// Vector operations
v1.add(v2);              // Addition
v1.subtract(v2);         // Subtraction
v1.multiply(v2);         // Component-wise multiplication
v1.multiplyScalar(2);    // Scalar multiplication
v1.normalize();          // Unit vector

// Vector products
const dot = v1.dot(v2);   // Dot product
const cross = v1.cross(v2); // Cross product (z-component)

// Vector analysis
const mag = v1.magnitude();        // Length
const magSq = v1.magnitudeSquared(); // Squared length
```

## Best Practices

- Use `Matrix` for combining multiple transformations
- Cache matrix operations when possible for better performance
- Use appropriate shapes for hit testing (e.g., `Circle` for radial areas)
- Consider using math-extras for vector operations
- Use `ObservablePoint` for reactive position updates
- Leverage shape methods like `contains()` for interaction detection

## Related Documentation

- See {@link Matrix} for transformation operations
- See {@link Point} for basic point operations
- See {@link ObservablePoint} for reactive points
- See {@link Rectangle} for rectangular shapes
- See {@link Circle} for circular shapes
- See {@link Ellipse} for oval shapes
- See {@link Polygon} for complex shapes
- See {@link RoundedRectangle} for rounded corners
- See {@link Transform} for hierarchical transformations

For detailed implementation requirements and advanced usage, refer to the API documentation of individual classes and interfaces.
