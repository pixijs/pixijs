---
title: Bitmap Text
description: Learn how to use BitmapText in PixiJS for high-performance text rendering with pre-generated texture atlases.
category: scene
---

# Bitmap Text

`BitmapText` is a high-performance text rendering solution. Unlike `Text`, which rasterizes each string into a new texture, `BitmapText` draws characters from a pre-generated texture atlas. This allows rendering tens of thousands of text objects with minimal overhead.

```ts
import { Assets, BitmapText } from 'pixi.js';

await Assets.load('fonts/MyFont.fnt');

const text = new BitmapText({
  text: 'Loaded font!',
  style: {
    fontFamily: 'MyFont',
    fontSize: 32,
    fill: '#ffcc00',
  },
});
```

## Why use `BitmapText`?

- **Fast rendering**: Characters are drawn from a shared texture atlas, so updating text doesn't trigger rasterization.
- **Cheap updates**: Changing the string just rearranges pre-rendered glyphs. No canvas re-draw.
- **Shared memory**: All `BitmapText` instances using the same font share one atlas texture.
- **MSDF/SDF support**: Signed distance field fonts stay crisp at any size without generating larger textures.

**Ideal use cases**:

- Frequently updating text
- Large numbers of text instances
- High-performance or mobile projects

## How to load and use bitmap fonts

### Font loading

PixiJS supports AngelCode BMFont format (`.fnt`, `.xml`) and MSDF/SDF font files via the `Assets` API. You can generate these from `.ttf`/`.otf` files using [AssetPack](https://pixijs.io/assetpack/).

After loading, reference the font by its family name:

```ts
import { Assets, BitmapText } from 'pixi.js';

await Assets.load('fonts/MyFont.fnt');

const text = new BitmapText({
  text: 'Loaded font!',
  style: {
    fontFamily: 'MyFont',
    fontSize: 32,
    fill: '#ffcc00',
  },
});
```

### MSDF and SDF fonts

PixiJS supports **MSDF** (multi-channel signed distance field) and **SDF** formats for crisp, resolution-independent text. These fonts remain sharp at any size and scale.

Generate MSDF/SDF fonts using tools like [AssetPack](https://pixijs.io/assetpack/), which takes a `.ttf` or `.otf` font and generates a bitmap font atlas with MSDF/SDF support.

Usage is the same as regular bitmap fonts; load the appropriate font file:

```ts
import { Assets, BitmapText } from 'pixi.js';

await Assets.load('fonts/MyMSDFFont.fnt');

const text = new BitmapText({
  text: 'Loaded MSDF font!',
  style: {
    fontFamily: 'MyMSDFFont',
  },
});
```

## Limitations and caveats

### Cannot update resolution

`BitmapText.resolution` is not mutable. Resolution is determined by the `BitmapFont` at creation time.

```ts
text.resolution = 2;
// ⚠️ [BitmapText] dynamically updating the resolution is not supported.
```

### Missing glyphs

If text contains characters that aren't in the bitmap font's atlas, those characters are skipped during layout and rendering. Text may appear incomplete but will not crash. To fix this, either add the missing characters to your bitmap font (e.g. via [AssetPack](https://pixijs.io/assetpack/)) or use `Text` / `HTMLText` for content with unpredictable character sets.

### Large character sets not practical

Each character needs space in the atlas texture. For CJK, Arabic, or emoji-heavy content, the atlas can exceed GPU texture size limits or consume too much memory. For these cases, use `Text` (renders any character the browser supports) or `HTMLText` (supports emoji and RTL natively).

---

## API reference

- {@link BitmapText}
- {@link BitmapFont}
- {@link Assets}
- {@link TextStyle}
- {@link FillStyle}
- {@link StrokeStyle}
