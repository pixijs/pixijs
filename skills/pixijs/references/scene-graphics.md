# scene-graphics

Vector shapes and paths with `Graphics`: fills, strokes, holes, gradients, patterns, draw-time transforms, context sharing, SVG, hit testing.

## Shape, then style

```ts
const g = new Graphics()
  .rect(10, 10, 200, 100)
  .fill({ color: 0x3498db, alpha: 0.8 })
  .stroke({ width: 3, color: 0x2c3e50 })
  .circle(300, 60, 40)
  .fill(0xe74c3c);
```

Draw a shape or path, then `fill()` and/or `stroke()` it; a `stroke()` right after `fill()` reuses the same path. Style calls apply only to shapes drawn before them: the v7-order `g.fill(0xff0000).rect(...)` draws nothing, and any shape left after the last `fill()`/`stroke()` is never rendered.

`poly(points, close?)` takes flat numbers or `{ x, y }` points; its stroke is a closed outline unless `close` is `false`. Stroke an open polyline with `poly(points, false)` or `moveTo`/`lineTo`.

Constructor: `new Graphics({ context?, roundPixels? })` (`roundPixels` default `false`), or `new Graphics(ctx)` as shorthand for `{ context: ctx }`.

## v7 names → v8

v8 replaced "set style, draw, end" with "draw shape, then style". `beginFill`, `endFill`, `lineStyle` and the `draw*` names survive only as deprecated shims that log a warning; write the v8 calls:

- `beginFill(c).drawRect(...).endFill()` → `rect(...).fill(c)`; `lineStyle(w, c)` → `stroke({ width: w, color: c })` after the shape.
- `drawRect` → `rect`, `drawCircle` → `circle`, `drawEllipse` → `ellipse`, `drawPolygon` → `poly`, `drawRoundedRect` → `roundRect`, `drawStar` → `star`, `drawRegularPolygon` → `regularPoly`, `drawRoundedPolygon` → `roundPoly`, `drawRoundedShape` → `roundShape`, `drawChamferRect` → `chamferRect`, `drawFilletRect` → `filletRect`. Signatures: `star(x, y, points, radius, innerRadius?, rotation?)`, `regularPoly(x, y, radius, sides, rotation?)`, `roundPoly(x, y, radius, sides, corner, rotation?)`, `roundShape(points: { x, y, radius? }[], radius)`, `chamferRect(x, y, w, h, chamfer)`, `filletRect(x, y, w, h, fillet)`.
- `beginHole()`/`endHole()` → `cut()` (see [Holes](#holes-with-cut)).
- `beginTextureFill({ texture })` → `fill({ texture, textureSpace: 'global' })` or a `FillPattern`; the default `'local'` stretches the texture.
- `GraphicsGeometry` → `GraphicsContext`. There is no `.geometry` property; share a context instead.

Ported v7 code fails silently through the `lineStyle` shim: it only sets the style, and nothing is committed until `endFill()`, so an outline-only `lineStyle(...)` + `drawRect(...)` with no `endFill()` draws nothing. The shim also takes only `(width, color, alpha)`, dropping a v7 alignment argument. When porting a stroke with `alignment`, invert it: v7 `alignment: 1` (outer) is v8 `alignment: 0`.

## Fills

`fill()` takes a `FillInput`: a color number/string, `{ color, alpha, texture, matrix, textureSpace }`, a `FillGradient`, a `FillPattern`, or a `Texture`. For a texture, `textureSpace` sets the mapping:

- `'local'` (default): one copy of the texture is stretched over each shape's bounding box (normalized 0-1 coordinates).
- `'global'`: the texture keeps its pixel size, anchored at the Graphics origin and tiled across all shapes.
- Atlas sub-textures: `'global'` honors the frame origin and rotation, so a shape drawn at the frame's size matches a `Sprite` of that frame. `'local'` maps the whole source image; pass a `matrix` that targets the frame's region of the source, or `renderer.generateTexture()` the frame first.

A `FillStyle` object can nest a `FillGradient` or `FillPattern` under its `fill` key. The gradient or pattern then takes over `color` (forced to white), `texture`, `matrix` and `textureSpace`; only `alpha` (and the stroke attributes, for `stroke()`) from the outer object apply. `fill({ fill: gradient, color: 0xff0000 })` is not tinted red; build the gradient with the colours you want, or set the `Graphics` `tint`.

Texture and pattern fills switch the texture source's shared `addressMode` from `'clamp-to-edge'` to `'repeat'` the first time they are drawn, which also affects every `Sprite` using that source (edge bleeding with linear filtering). Give patterns their own texture when that matters.

`g.texture(texture, tint?, dx?, dy?, dw?, dh?)` draws one textured rect without `fill()`. Areas drawn this way are not hit-tested.

## Strokes

`stroke()` takes a color, a `FillGradient`, a `FillPattern`, or a `StrokeStyle`: every `FillStyle` key (`color`, `alpha`, `texture`, `matrix`, `fill`, `textureSpace`) plus:

| Attribute    | Default   | Notes                                                                   |
| ------------ | --------- | ----------------------------------------------------------------------- |
| `width`      | `1`       |                                                                         |
| `cap`        | `'butt'`  | `'butt'`, `'round'`, `'square'`                                         |
| `join`       | `'miter'` | `'miter'`, `'round'`, `'bevel'`                                         |
| `miterLimit` | `10`      |                                                                         |
| `alignment`  | `0.5`     | `1` = inside the shape, `0.5` = centered, `0` = outside. Inverted from v7 (where `1` was outer). |
| `pixelLine`  | `false`   | Aligns 1-pixel lines to the pixel grid. On `SmoothGraphics`, keeps `width` in screen pixels instead. |

A gradient stroke is `stroke({ width: 8, fill: gradient })`.

## Holes with cut()

```ts
g.rect(0, 0, 200, 200).fill(0x00ff00).circle(100, 100, 50).cut();
```

`cut()` subtracts the active path from the previously drawn fill or stroke:

- The hole must be **completely inside** the target shape; holes that overlap edges or sit outside it don't render correctly.
- `cut()` looks back at up to the **last two** instructions. After `fill()` then `stroke()` of the same path, one `cut()` adds the hole to the stroke; a second `cut()` adds it to the fill underneath.
- It cuts strokes too: `g.rect(...).stroke(...).circle(...).cut()` cuts through the outline.
- Several shapes drawn before one `cut()` all become holes. Holes in separate shapes need each shape's own `fill()` followed by its own `cut()`.
- Cutting a shape that already has a hole adds to the hole path rather than replacing it.
- The active path resets after `cut()`.

## Paths

Path methods: `moveTo`, `lineTo`, `bezierCurveTo`, `quadraticCurveTo`, `arc(cx, cy, r, start, end, ccw?)`, `arcTo(x1, y1, x2, y2, r)`, `arcToSvg(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y)` (the SVG `A` command), `closePath`. `beginPath()` discards the active path without touching committed instructions.

Build a `GraphicsPath` once and append it many times with `g.path(path)` (also `GraphicsContext.path()`):

```ts
const arrow = new GraphicsPath().moveTo(0, 0).lineTo(60, 10).lineTo(0, 20).closePath();
g.path(arrow).fill(0x3498db);
```

## Gradients and patterns

```ts
const linear = new FillGradient({
  end: { x: 1, y: 0 },
  colorStops: [
    { offset: 0, color: 0xff0000 },
    { offset: 1, color: 0x0000ff },
  ],
});
g.rect(0, 0, 200, 100).fill(linear);

// Pixel coordinates need textureSpace: "global"; the gradient then spans shapes.
const radial = new FillGradient({
  type: "radial",
  center: { x: 100, y: 100 },
  outerRadius: 100,
  textureSpace: "global",
  colorStops: [
    { offset: 0, color: 0xffffff },
    { offset: 1, color: 0x000000 },
  ],
});
g.rect(0, 0, 200, 200).fill(radial);

const pattern = new FillPattern({ texture: tex, repetition: "repeat", textureSpace: "global" });
g.rect(0, 120, 200, 100).fill(pattern);
```

`FillGradient` defaults: `type: 'linear'`, `start {0,0}` to `end {0,1}` (vertical), `textureSpace: 'local'` (normalized 0-1 shape coordinates; a centred radial is `center`/`outerCenter` `{0.5, 0.5}`, `outerRadius: 0.5`). Radial uses `center`/`innerRadius` and `outerCenter`/`outerRadius`; `rotation` (radians, default `0`) and `scale` (default `1`) make it elliptical and apply to Graphics only.

A gradient is rasterised to a texture the first time it is drawn and never rebuilt: later `addColorStop()` calls or edits to `colorStops`, `start`, `end` or radii are ignored, even after `clear()` and a redraw. Set every stop before the first draw. To animate colours, create a new `FillGradient` (and `destroy()` the old one, which frees its texture) or tint the `Graphics`.

The pre-8.5 positional form `new FillGradient(x0, y0, x1, y1)` still compiles but now defaults to `'local'` space, so pixel coordinates stretch the gradient over hundreds of shape-widths and the shape shows only the first colour. Use the options object, with `textureSpace: "global"` for pixel coordinates.

`FillPattern` takes `{ texture, repetition?, textureSpace? }` or the legacy `new FillPattern(texture, repetition?)`; `repetition` is `'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat'`. Its `textureSpace` defaults to `'global'` (unlike texture fills): tiles repeat across the `Graphics` coordinate system, so adjacent shapes share one grid. `'local'` fits one tile to each shape's bounds; combine it with `setTransform` to subdivide a shape into a tile grid. `pattern.setTransform(matrix)` copies the matrix onto the pattern to scale, rotate or offset the tiling; `setTransform()` with no argument resets it.

Set `textureSpace` and the transform on the `FillPattern` itself: inside a style object (`fill({ fill: pattern, textureSpace: "local" })`) the pattern's own values replace the style's `textureSpace` and `matrix`. `FillPattern.destroy()` destroys its texture and source, so never destroy a pattern built from an `Assets` texture you still use.

## Draw-time transforms

`Graphics` has a transform stack applied to points **while drawing**, separate from its `Container` transform. The methods are renamed to avoid clashing with `Container` properties:

| Drawing transform                                         | Container transform       |
| --------------------------------------------------------- | ------------------------- |
| `g.rotateTransform(angle)`                                | `g.rotation`              |
| `g.scaleTransform(x, y?)`                                 | `g.scale.set(x, y)`       |
| `g.translateTransform(x, y?)`                             | `g.position.set(x, y)`    |
| `g.setTransform(matrix)` or `setTransform(a,b,c,d,tx,ty)` | `g.setFromMatrix(matrix)` |
| `g.transform(matrix)` or `transform(a,b,c,d,tx,ty)`       | n/a                       |
| `g.getTransform()` / `g.resetTransform()`                 | n/a                       |

```ts
// A 50x50 square centred on (100, 100), rotated 45 degrees about its centre.
g.save();
g.rotateTransform(Math.PI / 4).translateTransform(100, 100);
g.rect(-25, -25, 50, 50).fill(0x3498db);
g.restore(); // later shapes are untransformed again
```

**Order is the reverse of Canvas 2D.** `rotateTransform`, `scaleTransform` and `translateTransform` each apply *after* the transform built so far, in parent space: the first call is applied to the points first. To place a shape drawn around `(0, 0)` at `(x, y)` with angle `a`, call `rotateTransform(a)` then `translateTransform(x, y)`. The Canvas habit `translateTransform(x, y).rotateTransform(a)` rotates the translation too, so the shape orbits the origin (a square meant for `(100, 100)` lands centred near `(0, 141)`). Likewise `translateTransform(100, 0).scaleTransform(2)` puts the shape at `x = 200`.

`transform(matrix)` composes the other way (it applies `matrix` *before* the existing transform, Canvas-like), so `translateTransform(100, 100).transform(new Matrix().rotate(a))` does rotate about `(100, 100)`. For several steps, build one `Matrix` (its `rotate/scale/translate` also apply in call order) and `setTransform` it: `g.setTransform(new Matrix().rotate(Math.PI / 4).translate(100, 100))`.

The drawing transform affects every later shape and path command. `save()` pushes the drawing transform, fill style and stroke style; `restore()` pops them.

## Default styles

`setFillStyle(style)` / `setStrokeStyle(style)` set the style a bare `fill()` / `stroke()` uses; read or replace it via the `fillStyle` / `strokeStyle` properties. Library-wide fallbacks are the statics `GraphicsContext.defaultFillStyle` and `GraphicsContext.defaultStrokeStyle`; mutate them once at startup.

## GraphicsContext: sharing, cloning, destroying

```ts
const ctx = new GraphicsContext().rect(0, 0, 50, 50).fill(0xff0000);
const g1 = new Graphics(ctx);
const g2 = new Graphics(ctx); // tessellated once, drawn twice
```

The drawing instructions live on a `GraphicsContext`; sharing one avoids duplicate tessellation and GPU geometry. Assign one later with `g.context = ctx`.

- `g.clone()` shares the source context (both change together); `g.clone(true)` copies the context so the clone edits independently. `ctx.clone()` copies the instruction list (the instruction objects and their paths are shared), active path, transform, styles and stack.
- `clear()` wipes the active path, instructions and drawing transform; fill/stroke styles persist.
- `g.bounds` / `ctx.bounds` are the geometry bounds before the `Container` transform, cached across fill/stroke/texture instructions.
- `ctx.batchMode` is `'auto'` | `'batch'` | `'no-batch'`; `ctx.customShader` overrides the graphics shader.
- A context is an `EventEmitter` emitting `update`, `destroy` and `unload`.

**Destroying a shared context** leaves every other `Graphics` using it holding the destroyed context, and the next render throws. `destroy({ context: true })` and `destroy(true)` destroy the context even when it was passed to the constructor; `destroy(true)` also destroys the texture and its source behind the context's current fill and stroke style (the last texture fill, `FillPattern` or `FillGradient` used), even an `Assets` texture that sprites still show. For a `Graphics` on a shared context, call `destroy()` (no args), which detaches it and keeps the context, then `ctx.destroy()` after the last user is gone. A self-owned context (not passed via constructor) is destroyed by `destroy()` with no args, but not by an options object without `context: true` (`destroy({ children: true })` leaves it alive). A shallow `clone()` hands ownership away: after it, destroy the context yourself.

## Hit testing

Pointer events on a `Graphics` hit only its drawn shapes, not the bounding box. For a manual test, `g.containsPoint(g.toLocal(globalPoint))` (also `ctx.containsPoint`) takes a **local** point and tests every filled and stroked shape, including holes. A stroke's hit band follows its `width` and `alignment` (`1` inside, `0.5` centered, `0` outside), independent of winding order. `g.texture()` areas are not hit-tested.

## SVG import and export

`g.svg(markup)` parses into the active context: `<path>` (with `fill-rule="evenodd"` holes), `<rect>`, `<circle>`, `<ellipse>`, `<line>`, `<polygon>`, `<polyline>`, `<g>`. Styling comes from `fill`, `stroke`, `stroke-width`, `fill-opacity`, `stroke-opacity` and `opacity`, as attributes or inline `style`. `<linearGradient>`/`<radialGradient>` in `<defs>` become `FillGradient`s via `url(#id)`; `gradientUnits` maps to `textureSpace` and percentage coordinates are accepted. Not supported: `transform` attributes, `<style>` blocks, `stroke-linecap`/`stroke-linejoin`/`stroke-dasharray`, `gradientTransform`, `spreadMethod`, `stop-opacity`, `<text>`, `<image>`, `<use>`, `<clipPath>`, `<mask>`, `<pattern>`, filters; unsupported elements log a warning and are skipped. Complex hole geometries may render inaccurately. `svg(string)` parses through a DOM element, so it fails in a Web Worker.

`graphicsContextToSvg(graphicsOrContext, precision = 2)` returns a complete `<svg>` string with an auto-computed `viewBox`:

- Output is in the context's own drawing space: the `Graphics` position, scale, rotation, pivot and parent transforms are not applied, and there is no export for a whole `Container`. Export each `Graphics` and wrap it in `<g transform="matrix(a b c d tx ty)">` from `g.getGlobalTransform()`, or bake the placement with draw-time transforms first.
- Exports every primitive (advanced ones like `regularPoly`/`filletRect` as a path), all path methods, `width`/`cap`/`join`/`miterLimit`, `fill-opacity`/`stroke-opacity`, and linear and radial `FillGradient` via `<defs>`. Holes collapse into one `<path>` with `fill-rule="evenodd"`.
- `FillPattern` falls back to the fill's solid `color`; `texture()` instructions are skipped. Stroke `alignment` and `pixelLine` are not exported, so a non-centred stroke shifts.
- Reimporting with `g.svg(...)` keeps geometry, solid and gradient fills, stroke colour, width and opacity, but not stroke `cap`, `join` or `miterLimit`.

## Smooth edges without MSAA

`SmoothGraphics` extends `Graphics` with the same API and anti-aliases edges in the shader, so shapes stay smooth with `antialias: false`, in render textures, and with thin or zoomed lines. Dashed strokes take a `DashLineShader` as the context's `customShader`:

```ts
const smooth = new SmoothGraphics().circle(100, 100, 50).fill(0xde3249).stroke({ width: 1, color: 0xffffff });

const dashed = new SmoothGraphics();
dashed.context.customShader = new DashLineShader({ dash: 10, gap: 5 });
dashed.moveTo(0, 0).lineTo(200, 0).stroke({ width: 2, color: 0xffffff });
```

One `GraphicsContext` can't be drawn by both a `Graphics` and a `SmoothGraphics` (one renders blank, no error); give one a `context.clone()`. Read [scene-graphics/smooth-graphics.md](scene-graphics/smooth-graphics.md) for when to choose it, `pixelLine` and dash rules, performance, and caveats.

## Keep geometry stable

`clear()` and redraw every frame rebuilds GPU geometry each time; unlike Canvas 2D, shapes are tessellated once and then cheap to render. For dynamic visuals, move or transform a stable `Graphics` or a `Sprite` of a pre-rendered texture, use `cacheAsTexture(true)` for complex static graphics ([performance](performance.md#cacheastexture-for-performance)), or a `Mesh` with updated vertices for real-time shape changes. For a Graphics mask see [masking](scene-core-concepts/masking.md).
