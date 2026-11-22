# BitmapText

`BitmapText`: dynamic atlases and what shares them, `BitmapFont.install` and `dynamicFill`, loaded `.fnt` fonts, MSDF, and the options it ignores.

```ts
import { Application, BitmapText } from "pixi.js";

declare const app: Application;

const score = new BitmapText({ text: "Score: 0", style: { fontFamily: "Arial", fontSize: 32, fill: 0xffffff } });
app.stage.addChild(score);

app.ticker.add(() => {
  score.text = `Score: ${Math.floor(performance.now() / 100)}`;
});
```

A text change only repositions glyph quads: no canvas redraw, no GPU upload.

## Options

`BitmapText` takes the base `TextOptions` (`text`, `style`, `anchor`, `roundPixels`) with these differences from [Text](text.md):

- `style` is the same `TextStyle`, with `fill` defaulting to `0xffffff`. `fontFamily`, `fontSize`, `fill`, `stroke`, `align`, `wordWrap`, `wordWrapWidth` and `lineHeight` are respected; gradient fills and style `filters` are not.
- `resolution` is accepted but ignored, and a non-null value (constructor or `text.resolution = 2`) logs a warning. Resolution belongs to the font: `BitmapFont.install({ resolution })`, or install at a larger `fontSize` and scale the text down.
- There is no `textureStyle` or `autoGenerateMipmaps`; set the atlas texture style with `BitmapFont.install({ textureStyle })`.

## Dynamic fonts

A system `fontFamily` with no install generates an atlas lazily on first use. Without a stroke or drop shadow the atlas is shared by `fontFamily`, weight, style and variant (a solid fill is applied as a tint, so every colour reuses it). A stroke or drop shadow ties the atlas to the `TextStyle` object itself: pass one shared `TextStyle` instance (or `BitmapFont.install` the style) to every stroked BitmapText, or each one builds its own atlas. `fontSize` is not part of the key: glyphs are rasterised once at a fixed base size and scaled to each `fontSize`, so very small sizes can look soft; install a font at the target size for crisp small text. Missing characters are rasterised on first use (a canvas draw plus upload), so any script without complex shaping works, CJK included; pre-warm with `chars`. There is no shaping (one glyph per grapheme), so Arabic, Indic and other joined scripts render as isolated forms: use `Text` or `HTMLText` for them.

## BitmapFont.install

```ts
import { BitmapFont, BitmapFontManager, BitmapText } from "pixi.js";

BitmapFont.install({
  name: "UIFont",
  chars: BitmapFontManager.ALPHANUMERIC,
  resolution: window.devicePixelRatio,
  padding: 8,
  textureStyle: { scaleMode: "nearest" },
  dynamicFill: true,
  style: { fontFamily: "Arial", fontSize: 32, fill: 0xffffff, stroke: { color: "#000000", width: 2 } },
});

const hp = new BitmapText({ text: "100", style: { fontFamily: "UIFont", fill: "red" } });
```

The installed fill is baked into the glyphs unless the style is tintable (white fill, no stroke, no shadow or a black one) or you pass `dynamicFill: true`. Without `dynamicFill` here, the stroke makes the style non-tintable, so `fill: "red"` would be ignored and the text would render white with a black stroke. With `dynamicFill: true` the per-instance fill applies and also tints the stroke (a black stroke stays black).

| Option         | Default | Notes |
| -------------- | ------- | ----- |
| `chars`        |         | String, nested ranges, or `BitmapFontManager.ALPHA` / `NUMERIC` / `ALPHANUMERIC` / `ASCII`. A pre-warm list, not a whitelist: other characters are generated on first use. |
| `resolution`   | `1`     | Atlas resolution; `window.devicePixelRatio` for HiDPI. |
| `padding`      | `4`     | Glyph padding in the atlas; raise it to stop bleeding at large scales. |
| `skipKerning`  | `false` | Skip kerning data to save memory and install time. |
| `textureStyle` |         | Atlas `TextureStyle` options, e.g. `{ scaleMode: 'nearest' }` for pixel fonts. |
| `dynamicFill`  | auto    | Render glyphs white and colour them with each BitmapText's `style.fill`; on automatically when the style is tintable. The way to colour bitmap text without an atlas per colour. |

## Loaded bitmap fonts (FNT / XML) and MSDF

```ts
import { Assets, BitmapText } from "pixi.js";

await Assets.load("fonts/arcade.fnt");
const arcade = new BitmapText({ text: "HIGH SCORE", style: { fontFamily: "arcade", fontSize: 36 } });
```

AngelCode BMFont `.fnt` / `.xml` files load through Assets with no extra import; [AssetPack](https://pixijs.io/assetpack/) generates them from a `.ttf` / `.otf`. `style.fontFamily` must be the `face` name declared inside the file (read it with `(await Assets.load<BitmapFont>(url)).fontFamily`) or the exact key it was loaded under, not the file name; on a mismatch BitmapText silently builds a dynamic font from a system font of that name. A loaded font draws only the glyphs it contains and silently skips missing ones; for user-generated content fall back to a dynamic font, `Text` or `HTMLText`.

MSDF / SDF fonts (from AssetPack or msdf-bmfont) are detected automatically when the `.fnt` declares a `distanceField` section; they render through a custom fragment shader and stay crisp at any scale.
