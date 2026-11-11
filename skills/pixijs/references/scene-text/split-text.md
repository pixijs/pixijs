# split-text

`SplitText` and `SplitBitmapText`: text split into `lines`, `words` and `chars` you can animate one by one, and what rebuilds them.

`SplitText` wraps canvas `Text`: every character is a full `Text` with its own canvas and GPU texture, so a 40-character string makes 40 text renders. `SplitBitmapText` has the same API but wraps `BitmapText`, so each character reuses the glyph atlas; use it for long strings, many instances, or text that changes often. Both are new in v8 and their API may still change.

## Options

```ts
import { SplitText } from "pixi.js";

const full = new SplitText({
  text: "Animate\nEvery Character",
  style: { fontSize: 48, fill: "white", stroke: { color: "black", width: 2 } },
  autoSplit: true,
  lineAnchor: 0.5,
  wordAnchor: { x: 0, y: 0.5 },
  charAnchor: { x: 0.5, y: 1 },
  x: 100,
  y: 200,
});

full.chars.forEach((char, i) => {
  char.onRender = () => {
    char.y = Math.sin(performance.now() / 200 + i) * 5;
  };
});
```

Both classes are a `Container` (not a `ViewContainer`), so unlike `Text` they take no top-level `anchor`, `resolution`, `roundPixels`, `textureStyle` or `autoGenerateMipmaps`; those belong to the per-character text objects.

| Option       | Type                                     | Default | Description |
| ------------ | ---------------------------------------- | ------- | ----------- |
| `text`       | `string`                                 | —       | Text content to render and segment. Required. |
| `style`      | `TextStyle \| Partial<TextStyleOptions>` | —       | The `TextStyle` a `Text` takes ([text](text.md)); for `SplitBitmapText`, the subset `BitmapText` respects ([bitmap-text](bitmap-text.md)), with `fill` defaulting to `0xffffff`. Required. |
| `autoSplit`  | `boolean`                                | `true`  | Re-split when `text` or `style` changes; set `false` to batch updates and call `split.split()` manually. |
| `lineAnchor` | `number \| PointData`                    | `0`     | Normalized (0–1) transform origin of each line container, so per-line rotation and scale pivot there. |
| `wordAnchor` | `number \| PointData`                    | `0`     | The same for each word container. |
| `charAnchor` | `number \| PointData`                    | `0`     | The same for each character. |

`SplitText.defaultOptions` / `SplitBitmapText.defaultOptions` override these defaults globally.

## Segments

`lines` and `words` are `Container[]`; `chars` is `Text[]` (`BitmapText[]` for `SplitBitmapText`). With `autoSplit: true` the constructor splits synchronously, so all three are populated right after `new SplitText(...)`; with `autoSplit: false` call `split.split()` first. The arrays are managed: pushing to them is ignored and overwritten at the next split, so change content through `text`.

Assigning `text` (even the same string) or `style` with `autoSplit` on destroys every old line, word and char object, so held references, per-char `onRender` hooks and tweens die with them: re-read `split.chars` and re-attach animations after each change.

`SplitText.from(existingText)` and `SplitBitmapText.from(existingBitmapText, options?)` copy content and style, then split. `SplitBitmapText.from` discards the source's `tagStyles` with a warning, since bitmap text has none.

## SplitBitmapText fonts

```ts
import { BitmapFont, SplitBitmapText } from "pixi.js";

BitmapFont.install({ name: "GameFont", style: { fontFamily: "Arial", fontSize: 48 } });

const split = new SplitBitmapText({
  text: "Fast Animate",
  style: { fontFamily: "GameFont", fontSize: 48 },
});
```

A system `fontFamily` works without installing (a dynamic bitmap font is generated on first use); installing first avoids the first-render cost. It inherits `BitmapText`'s limits: no shaping (use `SplitText` for Arabic or Indic scripts), and a pre-built `.fnt` font silently skips glyphs it lacks, so `chars` indices may not line up with the source string. Dynamic and installed fonts generate missing glyphs (CJK included) on first use.
