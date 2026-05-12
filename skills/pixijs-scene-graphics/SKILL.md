---
name: pixijs-scene-graphics
description: "Use this skill when drawing vector shapes and paths in PixiJS v8. Covers the Graphics API: shape-then-fill methods (rect/circle/ellipse/poly/roundRect/star/regularPoly/roundPoly/roundShape/filletRect/chamferRect), path methods (moveTo/lineTo/bezierCurveTo/quadraticCurveTo/arc/arcTo/arcToSvg/closePath), fill/stroke/cut, holes, FillGradient (linear/radial), FillPattern, GraphicsContext sharing, svg import/export, containsPoint hit testing, cloning, clearing, bounds, fillStyle/strokeStyle, draw-time transforms (rotateTransform/scaleTransform/translateTransform/setTransform/save/restore), default styles, GraphicsPath reuse. Triggers on: Graphics, GraphicsContext, rect, circle, poly, roundRect, fill, stroke, cut, hole, beginHole, FillGradient, FillPattern, moveTo, bezierCurveTo, svg, graphicsContextToSvg, svg export, GraphicsOptions, containsPoint, clone, clear, bounds, rotateTransform, translateTransform, setFillStyle, setStrokeStyle, GraphicsPath."
license: MIT
---

`Graphics` is the vector-drawing leaf of the PixiJS v8 scene graph. The v8 API follows a shape-then-style pattern: draw a shape or path with `rect`, `circle`, `moveTo`, etc., then apply `fill` and/or `stroke`. Every method returns `this` for chaining, and the drawing instructions live on a `GraphicsContext` that can be shared between instances.

Assumes familiarity with `pixijs-scene-core-concepts`. `Graphics` is a leaf: do not nest children inside it. Wrap multiple `Graphics` objects in a `Container` to group them.

## Quick Start

```ts
const g = new Graphics();

g.rect(10, 10, 200, 100)
  .fill({ color: 0x3498db, alpha: 0.8 })
  .stroke({ width: 3, color: 0x2c3e50 });

g.circle(300, 60, 40).fill(0xe74c3c);

g.moveTo(50, 200)
  .lineTo(200, 200)
  .bezierCurveTo(250, 250, 100, 300, 50, 250)
  .closePath()
  .fill(0x6c5ce7);

app.stage.addChild(g);
```

**Related skills:** `pixijs-scene-core-concepts` (scene graph basics), `pixijs-scene-container` (group graphics with other objects), `pixijs-scene-core-concepts/references/masking.md` (Graphics as a stencil mask), `pixijs-filters` (effects), `pixijs-performance` (batching, `cacheAsTexture`).

## Constructor options

All `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

Leaf-specific options added by `GraphicsOptions`:

| Option        | Type              | Default                 | Description                                                                                                                                                                                          |
| ------------- | ----------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `context`     | `GraphicsContext` | new `GraphicsContext()` | Shared drawing context. Passing a context reuses its tessellated geometry across multiple `Graphics` nodes, avoiding duplicate GPU work. If omitted, each `Graphics` creates and owns a new context. |
| `roundPixels` | `boolean`         | `false`                 | Rounds the final on-screen `x`/`y` to the nearest pixel. Produces crisper lines for pixel-art styles at the cost of smooth sub-pixel movement.                                                       |

The constructor also accepts a `GraphicsContext` instance as its sole argument (`new Graphics(ctx)`), which is shorthand for `new Graphics({ context: ctx })`.

## Core Patterns

### Shape-then-fill workflow

```ts
const g = new Graphics();

g.rect(10, 10, 200, 100)
  .fill({ color: 0x3498db, alpha: 0.8 })
  .stroke({ width: 3, color: 0x2c3e50 });

g.circle(150, 200, 40).fill(0xe74c3c);
g.roundRect(300, 10, 150, 80, 12).fill(0x2ecc71);
g.poly([0, 0, 60, 0, 30, 50], true).fill(0x9b59b6);
g.star(400, 200, 5, 40, 20, 0).fill(0xf39c12);
g.ellipse(100, 350, 60, 30).fill(0x1abc9c);
```

`fill()` accepts a `FillInput`: a color number/string, `{ color, alpha, texture, matrix, textureSpace }`, a `FillGradient`, a `FillPattern`, or a `Texture`. When filling with a texture, `textureSpace` controls coordinate mapping:

- `'local'` (default): texture is scaled to fit each shape's bounding box (normalized 0-1 coordinates).
- `'global'`: texture position/scale are relative to the Graphics object's coordinate system, shared across all shapes.

`FillInput` also supports a nested `fill` subfield: a `FillStyle` options object can embed a `FillGradient` or `FillPattern` under its `fill` key, which applies the gradient or pattern alongside the `color`, `alpha`, `texture`, and `matrix` modifiers on the outer object.

`stroke()` accepts a color, a `FillGradient`, a `FillPattern`, or a `StrokeStyle` object that combines all `FillStyle` keys (`color`, `alpha`, `texture`, `matrix`, `fill`, `textureSpace`) with stroke attributes:

| Attribute    | Default   | Notes                                                                   |
| ------------ | --------- | ----------------------------------------------------------------------- |
| `width`      | `1`       | Pixel width of the stroke.                                              |
| `cap`        | `'butt'`  | One of `'butt'`, `'round'`, `'square'`. End style for open paths.       |
| `join`       | `'miter'` | One of `'miter'`, `'round'`, `'bevel'`. Corner style.                   |
| `miterLimit` | `10`      | Caps how far miter joins extend before falling back to bevel.           |
| `alignment`  | `0.5`     | `1` = inside the shape, `0.5` = centered, `0` = outside.                |
| `pixelLine`  | `false`   | Aligns 1-pixel lines to the pixel grid for crisp output. Graphics-only. |

Strokes can use the same gradients and patterns as fills via `fill: gradient` or `texture: tex`:

```ts
const grad = new FillGradient({
  end: { x: 1, y: 0 },
  colorStops: [
    { offset: 0, color: 0xff0000 },
    { offset: 1, color: 0x0000ff },
  ],
});
g.rect(0, 0, 200, 100).stroke({
  width: 8,
  fill: grad,
  join: "round",
  cap: "round",
});
```

Both `fill()` and `stroke()` can be called after the same shape; calling `stroke()` immediately after `fill()` reuses the same path.

### Advanced shape primitives

```ts
g.regularPoly(100, 100, 50, 6, 0).fill(0x3498db);
g.roundPoly(250, 100, 50, 5, 10).fill(0xe74c3c);
g.chamferRect(350, 50, 100, 80, 15).fill(0x2ecc71);
g.filletRect(500, 50, 100, 80, 15).fill(0x9b59b6);
g.roundShape(
  [
    { x: 50, y: 250, radius: 20 },
    { x: 150, y: 250, radius: 5 },
    { x: 150, y: 350, radius: 10 },
    { x: 50, y: 350, radius: 15 },
  ],
  10,
).fill(0xf39c12);
```

### Holes with cut()

```ts
g.rect(0, 0, 200, 200).fill(0x00ff00).circle(100, 100, 50).cut();
```

`cut()` subtracts the current active path from the previously drawn fill or stroke. Rules:

- The hole must be **completely inside** the target shape. Holes that overlap edges or sit outside the shape will not render correctly because the renderer triangulates with the hole as an interior boundary.
- `cut()` looks back at up to the **last two** instructions. When you `fill()` and then `stroke()` the same path, a single `cut()` adds the hole to the stroke first; a second `cut()` adds it to the fill underneath.
- After `cut()`, the active path resets so you can start the next shape with `moveTo`, `rect`, etc.
- `cut()` applies to strokes too — `g.rect(...).stroke(...).circle(...).cut()` cuts a hole through the stroke outline.

Punch multiple holes with a single `cut()` by drawing several shapes into the active path before calling it. Each shape accumulates into the same hole path:

```ts
const g = new Graphics();

g.rect(350, 350, 150, 150).fill(0x00ff00);

// Draw three circles into the active path, then cut them all in one call
g.circle(375, 375, 25);
g.circle(425, 425, 25);
g.circle(475, 475, 25);
g.cut();
```

If you need holes on **separate** filled shapes, give each shape its own `fill()` and matching `cut()`:

```ts
g.rect(0, 0, 100, 100).fill(0x3498db);
g.circle(50, 50, 20).cut(); // hole in the rect

g.rect(120, 0, 100, 100).fill(0xe74c3c);
g.circle(170, 50, 20).cut(); // hole in the second rect
```

Calling `cut()` on a shape that already has a hole **adds** to the existing hole path rather than replacing it. Use this to layer holes additively.

### Paths and complex shapes

```ts
g.moveTo(50, 50)
  .lineTo(200, 50)
  .bezierCurveTo(250, 100, 250, 150, 200, 200)
  .quadraticCurveTo(100, 250, 50, 200)
  .closePath()
  .fill({ color: 0x6c5ce7, alpha: 0.7 })
  .stroke({ width: 2, color: 0xdfe6e9 });
```

Path methods: `moveTo`, `lineTo`, `bezierCurveTo`, `quadraticCurveTo`, `arc`, `arcTo`, `arcToSvg`, `closePath`. Call `beginPath()` to discard the current path and start a new one.

```ts
// arc(cx, cy, radius, startAngle, endAngle, counterclockwise?)
g.moveTo(80, 50)
  .arc(50, 50, 30, 0, Math.PI)
  .stroke({ width: 4, color: 0x2c3e50 });

// arcTo(x1, y1, x2, y2, radius) — rounded corner between two line segments
g.moveTo(150, 20)
  .arcTo(200, 20, 200, 80, 20)
  .lineTo(200, 80)
  .stroke({ width: 2 });

// arcToSvg(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) — matches the SVG `A` command
g.moveTo(250, 50).arcToSvg(40, 20, 0, 1, 0, 330, 50).stroke({ width: 2 });
```

### Gradients and patterns

```ts
// Linear gradient
const linear = new FillGradient({
  end: { x: 1, y: 0 },
  colorStops: [
    { offset: 0, color: 0xff0000 },
    { offset: 1, color: 0x0000ff },
  ],
});
g.rect(0, 0, 200, 100).fill(linear);

// Radial gradient — inner circle at center, outer circle reaches edges
const radial = new FillGradient({
  type: "radial",
  center: { x: 100, y: 100 },
  innerRadius: 0,
  outerCenter: { x: 100, y: 100 },
  outerRadius: 100,
  colorStops: [
    { offset: 0, color: 0xffffff },
    { offset: 1, color: 0x000000 },
  ],
});
g.circle(100, 100, 100).fill(radial);

const brick = await Assets.load("brick.png");
const pattern = new FillPattern(brick, "repeat"); // 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat'
g.rect(0, 120, 200, 100).fill(pattern);
```

`FillGradient`'s default `type` is `'linear'` with `start {0,0}` to `end {0,1}`. Set `type: 'radial'` with `center`/`innerRadius` and `outerCenter`/`outerRadius` for radial gradients. `FillPattern`'s second argument selects a repetition mode and exposes `setTransform(matrix)` to scale, rotate, or offset the texture inside the pattern.

### Drawing a texture directly

```ts
const tex = await Assets.load("icon.png");

// Draw the whole texture at (x, y) with optional tint
g.texture(tex, 0xffffff, 20, 20);

// Draw a subregion (dx, dy, dw, dh)
g.texture(tex, 0xff0000, 100, 20, 64, 64);
```

`Graphics.texture(texture, tint?, dx?, dy?, dw?, dh?)` is a shortcut for drawing a single textured rect without going through `fill()`. Useful for icons where you don't need the full sprite lifecycle.

### GraphicsContext sharing

```ts
const ctx = new GraphicsContext().rect(0, 0, 50, 50).fill(0xff0000);

const g1 = new Graphics(ctx);
const g2 = new Graphics(ctx);
g2.x = 100;
```

Context sharing avoids duplicate GPU geometry; the expensive tessellation runs once. You can also assign a context after construction: `g.context = existingContext`.

### SVG import and export

Parse SVG markup into the active context with `svg()`:

```ts
g.svg(`<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" fill="red"/>
</svg>`);
```

`svg()` supports paths, basic shapes, and inline styles; complex hole geometries may render inaccurately because Pixi's triangulation is performance-optimized.

Serialize a `Graphics` or `GraphicsContext` back to a self-contained SVG document string with `graphicsContextToSvg`:

```ts
import { Graphics, graphicsContextToSvg } from "pixi.js";

const g = new Graphics()
  .rect(0, 0, 100, 50)
  .fill({ color: 0xff0000 })
  .circle(150, 25, 25)
  .stroke({ color: 0x0000ff, width: 4 });

const svgString = graphicsContextToSvg(g, 2);
```

`graphicsContextToSvg(source, precision = 2)` is a pure function that reads the context's instructions and returns a complete `<svg>` string with an auto-computed `viewBox`. Pass a `Graphics` or a `GraphicsContext`; `precision` controls decimal places on emitted coordinates. Exports every shape-then-fill primitive (advanced ones like `regularPoly`/`filletRect` fall back to a shape-path), all path methods, stroke attributes (`width`, `cap`, `join`, `miterLimit`), `fill-opacity`/`stroke-opacity`, and `FillGradient` (linear and radial) via a `<defs>` block. Holes collapse into one `<path>` with `fill-rule="evenodd"`. `FillPattern` and texture fills have no SVG equivalent: patterns fall through to the fill's solid `color`, and `texture()` instructions are skipped entirely. Exported markup roundtrips back through `g.svg(...)` without cleanup, so you can export, store, and later reimport a shape into another `Graphics`.

### Reusing a GraphicsPath

```ts
const arrow = new GraphicsPath()
  .moveTo(0, 0)
  .lineTo(40, 0)
  .lineTo(40, -10)
  .lineTo(60, 10)
  .lineTo(40, 30)
  .lineTo(40, 20)
  .lineTo(0, 20)
  .closePath();

g.path(arrow).fill(0x3498db);
g.translateTransform(80, 0).path(arrow).fill(0xe74c3c);
```

`Graphics.path(graphicsPath)` (and `GraphicsContext.path()`) appends a prebuilt `GraphicsPath` onto the active path. Build once, draw many times.

### Draw-time transforms

`Graphics` has its own transform stack used **while drawing** that is separate from the `Container` transform applied to the rendered output. The drawing methods are renamed to avoid clashing with `Container.rotation`, `Container.scale`, `Container.position`:

| Drawing transform                                         | Container transform       |
| --------------------------------------------------------- | ------------------------- |
| `g.rotateTransform(angle)`                                | `g.rotation`              |
| `g.scaleTransform(x, y?)`                                 | `g.scale.set(x, y)`       |
| `g.translateTransform(x, y?)`                             | `g.position.set(x, y)`    |
| `g.setTransform(matrix)` or `setTransform(a,b,c,d,tx,ty)` | `g.setFromMatrix(matrix)` |
| `g.transform(matrix)` or `transform(a,b,c,d,tx,ty)`       | n/a                       |
| `g.getTransform()` / `g.resetTransform()`                 | n/a                       |

```ts
const g = new Graphics();

g.translateTransform(100, 100)
  .rotateTransform(Math.PI / 4)
  .rect(-25, -25, 50, 50)
  .fill(0x3498db);

// The square is rotated 45 degrees as it is added to the geometry.
// Setting g.rotation later rotates the entire Graphics on screen.
```

The drawing transform affects every subsequent shape and path command added to the context. Use `save()`/`restore()` to scope it.

### State save/restore

```ts
g.save();
g.translateTransform(100, 100);
g.rotateTransform(Math.PI / 4);
g.rect(0, 0, 50, 50).fill(0xff0000);
g.restore();
```

`save()` pushes the drawing transform, fill style, and stroke style onto a stack; `restore()` pops them. `Graphics` exposes `save`/`restore` directly, mirroring the underlying `GraphicsContext` calls.

### Default styles via setFillStyle / setStrokeStyle

```ts
g.setFillStyle({ color: 0x3498db, alpha: 0.8 }).setStrokeStyle({
  width: 2,
  color: 0x2c3e50,
});

g.rect(0, 0, 100, 100).fill().stroke();
g.circle(150, 50, 40).fill().stroke();
```

`setFillStyle()` and `setStrokeStyle()` configure the default style used by subsequent `fill()` / `stroke()` calls when no argument is passed. Read or replace the current style at any time via the `fillStyle` and `strokeStyle` getters/setters. Override the library-wide defaults by mutating `GraphicsContext.defaultFillStyle` and `GraphicsContext.defaultStrokeStyle` once at startup.

### Hit testing

```ts
const g = new Graphics().star(100, 100, 5, 60, 30).fill(0xf39c12);
g.eventMode = "static";
g.on("pointermove", (e) => {
  if (g.containsPoint(g.toLocal(e.global))) {
    /* over the star, not just its bbox */
  }
});
```

`Graphics.containsPoint(pointInLocalSpace)` runs a topology-aware test against every filled and stroked shape in the context, including holes. Convert global pointer coordinates with `toLocal()` first.

### Cloning, clearing, and bounds

```ts
const g = new Graphics().rect(0, 0, 100, 100).fill(0xff0000);

const shallow = g.clone(); // shares the same GraphicsContext
const deep = g.clone(true); // creates an independent context

console.log(g.bounds.width); // 100 - geometry bounds before transforms

g.clear(); // wipes active path, instructions, and transform; fill/stroke styles persist
```

- `clone()` returns a new `Graphics` that shares the source context (cheap, geometry is reused). Both objects update together if the context changes.
- `clone(true)` clones the context as well so the new `Graphics` can be edited independently.
- `bounds` returns the geometry bounds before the `Container` transform. Useful for layout decisions.
- `clear()` resets the context so the same `Graphics` can be reused. See **Common Mistakes** below for guidance on when to clear versus when to keep stable geometry.

### GraphicsContext utilities

| Member                                          | Behavior                                                                                             |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `ctx.path(graphicsPath)`                        | Apply a prebuilt `GraphicsPath` onto the active path. Reuse one path across many contexts or frames. |
| `ctx.beginPath()`                               | Discard the current active path and start a new one without affecting committed instructions.        |
| `ctx.setFillStyle(style)` / `ctx.fillStyle`     | Set or read the default fill style used by subsequent shapes without calling `fill()`.               |
| `ctx.setStrokeStyle(style)` / `ctx.strokeStyle` | Set or read the default stroke style used by subsequent shapes without calling `stroke()`.           |
| `ctx.bounds`                                    | Cached geometry bounds across all fill/stroke/texture instructions.                                  |
| `ctx.clear()`                                   | Wipe instructions, the active path, and the drawing transform.                                       |
| `ctx.clone()`                                   | Deep copy including instructions, active path, transform, styles, and stack.                         |
| `ctx.containsPoint(point)`                      | Topology-aware hit test against all filled and stroked shapes (including holes).                     |
| `ctx.batchMode`                                 | One of `'auto'`, `'batch'`, `'no-batch'` — force or disable batching for the shapes in this context. |
| `ctx.customShader`                              | Assign a `Shader` to override the default graphics shader.                                           |
| `GraphicsContext.defaultFillStyle`              | Static fallback used when `fill()` is called without arguments and no fill style is set.             |
| `GraphicsContext.defaultStrokeStyle`            | Static fallback used when `stroke()` is called without arguments and no stroke style is set.         |

`GraphicsContext` is an `EventEmitter` that emits `update`, `destroy`, and `unload` events. Subscribe via `ctx.on('update' | 'destroy' | 'unload', cb)` when tooling or pools need to react to context lifecycle changes.

## Common Mistakes

### [CRITICAL] Using v7 beginFill/drawRect/endFill

Wrong:

```ts
const g = new Graphics().beginFill(0xff0000).drawRect(0, 0, 100, 100).endFill();
```

Correct:

```ts
const g = new Graphics().rect(0, 0, 100, 100).fill(0xff0000);
```

v8 replaced "set style, draw, end" with "draw shape, then apply style". `beginFill`/`endFill` do not exist.


### [CRITICAL] Using old shape method names

Wrong:

```ts
g.drawCircle(50, 50, 25);
```

Correct:

```ts
g.circle(50, 50, 25);
```

All `draw*` methods were renamed in v8: `drawRect` → `rect`, `drawCircle` → `circle`, `drawEllipse` → `ellipse`, `drawPolygon` → `poly`, `drawRoundedRect` → `roundRect`, `drawStar` → `star`.


### [CRITICAL] Using lineStyle instead of stroke

Wrong:

```ts
g.lineStyle(2, 0xffffff);
g.drawRect(0, 0, 100, 100);
```

Correct:

```ts
g.rect(0, 0, 100, 100).stroke({ width: 2, color: 0xffffff });
```

`lineStyle` was removed. Use `stroke()` after drawing the shape. The stroke options object accepts `width`, `color`, `alpha`, `cap`, `join`, `alignment`, `miterLimit`, and `pixelLine`.


### [HIGH] Using beginHole/endHole for holes

Wrong:

```ts
g.beginFill(0x00ff00)
  .drawRect(0, 0, 100, 100)
  .beginHole()
  .drawCircle(50, 50, 20)
  .endHole()
  .endFill();
```

Correct:

```ts
g.rect(0, 0, 100, 100).fill(0x00ff00).circle(50, 50, 20).cut();
```

`beginHole`/`endHole` were replaced by `cut()`. Draw the outer shape, fill it, then draw the hole shape and call `cut()`.


### [HIGH] Using GraphicsGeometry instead of GraphicsContext

Wrong:

```ts
const geom = g.geometry;
const clone = new Graphics(geom);
```

Correct:

```ts
const ctx = new GraphicsContext().rect(0, 0, 100, 100).fill(0xff0000);
const g1 = new Graphics(ctx);
const g2 = new Graphics(ctx);
```

`GraphicsGeometry` was replaced by `GraphicsContext` in v8. There is no `.geometry` property.


### [HIGH] Destroying a shared GraphicsContext unexpectedly

```ts
const ctx = new GraphicsContext().rect(0, 0, 50, 50).fill(0xff0000);
const g1 = new Graphics(ctx);
const g2 = new Graphics(ctx);

g1.destroy({ context: true }); // also nullifies g2's context reference
```

Destroying a shared `GraphicsContext` does not destroy sharing instances but breaks them by nullifying their context reference. When passing a context via the constructor, `destroy()` with no args preserves the context; use `destroy({ context: false })` to be explicit. Only destroy the context when all sharing instances are done with it. A self-owned context (not passed via constructor) is still destroyed by `destroy()` with no args.


### [HIGH] Clearing and redrawing Graphics every frame

Graphics are designed to be stable, not dynamic. Calling `clear()` and redrawing every frame rebuilds GPU geometry each time. For dynamic visuals:

- Use `Sprite` with pre-rendered textures and transform changes.
- Use `cacheAsTexture(true)` for complex static graphics.
- For real-time shape changes, consider `Mesh` with custom geometry updates.

This is the opposite of HTML Canvas 2D, where redrawing each frame is normal. PixiJS tessellates shapes into GPU triangles, so initial draw is expensive but subsequent renders are fast. Treat `Graphics` more like SVG elements than canvas draw calls.


### [MEDIUM] Do not nest children inside a Graphics

`Graphics` sets `allowChildren = false`. Adding children logs a deprecation warning and will be a hard error in a future version. Wrap multiple graphics alongside other leaves in a plain `Container`:

```ts
const group = new Container();
group.addChild(graphics, sprite);
```


## API Reference

- [Graphics](https://pixijs.download/release/docs/scene.Graphics.html.md)
- [GraphicsOptions](https://pixijs.download/release/docs/scene.GraphicsOptions.html.md)
- [GraphicsContext](https://pixijs.download/release/docs/scene.GraphicsContext.html.md)
- [GraphicsPath](https://pixijs.download/release/docs/scene.GraphicsPath.html.md)
- [graphicsContextToSvg](https://pixijs.download/release/docs/scene.graphicsContextToSvg.html.md)
- [FillGradient](https://pixijs.download/release/docs/scene.FillGradient.html.md)
- [FillPattern](https://pixijs.download/release/docs/scene.FillPattern.html.md)
- [FillStyle](https://pixijs.download/release/docs/scene.FillStyle.html.md)
- [FillInput](https://pixijs.download/release/docs/scene.FillInput.html.md)
