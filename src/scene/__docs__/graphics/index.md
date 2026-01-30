---
title: Graphics
description: Learn how to use PixiJS Graphics to create shapes, manage graphics contexts, and optimize performance in your projects.
category: scene
children:
  - ./graphics-fill.md
  - ./graphics-pixel-line.mdx
---
# Graphics

{@link Graphics} renders shapes such as rectangles, circles, stars, and custom polygons. You can combine multiple primitives into complex shapes, and it supports gradients, textures, and masks.

```ts
import { Graphics } from 'pixi.js';

const graphics = new Graphics().rect(50, 50, 100, 100).fill(0xff0000);
```

## Available shapes

PixiJS v8 supports these shape primitives:

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
<div>

### Basic primitives

- Line
- Rectangle
- Rounded Rectangle
- Circle
- Ellipse
- Arc
- Bezier / Quadratic Curves

</div>
<div>

### Advanced primitives

- Chamfer Rect
- Fillet Rect
- Regular Polygon
- Star
- Rounded Polygon
- Rounded Shape

</div>
</div>

```ts
const graphics = new Graphics()
  .rect(50, 50, 100, 100)
  .fill(0xff0000)
  .circle(200, 200, 50)
  .stroke(0x00ff00)
  .moveTo(300, 300)
  .lineTo(400, 400)
  .stroke({ width: 5 });
```

### SVG support

You can load SVG path data, though complex hole geometries may render inaccurately due to Pixi's performance-optimized triangulation system.

```ts
let shape = new Graphics().svg(`
  <svg>
    <path d="M 100 350 q 150 -300 300 0" stroke="blue" />
  </svg>
`);
```

## GraphicsContext

`GraphicsContext` is the core of the PixiJS graphics model. It holds all drawing commands and styles, allowing the same shape data to be reused by multiple `Graphics` instances:

```ts
const context = new GraphicsContext().circle(100, 100, 50).fill('red');

const shapeA = new Graphics(context);
const shapeB = new Graphics(context); // Shares the same geometry
```

This pattern is effective when rendering repeated or animated shapes, such as frame-based SVG swaps:

```ts
let frames = [
  new GraphicsContext().circle(100, 100, 50).fill('red'),
  new GraphicsContext().rect(0, 0, 100, 100).fill('red'),
];

let graphic = new Graphics(frames[0]);

function update() {
  graphic.context = frames[1]; // Very cheap operation
}
```

> [!NOTE]
> If you don't explicitly pass a `GraphicsContext` when creating a `Graphics` object, then internally, it will have its own context, accessible via `myGraphics.context`.

### Destroying a GraphicsContext

Destroying a `GraphicsContext` also destroys all `Graphics` instances that share it.

```ts
const context = new GraphicsContext().circle(100, 100, 50).fill('red');
const shapeA = new Graphics(context);
const shapeB = new Graphics(context); // Shares the same geometry

shapeA.destroy({ context: true }); // Destroys both shapeA and shapeB
```

## Creating holes

Use `.cut()` to remove a shape from the previous one:

```ts
const g = new Graphics().rect(0, 0, 100, 100).fill(0x00ff00).circle(50, 50, 20).cut(); // Creates a hole in the green rectangle
```

Ensure the hole is fully enclosed within the shape to avoid triangulation errors.

## Graphics builds geometry, it doesn't draw immediately

Methods like `.rect()` and `.circle()` don't render anything. They build a list of shapes stored in a `GraphicsContext`. Rendering happens when the `Graphics` object is added to the scene and the renderer processes it.

```ts
const graphic = new Graphics().rect(0, 0, 200, 100).fill(0xff0000);

app.stage.addChild(graphic); // Rendering happens here
```

This means you can build, reuse, and transform `Graphics` objects freely without triggering GPU work.

## Performance guidelines

- **Do not call `.clear()` and rebuild every frame.** Rebuilding triggers geometry re-triangulation on the CPU. For dynamic content, swap prebuilt `GraphicsContext` objects instead (see the context-swapping example above).
- **Use `Graphics.destroy()`** to clean up when done. Shared contexts are not auto-destroyed.
- **Use many simple `Graphics` objects** over one complex one to maintain GPU batching.
- **Overlapping semi-transparent shapes blend individually.** Each shape is drawn and blended in order, so two 50%-transparent overlapping circles will look different than a single 50%-transparent merged shape. To blend the entire Graphics as one unit, render it to a texture first via `cacheAsTexture()` or `renderer.generateTexture()`.

## Caveats and gotchas

- **Memory leaks**: Call `.destroy()` when no longer needed.
- **SVG and holes**: Not all SVG hole paths triangulate correctly.
- **Changing geometry**: Use `.clear()` sparingly. Prefer swapping contexts.
- **Transparency and blend modes**: These apply per primitive. Use `RenderTexture` to flatten effects.

---

## API reference

- {@link Graphics}
- {@link GraphicsContext}
- {@link FillStyle}
- {@link StrokeStyle}
