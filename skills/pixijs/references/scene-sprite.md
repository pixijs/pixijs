# scene-sprite

`Sprite` and `Texture`: loading before creating, sub-textures and frames, shared-texture destroy, and which sprite variant to use.

| Variant           | Use for                                                        | Sub-page                                                 |
| ----------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| `Sprite`          | One texture at a position                                      | [sprite.md](scene-sprite/sprite.md)                      |
| `AnimatedSprite`  | Frame animation from a `Texture[]` or spritesheet; a `Sprite` subclass | [animated-sprite.md](scene-sprite/animated-sprite.md)    |
| `NineSliceSprite` | Resizable panels and buttons with fixed corners (v7's `NineSlicePlane`, now an options object: `new NineSliceSprite({ texture, leftWidth, topHeight, rightWidth, bottomHeight })`) | [nineslice-sprite.md](scene-sprite/nineslice-sprite.md)  |
| `TilingSprite`    | Repeating or scrolling backgrounds (`tilePosition`)            | [tiling-sprite.md](scene-sprite/tiling-sprite.md)        |

Thousands of identical sprites belong in a `ParticleContainer` ([scene-particle-container](scene-particle-container.md)).

## Anchor vs pivot

`Sprite.anchor` is normalized `[0, 1]` and shifts only the texture draw origin; the position does not move. `Container.pivot` is pixel-space and shifts both the transform origin and the visual position. Center a sprite with `anchor.set(0.5)`. To rotate or scale around another local point without moving the sprite, set `origin` (pixel-space, inherited from `Container`), not `pivot`.

## Loading before creating

`Sprite.from(id)` and `Texture.from(url)` only read the Assets cache; neither fetches (v7's `Texture.from(url)` loaded the image). An unloaded key logs a "not found in the Cache" warning and the sprite draws nothing. `await Assets.load(url)` first; it returns the texture, so pass that to `new Sprite(texture)`.

The `Sprite`, `TilingSprite` and `NineSliceSprite` constructors accept only a `Texture` or an options object. A `TextureSource` (`CanvasSource`, `VideoSource`, `ImageSource`, or a source you built) type-checks as an options object and silently gives an empty sprite (`Texture.EMPTY`) sized like the source. Wrap it: `Sprite.from(source)`, `new Sprite(Texture.from(source))`, or `new Sprite({ texture: new Texture({ source }) })`.

## Sub-textures and frames

A sub-region of an image is a new `Texture` that shares the image's `TextureSource`:

```ts
import { Rectangle, Sprite, Texture } from "pixi.js";

declare const sheet: Texture;

const region = new Texture({
  source: sheet.source,
  frame: new Rectangle(0, 0, 50, 50),
  dynamic: true,
});
const sprite = new Sprite(region);

region.frame.x = 50;
region.update();

sprite.texture = new Texture({ source: sheet.source, frame: new Rectangle(50, 0, 50, 50) });
```

- `frame` is in the source's pixel units (`source.width/height`) and `texture.frame` is readonly: mutate its `x/y/width/height`; assigning a new `Rectangle` fails tsc (TS2540).
- A sprite listens for its texture's `update` event only if `texture.dynamic` was already `true` when the texture was assigned to it. Setting `dynamic = true` later, then `update()`, changes nothing on screen; there is no event, and `onViewUpdate` is protected. Pass `dynamic: true` to the constructor before handing the texture to sprites, or assign a fresh `Texture` to `sprite.texture` (always works, and keeps other users of the old texture unchanged).
- Pass `frame` at construction. A texture created without one (`new Texture({ source })`, most loaded or generated textures) resets `frame.width/height` to the full source on every `update()`.
- `texture.source.update()` re-uploads changed pixels (canvas redraws); `texture.update()` only recomputes the frame/UVs.

## Destroying a sprite with a shared texture

`sprite.destroy(true)` (or a parent's `destroy(true)`) also destroys the texture and its `TextureSource`, so every other sprite on the same spritesheet or `Assets`-loaded image makes the next render throw. Call `sprite.destroy()`, then `Assets.unload(key)` once nothing draws from it; full option rules in [scene-container](scene-container.md#destroy).
