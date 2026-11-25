# Text

Canvas `Text`: constructor options, `TextStyle` defaults and less obvious fields, `tagStyles`, sharing a style, and gradient or pattern fills.

```ts
import { Text } from "pixi.js";

const label = new Text({
  text: "Hello PixiJS",
  style: {
    fontSize: 36,
    fill: 0xffffff,
    stroke: { color: "#4a1850", width: 5 },
    dropShadow: { color: "#000000", blur: 4, distance: 6 },
    padding: 6,
  },
  anchor: 0.5,
});

const pixel = new Text({
  text: "PIXEL",
  style: { fontFamily: "monospace", fontSize: 16, fill: 0xffffff },
  textureStyle: { scaleMode: "nearest" },
});
```

## Constructor options

`new Text({...})` takes `CanvasTextOptions`: the base `TextOptions` plus `textureStyle` and `autoGenerateMipmaps`.

| Option                | Default | Notes |
| --------------------- | ------- | ----- |
| `text`                | `''`    | `string \| number \| { toString(): string }`; `'\n'` breaks a line. |
| `style`               | `new TextStyle()` | A `TextStyle` or its options. |
| `anchor`              | `0`     | `[0, 1]`; `0.5` centers. |
| `resolution`          | `null` (auto) | Pixel density of the rasterized texture; `null` follows the renderer's resolution (setting `null` at runtime re-enables auto, though the interface type is `number`). |
| `roundPixels`         | `false` | Snap rendered x/y to whole pixels. |
| `textureStyle`        | `undefined` | Scale mode for the generated texture (`nearest` or `linear`); every other `TextureStyle` field is ignored. |
| `autoGenerateMipmaps` | `TextureSource.defaultOptions.autoGenerateMipmaps` | Better quality when drawn smaller than native size. |

## TextStyle

Defaults when a property is omitted: `fill: 'black'`, `fontSize: 26`, `fontFamily: 'Arial'`, `whiteSpace: 'pre'`, `wordWrap: false` (`wordWrapWidth: 100`), `padding: 0`, no stroke or shadow. A partial `dropShadow` object is merged with `{ alpha: 1, angle: Math.PI / 6, blur: 0, color: 'black', distance: 5 }`. `stroke` is an object, `{ color, width }`.

Fields whose behaviour is easy to get wrong:

- `padding`: the canvas is sized from the text metrics, so a heavy stroke or drop shadow is clipped at the edges; raise `padding` to enlarge the texture.
- `breakWords` breaks mid-word only with `wordWrap: true`. `align` (`'left' | 'center' | 'right' | 'justify'`) affects only multi-line text.
- `whiteSpace`: `'normal' | 'pre' | 'pre-line'`. `textBaseline`: `'alphabetic' | 'top' | 'hanging' | 'middle' | 'ideographic' | 'bottom'`. `leading` adds pixels on top of `lineHeight`.
- `trim` crops transparent padding after rasterization (expensive).
- `filters` in the style are applied to the generated texture at bake time, cheaper than filters on the `Text` node for static strings.
- `tagStyles` maps tag names to style overrides: `text: "<red>Warning:</red> <b>overloaded</b>"` with `tagStyles: { red: { fill: 0xff0000 }, b: { fontWeight: "bold" } }`. Tags are parsed only when `tagStyles` has entries; otherwise `<` is literal. Nested tags inherit from outer ones.

Load web fonts with `await Assets.load({ src: "my-font.woff2", data: { family: "MyFont" } })` before creating the `Text`, then set `fontFamily: "MyFont"`; the `data` fields and the derived-name rule are in [fonts](../assets/fonts.md).

## Sharing a TextStyle

```ts
import { BitmapText, Text, TextStyle } from "pixi.js";

const style = new TextStyle({ fontSize: 24, fill: 0xffffff });
const title = new Text({ text: "Title", style });
const label = new BitmapText({ text: "Label", style });

style.fill = 0xff0000;
title.destroy();
```

One `TextStyle` instance can back any number of `Text`, `BitmapText` and `HTMLText` objects; changing it re-renders all of them. `destroy()` detaches the text from the style without destroying it; `destroy({ style: true })` and `destroy(true)` destroy the shared instance ([scene-container](../scene-container.md#destroy)).

## Gradient and pattern fills

`fill` accepts any `FillInput` that `Graphics` accepts: a color, a `FillGradient`, a `FillPattern`, a `Texture`, or a `FillStyle` object (`{ color, alpha, texture, fill }`). A number array is one RGB(A) color (0-1 components), never gradient stops; v7's `fill: ['#ff0', '#f00']` gradient becomes `new FillGradient(...)`:

```ts
import { Assets, FillGradient, FillPattern, Text } from "pixi.js";

const gradient = new FillGradient({
  end: { x: 0, y: 1 },
  colorStops: [
    { color: 0xff0000, offset: 0 },
    { color: 0x0000ff, offset: 1 },
  ],
});
const title = new Text({ text: "Gradient", style: { fontSize: 64, fill: gradient } });

const pattern = new FillPattern({ texture: await Assets.load("bricks.png"), repetition: "repeat" });
const label = new Text({ text: "PixiJS", style: { fontSize: 64, fill: pattern, stroke: { fill: pattern, width: 10 } } });
```

Canvas-rendered text ignores the pattern's `textureSpace`; the texture tiles in the text's pixel space at its native size. Use `pattern.setTransform(matrix)` to scale, rotate or offset the tiles ([scene-graphics](../scene-graphics.md#gradients-and-patterns)).
