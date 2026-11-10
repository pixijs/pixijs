# SVG loading

`.svg` as a rasterized texture (default) or as a `GraphicsContext`, and what Graphics mode can't parse.

```ts
import { Assets, Graphics, Sprite, type GraphicsContext, type Texture } from "pixi.js";

const texture = await Assets.load<Texture>({ src: "icon.svg", data: { resolution: 2 } });
const sprite = new Sprite(texture);

const context = await Assets.load<GraphicsContext>({ src: "logo.svg", data: { parseAsGraphicsContext: true } });
const small = new Graphics(context);
const large = new Graphics(context);
large.scale.set(3);
```

- **Texture mode** (default): the browser rasterizes the SVG once at its native size, times `data.resolution` (pair with `autoGenerateMipmaps` for smooth downscaling). It batches like any sprite and has the browser's full SVG/CSS support, but pixelates when scaled past that resolution.
- **Graphics mode** (`data: { parseAsGraphicsContext: true }`): parsed into a `GraphicsContext` that several `Graphics` can share, crisp at any scale; higher initial parse cost, and `resolution` doesn't apply. `Assets.setPreferences({ parseAsGraphicsContext: true })` makes it the default for later loads unless an asset's `data` overrides it.
- Graphics mode uses the same parser as `graphics.svg()`; supported elements and attributes are in [scene-graphics](../scene-graphics.md#svg-import-and-export). Unsupported elements are skipped with a console warning, and gradients map to `FillGradient`. It does not read `<style>` blocks or class selectors at all; only presentation attributes and inline `style="..."` are parsed, so class-styled shapes render with the default black fill. Move styling inline, or use texture mode.
- An SVG that references external images (`<image href="...">`) cross-origin without CORS headers may fail to load; inline the image as base64 or serve it from the same origin.
