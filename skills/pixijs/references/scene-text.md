# scene-text

Choosing between `Text`, `BitmapText`, `HTMLText`, `SplitText` and `SplitBitmapText`, what each update costs, and the defaults every text object shares.

All text classes take an options object: `new Text({ text, style })`. The v7 positional `(string, style)` form still runs but is deprecated and logs a warning. A `Text` with no `fill` is black (`TextStyle` defaults: `fill: 'black'`, `fontSize: 26`, `fontFamily: 'Arial'`), which is invisible on the default black canvas.

| Variant           | Use for                                                           | Trade-off                                                              | Sub-page |
| ----------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- | -------- |
| `Text`            | Styled labels that change rarely                                  | Each change is a canvas redraw + GPU upload                           | [text.md](scene-text/text.md) |
| `BitmapText`      | Scores, timers, anything that changes every frame                 | Limited styling; glyph atlas; crisp scaling needs MSDF                | [bitmap-text.md](scene-text/bitmap-text.md) |
| `HTMLText`        | Real HTML/CSS markup (`<b>`, `<i>`, `<br>`, nested styles)        | Texture appears a few frames after first render; size is known immediately | [html-text.md](scene-text/html-text.md) |
| `SplitText`       | Per-character animation with rich styling                         | Each char is a full `Text`; expensive for long strings                | [split-text.md](scene-text/split-text.md) |
| `SplitBitmapText` | Per-character animation on long strings or dynamic content        | Inherits BitmapText limits                                            | [split-text.md](scene-text/split-text.md) |

- Inline coloured tags (`<red>Warning:</red>`): `Text` or `HTMLText` with `tagStyles`.
- Arabic, Indic, other shaped scripts, or emoji: `Text` or `HTMLText`. `BitmapText` draws one glyph per grapheme, so it cannot join or shape scripts. CJK works with a dynamic `BitmapText` (glyphs are rasterised on first use), but a pre-built `.fnt` font drops any glyph it lacks.
- Custom font: `await Assets.load({ src: 'font.woff2', data: { family: 'MyFont' } })` first, then `style.fontFamily: 'MyFont'`; works for `Text` and `HTMLText` ([fonts](assets/fonts.md)).
- `BitmapFont.install` pre-generates an atlas before you create any `BitmapText`; without it, the first `BitmapText` with a new `fontFamily` generates the atlas lazily. MSDF fonts (from msdf-bmfont or AssetPack) stay sharp at any size and load with `Assets.load('font.fnt')`. No extra import is needed in any build: Assets registers the bitmap-font loader and `BitmapText` registers its own render pipes.

## Update cost comparison

| Update trigger      | Text | BitmapText | HTMLText | SplitText                     | SplitBitmapText          |
| ------------------- | ---- | ---------- | -------- | ----------------------------- | ------------------------ |
| Changing `.text`    | High | Very low   | High     | Very high (N text re-renders) | Low (N quad repositions) |
| Changing `.style`   | High | Medium     | High     | Very high                     | Medium                   |
| Moving, rotating, scaling | Free | Free | Free     | Free                          | Free                     |

"High" = new canvas draw + GPU upload; "Very low" = quad reposition only. Put strings that change most frames (scores, timers, counters) in `BitmapText` or `SplitBitmapText`. The `text` setter of `Text`, `BitmapText` and `HTMLText` ignores a value equal to the current string, so assigning every frame costs nothing until the value changes (an equality guard adds nothing); `SplitText` and `SplitBitmapText` rebuild on every assignment.
