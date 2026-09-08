# BitmapText

Text rendered from a pre-generated texture atlas of glyphs. Updating the text string only repositions quads; no canvas re-render, no GPU upload per change. Use `BitmapText` for scores, timers, gameplay labels, and any text whose content changes frequently. Trade-off: limited styling, fixed glyph set, pixel-perfect only at the font's native size (unless you use MSDF).

## Quick Start

```ts
const score = new BitmapText({
  text: "Score: 0",
  style: {
    fontFamily: "Arial",
    fontSize: 32,
    fill: 0xffffff,
  },
});

app.stage.addChild(score);

app.ticker.add(() => {
  score.text = `Score: ${Math.floor(performance.now() / 100)}`;
});
```

When you pass a system font family without calling `BitmapFont.install`, the text-bitmap system generates a dynamic bitmap font on first use.

## Construction

```ts
const minimal = new BitmapText({ text: "Score: 0" });

const styled = new BitmapText({
  text: "Hello",
  style: { fontFamily: "GameFont", fontSize: 48, fill: 0xff0000 },
  anchor: 0.5,
  roundPixels: true,
});
```

### BitmapTextOptions

`BitmapText`'s constructor accepts the base `TextOptions` directly (no additional bitmap-specific fields). Fields match `references/text.md` with two caveats: `style` is still `TextStyle \| TextStyleOptions` (the same class `Text` uses, but many style fields are ignored by the bitmap pipeline), and `resolution` is managed by the underlying `BitmapFont` at install time rather than per-instance.

| Option        | Type                            | Default                                  | Description                                                                                                                                                                                                                                      |
| ------------- | ------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `text`        | `TextString`                    | `''`                                     | Text content. Same as `Text`.                                                                                                                                                                                                                    |
| `style`       | `TextStyle \| TextStyleOptions` | `new TextStyle()` with `fill = 0xffffff` | Shared TextStyle type; fields like `fontFamily`, `fontSize`, `fill`, `stroke`, `align`, `wordWrap`, `wordWrapWidth`, and `lineHeight` are respected. Gradients as fill and filters are not. See the TextStyle reference in `references/text.md`. |
| `anchor`      | `PointData \| number`           | `0`                                      | Same as `Text`.                                                                                                                                                                                                                                  |
| `resolution`  | `number \| null`                | `null`                                   | Accepted but ignored at runtime — set resolution on the `BitmapFont` via `BitmapFont.install({ resolution })` instead. Passing a non-null value logs a warning.                                                                                  |
| `roundPixels` | `boolean`                       | `false`                                  | Same as `Text`.                                                                                                                                                                                                                                  |

All `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

> `BitmapText` does NOT accept `textureStyle` or `autoGenerateMipmaps`; those are specific to canvas `Text` and `HTMLText`. The atlas texture style is controlled when installing the font via `BitmapFont.install({ textureStyle })`.

## Core Patterns

### Dynamic fonts (system font -> runtime atlas)

```ts
const dynamic = new BitmapText({
  text: "Hello",
  style: { fontFamily: "Arial", fontSize: 32, fill: 0xff1010 },
});
```

The first `BitmapText` with a given `fontFamily` + `fontSize` generates an atlas lazily. Subsequent `BitmapText` instances reuse it. The system also scales an existing close-match size rather than re-generating.

### Pre-installed fonts

```ts
import { BitmapFont } from "pixi.js";

BitmapFont.install({
  name: "GameFont",
  style: {
    fontFamily: "Arial",
    fontSize: 48,
    fill: 0xffffff,
    stroke: { color: "#000000", width: 2 },
  },
});

const title = new BitmapText({
  text: "Level 1",
  style: { fontFamily: "GameFont", fontSize: 48, fill: 0x00ff00 },
});
```

`BitmapFont.install` pre-generates an atlas so the first `BitmapText` render has no setup cost. Useful for known fixed styles in a game.

#### Install options

| Option         | Purpose                                                                                                                                                                                                                                               |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chars`        | Character set to pre-render. Accepts a string, nested ranges, or a preset: `BitmapFontManager.ALPHA`, `BitmapFontManager.NUMERIC`, `BitmapFontManager.ALPHANUMERIC`, `BitmapFontManager.ASCII`. Essential for non-ASCII, CJK, or restricted charsets. |
| `resolution`   | Texture atlas resolution. Default `1`. Use `window.devicePixelRatio` for HiDPI displays.                                                                                                                                                              |
| `padding`      | Glyph padding inside the atlas. Default `4`. Raise to avoid bleeding at large scales.                                                                                                                                                                 |
| `skipKerning`  | Skip kerning metadata to save memory and install time. Default `false`.                                                                                                                                                                               |
| `textureStyle` | `TextureStyle`/`TextureStyleOptions` override for the generated atlas (for example `{ scaleMode: 'nearest' }` for pixel fonts).                                                                                                                       |
| `dynamicFill`  | Allow runtime tinting via `BitmapText.tint`. Requires the font `style.fill` to be white, no stroke, no drop shadow, or a drop shadow with color `0x000000` (black). The idiomatic way to color bitmap text without generating a new atlas per color.  |

```ts
import { BitmapFont, BitmapFontManager } from "pixi.js";

BitmapFont.install({
  name: "UIFont",
  chars: BitmapFontManager.ALPHANUMERIC,
  resolution: window.devicePixelRatio,
  padding: 8,
  skipKerning: true,
  textureStyle: { scaleMode: "nearest" },
  dynamicFill: true,
  style: { fontFamily: "Arial", fontSize: 32, fill: 0xffffff },
});

const hp = new BitmapText({
  text: "100",
  style: { fontFamily: "UIFont", fill: "red" },
});
const mp = new BitmapText({
  text: "50",
  style: { fontFamily: "UIFont", fill: "blue" },
});
```

### Loaded bitmap fonts (FNT / XML)

```ts
import "pixi.js/text-bitmap";
import { Assets, BitmapText } from "pixi.js";

await Assets.load("fonts/arcade.fnt");

const arcade = new BitmapText({
  text: "HIGH SCORE",
  style: { fontFamily: "arcade", fontSize: 36 },
});
```

Load `.fnt` or `.xml` files (AngelCode BMFont format) via Assets. Generate them from a `.ttf` / `.otf` with [AssetPack](https://pixijs.io/assetpack/). The side-effect import `'pixi.js/text-bitmap'` registers the loader; required for custom builds that set `skipExtensionImports: true`.

### MSDF / SDF fonts for crisp scaling

Multi-channel Signed Distance Field (MSDF) fonts stay sharp at any size. Generate them with [AssetPack](https://pixijs.io/assetpack/) (Pixi's own asset pipeline, which takes a `.ttf` or `.otf` and emits the `.fnt` + atlas) or [msdf-bmfont](https://msdf-bmfont.donmccurdy.com/). Load them via Assets; they're detected automatically when the FNT file declares a distanceField section.

```ts
await Assets.load("fonts/msdf-hero.fnt");

const heading = new BitmapText({
  text: "Title",
  style: { fontFamily: "msdf-hero", fontSize: 120 },
});

heading.scale.set(2);
```

MSDF fonts trade CPU rendering time for a custom fragment shader, but remain crisp when scaled up or down.

### Word wrap

```ts
const paragraph = new BitmapText({
  text: "A long wrapped paragraph of bitmap text",
  style: {
    fontFamily: "Arial",
    fontSize: 24,
    wordWrap: true,
    wordWrapWidth: 300,
    lineHeight: 30,
  },
});
```

Standard TextStyle wrapping properties work. Line-height and alignment (`align: 'center' | 'left' | 'right'`) apply to wrapped output.

### Updating content

```ts
score.text = `Score: ${value}`;
```

Updates reposition glyph quads only. No canvas re-draw, no GPU upload. This is why `BitmapText` is the right choice for every-frame text updates.

## Common Mistakes

### [HIGH] Not importing `pixi.js/text-bitmap` in custom builds

Wrong (custom build with `skipExtensionImports: true`):

```ts
import { Assets } from "pixi.js";
await Assets.load("font.fnt");
```

Correct:

```ts
import "pixi.js/text-bitmap";
import { Assets } from "pixi.js";
await Assets.load("font.fnt");
```

Without the side-effect import, `.fnt` and `.xml` files aren't recognized by the asset loader; the call silently succeeds but returns raw data instead of a `BitmapFont`.


### [MEDIUM] Setting `resolution` on BitmapText

Wrong:

```ts
text.resolution = 2;
```

`BitmapText` ignores `resolution` and logs a warning. The effective resolution is baked into the `BitmapFont` at install time. To get higher resolution, install the font with a larger `fontSize` and scale the text down.


### [MEDIUM] Missing characters silently dropped

If the font atlas doesn't contain a glyph (e.g., a rare Unicode character), the glyph is silently skipped with no visible error. Text may appear incomplete. For unknown or user-generated content, fall back to canvas `Text` or `HTMLText`.


### [HIGH] Using BitmapText for CJK or emoji-heavy content

CJK (Chinese/Japanese/Korean), Arabic, and emoji-heavy strings need thousands of glyphs. A bitmap atlas containing all of them exceeds GPU texture-size limits. Use `Text` or `HTMLText` for text with unpredictable or very large character sets.


## API Reference

- [BitmapText](https://pixijs.download/release/docs/scene.BitmapText.html.md)
- [BitmapFont](https://pixijs.download/release/docs/text.BitmapFont.html.md)
- [BitmapFontManager](https://pixijs.download/release/docs/text.BitmapFontManager.html.md)
- [AbstractBitmapFont](https://pixijs.download/release/docs/text.AbstractBitmapFont.html.md)
