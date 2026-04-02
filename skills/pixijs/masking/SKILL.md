---
name: masking
description: >
  Clip display objects with PixiJS masks. Four mask types: AlphaMask
  (sprite-based, supports channel selection), StencilMask (stencil buffer via
  Graphics/Container), ScissorMask (axis-aligned rectangle, fastest), ColorMask
  (bit-mask on channels). Inverse masking via setMask. Mask performance
  hierarchy. Remove mask before destroying masked objects. Use when the user
  asks about clipping, masking sprites, circular masks, rounded rectangle
  masks, alpha masks, stencil masks, inverse masks, mask channels, hiding
  parts of a sprite, or mask performance. Covers AlphaMask, StencilMask,
  ScissorMask, ColorMask, MaskEffectManager, setMask.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  requires: "pixijs, core-concepts"
  sources: "pixijs/pixijs:src/rendering/mask/MaskEffectManager.ts, pixijs/pixijs:src/rendering/mask/alpha/AlphaMask.ts, pixijs/pixijs:src/rendering/mask/stencil/StencilMask.ts, pixijs/pixijs:src/rendering/mask/scissor/ScissorMask.ts, pixijs/pixijs:src/rendering/mask/color/ColorMask.ts, pixijs/pixijs:src/scene/container/container-mixins/effectsMixin.ts"
---

## When to Use This Skill

Apply when clipping or hiding portions of display objects using shape-based, sprite-based, or inverse masks.

**Related skills:** For shape creation use **graphics**; for alpha mask filter internals use **filters**; for mask performance costs use **performance**.

This skill builds on pixijs and core-concepts. Read them first.

## Setup

```ts
import { Graphics, Sprite, Assets } from 'pixi.js';

const texture = await Assets.load('photo.png');
const photo = new Sprite(texture);

// Stencil mask with Graphics shape
const mask = new Graphics().circle(100, 100, 80).fill(0xffffff);
photo.mask = mask;
photo.addChild(mask);
```

Set `container.mask` to a display object. PixiJS automatically selects the mask type based on what you assign.

## Core Patterns

### Mask type selection

PixiJS picks the mask type automatically based on the mask object:

| Mask object | Type used | Cost | Notes |
|---|---|---|---|
| Graphics or Container | StencilMask | Medium | Uses stencil buffer |
| Sprite | AlphaMask | Expensive | Uses filter pipeline internally |
| Number (e.g., `0xF`) | ColorMask | Cheapest | Bitmask on RGBA channels |

Performance hierarchy: ColorMask (cheapest) < StencilMask < AlphaMask (most expensive). Choose the simplest mask that achieves the visual result.

Note: `ScissorMask` exists in the codebase but is not auto-selected by the mask system. Only `AlphaMask`, `StencilMask`, and `ColorMask` are registered as mask effects.

### Stencil mask (Graphics-based)

```ts
import { Graphics, Container } from 'pixi.js';

const container = new Container();
const mask = new Graphics().roundRect(0, 0, 200, 150, 20).fill(0xffffff);

container.mask = mask;
container.addChild(mask);
```

The mask Graphics should be a child of the masked container (or share the same coordinate space). The fill color doesn't matter; only the shape is used.

### Alpha mask (Sprite-based)

```ts
import { Sprite, Assets } from 'pixi.js';

const maskTexture = await Assets.load('gradient-mask.png');
const maskSprite = new Sprite(maskTexture);

const photo = new Sprite(await Assets.load('photo.png'));
photo.mask = maskSprite;
photo.addChild(maskSprite);
```

Alpha masks use the **red channel** of the sprite texture by default to control visibility. High red value = fully visible, zero red = hidden. This is the most expensive mask type because it uses the filter pipeline internally.

### Mask channel selection

By default, sprite (alpha) masks read the red channel. If your mask texture uses transparency instead (e.g., a PNG with an alpha gradient), switch to the alpha channel via `setMask`:

```ts
import { Sprite, Assets } from 'pixi.js';

const maskSprite = new Sprite(await Assets.load('alpha-gradient.png'));

const photo = new Sprite(await Assets.load('photo.png'));
photo.setMask({ mask: maskSprite, channel: 'alpha' });
photo.addChild(maskSprite);
```

Available channels: `'red'` (default), `'alpha'`. This is useful when a single mask texture encodes different shapes in different channels.

### Inverse masking

Use `setMask` with `inverse: true` to show everything outside the mask shape:

```ts
import { Graphics, Container, Sprite, Assets } from 'pixi.js';

// Inverse stencil mask (Graphics-based)
const holeMask = new Graphics().circle(100, 100, 80).fill(0xffffff);
const container = new Container();
container.setMask({ mask: holeMask, inverse: true });
container.addChild(holeMask);

// Inverse alpha mask (Sprite-based)
const maskSprite = new Sprite(await Assets.load('mask.png'));
const photo = new Sprite(await Assets.load('photo.png'));
photo.setMask({ mask: maskSprite, inverse: true });
photo.addChild(maskSprite);
```

Both alpha and stencil masks support inverse on WebGL and WebGPU. Canvas2D does not support inverse stencil masks (it logs a warning and ignores the flag).

### Removing a mask

```ts
// Remove mask (only container.mask = null works; setMask cannot clear)
container.mask = null;

// Remove and release the mask object
container.mask = null;
mask.destroy();
```

Always use `container.mask = null` to clear a mask. `setMask({ mask: null })` does not work due to an internal falsy check. Always remove the mask reference before destroying either the mask or the masked object.

## Common Mistakes

### [HIGH] Using cacheAsTexture with masks

The combination of `cacheAsTexture()` and masks is fragile. In Firefox, it can require a timeout between setting the mask and enabling caching. In other cases it fails silently. Avoid combining them when possible, or test thoroughly across browsers if needed.

Source: GitHub issues #11378, #11120

### [MEDIUM] Using too many sprite masks

Sprite masks (AlphaMask) use the filter pipeline internally, making them the most expensive mask type. Using many of them simultaneously degrades performance significantly. Prefer stencil masks (Graphics shapes) or scissor masks (axis-aligned rectangles) when the visual result allows it.

Performance cost: Scissor (near zero) < Stencil (one extra draw) < Alpha (full filter pass)

Source: src/__docs__/concepts/performance-tips.md

---

See also: filters (alpha masks use filter pipeline), graphics (shape-based masks), core-concepts (container hierarchy), performance (mask optimization)

## Learn More

- [AlphaMask](https://pixijs.download/release/docs/rendering.AlphaMask.html.md)
- [StencilMask](https://pixijs.download/release/docs/rendering.StencilMask.html.md)
- [ScissorMask](https://pixijs.download/release/docs/rendering.ScissorMask.html.md)
- [ColorMask](https://pixijs.download/release/docs/rendering.ColorMask.html.md)
- [MaskEffectManager](https://pixijs.download/release/docs/rendering.MaskEffectManager.html.md)
