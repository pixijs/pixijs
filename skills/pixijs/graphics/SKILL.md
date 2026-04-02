---
name: graphics
description: >
  Draw vector shapes with PixiJS Graphics. Shape-then-fill API: rect(), circle(),
  ellipse(), poly(), roundRect(), star(), then fill()/stroke()/cut(). Path operations:
  moveTo, lineTo, bezierCurveTo, quadraticCurveTo, arc, arcTo, closePath. FillInput
  accepts color, FillGradient, FillPattern, FillStyle, Texture. StrokeInput with
  width, color, cap, join, alignment, miterLimit, pixelLine. GraphicsContext sharing
  between instances. SVG drawing via svg(). save/restore state. clear(). Holes via
  cut(). beginPath() for new paths. Use when the user asks about drawing shapes,
  rectangles, circles, lines, polygons, vector graphics, gradients, patterns,
  fill and stroke, holes in shapes, SVG rendering, bezier curves, arcs, rounded
  rectangles, stars, or sharing graphics geometry. Covers Graphics, GraphicsContext,
  FillGradient, FillPattern, rect, circle, ellipse, poly, roundRect, star,
  fill, stroke, cut, svg, beginPath, moveTo, lineTo.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  requires: "pixijs, core-concepts"
  sources: "pixijs/pixijs:src/scene/graphics/shared/Graphics.ts, pixijs/pixijs:src/scene/graphics/shared/GraphicsContext.ts"
---

## When to Use This Skill

Apply when the user needs to draw vector shapes, lines, curves, or paths, fill them with colors, gradients, or patterns, or render SVG content as graphics.

**Related skills:** For image display use **sprite**; for text rendering use **text**; for using graphics as masks use **masking**; for applying effects use **filters**; for GPU performance use **performance**.

This skill builds on pixijs and core-concepts. Read them first.

## Setup

```ts
import { Graphics, GraphicsContext } from 'pixi.js';

const g = new Graphics();
g.rect(0, 0, 100, 50).fill(0xff0000);
app.stage.addChild(g);
```

Graphics is a leaf node; `allowChildren` is false. Use a Container parent to group graphics with other objects.

## Core Patterns

### Shape-then-fill workflow

v8 uses a "draw shape, then apply style" pattern. All shape methods return `this` for chaining.

```ts
import { Graphics } from 'pixi.js';

const g = new Graphics();

// Rectangle with fill and stroke
g.rect(10, 10, 200, 100)
    .fill({ color: 0x3498db, alpha: 0.8 })
    .stroke({ width: 3, color: 0x2c3e50 });

// Circle
g.circle(150, 200, 40)
    .fill(0xe74c3c);

// Rounded rectangle
g.roundRect(300, 10, 150, 80, 12)
    .fill(0x2ecc71);

// Polygon
g.poly([0, 0, 60, 0, 30, 50], true)
    .fill(0x9b59b6);

// Star (x, y, points, radius, innerRadius, rotation)
g.star(400, 200, 5, 40, 20, 0)
    .fill(0xf39c12);

// Ellipse
g.ellipse(100, 350, 60, 30)
    .fill(0x1abc9c);
```

`fill()` accepts a `FillInput`: a color number/string, `{ color, alpha, texture, matrix, textureSpace }`, a `FillGradient`, a `FillPattern`, or a `Texture`.

When filling with a texture, `textureSpace` controls coordinate mapping:
- `'local'` (default): texture is scaled to fit each shape's bounding box (normalized 0-1 coordinates).
- `'global'`: texture position/scale is relative to the Graphics object's coordinate system, shared across all shapes.

`stroke()` accepts a `StrokeInput`: a color, or `{ width, color, alpha, cap, join, alignment, miterLimit, pixelLine }`. Defaults: width 1, cap `'butt'`, join `'miter'`, alignment 0.5.

**Both `fill()` and `stroke()` can be called after the same shape.** Calling `stroke()` immediately after `fill()` reuses the same path without redrawing the shape.

### Advanced shape primitives

Beyond the basic shapes, Graphics also supports:

```ts
import { Graphics } from 'pixi.js';

const g = new Graphics();

// Regular polygon (x, y, radius, sides, rotation?)
g.regularPoly(100, 100, 50, 6, 0)
    .fill(0x3498db);

// Polygon with rounded corners (x, y, radius, sides, corner, rotation?)
g.roundPoly(250, 100, 50, 5, 10)
    .fill(0xe74c3c);

// Rectangle with chamfered (angled) corners (x, y, w, h, chamfer)
g.chamferRect(350, 50, 100, 80, 15)
    .fill(0x2ecc71);

// Rectangle with fillet corners; negative radius creates external fillets
g.filletRect(500, 50, 100, 80, 15)
    .fill(0x9b59b6);

// Shape with per-corner radius control
g.roundShape([
    { x: 50, y: 250, radius: 20 },
    { x: 150, y: 250, radius: 5 },
    { x: 150, y: 350, radius: 10 },
    { x: 50, y: 350, radius: 15 },
], 10)
    .fill(0xf39c12);
```

### Holes with cut()

```ts
import { Graphics } from 'pixi.js';

const g = new Graphics();

// Outer shape filled, then inner shape cut out
g.rect(0, 0, 200, 200).fill(0x00ff00)
    .circle(100, 100, 50).cut();
```

`cut()` subtracts the current path from the previously filled shape. The hole shape must be completely within the filled shape.

### Paths and complex shapes

```ts
import { Graphics } from 'pixi.js';

const g = new Graphics();

g.moveTo(50, 50)
    .lineTo(200, 50)
    .bezierCurveTo(250, 100, 250, 150, 200, 200)
    .quadraticCurveTo(100, 250, 50, 200)
    .closePath()
    .fill({ color: 0x6c5ce7, alpha: 0.7 })
    .stroke({ width: 2, color: 0xdfe6e9 });
```

Path methods: `moveTo`, `lineTo`, `bezierCurveTo`, `quadraticCurveTo`, `arc`, `arcTo`, `arcToSvg`, `closePath`. Call `beginPath()` to discard the current path and start a new one.

### Gradients and patterns

```ts
import { Graphics, FillGradient, FillPattern, Texture } from 'pixi.js';

// Default direction is vertical (top to bottom): start {0,0}, end {0,1}
const gradient = new FillGradient({
    end: { x: 1, y: 0 }, // override to horizontal
    colorStops: [
        { offset: 0, color: 0xff0000 },
        { offset: 1, color: 0x0000ff },
    ],
});

const g = new Graphics();
g.rect(0, 0, 200, 100).fill(gradient);

// Pattern fill from a texture (must be loaded first via Assets.load)
const brickTexture = await Assets.load('brick.png');
const pattern = new FillPattern(brickTexture);
g.rect(0, 120, 200, 100).fill(pattern);
```

### GraphicsContext sharing

```ts
import { Graphics, GraphicsContext } from 'pixi.js';

// Create a reusable context
const ctx = new GraphicsContext()
    .rect(0, 0, 50, 50)
    .fill(0xff0000);

// Multiple Graphics share the same geometry (rendered once, reused)
const g1 = new Graphics(ctx);
const g2 = new Graphics(ctx);
g2.x = 100;
```

Context sharing avoids duplicate GPU geometry. The expensive tessellation runs once on the shared context.

You can also assign a context after construction:

```ts
const g = new Graphics();
g.context = existingContext;
```

### SVG paths

```ts
import { Graphics } from 'pixi.js';

const g = new Graphics();
g.svg(`<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" fill="red"/>
</svg>`);
```

The `svg()` method parses SVG markup and converts it to graphics instructions. It supports paths, basic shapes, and inline styles. Complex hole geometries may render inaccurately due to Pixi's performance-optimized triangulation.

### State save/restore

```ts
import { Graphics } from 'pixi.js';

const g = new Graphics();

g.context.save();
g.context.setFillStyle({ color: 0xff0000 });
g.context.translate(100, 100);
g.context.rotate(Math.PI / 4);
g.rect(0, 0, 50, 50).fill();
g.context.restore();

// State is back to pre-save values
g.rect(0, 0, 50, 50).fill(0x00ff00);
```

`save()` pushes transform, fill style, and stroke style onto a stack. `restore()` pops them.

## Common Mistakes

### [CRITICAL] Using v7 beginFill/drawRect/endFill pattern

Wrong:
```ts
const g = new Graphics()
    .beginFill(0xff0000)
    .drawRect(0, 0, 100, 100)
    .endFill();
```

Correct:
```ts
const g = new Graphics()
    .rect(0, 0, 100, 100)
    .fill(0xff0000);
```

v8 completely overhauled the Graphics API. The old "set style, draw, end" pattern is replaced with "draw shape, then apply style". `beginFill`/`endFill` do not exist.

Source: src/__docs__/migrations/v8.md

### [CRITICAL] Using old shape method names (drawRect, drawCircle)

Wrong:
```ts
graphics.drawCircle(50, 50, 25);
```

Correct:
```ts
graphics.circle(50, 50, 25);
```

All `draw*` methods were renamed in v8: `drawRect` -> `rect`, `drawCircle` -> `circle`, `drawEllipse` -> `ellipse`, `drawPolygon` -> `poly`, `drawRoundedRect` -> `roundRect`, `drawStar` -> `star`.

Source: src/__docs__/migrations/v8.md

### [CRITICAL] Using lineStyle instead of stroke

Wrong:
```ts
graphics.lineStyle(2, 0xffffff);
graphics.drawRect(0, 0, 100, 100);
```

Correct:
```ts
graphics.rect(0, 0, 100, 100)
    .stroke({ width: 2, color: 0xffffff });
```

`lineStyle` was removed. Use `stroke()` after drawing the shape. The stroke options object provides `width`, `color`, `alpha`, `cap`, `join`, `alignment`, `miterLimit`, and `pixelLine`.

Source: src/__docs__/migrations/v8.md

### [HIGH] Using beginHole/endHole for holes

Wrong:
```ts
graphics.beginFill(0x00ff00)
    .drawRect(0, 0, 100, 100)
    .beginHole()
    .drawCircle(50, 50, 20)
    .endHole()
    .endFill();
```

Correct:
```ts
graphics.rect(0, 0, 100, 100).fill(0x00ff00)
    .circle(50, 50, 20).cut();
```

`beginHole`/`endHole` were replaced by `cut()`. Draw the outer shape and fill it, then draw the hole shape and call `cut()`.

Source: src/__docs__/migrations/v8.md

### [HIGH] Using GraphicsGeometry instead of GraphicsContext

Wrong:
```ts
const geometry = graphics.geometry;
const clone = new Graphics(geometry);
```

Correct:
```ts
const context = new GraphicsContext()
    .rect(0, 0, 100, 100).fill(0xff0000);
const g1 = new Graphics(context);
const g2 = new Graphics(context);
```

`GraphicsGeometry` was replaced by `GraphicsContext` in v8. The context holds drawing instructions and is shared between Graphics instances. There is no `.geometry` property.

Source: src/__docs__/migrations/v8.md

### [HIGH] Destroying a shared GraphicsContext unexpectedly

```ts
const ctx = new GraphicsContext().rect(0, 0, 50, 50).fill(0xff0000);
const g1 = new Graphics(ctx);
const g2 = new Graphics(ctx);

// This destroys the shared context, breaking g2 (null context reference):
g1.destroy({ context: true });
```

Destroying a `GraphicsContext` does not destroy other `Graphics` instances that share it, but it breaks them by nullifying their context reference. When using a shared context passed via constructor, `destroy()` with no args preserves the context. Use `destroy({ context: false })` to be explicit. Only destroy the context when all sharing instances are done with it.

Note: if a `Graphics` creates its own context (not passed via constructor), calling `destroy()` with no args still destroys that self-owned context.

### [HIGH] Clearing and redrawing Graphics every frame

Graphics are designed to be stable, not dynamic. Calling `clear()` and redrawing every frame is expensive because it rebuilds GPU geometry each time. For dynamic visuals:

- Use Sprite with pre-rendered textures and transform changes.
- Use `cacheAsTexture(true)` for complex static graphics.
- For real-time shape changes, consider Mesh with custom geometry updates.

**Tension note (cross-skill)**: This is the opposite of how HTML Canvas 2D works, where redrawing each frame is normal. PixiJS Graphics tessellates shapes into GPU triangles, making initial draw expensive but subsequent renders fast. Treat Graphics more like SVG elements than canvas draw calls.

Source: maintainer guidance

---

See also: core-concepts (transforms, containers), performance (batching, cacheAsTexture), masking (Graphics as stencil mask), filters (applying effects to graphics)

## Learn More

- [Graphics](https://pixijs.download/release/docs/scene.Graphics.html.md)
- [GraphicsContext](https://pixijs.download/release/docs/scene.GraphicsContext.html.md)
- [GraphicsPath](https://pixijs.download/release/docs/scene.GraphicsPath.html.md)
- [FillGradient](https://pixijs.download/release/docs/scene.FillGradient.html.md)
- [FillPattern](https://pixijs.download/release/docs/scene.FillPattern.html.md)
