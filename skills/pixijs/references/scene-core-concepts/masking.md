# masking

Clipping with `container.mask` / `setMask`: which mask type each object selects, sprite-mask channels, inverse masks, and removing a mask.

```ts
const photoGroup = new Container();
photoGroup.addChild(new Sprite(await Assets.load("photo.png")));

const mask = new Graphics().circle(100, 100, 80).fill(0xffffff); // fill color is ignored; only the shape counts
photoGroup.mask = mask;
photoGroup.addChild(mask);
```

Put the mask in the masked object's coordinate space, normally as a child of the masked `Container`, so its transform tracks the subtree. A `Sprite`, `Text` or other leaf cannot hold the mask as a child (`allowChildren = false`); wrap it in a `Container` as above.

## Mask type selection

The type is picked from what you assign:

| Mask object           | Type used   | Cost                                   |
| --------------------- | ----------- | -------------------------------------- |
| Number (e.g., `0xF`)  | ColorMask   | Cheapest: bitmask on RGBA channels     |
| Graphics or Container | StencilMask | Medium: extra draws into the stencil buffer (rectangle masks too) |
| Sprite                | AlphaMask   | Most expensive: a filter pass          |

Many simultaneous sprite masks degrade performance significantly; use a `Graphics` shape when the visual result allows. `ScissorMask` is exported but not registered as a mask effect in 8.22; it cannot be selected.

## Sprite masks: channel

A sprite (alpha) mask reads the texture's **red channel** by default: high red is visible, zero red hidden. For a mask whose shape is in its transparency (a PNG with an alpha gradient), select the alpha channel:

```ts
const maskSprite = new Sprite(await Assets.load("alpha-gradient.png"));
photoGroup.setMask({ mask: maskSprite, channel: "alpha" }); // 'red' (default) | 'alpha'
photoGroup.addChild(maskSprite);
```

## Inverse masks

`setMask({ mask, inverse: true })` shows everything outside the mask shape:

```ts
const holeMask = new Graphics().circle(100, 100, 80).fill(0xffffff);
const container = new Container();
container.setMask({ mask: holeMask, inverse: true });
container.addChild(holeMask);
```

Both alpha (sprite) and stencil masks support inverse on WebGL and WebGPU. The Canvas renderer supports only `Graphics` masks, without inverse; `Sprite` and other `Container` masks are skipped with a warning.

## Removing a mask

```ts
container.mask = null;
mask.destroy();

// Sprite masks: clear the mask before destroying its texture
photoGroup.mask = null;
maskSprite.destroy({ texture: true, textureSource: true });
```

Clear with `container.mask = null`; `setMask({ mask: null })` does not work due to an internal falsy check. Remove the mask reference before destroying the mask, the masked object, or (for sprite masks) the mask's texture. A sprite mask whose texture is destroyed while still assigned renders as empty and, in debug builds, logs `[MaskFilter] The mask texture was destroyed while the mask is still in use. Remove the mask before destroying its texture.`
