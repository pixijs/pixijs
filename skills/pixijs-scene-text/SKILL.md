---
name: pixijs-scene-text
description: "Use this skill when rendering text in PixiJS v8. Covers Text for canvas-quality styled labels, BitmapText for cheap per-frame updates via glyph atlas, HTMLText for HTML/CSS markup via SVG, SplitText and SplitBitmapText for per-character animation, TextStyle, tagStyles, constructor options, TextOptions, HTMLTextOptions, BitmapText, SplitTextOptions, SplitBitmapTextOptions. Triggers on: Text, BitmapText, HTMLText, SplitText, SplitBitmapText, TextStyle, HTMLTextStyle, BitmapFont.install, tagStyles, fontFamily, wordWrap."
license: MIT
---

PixiJS has five text-rendering classes that cover different trade-offs between styling, performance, and animation. `Text` renders to a canvas for full CSS-style fidelity. `BitmapText` reads from a pre-generated atlas for cheap updates. `HTMLText` renders an HTML fragment via SVG `<foreignObject>` for rich markup. `SplitText` and `SplitBitmapText` wrap the first two classes and expose per-character, per-word, and per-line containers for animation.

Assumes familiarity with `pixijs-scene-core-concepts`. All text classes are leaf nodes; they cannot have children. Wrap multiple text instances in a `Container` to group them.

## Quick Start

```ts
const text = new Text({
  text: "Hello PixiJS",
  style: {
    fontFamily: "Arial",
    fontSize: 36,
    fill: 0xffffff,
    stroke: { color: 0x4a1850, width: 5 },
    dropShadow: { color: 0x000000, blur: 4, distance: 6 },
  },
});

text.anchor.set(0.5);
text.x = app.screen.width / 2;
text.y = 40;

app.stage.addChild(text);
```

All text classes use options-object constructors; positional `(string, style)` from v7 is not supported.

**Related skills:** `pixijs-scene-core-concepts` (leaves, transforms), `pixijs-assets` (font loading), `pixijs-performance` (BitmapText tradeoffs), `pixijs-color` (`FillInput` for fill/stroke), `pixijs-scene-graphics` (gradients and patterns reused via `FillInput`).

## Variants

| Variant           | Use when                                                           | Trade-offs                                                            | Reference                                                          |
| ----------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `Text`            | High-quality static or infrequent-update labels                    | Expensive to update (canvas re-draw + GPU upload)                     | [references/text.md](references/text.md)                           |
| `BitmapText`      | Scores, timers, gameplay labels, anything that changes every frame | Limited styling; fixed glyph atlas; requires MSDF for crisp scaling   | [references/bitmap-text.md](references/bitmap-text.md)             |
| `HTMLText`        | Rich formatted text, mixed styles, real HTML tags                  | Async rendering (one frame delay); similar update cost to `Text`      | [references/html-text.md](references/html-text.md)                 |
| `SplitText`       | Per-character animation with rich styling                          | Each char is a full `Text`; expensive for long strings                | [references/split-text.md](references/split-text.md)               |
| `SplitBitmapText` | Per-character animation on long strings or dynamic content         | Inherits BitmapText limitations (glyph atlas, no MSDF-free crispness) | [references/split-bitmap-text.md](references/split-bitmap-text.md) |

## When to use what

- **"I need a styled static label"** → `Text`. Use for titles, menus, dialog, error messages. See `references/text.md`.
- **"I need a score or timer that updates every frame"** → `BitmapText`. Updates only reposition quads; no canvas re-draw. See `references/bitmap-text.md`.
- **"I need mixed formatting with `<b>`, `<i>`, `<br>`"** → `HTMLText`. Real HTML/CSS rendering via SVG. See `references/html-text.md`.
- **"I need inline colored tags like `<red>Warning:</red>`"** → `Text` or `HTMLText` with `tagStyles`. Both support it.
- **"I need to animate each character individually"** → `SplitText` for short strings, `SplitBitmapText` for long strings or many instances. See `references/split-text.md` / `references/split-bitmap-text.md`.
- **"I need CJK / Arabic / emoji-heavy text"** → `Text` or `HTMLText`. `BitmapText` fails because the glyph set is too large for a single atlas.
- **"I need a custom font"** → Load via `Assets.load({ src: 'font.woff2', data: { family: 'MyFont' } })` first, then set `style.fontFamily: 'MyFont'`. Works for `Text` and `HTMLText`.

## Update cost comparison

| Update trigger      | Text | BitmapText | HTMLText | SplitText                     | SplitBitmapText          |
| ------------------- | ---- | ---------- | -------- | ----------------------------- | ------------------------ |
| Changing `.text`    | High | Very low   | High     | Very high (N text re-renders) | Low (N quad repositions) |
| Changing `.style`   | High | Medium     | High     | Very high                     | Medium                   |
| Moving (`.x`, `.y`) | Free | Free       | Free     | Free                          | Free                     |
| Rotating / scaling  | Free | Free       | Free     | Free                          | Free                     |

"Free" = normal Container transform cost. "High" = new canvas draw + GPU upload. "Very low" = quad reposition only. Update strings that change per-frame only on `BitmapText` or `SplitBitmapText`.

## Quick concepts

- **Options-object constructors.** Every v8 text class uses `new Text({ text, style, ... })`. The v7 `(string, style)` form is removed.
- **`tagStyles`.** `Text` and `HTMLText` support per-tag styling via `style.tagStyles`. Tags are only parsed when `tagStyles` has entries; otherwise `<` is treated literally.
- **`BitmapFont.install`.** Pre-generates an atlas before you create any `BitmapText`. Without install, the first `BitmapText` with a new `fontFamily` generates the atlas lazily.
- **MSDF fonts.** Multi-channel Signed Distance Field fonts stay sharp at any size. Generate with external tools (e.g., msdf-bmfont), load via `Assets.load('font.fnt')`. Requires `import 'pixi.js/text-bitmap'` in custom builds.

## Common Mistakes

### [HIGH] Updating `Text.text` every frame

Wrong:

```ts
app.ticker.add(() => {
  scoreText.text = `Score: ${score}`;
});
```

Correct:

```ts
const scoreText = new BitmapText({ text: "Score: 0", style });
app.ticker.add(() => {
  scoreText.text = `Score: ${score}`;
});
```

Every `Text` update re-rasterizes the whole string. Use `BitmapText` for any value that changes per-frame.


### [HIGH] Positional constructor args

Wrong:

```ts
const text = new Text("Hello", { fontSize: 24 });
```

Correct:

```ts
const text = new Text({ text: "Hello", style: { fontSize: 24 } });
```

v8 removed the `(string, style)` form. All text classes use options objects.


### [HIGH] Not importing `pixi.js/text-bitmap` in custom builds

Under `skipExtensionImports: true` or aggressive tree-shaking, `Assets.load('font.fnt')` silently returns raw data unless you add `import 'pixi.js/text-bitmap'`. The standard `import { ... } from 'pixi.js'` bundle includes the extension.


### [MEDIUM] Adding children to a text instance

Every text class sets `allowChildren = false`. Wrap in a `Container` to group text with other content.


## API Reference

- [Text](https://pixijs.download/release/docs/scene.Text.html.md)
- [TextStyle](https://pixijs.download/release/docs/text.TextStyle.html.md)
- [BitmapText](https://pixijs.download/release/docs/scene.BitmapText.html.md)
- [BitmapFont](https://pixijs.download/release/docs/text.BitmapFont.html.md)
- [HTMLText](https://pixijs.download/release/docs/scene.HTMLText.html.md)
- [HTMLTextStyle](https://pixijs.download/release/docs/text.HTMLTextStyle.html.md)
- [SplitText](https://pixijs.download/release/docs/text.SplitText.html.md)
- [SplitBitmapText](https://pixijs.download/release/docs/text.SplitBitmapText.html.md)
- [AbstractSplitText](https://pixijs.download/release/docs/text.AbstractSplitText.html.md)
- [AbstractText](https://pixijs.download/release/docs/scene.AbstractText.html.md)
