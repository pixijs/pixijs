---
title: HTML Text
description: Learn how to use HTMLText in PixiJS to render styled HTML strings within your WebGL canvas, enabling complex typography and inline formatting.
category: scene
---

# HTML Text

`HTMLText` renders HTML markup inside your PixiJS scene. It works by embedding HTML in an SVG `<foreignObject>`, rasterizing it, and uploading the result as a texture.

Use it when you need rich formatting (`<b>`, `<i>`, `<span>`), emoji, RTL text, or CSS layout that `Text` can't handle. The tradeoff is performance: rendering is async and slower than `Text` or `BitmapText`.

```ts
import { HTMLText } from 'pixi.js';

const html = new HTMLText({
  text: '<strong>Hello</strong> <em>PixiJS</em>!',
  style: {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: '#ff1010',
    align: 'center',
  },
});

app.stage.addChild(html);
```

## Why use `HTMLText`?

- ✅ Supports inline tags like `<b>`, `<i>`, `<span>`, etc.
- ✅ Compatible with emojis, Unicode, and RTL text
- ✅ Fine-grained layout control via CSS
- ✅ Tag-based style overrides (`<warning>`, `<link>`, etc.)

## Async rendering behavior

Because HTMLText rasterizes via SVG, the text won't appear on the frame it's created. It typically appears one frame later. Plan for this if you need to measure or position based on the text's bounds.

If you need the text to be ready before showing it, add it to the scene while hidden (`visible = false`), then show it after a frame or after checking that the texture has updated.

## Styling HTMLText

`HTMLTextStyle` extends `TextStyle` and adds:

- **HTML-aware tag-based styles** via `tagStyles`
- **CSS override support** via `cssOverrides`

```ts
const fancy = new HTMLText({
  text: '<red>Red</red>, <blue>Blue</blue>',
  style: {
    fontFamily: 'DM Sans',
    fontSize: 32,
    fill: '#ffffff',
    tagStyles: {
      red: { fill: 'red' },
      blue: { fill: 'blue' },
    },
  },
});
```

### CSS overrides

For CSS properties that don't have a TextStyle equivalent (e.g., `text-shadow`, `text-decoration`, `line-height`), use `addOverride` to inject raw CSS:

```ts
fancy.style.addOverride('text-shadow: 2px 2px 4px rgba(0,0,0,0.5)');
fancy.style.addOverride('text-decoration: underline');
```

---

## API reference

- {@link HTMLText}
- {@link HTMLTextStyle}
