# Text (Canvas Text)

The primary text renderer in PixiJS v8. Rasterizes strings to an off-screen canvas via the native Canvas API, then uploads the result as a GPU texture. Use `Text` for high-quality typography, styled labels, UI text, and anything where visual fidelity matters more than update speed. For frequently-changing numeric displays (scores, timers), prefer `BitmapText`.

## Quick Start

```ts
const text = new Text({
  text: "Hello PixiJS",
  style: {
    fontFamily: "Arial",
    fontSize: 36,
    fill: 0xffffff,
    stroke: { color: "#4a1850", width: 5 },
    dropShadow: {
      color: "#000000",
      blur: 4,
      distance: 6,
      angle: Math.PI / 6,
    },
  },
  anchor: 0.5,
  x: 400,
  y: 40,
});

app.stage.addChild(text);
```

Text is a leaf (`allowChildren = false`). It uses an options-object constructor; positional `(string, style)` arguments from v7 are no longer supported.

## Construction

```ts
const minimal = new Text({ text: "Hello" });

const styled = new Text({
  text: "Styled Text",
  style: { fontSize: 24, fill: 0xff1010 },
  anchor: 0.5,
  resolution: 2,
  roundPixels: true,
});

const crisp = new Text({
  text: "Crisp Text",
  style: { fontSize: 32 },
  textureStyle: { scaleMode: "nearest" },
  autoGenerateMipmaps: true,
});
```

### CanvasTextOptions

These are the options accepted by `new Text({ ... })`. The concrete `Text` constructor takes `CanvasTextOptions`, which extends the base `TextOptions` with the canvas-specific `textureStyle` and `autoGenerateMipmaps` fields.

| Option                | Type                                                        | Default                                            | Description                                                                                                                                                               |
| --------------------- | ----------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`                | `TextString` (`string \| number \| { toString(): string }`) | `''`                                               | Text content to display; `'\n'` inserts a line break.                                                                                                                     |
| `style`               | `TextStyle \| TextStyleOptions`                             | `new TextStyle()`                                  | Text style object or options. See the existing TextStyle docs below for field details.                                                                                    |
| `anchor`              | `PointData \| number`                                       | `0`                                                | Draw origin in `[0, 1]`; `0.5` is center, `1` is bottom-right.                                                                                                            |
| `resolution`          | `number`                                                    | `null` (auto)                                      | Pixel density of the rasterized texture; `null` follows the renderer's resolution (setting to `null` at runtime enables auto-resolution; the interface type is `number`). |
| `roundPixels`         | `boolean`                                                   | `false`                                            | Snap rendered x/y to whole pixels to avoid sub-pixel anti-aliasing.                                                                                                       |
| `textureStyle`        | `TextureStyle \| TextureStyleOptions`                       | `undefined`                                        | Override the generated texture's scale mode, wrap, etc. (@advanced)                                                                                                       |
| `autoGenerateMipmaps` | `boolean`                                                   | `TextureSource.defaultOptions.autoGenerateMipmaps` | Generate mipmaps for the text texture; improves quality when scaled down.                                                                                                 |

All `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

The `style` field is a rich nested type; the rest of this document covers its key properties.

## Core Patterns

### TextStyle properties

```ts
const styled = new Text({
  text: "Styled",
  style: {
    fontFamily: "Arial",
    fontSize: 32,
    fontWeight: "bold",
    fontStyle: "italic",
    fill: 0xff1010,
    stroke: { color: "#4a1850", width: 5 },
    dropShadow: {
      color: "#000000",
      blur: 4,
      distance: 6,
      angle: Math.PI / 6,
      alpha: 0.8,
    },
    align: "center",
    wordWrap: true,
    wordWrapWidth: 300,
    lineHeight: 45,
    letterSpacing: 2,
    padding: 4,
  },
});
```

Key TextStyle properties:

- `fontFamily`, `fontSize`, `fontWeight`, `fontStyle`
- `fill`: color, gradient, or pattern (same `FillInput` as `Graphics`)
- `stroke`: `{ color, width }` object
- `dropShadow`: `{ color, blur, distance, angle, alpha }`
- `wordWrap`, `wordWrapWidth`
- `breakWords`: allow breaking mid-word when wrapping. Requires `wordWrap: true`
- `whiteSpace`: `'normal' | 'pre' | 'pre-line'` whitespace handling for multi-line strings
- `align`: `'left'`, `'center'`, `'right'`, `'justify'`; only affects multi-line text
- `textBaseline`: `'alphabetic' | 'top' | 'hanging' | 'middle' | 'ideographic' | 'bottom'`
- `lineHeight`, `letterSpacing`
- `leading`: additional line spacing in pixels on top of `lineHeight`
- `trim`: boolean; crop transparent padding after rasterization (expensive, use only when needed)
- `padding`: extra space around the rendered texture; increase when a stroke or shadow gets clipped
- `filters`: array of Pixi filters applied to the generated text texture at bake time, cheaper than filters on the `Text` node for static strings
- `tagStyles`: per-tag inline style overrides

### Tagged text

```ts
const alert = new Text({
  text: "<red>Warning:</red> system <b>overloaded</b>",
  style: {
    fontSize: 24,
    fill: 0xffffff,
    tagStyles: {
      red: { fill: 0xff0000 },
      b: { fontWeight: "bold" },
    },
  },
});
```

Tags are parsed only when `tagStyles` has entries; without entries, `<` is treated literally. Nested tags inherit from outer tags via an internal style stack.

### Font loading

```ts
await Assets.load({
  src: "my-font.woff2",
  data: { family: "MyFont" },
});

const text = new Text({
  text: "Custom Font",
  style: { fontFamily: "MyFont", fontSize: 36, fill: 0xffffff },
});
```

Supported formats: `woff2` (preferred), `woff`, `ttf`, `otf`. The `data` object is forwarded to `FontFace`; valid fields are `family`, `display`, `style`, `weights` (string array, e.g., `['normal', 'bold']`), `stretch`, `unicodeRange`, `featureSettings`, `variant`.

```ts
await Assets.load({
  src: "titan-one.woff",
  data: { family: "Titan One", weights: ["normal", "bold"] },
});
```

### Resolution and mipmaps

```ts
const sharp = new Text({
  text: "Crisp on retina",
  style: { fontSize: 36, fill: 0xffffff },
  resolution: 2,
  autoGenerateMipmaps: true,
});
```

- `resolution` (default: renderer's resolution): pixel density of the underlying texture. Higher values produce sharper text on high-DPI displays.
- `autoGenerateMipmaps`: improves quality when the text is drawn smaller than its native size.

### Dynamic content

```ts
app.ticker.add(() => {
  const next = `Score: ${score}`;
  if (scoreText.text !== next) {
    scoreText.text = next;
  }
});
```

Guard text updates with an equality check when using `Text` for live values. Every assignment triggers a canvas re-render and GPU upload.

### Gradient and pattern fills

```ts
import { FillGradient } from "pixi.js";

const gradient = new FillGradient({
  end: { x: 0, y: 1 },
  colorStops: [
    { color: 0xff0000, offset: 0 },
    { color: 0x0000ff, offset: 1 },
  ],
});

const title = new Text({
  text: "Gradient",
  style: { fontSize: 64, fill: gradient },
});
```

`fill` accepts any `FillInput` that `Graphics` accepts; gradients, patterns, solid colors, and arrays of stops.

## Common Mistakes

### [HIGH] Updating Text content every frame

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

Every `Text` update re-rasterizes the full string and uploads a new texture. At 60fps this burns frame budget. Use `BitmapText` for values that change per-frame, or at minimum guard with an equality check against the previous string.


### [HIGH] Using positional constructor args

Wrong:

```ts
const text = new Text("Hello", { fontSize: 24 });
```

Correct:

```ts
const text = new Text({ text: "Hello", style: { fontSize: 24 } });
```

v8 `Text` uses an options object. The v7 `(string, style)` signature is not supported.


### [MEDIUM] Stroke or shadow getting clipped at edges

Wrong:

```ts
const text = new Text({
  text: "Hello",
  style: { stroke: { color: "red", width: 10 } },
});
```

Correct:

```ts
const text = new Text({
  text: "Hello",
  style: { stroke: { color: "red", width: 10 }, padding: 10 },
});
```

The underlying canvas is sized from the text metrics; heavy strokes or drop-shadows render past those bounds and get clipped. Add `padding` to the style to enlarge the texture.


## API Reference

- [Text](https://pixijs.download/release/docs/scene.Text.html.md)
- [TextStyle](https://pixijs.download/release/docs/text.TextStyle.html.md)
- [TextOptions](https://pixijs.download/release/docs/text.TextOptions.html.md)
- [AbstractText](https://pixijs.download/release/docs/scene.AbstractText.html.md)
