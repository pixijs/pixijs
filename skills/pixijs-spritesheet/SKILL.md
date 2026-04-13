---
name: pixijs-spritesheet
description: >
  Load and use PixiJS spritesheets for texture atlases and animations.
  Spritesheet class, SpritesheetData format (frames, animations, meta),
  sheet.parse() for async frame extraction, sheet.textures dict,
  sheet.animations dict, resolution from meta.scale, loading via Assets.
  Use when the user asks about texture atlases, sprite sheets, sprite
  animations, AnimatedSprite, frame extraction, atlas packing, multi-pack
  spritesheets, JSON atlas format, TexturePacker, cachePrefix, or
  meta.scale resolution. Covers Spritesheet, SpritesheetData, AnimatedSprite.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  sources: "pixijs/pixijs:src/spritesheet/Spritesheet.ts"
---

## When to Use This Skill

Apply when working with texture atlases, sprite sheet JSON files, frame-based animations, or multi-pack atlas configurations.

**Related skills:** For loading atlas files use **asset-loading**; for displaying individual frames use **sprite**; for atlas JSON structure see **core-concepts**.

## Setup

```ts
import { Assets, Sprite, AnimatedSprite } from 'pixi.js';

// Preferred: load via Assets (parses automatically)
const sheet = await Assets.load('spritesheet.json');

// Access individual textures
const hero = new Sprite(sheet.textures['hero.png']);

// Access animation sequences
const walk = new AnimatedSprite(sheet.animations['walk']);
walk.animationSpeed = 0.15;
walk.play();
```

When loaded through `Assets.load()`, the JSON file is fetched, the atlas image is loaded, and `sheet.parse()` is called automatically. The returned object is a `Spritesheet` instance.

## Core Patterns

### SpritesheetData JSON format

```json
{
    "frames": {
        "hero.png": {
            "frame": { "x": 0, "y": 0, "w": 64, "h": 64 },
            "sourceSize": { "w": 64, "h": 64 },
            "spriteSourceSize": { "x": 0, "y": 0, "w": 64, "h": 64 },
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
    "animations": {
        "walk": ["walk_01.png", "walk_02.png", "walk_03.png"]
    },
    "meta": {
        "image": "spritesheet.png",
        "size": { "w": 512, "h": 256 },
        "scale": "1"
    }
}
```

Key fields:
- `frames` maps frame names to rectangle data, trim info, anchors, and 9-slice borders.
- `rotated` indicates the frame is stored rotated 90 degrees in the atlas. The parser swaps width/height automatically.
- `trimmed` indicates transparent padding was removed. `sourceSize` is the original dimensions; `spriteSourceSize` is the trimmed region within it.
- `animations` maps animation names to ordered arrays of frame names.
- `meta.scale` sets the resolution of the texture source. `"2"` means the atlas is @2x.
- `meta.image` is the atlas image filename, resolved relative to the JSON file.

### Manual Spritesheet creation

```ts
import { Assets, Spritesheet, Sprite } from 'pixi.js';

const texture = await Assets.load('atlas.png');
const sheet = new Spritesheet({
    texture,
    data: spritesheetJsonData,
    cachePrefix: 'myAtlas_', // optional: disambiguates texture names across multiple atlases
});
await sheet.parse();

const frame = new Sprite(sheet.textures['hero.png']);
```

`parse()` is async for large spritesheets (over 1000 frames); it batches texture creation across multiple frames. For smaller sheets, `parseSync()` is also available.

`cachePrefix` prepends a string to all cached texture names, preventing collisions when multiple atlases share frame names (e.g., `"hero.png"` in two different sheets).

### Preloaded texture with Assets

```ts
import { Assets } from 'pixi.js';

// Load the atlas image yourself
const atlasTexture = await Assets.load('images/spritesheet.png');

// Pass it to the JSON loader
Assets.add({
    alias: 'atlas',
    src: 'images/spritesheet.json',
    data: { texture: atlasTexture },
});
const sheet = await Assets.load('atlas');
```

### Multi-pack spritesheets

When `meta.related_multi_packs` is present, the loader automatically loads and links related spritesheets. All linked sheets are accessible via `sheet.linkedSheets`.

### Cleanup

```ts
// Destroy frame textures only
sheet.destroy();

// Destroy frame textures AND the base atlas texture
sheet.destroy(true);
```

## Common Mistakes

### [HIGH] Spritesheet meta.scale behavior change

In v8, `meta.scale` directly sets the texture source resolution. If your atlas was exported at @2x but `meta.scale` says `"1"`, frames render at double the intended size. Ensure `meta.scale` matches the actual resolution of the atlas image. Tools like TexturePacker set this automatically.

Source: GitHub issue #10311

### [MEDIUM] Not awaiting spritesheet parse

Wrong:
```ts
import { Spritesheet, Sprite } from 'pixi.js';

const sheet = new Spritesheet({ texture, data });
sheet.parse();
const frame = new Sprite(sheet.textures['hero.png']); // undefined
```

Correct:
```ts
import { Spritesheet, Sprite } from 'pixi.js';

const sheet = new Spritesheet({ texture, data });
await sheet.parse();
const frame = new Sprite(sheet.textures['hero.png']);
```

`parse()` is async. Accessing `sheet.textures` before it resolves returns undefined entries. When loading via `Assets.load()`, parsing is handled automatically.

Source: src/spritesheet/Spritesheet.ts

### [HIGH] Importing from @pixi/spritesheet

Wrong:
```ts
import { Spritesheet } from '@pixi/spritesheet';
```

Correct:
```ts
import { Spritesheet } from 'pixi.js';
```

All `@pixi/*` sub-packages were removed in v8. Import everything from `pixi.js`.

Source: src/__docs__/migrations/v8.md

---

See also: asset-loading (Assets API), sprite (display), core-concepts (texture structure), migration-v8 (upgrading from v7)

## Learn More

- [Spritesheet](https://pixijs.download/release/docs/assets.Spritesheet.html.md)
- [SpritesheetData](https://pixijs.download/release/docs/assets.SpritesheetData.html.md)
- [SpritesheetFrameData](https://pixijs.download/release/docs/assets.SpritesheetFrameData.html.md)
