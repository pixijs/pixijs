---
title: Text
description: Learn how to use PixiJS's text rendering classes Text, BitmapText, and HTMLText.
category: scene
children:
  - ./canvas.md
  - ./bitmap.md
  - ./html.md
  - ./style.md
  - ./split-text.md
---

# Text

PixiJS provides three text rendering systems, each with different tradeoffs:

- **`Text`**: High-quality, styled raster text
- **`BitmapText`**: Ultra-fast, GPU-optimized bitmap fonts
- **`HTMLText`**: Richly formatted HTML inside the Pixi scene

Each approach has tradeoffs in fidelity, speed, and flexibility.

## `Text`: Rich dynamic text with styles

The `Text` class renders using the browser's native text engine, then converts the result into a texture.

```ts
import { Text } from 'pixi.js';

const text = new Text({
    text: 'Hello PixiJS!',
    style: {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: '#ffffff',
    }
});
```

**Use it when**:

- You need detailed font control (drop shadows, gradients, alignment)
- Text changes occasionally
- Fidelity is more important than speed

**Avoid when**:

- You're changing text every frame
- You need to render hundreds of instances

---

## `BitmapText`: High-performance glyph rendering

`BitmapText` draws characters from a pre-baked bitmap font image, bypassing font rasterization entirely.

```ts
import { BitmapFont, BitmapText } from 'pixi.js';

BitmapFont.install({
    name: 'Game Font',
    style: {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: '#ffffff'
    }
});

const text = new BitmapText({
    text: 'High Performance!',
    style: {
        fontFamily: 'Game Font',
        fontSize: 32
    }
});
```

**Use it when**:

- You need to render lots of dynamic text (HUDs, score counters, timers)
- You prioritize performance over styling
- You predefine the characters and styles

**Avoid when**:

- You need fine-grained style control
- You change fonts or font sizes frequently

To use `BitmapText`, you must first register a bitmap font via:

- `BitmapFont.install(...)` to create on the fly, or
- `Assets.load(...)` if using a 3rd-party BMFont or AngelCode export

---

## `HTMLText`: Styled HTML inside the scene

`HTMLText` renders HTML markup in your PixiJS scene using SVG `<foreignObject>`.

```ts
import { HTMLText } from 'pixi.js';

const text = new HTMLText({
    text: '<b>Bold</b> and <i>Italic</i>',
    style: {
        fontSize: 24,
        fill: '#ffffff'
    }
});
```

**Use it when**:

- You want complex HTML-style markup (`<b>`, `<i>`, `<span>`)
- You need emoji, RTL, or links
- Your users expect document-like layout

**Avoid when**:

- You need pixel-perfect performance
- You're rendering hundreds of text blocks
- You need GPU text effects

## Performance comparison

| Metric           | `Text`                          | `BitmapText`              | `HTMLText`                 |
| ---------------- | ------------------------------- | ------------------------- | -------------------------- |
| Memory usage     | Medium (one texture per string) | Low (shared texture atlas)| High (DOM elements + textures) |
| Rendering speed  | Medium                          | Fast                      | Slow                       |
| Update speed     | Slow for frequent updates       | Fast for any updates      | Medium                     |

## Quick decision guide

- **Updating text rarely** (menus, dialogs): Use `Text`
- **Updating text every frame** (scores, timers) or **many instances**: Use `BitmapText`
- **Need HTML tags, emoji, or CSS layout**: Use `HTMLText`
- **Unsure?** Start with `Text`. Switch to `BitmapText` if you hit performance issues.

## Detailed guides

- [Text (Canvas)](./canvas.md) - Font loading, resolution, dynamic updates
- [BitmapText](./bitmap.md) - Bitmap font loading, MSDF fonts, limitations
- [HTMLText](./html.md) - HTML markup, tag styles, CSS overrides
- [Text Style](./style.md) - Fill, stroke, shadows, and shared styles
- [SplitText](./split-text.md) - Per-character and per-word animations

---

## API reference

- {@link Text}
- {@link BitmapText}
- {@link HTMLText}
- {@link TextStyle}
- {@link BitmapFont}
- {@link FillStyle}
- {@link StrokeStyle}
