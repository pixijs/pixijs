# NineSliceSprite

`NineSliceSprite` panels: border options and fallbacks, resizing with `width`/`height`, texture-defined borders, and a panel texture baked from `Graphics`.

```ts
import { Assets, NineSliceSprite, type Texture } from "pixi.js";

const texture = await Assets.load<Texture>("panel.png");

const panel = new NineSliceSprite({
  texture,
  leftWidth: 20,
  topHeight: 20,
  rightWidth: 20,
  bottomHeight: 20,
  width: 400,
  height: 200,
});
panel.setSize(600, 300);
```

## Options and resizing

| Option | Default | Notes |
| ------ | ------- | ----- |
| `leftWidth`, `topHeight`, `rightWidth`, `bottomHeight` | `10` | Unscaled border sizes; fall back to `texture.defaultBorders` when not passed. Mutable at runtime; the geometry rebuilds on the next render. |
| `width`, `height` | `texture.width` / `texture.height` (else `100`) | Size of the stretched panel; modifies vertices, not UVs. |
| `anchor`, `roundPixels` | `0`, `false` | As on `Sprite`. `roundPixels` avoids sub-pixel seams at slice boundaries in pixel-art UI. |

Resize with `width`/`height` or `setSize(w, h)`, never `scale`: `scale` stretches the whole geometry, corners included. The corners stay fixed while the panel is at least `leftWidth + rightWidth` wide and `topHeight + bottomHeight` tall; below that, all borders shrink proportionally.

Keep each pair of opposing borders smaller than the texture dimension. If `leftWidth + rightWidth >= texture.width` (or `topHeight + bottomHeight >= texture.height`), no texture pixels are left for the center strip, so it is filled by stretching the seam between the two borders instead of the texture's middle.

`originalWidth` / `originalHeight` are readonly getters returning `texture.width` / `texture.height`, e.g. `panel.setSize(panel.originalWidth, panel.originalHeight)` to reset.

`NineSliceSprite.defaultOptions` is mutable, but only its `texture` field is read as a fallback. Border defaults come from `texture.defaultBorders` (per texture) or `NineSliceGeometry.defaultOptions` (global), and size defaults fall back to `texture.width` / `texture.height` or `NineSliceGeometry.defaultOptions.width` / `.height`.

## Texture-defined borders

```ts
import { NineSliceSprite, Texture, type TextureSource } from "pixi.js";

declare const baseSource: TextureSource;

const texture = new Texture({
  source: baseSource,
  defaultBorders: { left: 15, top: 15, right: 15, bottom: 15 },
});
const panel = new NineSliceSprite({ texture, width: 400, height: 200 });
```

`defaultBorders` is a readonly `Texture` property: pass it to the `Texture` constructor, or set `borders` on the spritesheet frame data so `Assets.load` bakes it in. The sprite picks it up when no explicit border values are passed.

## Panel texture drawn with Graphics

```ts
import { Application, Graphics, NineSliceSprite, Rectangle } from "pixi.js";

declare const app: Application;

const shape = new Graphics()
  .roundRect(0, 0, 48, 48, 12)
  .fill(0x223344)
  .stroke({ width: 2, color: 0xffffff, alignment: 1 });
const texture = app.renderer.generateTexture({ target: shape, frame: new Rectangle(0, 0, 48, 48) });
shape.destroy();

const panel = new NineSliceSprite({
  texture,
  leftWidth: 14,
  topHeight: 14,
  rightWidth: 14,
  bottomHeight: 14,
  width: 300,
  height: 120,
});
app.stage.addChild(panel);
```

Make the borders at least the corner radius plus the stroke width. `frame` must be a `Rectangle`; a plain `{ x, y, width, height }` throws `copyTo is not a function`. `alignment: 1` keeps the stroke inside the frame.
