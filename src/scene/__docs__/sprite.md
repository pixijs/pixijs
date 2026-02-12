---
title: Sprite
description: Learn how to create and manipulate Sprites in PixiJS, including texture updates, scaling, and transformations.
category: scene
---

# Sprite

A `Sprite` displays a single image (texture) on screen. It's the most common way to show images in PixiJS: load a texture, create a sprite, add it to the stage.

```ts
import { Assets, Sprite } from 'pixi.js';

const texture = await Assets.load('path/to/image.png');
const sprite = new Sprite(texture);

sprite.anchor.set(0.5);
sprite.position.set(100, 100);
sprite.scale.set(2);
sprite.rotation = Math.PI / 4; // Rotate 45 degrees
```

Use `Sprite` when you need to display a single image or spritesheet frame. For repeating textures, see [TilingSprite](./tiling-sprite.md). For scalable UI panels, see [NineSliceSprite](./nine-slice-sprite.md).

## Updating the Texture

If you change the texture of a sprite, it will automatically:

- Rebind listeners for texture updates
- Recalculate width/height if set so that the visual size remains the same
- Trigger a visual update

```ts
const texture = Assets.get('path/to/image.png');
sprite.texture = texture;
```

## Scale vs width/height

There are two ways to resize a sprite:

- **`scale`**: Multiplier relative to the texture's original size. `scale.set(2)` doubles it.
- **`width` / `height`**: Set an absolute pixel size. These are convenience setters that compute the corresponding scale for you.

```ts
sprite.scale.set(2); // Double the size

sprite.width = 100; // Sets scale.x = 100 / texture.orig.width
```

Setting `width` recalculates `scale.x`, and vice versa. They're two views of the same value.

---

## API reference

- {@link Sprite}
- {@link Texture}
- {@link Assets}
