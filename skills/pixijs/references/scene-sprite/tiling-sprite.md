# TilingSprite

`TilingSprite` options (`tilePosition`, `tileScale`, `tileRotation`, `applyAnchorToTexture`), cache-only `from`, and how it tiles non-power-of-two and atlas textures.

```ts
import { Application, Assets, TilingSprite, type Texture } from "pixi.js";

declare const app: Application;

const texture = await Assets.load<Texture>("grass.png");
const bg = new TilingSprite({ texture, width: app.screen.width, height: app.screen.height });
app.stage.addChild(bg);

app.ticker.add((ticker) => {
  bg.tilePosition.x -= 1 * ticker.deltaTime;
});
```

Pass a loaded texture: the default is `Texture.EMPTY` (from `TilingSprite.defaultOptions`), so a TilingSprite without one draws nothing. `TilingSprite.from(source, options?)` takes a `Texture` or a cached alias; the alias form reads the Assets cache only, so `await Assets.load('pattern.png')` first or the sprite draws `Texture.EMPTY`.

| Option                 | Default          | Notes |
| ---------------------- | ---------------- | ----- |
| `width`, `height`      | `texture.width` / `texture.height` | The visible tiling region. Resize with these or `setSize(w, h)`. |
| `tilePosition`         | `{ x: 0, y: 0 }` | Offset of the pattern inside the region; animate it to scroll. |
| `tileScale`            | `{ x: 1, y: 1 }` | Scales the tiles only. Use it to make tiles larger; `scale` stretches the sprite region too. |
| `tileRotation`         | `0`              | Radians, applied to the texture before tiling; the region stays axis-aligned. |
| `anchor`               | `0`              | Origin of the region, not of the pattern. |
| `applyAnchorToTexture` | `false`          | By default the region's top-left always maps to texture `(0, 0)`; `true` shifts the texture origin by the anchor, so the pattern stays centered on the anchor as it scales. |
| `roundPixels`          | `false`          | Snaps the sprite's position, not the tile pattern. |

`TilingSprite.defaultOptions` is merged with every constructor's options. `containsPoint` tests the anchor-offset tiling region, so a TilingSprite works as a clickable background.

## Non-power-of-two and atlas textures

Resizing textures to power-of-two is unnecessary in v8. Non-power-of-two textures and spritesheet sub-frames tile correctly: `TilingSprite` sets the shared source's `addressMode` to `'repeat'` and, where hardware wrapping is unavailable (WebGL1 NPOT, sub-frames), wraps in its own shader. The only cost is that such a sprite no longer batches. Because the source's `addressMode` is changed, other sprites drawing the same source also sample with `repeat`.
