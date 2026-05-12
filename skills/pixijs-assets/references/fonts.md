# Fonts

PixiJS loads two kinds of fonts through `Assets`: web fonts (TTF/OTF/WOFF/WOFF2) via `loadWebFont`, and bitmap fonts (FNT/XML) via `loadBitmapFont`. Use web fonts for `Text` and `HTMLText`; use bitmap fonts for `BitmapText` when you need GPU-friendly rendering without runtime text layout.

## Web fonts

### Quick Start

```ts
await Assets.load("fonts/titan-one.woff2");

const text = new Text({
  text: "Hello world",
  style: { fontFamily: "Titan One", fontSize: 48 },
});
```

Once the font is loaded, reference it by its derived family name in any `TextStyle`. PixiJS registers the font with the browser's `FontFaceSet`, so DOM elements and Canvas can use it too.

### Family name derivation

```ts
// Loaded URL               → Derived family name
// fonts/titan-one.woff     → 'Titan One'
// fonts/open_sans.ttf      → 'Open Sans'
// fonts/my-custom-font.otf → 'My Custom Font'
```

By default, the family name is the filename without extension, with dashes and underscores replaced by spaces and title-cased. Override it with `data.family`.

### Load options via `data`

```ts
await Assets.load({
  alias: "hero-font",
  src: "fonts/hero.woff2",
  data: {
    family: "HeroFont",
    weights: ["normal", "bold"],
    style: "italic",
    display: "swap",
    unicodeRange: "U+0000-00FF",
    stretch: "expanded",
    featureSettings: '"liga" 1',
  },
});
```

Fields on `data` map directly to FontFace descriptors:

| Option            | Purpose                                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `family`          | Override the derived font family name                                                                                                  |
| `weights`         | Array of weights to register. One `FontFace` per weight, all sharing the same URL. Valid values: `'normal'`, `'bold'`, `'100'`–`'900'` |
| `style`           | `'normal'`, `'italic'`, `'oblique'`                                                                                                    |
| `display`         | CSS `font-display` (`'auto'`, `'block'`, `'swap'`, `'fallback'`, `'optional'`)                                                         |
| `unicodeRange`    | Restrict which codepoints the font covers                                                                                              |
| `stretch`         | `'normal'`, `'condensed'`, `'expanded'`, etc.                                                                                          |
| `variant`         | CSS font-variant value                                                                                                                 |
| `featureSettings` | OpenType feature settings like `'"liga" 1, "dlig" 1'`                                                                                  |

### Loading multiple weights

```ts
await Assets.load({
  src: "fonts/inter.woff2",
  data: {
    family: "Inter",
    weights: ["400", "700"],
  },
});
```

A single URL registers as multiple weights. Use when your font file contains a variable font or when your platform lets one file satisfy multiple weights.

### Supported extensions

`.ttf`, `.otf`, `.woff`, `.woff2`. WOFF2 is the smallest and universally supported in current browsers. Prefer it unless you're targeting very old environments.

## Bitmap fonts

### Quick Start

```ts
import "pixi.js/text-bitmap";

await Assets.load("fonts/arial.fnt");

const text = new BitmapText({
  text: "Score: 9999",
  style: { fontFamily: "Arial", fontSize: 32 },
});
```

The side-effect import registers the `CanvasBitmapTextPipe` and `BitmapTextPipe` rendering pipes. `Assets.load('font.fnt')` works without it and returns a `BitmapFont`, but rendering a `BitmapText` fails at render time without the import.

### Supported formats

| Extension | Format             |
| --------- | ------------------ |
| `.fnt`    | BMFont text or XML |
| `.xml`    | BMFont XML         |

The parser sniffs the content to pick between text and XML automatically.

### Texture page loading

```ts
// my-font.fnt references my-font_0.png, my-font_1.png
await Assets.load("fonts/my-font.fnt");
```

Bitmap fonts reference page images by filename in the `.fnt` data. The parser resolves these relative to the `.fnt` URL and loads them automatically. Any search params on the `.fnt` URL (e.g. cache busting) propagate to the page texture URLs.

### Signed Distance Field (SDF) fonts

The parser detects distance field metadata in the `.fnt` file and enables `linear` scale mode plus disables mipmaps automatically. No extra configuration needed from the caller. SDF fonts stay crisp at any size, so you can render a single bitmap font at many different sizes.

### Accessing the BitmapFont instance

```ts
await Assets.load({ alias: "arial", src: "fonts/arial.fnt" });

const font = Assets.get("arial");
console.log(font.chars);
console.log(font.fontFamily);
```

The cached asset is a `BitmapFont` instance. `Assets.get('arial')` and `Assets.get('arial-bitmap')` both return it, and `Assets.get('Arial-bitmap')` works if `fontFamily` matches.

## Forcing the font parser

If your font URL lacks an extension, force the loader:

```ts
await Assets.load({
  src: "https://cdn.example.com/fonts/abc123",
  parser: "web-font",
  data: { family: "Hero", weights: ["400", "700"] },
});

await Assets.load({
  src: "https://cdn.example.com/fonts/hero-bmfont",
  parser: "bitmap-font",
});
```

See the main `SKILL.md` section on "Forcing a parser with `parser`" for the full list of parser IDs.

## Common Mistakes

### [HIGH] Forgetting the bitmap-font import

Wrong:

```ts
import { Assets, BitmapText } from "pixi.js";
await Assets.load("arial.fnt");
const text = new BitmapText({ text: "Hi", style: { fontFamily: "Arial" } });
app.stage.addChild(text);
```

Correct:

```ts
import "pixi.js/text-bitmap";
import { Assets, BitmapText } from "pixi.js";
await Assets.load("arial.fnt");
const text = new BitmapText({ text: "Hi", style: { fontFamily: "Arial" } });
app.stage.addChild(text);
```

`Assets.load('arial.fnt')` succeeds in the default bundle and returns a `BitmapFont`, but `'pixi.js/text-bitmap'` registers the `CanvasBitmapTextPipe` and `BitmapTextPipe`. Without it, `BitmapText` renders nothing or errors at render time.


### [HIGH] Using Text before the font is loaded

Wrong:

```ts
const text = new Text({ text: "Hi", style: { fontFamily: "Hero" } });
Assets.load("fonts/hero.woff2");
```

Correct:

```ts
await Assets.load("fonts/hero.woff2");
const text = new Text({ text: "Hi", style: { fontFamily: "Hero" } });
```

The browser falls back to a system font if the named family isn't registered yet, then the `Text` is cached at that fallback style. Reloading the font doesn't repaint existing Text objects.


### [MEDIUM] Family name mismatch

If you don't pass `data.family`, the family name is derived from the filename. `my_hero_font.woff` becomes `'My Hero Font'`; use exactly that string in your `TextStyle.fontFamily`, or set `data.family` to an explicit value.


## API Reference

- [loadWebFont](https://pixijs.download/release/docs/assets.loadWebFont.html.md)
- [loadBitmapFont](https://pixijs.download/release/docs/assets.loadBitmapFont.html.md)
- [LoadFontData](https://pixijs.download/release/docs/assets.LoadFontData.html.md)
- [BitmapFont](https://pixijs.download/release/docs/scene.BitmapFont.html.md)
