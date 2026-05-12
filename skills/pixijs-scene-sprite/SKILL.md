---
name: pixijs-scene-sprite
description: "Use this skill when drawing images in PixiJS v8. Covers Sprite with anchor/tint/texture, AnimatedSprite for frame animation, NineSliceSprite for resizable UI panels, TilingSprite for scrolling/repeating backgrounds. Triggers on: Sprite, AnimatedSprite, NineSliceSprite, TilingSprite, Sprite.from, anchor, tint, tilePosition, animationSpeed, gotoAndPlay, leftWidth, topHeight, constructor options, SpriteOptions, AnimatedSpriteOptions, NineSliceSpriteOptions, TilingSpriteOptions."
license: MIT
---

PixiJS has three sprite classes for different drawing tasks. `Sprite` is the default image-drawing leaf; `NineSliceSprite` is a resizable UI-panel variant that preserves corner art; `TilingSprite` repeats a texture across an area. The `AnimatedSprite` subclass of `Sprite` cycles through texture frames for frame-based animation.

Assumes familiarity with `pixijs-scene-core-concepts`. All sprite classes are leaf nodes; they cannot have children. Wrap multiple sprites in a `Container` to group them.

## Quick Start

```ts
const texture = await Assets.load("bunny.png");

const sprite = new Sprite({
  texture,
  anchor: 0.5,
  tint: 0xff8888,
});
sprite.x = app.screen.width / 2;
sprite.y = app.screen.height / 2;

app.stage.addChild(sprite);
```

Position is set after construction because `app.screen.width / 2` depends on the live renderer size. Literal positions can go directly in the options object via `x`/`y` (inherited from `Container`).

**Related skills:** `pixijs-scene-core-concepts` (leaves, transforms), `pixijs-assets` (texture loading), `pixijs-scene-particle-container` (thousands of sprites), `pixijs-performance` (spritesheets, batching).

## Variants

| Variant           | Use when                                                  | Trade-offs                                      | Reference                                                        |
| ----------------- | --------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| `Sprite`          | Draw a single texture at a position                       | Fixed size = texture size                       | [references/sprite.md](references/sprite.md)                     |
| `AnimatedSprite`  | Frame-based animation from a texture array or spritesheet | Pre-rendered frames only; no tweening           | [references/animated-sprite.md](references/animated-sprite.md)   |
| `NineSliceSprite` | Resizable UI panels, buttons, dialog frames               | Border width is fixed; center stretches         | [references/nineslice-sprite.md](references/nineslice-sprite.md) |
| `TilingSprite`    | Scrolling backgrounds, parallax, repeating patterns       | Single texture repeated; `tilePosition` scrolls | [references/tiling-sprite.md](references/tiling-sprite.md)       |

`AnimatedSprite` is a subclass of `Sprite`; all `Sprite` properties (anchor, tint, position) apply.

Each variant's constructor options are documented in its sub-reference file (`references/{variant}.md`). All variants also accept the `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

## When to use what

- **"I want to draw a single image at a position"** → `Sprite`. The default choice for 90% of 2D game and app content.
- **"I want to animate a character through a series of frames"** → `AnimatedSprite`. Load a spritesheet via Assets and pass `sheet.animations['walk']`. See `references/animated-sprite.md`.
- **"I want a UI button/panel that resizes without stretching the borders"** → `NineSliceSprite`. Set border widths, then set `width`/`height`. See `references/nineslice-sprite.md`.
- **"I want a scrolling repeating background"** → `TilingSprite`. Animate `tilePosition` to scroll. See `references/tiling-sprite.md`.
- **"I want thousands of identical sprites"** → Use `ParticleContainer` with `Particle` instances (see `pixijs-scene-particle-container`), not plain sprites.
- **"I want to draw shapes or paths"** → Use `Graphics` (see `pixijs-scene-graphics`), not a sprite.

## Quick concepts

### Anchor vs pivot

`Sprite.anchor` is normalized `[0, 1]` and shifts only the texture draw origin; no position offset. `Container.pivot` is pixel-space and shifts both the transform origin and the visual position. For centering a sprite, always use `anchor.set(0.5)`.

### Loading before creating

`Sprite.from(id)` only reads the Assets cache; it does not fetch. Always `await Assets.load(...)` first, or pass the returned `Texture` directly to `new Sprite(texture)`.

### Dynamic textures

Once a texture is loaded, modifying its `frame` or swapping its source does not automatically notify sprites. Set `texture.dynamic = true` once, or call `sprite['onViewUpdate']()` manually after changes.

## Common Mistakes

### [HIGH] Using `Texture.from(url)` to load

Wrong:

```ts
const texture = Texture.from("https://example.com/image.png");
```

Correct:

```ts
const texture = await Assets.load("https://example.com/image.png");
```

`Texture.from()` only reads the cache in v8. Use `Assets.load()` first; its return value is the texture.


### [HIGH] Confusing anchor and pivot

Wrong:

```ts
sprite.pivot.set(sprite.width / 2, sprite.height / 2);
```

Correct:

```ts
sprite.anchor.set(0.5);
```

`anchor` shifts only the draw origin. `pivot` shifts the transform origin AND the visual position, causing the sprite to move unexpectedly.


### [HIGH] Old `NineSlicePlane` name

`NineSlicePlane` was renamed to `NineSliceSprite` in v8 and switched to an options-object constructor: `new NineSliceSprite({ texture, leftWidth, topHeight, rightWidth, bottomHeight })`.


### [MEDIUM] Adding children to a sprite

`Sprite`, `NineSliceSprite`, and `TilingSprite` all set `allowChildren = false`. Wrap in a `Container` to group sprites with other content.


## API Reference

- [Sprite](https://pixijs.download/release/docs/scene.Sprite.html.md)
- [SpriteOptions](https://pixijs.download/release/docs/scene.SpriteOptions.html.md)
- [AnimatedSprite](https://pixijs.download/release/docs/scene.AnimatedSprite.html.md)
- [NineSliceSprite](https://pixijs.download/release/docs/scene.NineSliceSprite.html.md)
- [TilingSprite](https://pixijs.download/release/docs/scene.TilingSprite.html.md)
- [Texture](https://pixijs.download/release/docs/rendering.Texture.html.md)
