# Masking

Clip display objects with PixiJS masks. PixiJS supports four mask types: AlphaMask (sprite-based), StencilMask (Graphics/Container-based via the stencil buffer), ScissorMask (axis-aligned rectangle), and ColorMask (bit-mask on channels).

## Quick Start

```ts
const photoGroup = new Container();
photoGroup.addChild(new Sprite(await Assets.load("photo.png")));

const mask = new Graphics().circle(100, 100, 80).fill(0xffffff);
photoGroup.mask = mask;
photoGroup.addChild(mask);

app.stage.addChild(photoGroup);
```

A mask should live in the scene graph of the masked object's parent (typically as a child of the masked Container) so its transform tracks the masked subtree. Sprites, Text, and other leaves cannot hold the mask as a child (`allowChildren = false`); wrap them in a `Container` as shown above.

Set `container.mask` to a display object. PixiJS automatically selects the mask type based on what you assign.

## Core Patterns

### Mask type selection

PixiJS picks the mask type automatically based on the mask object:

| Mask object           | Type used   | Cost      | Notes                           |
| --------------------- | ----------- | --------- | ------------------------------- |
| Graphics or Container | StencilMask | Medium    | Uses stencil buffer             |
| Sprite                | AlphaMask   | Expensive | Uses filter pipeline internally |
| Number (e.g., `0xF`)  | ColorMask   | Cheapest  | Bitmask on RGBA channels        |

Performance hierarchy: ColorMask (cheapest) < StencilMask < AlphaMask (most expensive). Choose the simplest mask that achieves the visual result.

Note: `ScissorMask` exists in the codebase but is not auto-selected by the mask system. Only `AlphaMask`, `StencilMask`, and `ColorMask` are registered as mask effects.

### Stencil mask (Graphics-based)

```ts
const container = new Container();
const mask = new Graphics().roundRect(0, 0, 200, 150, 20).fill(0xffffff);

container.mask = mask;
container.addChild(mask);
```

The mask Graphics should be a child of the masked container (or share the same coordinate space). The fill color doesn't matter; only the shape is used.

### Alpha mask (Sprite-based)

```ts
const maskTexture = await Assets.load("gradient-mask.png");
const maskSprite = new Sprite(maskTexture);

const photoGroup = new Container();
photoGroup.addChild(new Sprite(await Assets.load("photo.png")));
photoGroup.mask = maskSprite;
photoGroup.addChild(maskSprite);
```

Alpha masks use the **red channel** of the sprite texture by default to control visibility. High red value = fully visible, zero red = hidden. This is the most expensive mask type because it uses the filter pipeline internally.

### Mask channel selection

By default, sprite (alpha) masks read the red channel. If your mask texture uses transparency instead (e.g., a PNG with an alpha gradient), switch to the alpha channel via `setMask`:

```ts
const maskSprite = new Sprite(await Assets.load("alpha-gradient.png"));

const photoGroup = new Container();
photoGroup.addChild(new Sprite(await Assets.load("photo.png")));
photoGroup.setMask({ mask: maskSprite, channel: "alpha" });
photoGroup.addChild(maskSprite);
```

Available channels: `'red'` (default), `'alpha'`. This is useful when a single mask texture encodes different shapes in different channels.

### Inverse masking

Use `setMask` with `inverse: true` to show everything outside the mask shape:

```ts
const holeMask = new Graphics().circle(100, 100, 80).fill(0xffffff);
const container = new Container();
container.setMask({ mask: holeMask, inverse: true });
container.addChild(holeMask);

const maskSprite = new Sprite(await Assets.load("mask.png"));
const photoGroup = new Container();
photoGroup.addChild(new Sprite(await Assets.load("photo.png")));
photoGroup.setMask({ mask: maskSprite, inverse: true });
photoGroup.addChild(maskSprite);
```

Both alpha and stencil masks support inverse on WebGL and WebGPU. Canvas2D does not support inverse stencil masks (it logs a warning and ignores the flag).

### Removing a mask

```ts
container.mask = null;

container.mask = null;
mask.destroy();
```

Always use `container.mask = null` to clear a mask. `setMask({ mask: null })` does not work due to an internal falsy check. Always remove the mask reference before destroying either the mask or the masked object.

## Common Mistakes

### [HIGH] Using cacheAsTexture with masks

The combination of `cacheAsTexture()` and masks is fragile. In Firefox, it can require a timeout between setting the mask and enabling caching. In other cases it fails silently. Avoid combining them when possible, or test thoroughly across browsers if needed.

### [MEDIUM] Using too many sprite masks

Sprite masks (AlphaMask) use the filter pipeline internally, making them the most expensive mask type. Using many of them simultaneously degrades performance significantly. Prefer stencil masks (Graphics shapes) or scissor masks (axis-aligned rectangles) when the visual result allows it.

Performance cost: Scissor (near zero) < Stencil (one extra draw) < Alpha (full filter pass)

## API Reference

- [AlphaMask](https://pixijs.download/release/docs/rendering.AlphaMask.html.md)
- [StencilMask](https://pixijs.download/release/docs/rendering.StencilMask.html.md)
- [ScissorMask](https://pixijs.download/release/docs/rendering.ScissorMask.html.md)
- [ColorMask](https://pixijs.download/release/docs/rendering.ColorMask.html.md)
- [MaskEffectManager](https://pixijs.download/release/docs/rendering.MaskEffectManager.html.md)
