# SmoothGraphics

`SmoothGraphics` is a `Graphics` that anti-aliases its edges in the shader: every edge of a fill or stroke gets about one pixel of coverage, computed in render target pixels. Edges stay smooth without MSAA, at any scale and resolution, and in render textures.

It extends `Graphics` and has the same drawing API. Switching `new Graphics()` to `new SmoothGraphics()` needs no other change.

```ts
import { SmoothGraphics } from "pixi.js";

const g = new SmoothGraphics()
  .circle(100, 100, 50)
  .fill(0xde3249)
  .stroke({ width: 2, color: 0xffffff });

app.stage.addChild(g);
```

Shapes, paths, `cut()` holes, texture fills and strokes, `FillGradient`, `FillPattern`, `g.texture()`, caps, joins, `alignment`, tint, alpha and blend modes all behave as in `Graphics`.

## When to choose it over Graphics

- The app runs with `antialias: false` and vector edges must look smooth.
- Shapes are drawn into a `RenderTexture`, through a filter, or with `cacheAsTexture()`: these have no MSAA by default.
- Thin lines, or scenes that zoom, where MSAA still leaves visible steps.

Keep `Graphics` when MSAA already looks good enough or edges don't matter: it builds and moves for less.

## pixelLine keeps the width

`pixelLine: true` keeps the stroke width in screen pixels whatever the transform. On `Graphics` a pixel line is always 1 pixel wide; on `SmoothGraphics` the `width` is kept:

```ts
const g = new SmoothGraphics().circle(0, 0, 10).stroke({ width: 2, color: 0xffffff, pixelLine: true });

g.scale.set(5); // the circle grows, its stroke stays 2px
```

## Dashed lines with DashLineShader

```ts
import { DashLineShader, SmoothGraphics } from "pixi.js";

const dashes = new DashLineShader({ dash: 10, gap: 5 });
const g = new SmoothGraphics();

g.context.customShader = dashes;
g.moveTo(0, 0).lineTo(200, 100).stroke({ width: 3, color: 0xffffff });

dashes.dash = 20; // dash and gap can change at any time (customShader is typed as Shader)
```

- The shader applies to every stroke of the context; dashes restart at the start of each shape.
- Fills are not drawn with a `DashLineShader`. Draw them with a second `SmoothGraphics`.
- `dash` and `gap` scale with the object, like the line width.
- Keep the default `'butt'` cap: a `'round'` cap at the start of a path can show a sliver of dash.
- A context with a custom shader is never batched: one draw call per context.
- `DashLineShader` only works with `SmoothGraphics`, not `Graphics`.

## A context can't be shared with Graphics

`Graphics` and `SmoothGraphics` build different geometry and store it on the context, so one `GraphicsContext` can't be drawn by both. One of them can render blank, and no error is thrown. Give one a copy:

```ts
const context = new GraphicsContext().star(0, 0, 5, 50).fill(0xffcc00);

const aliased = new Graphics(context);
const smooth = new SmoothGraphics(context.clone());
```

Several `SmoothGraphics` can share a context with each other.

## Renderers

WebGL and WebGPU draw the shader anti-aliasing. The canvas renderer draws `SmoothGraphics` like a regular `Graphics`.

## Performance

- Small contexts batch like `Graphics`; large ones and ones with a `customShader` get their own draw call.
- The anti-aliasing uses more and bigger vertices than `Graphics`. Static scenes cost about the same, but every batched `SmoothGraphics` that moves has its vertices transformed and uploaded again.
- Many objects moving together: put their container in a render group (`container.isRenderGroup = true`) so moving it doesn't touch the children's vertices.
- Medium sized objects each moving on their own: `g.context.batchMode = 'no-batch'` uploads their vertices once, at one draw call each.
- Don't `clear()` and redraw every frame; swap prebuilt contexts.

## Caveats

- Pixels just outside very sharp fill corners can get slightly too much coverage.
- Shapes blend one after the other, so two shapes sharing an edge show a faint seam where their anti-aliased edges overlap. Draw the union as one shape instead.
