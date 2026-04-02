---
title: Overview
description: Learn how to use scene objects in PixiJS, including containers, sprites, transforms, and more. This guide covers the basics of building your scene graph.
category: scene
children:
  - ./container/index.md
  - ./sprite.md
  - ./nine-slice-sprite.md
  - ./tiling-sprite.md
  - ./graphics/index.md
  - ./text/index.md
  - ./mesh/index.md
  - ./particle-container.md
---

# Scene objects

Everything visible in a PixiJS application is a scene object arranged in a **scene graph**: a tree of containers, sprites, text, graphics, and other display objects. Parent transforms (position, rotation, scale, alpha) cascade to children, so moving a container moves everything inside it.

This guide covers the objects available, how transforms work, and common operations like masking, filtering, and tinting.

## Available display objects

### Containers

{@link Container} is the **base class** for all scene objects in v8 (replacing the old `DisplayObject`).

- Can have children.
- Commonly used to group objects and apply transformations (position, scale, rotation) to the group.
- {@link ParticleContainer} is an optimized container for particle systems.

```ts
const group = new Container();
group.addChild(spriteA);
group.addChild(spriteB);
```

### Renderable objects

These are the visual objects you add to containers. In v8, **only containers should have children**; the objects below are "leaf nodes" that render content but shouldn't contain other objects.

- {@link Sprite} - Image display
- {@link AnimatedSprite} - Sprite animation
- {@link TilingSprite} - Repeating texture patterns
- {@link NineSliceSprite} - Scalable UI elements
- {@link Text} - Canvas-based text rendering
- {@link HTMLText} - HTML/CSS-based text
- {@link BitmapText} - High-performance bitmap fonts
- {@link Graphics} - Vector shape drawing
- {@link Mesh} - Custom vertex-based rendering
  - {@link MeshSimple} - Basic mesh with convenient constructor
  - {@link MeshPlane} - Deformable textured plane
  - {@link MeshRope} - Rope-like curved mesh

Adding children to a leaf node won't cause a runtime error, but you may encounter unexpected rendering behavior. If nesting is required, wrap leaf nodes in a `Container`.

**Before v8 (invalid in v8):**

```ts
const sprite = new Sprite();
sprite.addChild(anotherSprite); // Invalid in v8
```

**v8 approach:**

```ts
const group = new Container();
group.addChild(sprite);
group.addChild(anotherSprite); // Valid
```

## Transforms

All scene objects have properties that control position, rotation, scale, and alpha. These properties are inherited by child objects, letting you apply transformations to groups of objects.

| Property     | Description                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **position** | X- and Y-position are given in pixels and change the position of the object relative to its parent, also available directly as `object.x` / `object.y`  |
| **rotation** | Rotation is specified in radians, and turns an object clockwise (0.0 - 2 \* Math.PI)                                                                    |
| **angle**    | Angle is an alias for rotation that is specified in degrees instead of radians (0.0 - 360.0)                                                            |
| **pivot**    | Point the object rotates around, in pixels; also sets origin for child objects                                                                          |
| **alpha**    | Opacity from 0.0 (fully transparent) to 1.0 (fully opaque), inherited by children                                                                       |
| **scale**    | Scale is specified as a percent with 1.0 being 100% or actual-size, and can be set independently for the x and y axis                                   |
| **skew**     | Skew transforms the object in x and y similar to the CSS skew() function, and is specified in radians                                                   |
| **anchor?**  | Anchor is a percentage-based offset for the sprite's position and rotation. This differs from `pivot`, which is a pixel-based offset. |

### Anchor vs pivot

Some leaf nodes have an `anchor` property, a percentage-based offset for position and rotation. This differs from `pivot`, which is a pixel-based offset. Understanding the difference is critical when positioning or rotating a node.

> [!NOTE]
> Setting either pivot or anchor visually moves the node. This differs from CSS where changing `transform-origin` does not affect the element's position.

#### Anchor

- Anchor is available on sprite-based objects (`Sprite`, `TilingSprite`, `NineSliceSprite`, `AnimatedSprite`) and text objects (`Text`, `BitmapText`, `HTMLText`)
- Defined in normalized values `(0.0 to 1.0)`
- `(0, 0)` is the top-left, `(0.5, 0.5)` is the center
- Changes both position and rotation origin

```ts
sprite.anchor.set(0.5); // center
sprite.rotation = Math.PI / 4; // Rotate 45 degrees around the center
```

#### Pivot

- Available on all `Container`s
- Defined in **pixels**, not normalized

```ts
const sprite = new Sprite(texture);
sprite.width = 100;
sprite.height = 100;
sprite.pivot.set(50, 50); // Center of the sprite
sprite.rotation = Math.PI / 4; // Rotate 45 degrees around the pivot
```

## Measuring bounds

There are two types of bounds in PixiJS:

- **Local bounds** represent the object's dimensions in its own coordinate space. Use `getLocalBounds()`.
- **Global bounds** represent the object's bounding box in world coordinates. Use `getBounds()`.

```ts
const local = container.getLocalBounds();
const global = container.getBounds();
```

If performance is critical, you can provide a custom `boundsArea` to avoid per-child measurement.

### Changing size

To change the size of a container, use the `width` and `height` properties. This scales the container to fit the specified dimensions:

```ts
const container = new Container();
container.width = 100;
container.height = 200;
```

Setting `width` and `height` individually can be expensive because it requires recalculating the bounds of the container and its children. Use `setSize()` to set both at once:

```ts
const container = new Container();
container.setSize(100, 200);
const size = container.getSize(); // { width: 100, height: 200 }
```

## Masking scene objects

PixiJS supports **masking**, restricting the visible area of a scene object based on another object's shape. This is useful for cropping, revealing, or hiding parts of your scene.

### Types of masks

- **Graphics-based masks**: Use a `Graphics` object to define the shape.
- **Sprite-based masks**: Use a `Sprite` or other renderable object.

```ts
const shape = new Graphics().circle(100, 100, 50).fill(0x000000);

const maskedSprite = new Sprite(texture);
maskedSprite.mask = shape;

stage.addChild(shape);
stage.addChild(maskedSprite);
```

### Inverse masks

To create an inverse mask, use `setMask` with `inverse: true`. This renders everything outside the mask.

```ts
const inverseMask = new Graphics().rect(0, 0, 200, 200).fill(0x000000);
const maskedContainer = new Container();
maskedContainer.setMask({ mask: inverseMask, inverse: true });
maskedContainer.addChild(sprite);
stage.addChild(inverseMask);
stage.addChild(maskedContainer);
```

### Mask channel selection

Sprite masks read the **red channel** of the mask texture by default. This works well for grayscale mask textures where the red component controls visibility.

If your mask is defined by transparency (e.g., a PNG with an alpha gradient), set `channel: 'alpha'` to read the alpha channel instead:

```ts
const maskSprite = new Sprite(texture);
maskedContainer.setMask({ mask: maskSprite, channel: 'alpha' });
```

This is useful when a single mask texture encodes different shapes in different channels. For example, a texture with a red star and a translucent blue circle produces two distinct masks depending on the channel:

```ts
// Red channel: reveals only where R > 0 (the star shape)
sprite.setMask({ mask: maskSprite, channel: 'red' });

// Alpha channel: reveals only where A > 0 (the full circle)
sprite.setMask({ mask: maskSprite, channel: 'alpha' });
```

### Notes on masking

- The mask is not drawn visually, but must be part of the scene graph for coordinate calculations.
- Only one mask can be assigned per object.
- For advanced blending, use **alpha masks** or **filters** (covered in later guides).

## Filters

Filters apply per-pixel effects (blur, displacement, color shifts) to a container and everything inside it. The container's contents are rendered first, then the filter processes the resulting pixels.

```ts
const container = new Container();
const sprite = new Sprite(texture);
const filter = new BlurFilter({ strength: 8, quality: 4, kernelSize: 5 });
container.filters = [filter];
container.addChild(sprite);
```

> [!NOTE]
> Use filters sparingly. They can slow performance and increase memory usage.

Below are the filters available by default. There is also a community repository with [many more filters](https://github.com/pixijs/filters).

| Filter             | Description                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| AlphaFilter        | Similar to setting `alpha` property, but flattens the Container instead of applying to children individually. |
| BlurFilter         | Apply a blur effect                                                                                           |
| ColorMatrixFilter  | A color matrix is a flexible way to apply more complex tints or color transforms (e.g., sepia tone).          |
| DisplacementFilter | Displacement maps create visual offset pixels, for instance creating a wavy water effect.                     |
| NoiseFilter        | Create random noise (e.g., grain effect).                                                                     |

Each built-in filter is written in both GLSL (for WebGL) and WGSL (for WebGPU), so all filters work on both renderers.

## Tinting

You can tint any scene object by setting the `tint` property. It modifies the color of rendered pixels, multiplying a tint color over the object.

```ts
const sprite = new Sprite(texture);
sprite.tint = 0xff0000; // Red tint
sprite.tint = 'red'; // Red tint
```

The `tint` is inherited by child objects unless they specify their own. If only part of your scene should be tinted, place it in a separate container.

A value of `0xFFFFFF` disables tinting.

```ts
const sprite = new Sprite(texture);
sprite.tint = 0x00ff00; // Green tint
sprite.tint = 0xffffff; // No tint
```

PixiJS supports a variety of color formats. See the [Color documentation](../../color/__docs__/color.md) for details.

## Blend modes

Blend modes determine how colors of overlapping objects combine. PixiJS supports:

- `normal`: Default blend mode.
- `add`: Adds the colors of the source and destination pixels.
- `multiply`: Multiplies the colors of the source and destination pixels.
- `screen`: Inverts the colors, multiplies them, and inverts again.
- `erase`: Erases pixels from the render target.
- `none`: No blending, overwrites the destination.

There are also advanced blend modes like `subtract`, `difference`, and `overlay`. See the full list in the [Blend Modes documentation](../../filters/__docs__/filters.md#advanced-blend-modes).

```ts
const sprite = new Sprite(texture);
sprite.blendMode = 'multiply'; // Multiply blend mode
```

## Interaction

To handle clicks, hovers, and other pointer events on a scene object, set `eventMode` to `'static'` (for non-moving objects) or `'dynamic'` (for objects that move without user input).

```ts
const sprite = new Sprite(texture);
sprite.eventMode = 'static';
sprite.on('click', (event) => {
  console.log('Sprite clicked!', event);
});
```

See the detailed guide on [Interaction](../../events/__docs__/events.md) for setup, hit testing, pointer events, and more.

## Using `onRender`

The `onRender` callback runs logic every frame when a scene object is rendered. Useful for lightweight animation and update logic:

```ts
const container = new Container();
container.onRender = () => {
  container.rotation += 0.01;
};
```

This replaces the v7 pattern of overriding `updateTransform`, which no longer runs every frame.

To remove the callback:

```ts
container.onRender = null;
```

---

## API reference

- {@link Container}
- {@link ParticleContainer}
- {@link Sprite}
- {@link TilingSprite}
- {@link NineSliceSprite}
- {@link Graphics}
- {@link Mesh}
- {@link Text}
- {@link BitmapText}
- {@link HTMLText}
