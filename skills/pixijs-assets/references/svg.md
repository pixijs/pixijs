# SVG Loading

PixiJS loads `.svg` files in one of two modes: rasterized to a texture (fast, fixed resolution) or parsed into a `GraphicsContext` (scalable vector, reusable across `Graphics` instances). Choose texture mode for backgrounds and decorative elements at a fixed size; choose Graphics mode for icons, UI elements, or anything that needs to scale or be modified at runtime.

## Quick Start

```ts
const svgTexture = await Assets.load("icon.svg");
const sprite = new Sprite(svgTexture);

const svgContext = await Assets.load({
  src: "icon.svg",
  data: { parseAsGraphicsContext: true },
});
const graphic = new Graphics(svgContext);
```

By default, SVG files rasterize to a texture at their native size. Pass `parseAsGraphicsContext: true` in the `data` field to parse as vector geometry instead.

## Core Patterns

### Texture mode (default)

```ts
const icon = await Assets.load("close.svg");
const button = new Sprite(icon);
```

The SVG is rasterized to a bitmap via the browser's native SVG-to-image pipeline, then uploaded as a `Texture`. Rendering is batched just like a regular sprite. Scaling up beyond the rasterized resolution pixelates; the rasterization happens once.

### Graphics mode

```ts
const context = await Assets.load({
  src: "logo.svg",
  data: { parseAsGraphicsContext: true },
});

const small = new Graphics(context);
small.scale.set(0.5);

const large = new Graphics(context);
large.scale.set(3);
```

The SVG is parsed into a `GraphicsContext` (a compiled list of fill/stroke instructions). Both `Graphics` instances share the same context; cheap, and both stay crisp at any scale.

### Resolution for sharper texture mode

```ts
const icon = await Assets.load({
  src: "icon.svg",
  data: { resolution: 2 },
});
```

For texture mode, you can pass `resolution` in `data` to rasterize at a higher density. Pairs with `autoGenerateMipmaps` for smooth downscaling. Doesn't apply in Graphics mode.

### Global default

```ts
import { loadSvg } from "pixi.js";

loadSvg.config.parseAsGraphicsContext = true;
```

Flip the default mode globally. Any subsequent `Assets.load('*.svg')` call parses as Graphics unless overridden in the asset's `data` options.

### When to use which mode

| Mode                                      | Best for                                          | Cost                                                           |
| ----------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------- |
| Texture (default)                         | Icons at a known size, backgrounds, complex SVGs  | One-time rasterization; fast per-frame; pixelates when scaled  |
| Graphics (`parseAsGraphicsContext: true`) | Scalable icons, UI elements, runtime modification | Higher initial parse cost; crisp at any scale; shared contexts |

If you need the same SVG at multiple sizes, Graphics mode is usually faster because you parse once and scale cheaply. If you have one fixed-size SVG, texture mode is simpler and batches with other sprites.

## Common Mistakes

### [HIGH] Expecting scalability in texture mode

Wrong:

```ts
const icon = await Assets.load("icon.svg");
const sprite = new Sprite(icon);
sprite.scale.set(5); // pixelates
```

Correct (if you need scaling):

```ts
const context = await Assets.load({
  src: "icon.svg",
  data: { parseAsGraphicsContext: true },
});
const graphic = new Graphics(context);
graphic.scale.set(5); // crisp
```

Or rasterize at higher resolution:

```ts
const icon = await Assets.load({
  src: "icon.svg",
  data: { resolution: 5 },
});
```

Texture mode is frozen at rasterization time. Use Graphics mode or high `resolution` when the final size isn't known upfront.


### [MEDIUM] External references in SVG files

SVGs that reference external images via `<image href="...">` may fail to load if the reference is cross-origin without CORS headers. Inline the image data as base64 or serve everything from the same origin.


### [MEDIUM] CSS in `<style>` elements

Not all CSS features are supported in Graphics mode; the parser extracts geometry, fill, and stroke, but ignores advanced CSS like `filter` or `mask`. For full CSS fidelity, use texture mode.


## API Reference

- [Assets](https://pixijs.download/release/docs/assets.Assets.html.md)
- [LoadSVGConfig](https://pixijs.download/release/docs/assets.LoadSVGConfig.html.md)
- [Graphics](https://pixijs.download/release/docs/scene.Graphics.html.md)
- [GraphicsContext](https://pixijs.download/release/docs/scene.GraphicsContext.html.md)
