# Fonts

Web fonts (`.ttf`, `.otf`, `.woff`, `.woff2`) and bitmap fonts (`.fnt`, `.xml`) through `Assets`: family names, `data` descriptors, cache keys and load order.

## Web fonts

```ts
import { Assets, Text } from "pixi.js";

await Assets.load({ src: "fonts/inter.woff2", data: { family: "Inter", weights: ["400", "700"] } });
const text = new Text({ text: "Hello", style: { fontFamily: "Inter", fontWeight: "700" } });
```

- Load the font before creating the `Text`. A `Text` created first rasterises with the browser's fallback font and is cached at that style; loading the font later doesn't repaint existing Text objects.
- Without `data.family`, the family name is derived from the filename: extension dropped, dashes and underscores become spaces, words title-cased (`fonts/titan-one.woff` → `'Titan One'`, `my_hero_font.woff` → `'My Hero Font'`). Use exactly that string in `fontFamily`, or set `data.family`.
- Fonts are registered with the browser's `FontFaceSet`, so DOM elements and `Text` can use them. `HTMLText` can use only fonts loaded this way ([html-text](../scene-text/html-text.md#fonts-must-come-through-assets)).
- An extension-less font URL needs `parser: "web-font"` (or `"bitmap-font"`) at the top level of the descriptor ([assets](../assets.md#forcing-a-parser-with-parser)).

`data` fields map to `FontFace` descriptors:

| Field             | Purpose |
| ----------------- | ------- |
| `family`          | Override the derived family name |
| `weights`         | Weights to register, one `FontFace` per weight, all sharing the same URL: `'normal'`, `'bold'`, `'100'`–`'900'` |
| `style`           | `'normal'`, `'italic'`, `'oblique'` |
| `display`         | CSS `font-display` (`'auto'`, `'block'`, `'swap'`, `'fallback'`, `'optional'`) |
| `unicodeRange`    | Restrict the codepoints the font covers |
| `stretch`         | `'normal'`, `'condensed'`, `'expanded'`, ... |
| `variant`         | CSS font-variant value |
| `featureSettings` | OpenType features, e.g. `'"liga" 1, "dlig" 1'` |

## Bitmap fonts

```ts
import { Assets, BitmapText, type BitmapFont } from "pixi.js";

const font = await Assets.load<BitmapFont>({ alias: "arial", src: "fonts/arial.fnt" });
const text = new BitmapText({ text: "Score: 9999", style: { fontFamily: font.fontFamily, fontSize: 32 } });
```

- No side-effect import is needed in any build: Assets registers the bitmap-font loader and `BitmapText` registers its own render pipes. `pixi.js/text-bitmap` exists only for manual extension setups.
- `fontFamily` must match the `face` declared inside the `.fnt` or the key it was loaded under; a mismatch silently falls back to a dynamic font built from a system font.
- The cached asset is a `BitmapFont`. `Assets.get('arial')` and `Assets.get('arial-bitmap')` both return it, and `Assets.get('Arial-bitmap')` works if `fontFamily` matches.
- The parser sniffs text vs XML BMFont content. Page images named in the `.fnt` are resolved relative to the `.fnt` URL and loaded automatically; search params on the `.fnt` URL (cache busting) propagate to them.
- Distance-field metadata in the `.fnt` switches the atlas to `linear` scale mode and disables mipmaps automatically; SDF/MSDF fonts stay crisp at any size.
