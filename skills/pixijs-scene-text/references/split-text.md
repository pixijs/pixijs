# SplitText

A container that splits a canvas `Text` render into independently-animatable `lines`, `words`, and `chars`; each exposed as its own `Text` instance. Use `SplitText` for per-character intro animations, staggered reveals, or any effect where you need to transform each glyph, word, or line separately.

## Quick Start

```ts
const split = new SplitText({
  text: "Animate Me",
  style: { fontSize: 48, fill: 0xffffff },
  charAnchor: { x: 0.5, y: 1 },
});

app.stage.addChild(split);

split.chars.forEach((char, i) => {
  char.alpha = 0;
  char.y = -40;
  const delay = i * 80;
  setTimeout(() => {
    app.ticker.add(() => {
      char.alpha = Math.min(char.alpha + 0.05, 1);
      char.y += (0 - char.y) * 0.1;
    });
  }, delay);
});
```

`SplitText` is new in v8; API shape may still evolve. It wraps `Text` internally, so the same TextStyle options apply. Every character is a full `Text` instance; use sparingly and prefer `SplitBitmapText` for long strings or many animated instances.

## Construction

```ts
const minimal = new SplitText({
  text: "Hello World",
  style: { fontSize: 32, fill: 0xffffff },
});

const full = new SplitText({
  text: "Animate\nEvery Character",
  style: { fontSize: 48, fill: "white", stroke: { color: "black", width: 2 } },
  autoSplit: true,
  lineAnchor: 0.5,
  wordAnchor: { x: 0, y: 0.5 },
  charAnchor: { x: 0.5, y: 1 },
  x: 100,
  y: 200,
  alpha: 0.8,
});
```

### SplitTextOptions

`SplitText` is a `Container` (not a `ViewContainer`), so unlike `Text` it does NOT take `anchor`, `resolution`, `roundPixels`, `textureStyle`, or `autoGenerateMipmaps` at the top level. Those belong on the internal per-character `Text` instances. The splitting behavior is controlled by the fields below.

| Option       | Type                                     | Default | Description                                                                                                            |
| ------------ | ---------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| `text`       | `string`                                 | —       | Text content to render and segment. Required.                                                                          |
| `style`      | `TextStyle \| Partial<TextStyleOptions>` | —       | TextStyle instance or style options; the same TextStyle used by `Text`. See `references/text.md`. Required.            |
| `autoSplit`  | `boolean`                                | `true`  | Automatically re-split when `text` or `style` changes; set `false` to batch updates and call `split.split()` manually. |
| `lineAnchor` | `number \| PointData`                    | `0`     | Normalized transform origin (0–1) for each line container; controls the pivot of per-line rotations/scales.            |
| `wordAnchor` | `number \| PointData`                    | `0`     | Same as `lineAnchor` but for each word container.                                                                      |
| `charAnchor` | `number \| PointData`                    | `0`     | Same as `lineAnchor` but for each character container.                                                                 |

All `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

> `SplitText.defaultOptions` overrides the defaults globally for every new `SplitText` instance. The built-in defaults are the values above.

## Core Patterns

### Segment access

```ts
split.lines.forEach((line) => {
  line.alpha = 0.8;
});
split.words.forEach((word) => {
  word.rotation = 0.1;
});
split.chars.forEach((char) => {
  char.scale.set(1.2);
});
```

`lines` and `words` are `Container[]`; `chars` is `Text[]` directly (or `BitmapText[]` for `SplitBitmapText`). All three arrays are refreshed whenever the text or style changes (when `autoSplit` is `true`).

### Transform origins

```ts
const split = new SplitText({
  text: "Wave",
  style: { fontSize: 64, fill: 0xffffff },
  lineAnchor: 0.5,
  wordAnchor: { x: 0, y: 0.5 },
  charAnchor: { x: 0.5, y: 1 },
});
```

- `lineAnchor`: transform origin for each line container (0–1 normalized).
- `wordAnchor`: transform origin for each word container.
- `charAnchor`: transform origin for each character container.

Setting these once at construction time ensures rotations and scales pivot around the intended point (center, bottom, etc.).

### Animating per character

```ts
split.chars.forEach((char, i) => {
  char.onRender = () => {
    const t = performance.now() / 200 + i;
    char.y = Math.sin(t) * 5;
  };
});
```

Using each character's `onRender` hook avoids one global ticker callback. Each char updates itself every render pass.

### Auto-split on change

```ts
split.text = "New text";
```

With `autoSplit = true` (default), reassigning `text` or `style` re-splits and rebuilds the segment arrays. Set `autoSplit = false` to batch multiple changes before calling `split.split()` manually (see `pixijs-scene-text` source).

### Constructing from an existing Text

```ts
const plain = new Text({ text: "Convert me", style: { fontSize: 32 } });
const converted = SplitText.from(plain);
```

`SplitText.from(existingText)` copies content and style, then splits. Useful when you already have a `Text` instance and want to apply per-character animation retroactively.

## Common Mistakes

### [HIGH] Many SplitText instances with long strings

Each character is a full `Text` instance with its own canvas rasterization and GPU texture. A 40-character `SplitText` creates 40 text renders at construction time. For long strings, use `SplitBitmapText`; it wraps `BitmapText` instead, so each character reuses the glyph atlas.


### [MEDIUM] Modifying `chars` array directly

Wrong:

```ts
split.chars.push(extraChar);
```

Correct:

```ts
split.text = split.text + "extra";
```

`chars`, `words`, and `lines` are managed arrays. Pushing to them is ignored and will be overwritten on the next auto-split. Always update via the `text` property and let the class rebuild segments.


### [MEDIUM] Expecting segments before the first render

When `autoSplit` is true, splitting happens lazily on first property read or render. If you need segments immediately after construction, access `chars` (or call `split.split()` manually) once before iterating.


## API Reference

- [SplitText](https://pixijs.download/release/docs/text.SplitText.html.md)
- [AbstractSplitText](https://pixijs.download/release/docs/text.AbstractSplitText.html.md)
- [SplitTextOptions](https://pixijs.download/release/docs/text.SplitTextOptions.html.md)
