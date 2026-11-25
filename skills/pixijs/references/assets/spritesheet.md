# Spritesheet

Texture atlases with `Spritesheet`: the JSON fields Pixi reads, `meta.scale`, hand-built sheets and the cache, and cleanup.

```ts
import { AnimatedSprite, Assets, Sprite, type Spritesheet } from "pixi.js";

const sheet = await Assets.load<Spritesheet>("spritesheet.json");
const hero = new Sprite(sheet.textures["hero.png"]);
const walk = new AnimatedSprite({ textures: sheet.animations["walk"], animationSpeed: 0.15, autoPlay: true });
```

`Assets.load` of the JSON fetches it, loads the atlas image named by `meta.image` (relative to the JSON), runs `parse()`, caches every frame name, and returns the `Spritesheet`.

## JSON fields

```json
{
  "frames": {
    "hero.png": {
      "frame": { "x": 0, "y": 0, "w": 64, "h": 64 },
      "anchor": { "x": 0.5, "y": 0.5 },
      "borders": { "left": 10, "top": 10, "right": 10, "bottom": 10 }
    },
    "walk_01.png": {
      "frame": { "x": 64, "y": 0, "w": 64, "h": 64 },
      "rotated": true,
      "trimmed": true,
      "sourceSize": { "w": 80, "h": 80 },
      "spriteSourceSize": { "x": 8, "y": 8, "w": 64, "h": 64 }
    }
  },
  "animations": { "walk": ["walk_01.png", "walk_02.png"] },
  "meta": { "image": "spritesheet.png", "size": { "w": 512, "h": 256 }, "scale": "1" }
}
```

Per frame, `anchor` becomes the texture's `defaultAnchor` and `borders` its nine-slice `defaultBorders`. `rotated` frames are stored 90 degrees rotated (the parser swaps width/height); `trimmed` frames have `sourceSize` as the original size and `spriteSourceSize` as the trimmed region within it. `animations` maps names to ordered frame lists. When `meta.related_multi_packs` is present, the loader loads and links the related sheets, reachable through `sheet.linkedSheets`.

## `meta.scale` sets the resolution

In v8, `meta.scale` directly sets the texture source resolution (`"2"` means the atlas is @2x). If an atlas exported at @2x says `"1"`, frames render at double the intended size. Keep `meta.scale` equal to the atlas image's real resolution; TexturePacker sets it automatically.

## Hand-built sheets

```ts
import { Assets, Sprite, Spritesheet, type SpritesheetData, type Texture } from "pixi.js";

declare const spritesheetJsonData: SpritesheetData;

const texture = await Assets.load<Texture>("atlas.png");
const sheet = new Spritesheet({ texture, data: spritesheetJsonData });
await sheet.parse();

const frame = new Sprite(sheet.textures["hero.png"]);
```

`parse()` is async (sheets over 1000 frames are batched across frames); `sheet.textures` entries are undefined until it resolves. `parseSync()` exists for smaller sheets.

A hand-built sheet's frames exist only in `sheet.textures` and `sheet.animations`. Only `Assets.load` of the JSON adds frame names to the cache, so after a manual `parse()`, `Texture.from("hero.png")`, `Sprite.from("hero.png")` and `AnimatedSprite.fromFrames([...])` find nothing ("not found in the Cache"). The `cachePrefix` option likewise only affects the cache keys of a loaded sheet: `Assets.load({ src: "a.json", data: { cachePrefix: "a/" } })` caches frames as `"a/hero.png"`, while `sheet.textures` keeps the unprefixed names. Use it when two loaded atlases share frame names.

To reuse an already loaded atlas image with Assets, pass it as `data.texture`: `Assets.add({ alias: "atlas", src: "images/spritesheet.json", data: { texture: atlasTexture } })`.

## Cleanup

```ts
import { Assets, type Spritesheet } from "pixi.js";

declare const sheet: Spritesheet;

await Assets.unload("spritesheet.json");

sheet.destroy();
await Assets.unload("atlas.png");
```

A loaded sheet: `Assets.unload` its JSON after every sprite using its frames is destroyed; that destroys the frames and atlas and clears the cache. `sheet.destroy(true)` on a loaded sheet leaves the dead `Spritesheet` cached, and a later `Assets.load` of the same JSON throws "Cannot convert undefined or null to object". A hand-built sheet: `sheet.destroy()` destroys its frame textures, then unload its atlas (or `sheet.destroy(true)` if you made the atlas yourself).
