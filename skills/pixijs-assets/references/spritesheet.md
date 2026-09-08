# Spritesheet: Texture Atlases and Animations

Load and use texture atlases and animation sheets with PixiJS's `Spritesheet` class. Atlases reduce draw calls by packing many textures into a single image.

## Quick Start

```ts
const sheet = await Assets.load("spritesheet.json");

const hero = new Sprite(sheet.textures["hero.png"]);
app.stage.addChild(hero);

const walk = new AnimatedSprite(sheet.animations["walk"]);
walk.animationSpeed = 0.15;
walk.play();
app.stage.addChild(walk);
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
const texture = await Assets.load("atlas.png");
const sheet = new Spritesheet({
  texture,
  data: spritesheetJsonData,
  cachePrefix: "myAtlas_",
});
await sheet.parse();

const frame = new Sprite(sheet.textures["hero.png"]);
```

`parse()` is async for large spritesheets (over 1000 frames); it batches texture creation across multiple frames. For smaller sheets, `parseSync()` is also available.

`cachePrefix` prepends a string to all cached texture names, preventing collisions when multiple atlases share frame names (e.g., `"hero.png"` in two different sheets).

### Preloaded texture with Assets

```ts
const atlasTexture = await Assets.load("images/spritesheet.png");

Assets.add({
  alias: "atlas",
  src: "images/spritesheet.json",
  data: { texture: atlasTexture },
});
const sheet = await Assets.load("atlas");
```

### Multi-pack spritesheets

When `meta.related_multi_packs` is present, the loader automatically loads and links related spritesheets. All linked sheets are accessible via `sheet.linkedSheets`.

### Cleanup

```ts
sheet.destroy();
sheet.destroy(true); // also destroys the base atlas texture
```

## Common Mistakes

### [HIGH] Spritesheet meta.scale behavior change

In v8, `meta.scale` directly sets the texture source resolution. If your atlas was exported at @2x but `meta.scale` says `"1"`, frames render at double the intended size. Ensure `meta.scale` matches the actual resolution of the atlas image. Tools like TexturePacker set this automatically.

### [MEDIUM] Not awaiting spritesheet parse

`parse()` is async. Accessing `sheet.textures` before it resolves returns undefined entries. When loading via `Assets.load()`, parsing is handled automatically.

## API Reference

- [Spritesheet](https://pixijs.download/release/docs/assets.Spritesheet.html.md)
- [spritesheetAsset](https://pixijs.download/release/docs/assets.spritesheetAsset.html.md)
- [AnimatedSprite](https://pixijs.download/release/docs/scene.AnimatedSprite.html.md)
