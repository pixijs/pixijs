---
title: Text (Canvas)
description: Learn how to use the Text class in PixiJS to render styled text as display objects, including dynamic updates and font loading.
category: scene
---

# Text (Canvas)

The `Text` class renders styled strings by rasterizing them through the browser's Canvas 2D text API, then uploading the result as a GPU texture. The text behaves like a sprite after that: you can move, rotate, scale, and mask it.

The tradeoff: every time you change the text string or style, PixiJS must re-rasterize and re-upload. This makes `Text` a poor choice for content that changes every frame (use [BitmapText](./bitmap.md) instead).

```ts
import { Text, TextStyle, Assets } from 'pixi.js';

// Load font before use
await Assets.load({
    src: 'my-font.woff2',
    data: {
        family: 'MyFont', // optional
    }
});


const myText = new Text({
    text: 'Hello PixiJS!',
    style: {
      fill: '#ffffff',
      fontSize: 36,
      fontFamily: 'MyFont',
    },
    anchor: 0.5
});

app.stage.addChild(myText);
```

## Text styling

The `TextStyle` class customizes text appearance. Available properties include:

- `fontFamily`
- `fontSize`
- `fontWeight`
- `fill` (color)
- `align`
- `stroke` (outline)

See the guide on [TextStyle](./style.md) for more details.

## Changing text dynamically

You can update the text string or its style at runtime:

```ts
text.text = 'Updated!';
text.style.fontSize = 40; // Triggers re-render
```

> [!WARNING]
> Changing text or style re-rasterizes the object. Avoid doing this every frame unless necessary.

## Text resolution

The `resolution` property determines the pixel density of rendered text. It defaults to the renderer's resolution.

You can set text resolution independently for sharper text on high-DPI displays.

```ts
const myText = new Text({
  text: 'Hello',
  resolution: 2, // Higher resolution for sharper text,
  style: {}
});

// change resolution
myText.resolution = 1; // Reset to default
```

## Font loading

PixiJS loads custom fonts via the `Assets` API. Supported formats:

- `woff`
- `woff2`
- `ttf`
- `otf`

Use `woff2` for the best performance and compression.

```js
await Assets.load({
  src: 'my-font.woff2',
  data: {},
});
```

Below is a list of properties you can pass in the `data` object when loading a font:

| Property            | Description                                             |
| ------------------- | ------------------------------------------------------- |
| **family**          | The font family name.                                   |
| **display**         | Controls font loading behavior (e.g., `'swap'`, `'block'`). Maps to [FontFace.display](https://developer.mozilla.org/en-US/docs/Web/API/FontFace/display). |
| **featureSettings** | OpenType feature settings (e.g., `'"liga" 1'`). Maps to [FontFace.featureSettings](https://developer.mozilla.org/en-US/docs/Web/API/FontFace/featureSettings). |
| **stretch**         | Font stretch (e.g., `'condensed'`). Maps to [FontFace.stretch](https://developer.mozilla.org/en-US/docs/Web/API/FontFace/stretch). |
| **style**           | Font style (e.g., `'italic'`). Maps to [FontFace.style](https://developer.mozilla.org/en-US/docs/Web/API/FontFace/style). |
| **unicodeRange**    | Limits which characters this font covers (e.g., `'U+0025-00FF'`). Maps to [FontFace.unicodeRange](https://developer.mozilla.org/en-US/docs/Web/API/FontFace/unicodeRange). |
| **variant**         | Font variant (e.g., `'small-caps'`). Maps to [FontFace.variant](https://developer.mozilla.org/en-US/docs/Web/API/FontFace/variant). |
| **weights**         | Font weight values. Maps to [FontFace.weight](https://developer.mozilla.org/en-US/docs/Web/API/FontFace/weight). |

---

## API reference

- {@link Text}
- {@link TextStyle}
- {@link FillStyle}
- {@link StrokeStyle}
