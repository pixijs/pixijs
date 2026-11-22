# Sprite

`Sprite` construction, `Sprite.from`, anchor fallback, `visualBounds`, `roundPixels`, and canvas or video textures.

```ts
import { Sprite, type Texture } from "pixi.js";

declare const texture: Texture;
declare const canvas: HTMLCanvasElement;

const sprite = new Sprite({ texture, anchor: 0.5, x: 100, y: 200, tint: 0xffcc00, roundPixels: true });
const ephemeral = Sprite.from(canvas, true);
```

- `texture` defaults to `Texture.EMPTY`. `anchor` (normalized `[0, 1]`, default `0`) falls back to `texture.defaultAnchor` when unset. Anchor vs `pivot`: [scene-sprite](../scene-sprite.md#anchor-vs-pivot).
- `Sprite.from(source, skipCache?)` accepts a `Texture` or a `TextureSourceLike` (canvas, video, cache key; a string is a cache lookup only, see [scene-sprite](../scene-sprite.md#loading-before-creating)). `skipCache` keeps ephemeral textures out of the global cache.
- `roundPixels: true` snaps rendering coordinates to integers for crisp pixel art. Apply per sprite, or globally via `TextureStyle.defaultOptions.scaleMode = 'nearest'` + `roundPixels: true` on the renderer.
- `sprite.visualBounds` (`minX`, `maxX`, `minY`, `maxY`) is the rectangle the sprite actually draws in local space, accounting for anchor and texture trim. Both it and `getLocalBounds()` are anchor-aware; they differ only for trimmed textures (`getLocalBounds()` uses the untrimmed `orig` size).
- Changing the displayed region (sub-textures, `dynamic: true`, the readonly `frame`, `texture.update()`): [scene-sprite](../scene-sprite.md#sub-textures-and-frames).

## Canvas and video textures

Pixels drawn into a canvas after the texture was uploaded do not appear until `texture.source.update()`:

```ts
import { Sprite, Texture } from "pixi.js";

const canvas = document.createElement("canvas");
const sprite = new Sprite(Texture.from(canvas));

canvas.getContext("2d")!.fillRect(0, 0, 10, 10);
sprite.texture.source.update();
```

A video is loaded with `await Assets.load('clip.mp4')` and the returned texture passed to `new Sprite(texture)`; on mobile, start playback from a user gesture to satisfy autoplay policies ([video](../assets/video.md)).
