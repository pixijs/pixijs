# SplitBitmapText (experimental)

The bitmap counterpart to `SplitText`. Wraps a `BitmapText` and exposes `lines`, `words`, and `chars` as independently-animatable containers. Use `SplitBitmapText` when you want per-character animation on long strings, many simultaneous instances, or text that changes frequently; scenarios where `SplitText`'s per-char canvas rasterization would be too expensive.

## Quick Start

```ts
import { BitmapFont, SplitBitmapText } from "pixi.js";

BitmapFont.install({
  name: "GameFont",
  style: { fontFamily: "Arial", fontSize: 48 },
});

const split = new SplitBitmapText({
  text: "Fast Animate",
  style: { fontFamily: "GameFont", fontSize: 48 },
  charAnchor: { x: 0.5, y: 1 },
});

app.stage.addChild(split);

split.chars.forEach((char, i) => {
  char.onRender = () => {
    const t = performance.now() / 200 + i;
    char.y = Math.sin(t) * 5;
  };
});
```

The API mirrors `SplitText` exactly; the only difference is the underlying text engine. Install a bitmap font (or load one from a `.fnt` file) before creating the instance.

## Construction

```ts
const minimal = new SplitBitmapText({
  text: "Hello World",
  style: { fontFamily: "GameFont", fontSize: 32 },
});

const full = new SplitBitmapText({
  text: "Fast\nPer-char",
  style: { fontFamily: "GameFont", fontSize: 48, fill: 0xffffff },
  autoSplit: true,
  lineAnchor: 0.5,
  wordAnchor: { x: 0, y: 0.5 },
  charAnchor: { x: 0.5, y: 1 },
  x: 100,
  y: 200,
});
```

### SplitBitmapTextOptions

`SplitBitmapText` uses the same option shape as `SplitText`: all splitting fields are inherited from `AbstractSplitOptions`, and the only concrete difference is that `style` drives a `BitmapText` render instead of a `Text` render. Like `SplitText`, it is a `Container`, not a `ViewContainer`; the top-level options do NOT include `anchor`, `resolution`, `roundPixels`, `textureStyle`, or `autoGenerateMipmaps`.

| Option       | Type                                     | Default | Description                                                                                                                                                                                    |
| ------------ | ---------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`       | `string`                                 | —       | Text content to render and segment. Required.                                                                                                                                                  |
| `style`      | `TextStyle \| Partial<TextStyleOptions>` | —       | TextStyle instance or style options; `fill` defaults to `0xffffff` when unset, matching `BitmapText`. See `references/bitmap-text.md` for which fields the bitmap pipeline respects. Required. |
| `autoSplit`  | `boolean`                                | `true`  | Automatically re-split when `text` or `style` changes; set `false` to batch updates and call `split.split()` manually.                                                                         |
| `lineAnchor` | `number \| PointData`                    | `0`     | Normalized transform origin (0–1) for each line container.                                                                                                                                     |
| `wordAnchor` | `number \| PointData`                    | `0`     | Normalized transform origin for each word container.                                                                                                                                           |
| `charAnchor` | `number \| PointData`                    | `0`     | Normalized transform origin for each character container.                                                                                                                                      |

All `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

> `SplitBitmapText.defaultOptions` overrides the defaults globally for every new `SplitBitmapText` instance. `SplitBitmapText.from(existingBitmapText, options?)` builds an instance by cloning the source's text and style — `tagStyles` on the source are discarded (bitmap text does not support them) and a warning is logged.

## Core Patterns

### Segment access

```ts
split.lines.forEach((line) => {
  line.alpha = 0.9;
});
split.words.forEach((word) => {
  word.scale.set(1.1);
});
split.chars.forEach((char) => {
  char.rotation = 0.05;
});
```

Each `lines[i]`, `words[i]`, `chars[i]` is a Container wrapping a `BitmapText` instance for that segment. BitmapText glyph quads are cheap, so iterating and transforming hundreds of characters stays performant.

### Transform origins

```ts
const split = new SplitBitmapText({
  text: "Wave motion",
  style: { fontFamily: "GameFont", fontSize: 48 },
  lineAnchor: 0.5,
  wordAnchor: { x: 0, y: 0.5 },
  charAnchor: { x: 0.5, y: 1 },
});
```

Same normalized 0–1 anchors as `SplitText`: line, word, and char containers each get a separate transform origin. Set once at construction; the anchors apply to every future re-split.

### Stagger animation

```ts
split.chars.forEach((char, i) => {
  char.alpha = 0;
});

let elapsed = 0;
app.ticker.add((ticker) => {
  elapsed += ticker.deltaMS;
  split.chars.forEach((char, i) => {
    if (elapsed > i * 50) char.alpha = Math.min(char.alpha + 0.05, 1);
  });
});
```

Reveal characters one at a time. Because each char is a cheap BitmapText, this scales to long strings without dropping frames.

### Constructing from an existing BitmapText

```ts
const label = new BitmapText({
  text: "Press start",
  style: { fontFamily: "GameFont", fontSize: 32 },
});

const animatable = SplitBitmapText.from(label);
```

`SplitBitmapText.from(existingBitmapText)` copies content and style, then splits. Useful for attaching per-character animation to a text that was already laid out elsewhere.

### Updating content

```ts
split.text = "New string";
```

`autoSplit` (default `true`) rebuilds the segment arrays on every text/style change. Per-segment animations attached via `onRender` persist across re-splits as long as you re-apply them in the update step.

## Common Mistakes

### [HIGH] Using SplitBitmapText without a BitmapFont

Wrong:

```ts
const split = new SplitBitmapText({
  text: "Hello",
  style: { fontFamily: "Arial", fontSize: 48 },
});
```

The above works; dynamic bitmap fonts auto-generate; but for known game fonts prefer pre-installing:

Correct:

```ts
BitmapFont.install({
  name: "GameFont",
  style: { fontFamily: "Arial", fontSize: 48 },
});
const split = new SplitBitmapText({
  text: "Hello",
  style: { fontFamily: "GameFont", fontSize: 48 },
});
```

Pre-installation avoids first-render latency and gives you control over the atlas.


### [MEDIUM] Expecting CJK or emoji support

`SplitBitmapText` inherits BitmapText's limitations: the glyph atlas must contain every character, and very large character sets exceed GPU texture size. For per-character animation on CJK or emoji-heavy text, use `SplitText` (which accepts the performance cost) or pre-generate a targeted atlas covering only the characters you'll use.


### [MEDIUM] Missing glyphs silently dropped

If a character isn't in the font atlas, its segment is skipped and no error is thrown. Array indices may not line up one-to-one with source character positions if glyphs are missing. Always test your font against the full string content.


## API Reference

- [SplitBitmapText](https://pixijs.download/release/docs/text.SplitBitmapText.html.md)
- [AbstractSplitText](https://pixijs.download/release/docs/text.AbstractSplitText.html.md)
- [BitmapText](https://pixijs.download/release/docs/scene.BitmapText.html.md)
- [BitmapFont](https://pixijs.download/release/docs/text.BitmapFont.html.md)
