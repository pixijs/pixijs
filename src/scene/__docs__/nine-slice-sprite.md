---
title: NineSlice Sprite
description: Learn how to use the NineSliceSprite class in PixiJS for creating scalable UI elements with preserved corners and edges.
category: scene
---

# NineSlice Sprite

`NineSliceSprite` splits a texture into a 3x3 grid, then stretches only the center and edge regions when you resize it. Corners stay their original size. This is the standard technique for building resizable UI elements (buttons, panels, dialog boxes) from a single texture.

```ts
import { NineSliceSprite, Texture } from 'pixi.js';

const nineSlice = new NineSliceSprite({
  texture: Texture.from('button.png'),
  leftWidth: 15,
  topHeight: 15,
  rightWidth: 15,
  bottomHeight: 15,
  width: 200,
  height: 80,
});

app.stage.addChild(nineSlice);
```

You can also pass just a texture. If the texture has `defaultBorders` set (e.g., from a spritesheet's JSON data), those values are used automatically:

```ts
const nineSlice = new NineSliceSprite({ texture: Texture.from('button.png') });
```

## How nine-slice works

Here’s how a nine-slice texture is divided:

```js
    A                          B
  +---+----------------------+---+
C | 1 |          2           | 3 |
  +---+----------------------+---+
  |   |                      |   |
  | 4 |          5           | 6 |
  |   |                      |   |
  +---+----------------------+---+
D | 7 |          8           | 9 |
  +---+----------------------+---+

Areas:
  - 1, 3, 7, 9: Corners (remain unscaled)
  - 2, 8: Top/Bottom center (stretched horizontally)
  - 4, 6: Left/Right center (stretched vertically)
  - 5: Center (stretched in both directions)
```

This ensures that decorative corners are preserved and the center content can scale as needed.

## Width and height vs scale

`width` and `height` resize the nine-slice correctly: corners stay fixed, edges and center stretch. `scale` uniformly scales the entire thing, including corners. For UI elements, always use `width`/`height` to resize.

```ts
// The texture will stretch to fit the new dimensions
nineSlice.width = 300;
nineSlice.height = 100;

// The nine-slice will increase in size uniformly
nineSlice.scale.set(2); // Doubles the size
```

### Original width and height

If you need to know the original size of the nine-slice, you can access it through the `originalWidth` and `originalHeight` properties. These values are set when the `NineSliceSprite` is created and represent the dimensions of the texture before any scaling or resizing is applied.

```ts
console.log(nineSlice.originalWidth);
console.log(nineSlice.originalHeight);
```

## Dynamic updates

You can change slice dimensions or size at runtime:

```ts
nineSlice.leftWidth = 20;
nineSlice.topHeight = 25;
```

Each setter triggers a geometry update to reflect the changes.

---

## API reference

- {@link NineSliceSprite}
