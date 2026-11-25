# blend-modes

`blendMode` inheritance and render roots, erasing, filtered containers, and the filter-based advanced modes.

## Standard modes

`"normal"`, `"add"`, `"multiply"`, `"screen"`, `"erase"`, `"none"` (overwrites the destination), `"min"`, `"max"`, plus `"inherit"`, which is the actual default value. These use GPU blend equations and need no import. `min`/`max` need WebGL2, WebGL1 with `EXT_blend_minmax`, or WebGPU. v7's `BLEND_MODES.ADD` is the string `"add"`: `BLEND_MODES` is a type only in v8, so importing it as a value fails (TS2693, and an ES module import fails to link).

Each blend-mode change breaks the batch, so group siblings by mode; see [performance](performance.md#batching-optimization).

## Inheritance and render roots

Each child resolves `"inherit"` during the transform update to its parent's resolved mode. Children of an `"add"` container therefore draw additively; set `child.blendMode = "normal"` to opt one out.

**The render root's own `blendMode` is ignored.** The container passed to `renderer.render({ container, target })` (and `app.stage`) never applies its `blendMode`, even when it is a `Graphics` or `Sprite`: an `"erase"` brush rendered directly into a texture paints white instead of cutting a hole. Wrap it in a plain `Container` and render the wrapper.

**Blend modes don't inherit across a render-group boundary.** Direct children of a render root or of an `isRenderGroup: true` container resolve `"inherit"` to `"normal"`, ignoring that container's `blendMode` and its ancestors'. Set the mode on the children themselves. A `cacheAsTexture` container composites with its own `blendMode`.

## Erase and paint-out layers

`erase` clears everything already drawn in the same render target (objects underneath and the renderer's background colour), not only the layer the erasing object belongs to. To cut a hole in one layer, give that layer its own target: `layer.filters = [new AlphaFilter()]`, `layer.cacheAsTexture(true)` (call `layer.updateCacheTexture()` after changes), or a `RenderTexture` as below. `isRenderGroup` alone does not isolate it.

To erase permanently from a texture (scratch-off, fog of war, paint-out), render an erasing brush into a `RenderTexture` with `clear: false`, with the brush as a child of the rendered container:

```ts
import { Container, Graphics, RenderTexture, Sprite } from "pixi.js";
import type { Application } from "pixi.js";

declare const app: Application;

const fogTexture = RenderTexture.create({ width: 512, height: 384 });
app.renderer.render({ container: new Graphics().rect(0, 0, 512, 384).fill(0x101820), target: fogTexture });

const fog = new Sprite(fogTexture);
fog.position.set(64, 48);
app.stage.addChild(fog);

const brush = new Graphics().circle(0, 0, 24).fill(0xffffff);
brush.blendMode = "erase";
const brushRoot = new Container(); // the render root's own blendMode is ignored, so the brush is a child
brushRoot.addChild(brush);

function reveal(globalX: number, globalY: number): void {
  // texture pixel under the point, whatever the sprite's position, scale, rotation or anchor
  const local = fog.toLocal({ x: globalX, y: globalY });
  brush.position.set(local.x + fog.anchor.x * fogTexture.width, local.y + fog.anchor.y * fogTexture.height);
  // render() clears the target first unless clear: false
  app.renderer.render({ container: brushRoot, target: fogTexture, clear: false });
}

fog.eventMode = "static";
fog.on("pointermove", (e) => reveal(e.global.x, e.global.y));
```

The brush draws in texture pixels, so convert the pointer with `toLocal`; subtracting `fog.x` / `fog.y` misses as soon as the sprite is anchored, scaled or nested.

## Filtered containers

A container with `filters` is composited by its **last filter's** `blendMode` (default `"normal"`). `container.blendMode` only changes how its children draw into the filter's input, so `container.blendMode = "add"` on a filtered container still covers what is behind it. Put the mode on the filter:

```ts
import { BlurFilter, Container } from "pixi.js";

const glow = new Container();
glow.filters = [new BlurFilter({ strength: 8, blendMode: "add" })]; // or blur.blendMode = "add"
```

## Advanced blend modes

`color-burn`, `color-dodge`, `darken`, `difference`, `divide`, `exclusion`, `hard-light`, `hard-mix`, `lighten`, `linear-burn`, `linear-dodge`, `linear-light`, `luminosity`, `negation`, `overlay`, `pin-light`, `saturation`, `soft-light`, `subtract`, `vivid-light`, `color`. They are filters, set through the same `blendMode` property, and need three things:

```ts
import "pixi.js/advanced-blend-modes"; // 1. registers them
import { Application, Filter, Sprite } from "pixi.js";

declare const sprite: Sprite;

Filter.defaultOptions.resolution = "inherit"; // 3. before the first render that uses an advanced mode

const app = new Application();
await app.init({ useBackBuffer: true }); // 2. WebGL only; WebGPU always has the back buffer

sprite.blendMode = "color-burn";
```

1. **Without the import**, any mode outside the standard list renders as `normal` with no console warning.
2. **Without `useBackBuffer: true` on WebGL**, the object renders with normal blending (dev builds warn every frame).
3. **Resolution.** The blend filters use `Filter.defaultOptions`, whose resolution defaults to `1`, so on a high-DPI target the blended object is drawn at resolution `1` and looks soft, while the backdrop is read at the target's resolution. Each blend filter is created on first use and cached, so setting it after that frame has no effect. It also changes the default for every filter created afterwards, at more memory and runtime cost.

Each run of consecutive objects with the same advanced mode becomes one filter pass plus a copy of the back buffer, so group siblings that share a mode.
