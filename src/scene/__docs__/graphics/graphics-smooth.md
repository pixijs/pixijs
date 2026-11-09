---
title: Smooth Graphics
description: Learn how to use SmoothGraphics in PixiJS to draw vector shapes with anti-aliased edges without MSAA, including pixel lines and dashed strokes.
category: scene
---

# Smooth Graphics

{@link SmoothGraphics} is a {@link Graphics} that anti-aliases its edges in the shader. Every edge of a fill or stroke gets about one pixel of coverage, computed from the geometry in render target pixels, so shapes stay smooth without MSAA, at any scale and resolution.

It has the same drawing API as `Graphics`, so you can switch a `Graphics` to a `SmoothGraphics` without changing the drawing code.

---

@stackblitz(smoothGraphics)

## Basic usage

```ts
import { SmoothGraphics } from 'pixi.js';

const graphics = new SmoothGraphics()
  .circle(100, 100, 50)
  .fill(0xde3249)
  .stroke({ width: 2, color: 0xffffff });

app.stage.addChild(graphics);
```

Everything `Graphics` draws works the same way: shapes, paths, holes with `cut()`, texture fills and strokes, {@link FillGradient}, {@link FillPattern}, `graphics.texture()`, stroke caps, joins and alignment, tint, alpha and blend modes.

## When to use it

Use `SmoothGraphics` when the edges of vector shapes have to look smooth and MSAA can't do it:

- The renderer is created with `antialias: false`, for performance or because MSAA is not available.
- The shapes are drawn into a {@link RenderTexture}, through a filter, or with `cacheAsTexture()`: these don't use MSAA by default.
- The scene has thin lines, or is zoomed in and out, and MSAA's few samples per pixel leave visible steps.

`Graphics` is cheaper to build and to move, so keep it for shapes that don't need smooth edges, or when MSAA (`antialias: true`) already looks good enough.

## Line width independent from the scale

As with `Graphics`, a stroke scales with the transform of the object. Set `pixelLine: true` to keep the width in screen pixels. Unlike `Graphics`, which always draws pixel lines 1 pixel wide, `SmoothGraphics` keeps the `width` of the stroke:

```ts
const graphics = new SmoothGraphics().circle(0, 0, 10).stroke({ width: 2, color: 0xffffff, pixelLine: true });

graphics.scale.set(5); // the circle grows, its stroke stays 2 pixels wide
```

## Dashed lines

Set a {@link DashLineShader} as the custom shader of the context to dash its strokes:

```ts
import { DashLineShader, SmoothGraphics } from 'pixi.js';

const dashes = new DashLineShader({ dash: 10, gap: 5 });
const graphics = new SmoothGraphics();

graphics.context.customShader = dashes;
graphics.moveTo(0, 0).lineTo(200, 100).stroke({ width: 3, color: 0xffffff });

// dash and gap can be changed at any time
dashes.gap = 10;
```

- The shader applies to every stroke of the context, and dashes restart at the start of each shape.
- Fills aren't drawn with a `DashLineShader`: draw them with another `SmoothGraphics`.
- Dash and gap lengths scale with the object, like the line width.
- Keep the default `'butt'` cap: a `'round'` cap at the start of a path can show a sliver of dash.
- A context with a custom shader is never batched, so each one costs a draw call.

## A context can't be shared with Graphics

`Graphics` and `SmoothGraphics` build different geometry and store it on the {@link GraphicsContext}, so one context can't be drawn by both: one of them can render blank. No error is thrown. To draw the same shapes with both, give one a copy:

```ts
const context = new GraphicsContext().star(0, 0, 5, 50).fill(0xffcc00);

const aliased = new Graphics(context);
const smooth = new SmoothGraphics(context.clone());
```

Several `SmoothGraphics` can share a context with each other, the same way several `Graphics` can.

## Renderers

`SmoothGraphics` works with the WebGL and WebGPU renderers. The canvas renderer draws it like a regular `Graphics`, with the anti-aliasing of the 2D canvas.

## Performance

Small contexts are batched together like with `Graphics`, and bigger ones (or ones with a custom shader) are drawn with their own draw call.

The anti-aliasing needs more vertices than `Graphics`, and bigger ones. Static scenes render about as fast as with `Graphics`, but every batched `SmoothGraphics` that moves has its vertices transformed and uploaded again, which costs more than with `Graphics`. When many of them move:

- Put a container that is moved, rotated or zoomed as a whole in a render group (`container.isRenderGroup = true`): moving the group doesn't update the vertices of its children.
- For medium sized objects that each move on their own, set `graphics.context.batchMode = 'no-batch'`: their vertices are uploaded once, and each one costs a draw call.

As with `Graphics`, don't clear and redraw a context every frame if you can swap prebuilt contexts instead.

## Caveats

- Pixels just outside very sharp corners of fills can get a little too much coverage.
- Overlapping shapes are blended one after the other, so the anti-aliased edges of two shapes that touch can show a faint seam.

---

## API reference

- {@link SmoothGraphics}
- {@link DashLineShader}
- {@link DashLineShaderOptions}
- {@link Graphics}
- {@link GraphicsContext}
