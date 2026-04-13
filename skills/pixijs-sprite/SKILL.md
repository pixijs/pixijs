---
name: pixijs-sprite
description: >
  Display images with PixiJS Sprite, Sprite.from(), anchor (0-1 texture-relative)
  vs pivot, roundPixels. AnimatedSprite for frame-based animation with textures
  array or FrameObject arrays, play/stop/gotoAndPlay/gotoAndStop, animationSpeed,
  autoUpdate, loop, onComplete/onFrameChange/onLoop callbacks. NineSliceSprite
  for scalable UI panels with leftWidth/topHeight/rightWidth/bottomHeight.
  TilingSprite for repeating patterns with tilePosition/tileScale/tileRotation.
  Use when the user asks about displaying images, rendering textures, sprite
  anchoring, centering sprites, pixel-perfect rendering, frame animation, sprite
  sheets, scrolling backgrounds, tiling textures, nine-slice UI, scalable panels,
  or repeating patterns. Covers Sprite, AnimatedSprite, NineSliceSprite,
  TilingSprite, Sprite.from, anchor vs pivot, roundPixels, tilePosition,
  tileScale, animationSpeed, FrameObject.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  sources: "pixijs/pixijs:src/scene/sprite/Sprite.ts, pixijs/pixijs:src/scene/sprite-animated/AnimatedSprite.ts, pixijs/pixijs:src/scene/sprite-nine-slice/NineSliceSprite.ts, pixijs/pixijs:src/scene/sprite-tiling/TilingSprite.ts"
---

## When to Use This Skill

Apply when the user needs to display images, textures, or frame-based animations on screen, including tiling backgrounds and nine-slice UI elements.

**Related skills:** For vector drawing use **graphics**; for text rendering use **text**; for loading textures use **asset-loading**; for animation frames from atlases use **spritesheet**; for high-volume identical sprites use **particle-container**.

## Setup

```ts
import { Sprite, AnimatedSprite, NineSliceSprite, TilingSprite, Texture, Assets } from 'pixi.js';

const texture = await Assets.load('character.png');
const sprite = new Sprite(texture);
app.stage.addChild(sprite);
```

Sprite is a leaf node; `allowChildren` is false. To group sprites, use a Container parent.

## Core Patterns

### Basic Sprite

```ts
import { Sprite, Texture } from 'pixi.js';

// From a Texture
const sprite = new Sprite(texture);

// From a cached texture (must already be loaded via Assets.load)
const sprite2 = Sprite.from('assets/bunny.png');

// With options object
const sprite3 = new Sprite({
    texture: Texture.from('hero.png'),
    anchor: 0.5,
    roundPixels: true,
    x: 100,
    y: 200,
});
```

`anchor` is a 0-1 normalized value relative to the texture dimensions. `{ x: 0.5, y: 0.5 }` centers the texture on the sprite's position. It can be set as a single number (applies to both axes) or a `PointData`. If omitted, falls back to `texture.defaultAnchor`.

`roundPixels` snaps rendering to integer coordinates for crisp pixel art.

### AnimatedSprite

```ts
import { AnimatedSprite, Assets } from 'pixi.js';

// From a spritesheet with named animations
const sheet = await Assets.load('character.json');
const anim = new AnimatedSprite(sheet.animations['walk']);
anim.animationSpeed = 0.15;
anim.play();
app.stage.addChild(anim);

// From explicit textures with options
const explosion = new AnimatedSprite({
    textures: [
        Texture.from('boom1.png'),
        Texture.from('boom2.png'),
        Texture.from('boom3.png'),
    ],
    loop: false,
    autoPlay: true,
    onComplete: () => explosion.destroy(),
});

// With per-frame timing via FrameObject
const customTiming = new AnimatedSprite({
    textures: [
        { texture: Texture.from('f1.png'), time: 100 },
        { texture: Texture.from('f2.png'), time: 200 },
    ],
});
```

Key properties:
- `animationSpeed` (default 1): multiplier for playback speed. Negative reverses.
- `loop` (default true): restart after last frame.
- `autoUpdate` (default true): uses `Ticker.shared`. Set false for manual `update(ticker)` calls.
- `autoPlay` (default false): starts immediately on creation.
- `currentFrame`: get/set the current frame index.
- `totalFrames`: readonly frame count.
- `playing`: readonly boolean.

Control methods: `play()`, `stop()`, `gotoAndStop(frame)`, `gotoAndPlay(frame)`.

Callbacks: `onComplete`, `onFrameChange(currentFrame)`, `onLoop`.

`updateAnchor` (default false): when true, updates anchor to each frame's `texture.defaultAnchor` on frame change. Useful for spritesheets with per-frame anchor data.

Static factories: `AnimatedSprite.fromFrames(frames)` creates from an array of cached frame IDs, `AnimatedSprite.fromImages(images)` from an array of cached image URLs.

### NineSliceSprite

```ts
import { NineSliceSprite, Texture } from 'pixi.js';

const panel = new NineSliceSprite({
    texture: Texture.from('panel.png'),
    leftWidth: 15,
    topHeight: 15,
    rightWidth: 15,
    bottomHeight: 15,
});

panel.width = 300;
panel.height = 200;
```

The texture is divided into a 3x3 grid. Corners stay fixed, edges stretch along one axis, center stretches both. All border values default to 10.

Textures can also define `defaultBorders` so NineSliceSprite picks them up automatically.

### TilingSprite

```ts
import { TilingSprite, Texture } from 'pixi.js';

const bg = new TilingSprite({
    texture: Texture.from('grass.png'),
    width: 800,
    height: 600,
});

// Scroll the pattern
app.ticker.add((ticker) => {
    bg.tilePosition.x -= 1 * ticker.deltaTime;
});
```

Key properties:
- `tilePosition`: `ObservablePoint` for pattern offset.
- `tileScale`: `ObservablePoint` for pattern scale.
- `tileRotation`: radians. Rotates the tile pattern.
- `anchor`: same as Sprite, 0-1 range.
- `applyAnchorToTexture`: whether anchor affects the tiling pattern's start point.
- `width`/`height`: dimensions of the visible tiling area. Defaults to the texture's own dimensions (`texture.width`/`texture.height`).

Default texture is `Texture.EMPTY` (same as Sprite). Always provide an explicit texture.

## Common Mistakes

### [HIGH] Confusing anchor and pivot

Wrong:
```ts
// Trying to center rotation using pivot on a Sprite
sprite.pivot.set(sprite.width / 2, sprite.height / 2);
// Result: sprite renders at an offset from its position
```

Correct:
```ts
// Anchor is texture-relative (0-1), does not offset position
sprite.anchor.set(0.5, 0.5);
```

Anchor (Sprite-only) is normalized 0-1 and changes the texture's render origin without offsetting position. Pivot (inherited from Container) is in pixel space and shifts both the transform origin and the visual position. Use anchor to center sprites; use pivot only when you explicitly want the position offset.

Source: src/scene/sprite/Sprite.ts

### [HIGH] Expecting texture UV change notification on sprites

Wrong:
```ts
texture.frame.width = texture.frame.width / 2;
texture.update();
// sprite does NOT auto-reflect the change (unless texture.dynamic is true)
```

Correct (option A, preferred for frequently changing textures):
```ts
texture.dynamic = true; // opt in once; sprite auto-listens for updates
texture.frame.width = texture.frame.width / 2;
texture.update(); // sprite picks up the change automatically
```

Correct (option B, manual notification):
```ts
texture.frame.width = texture.frame.width / 2;
texture.update();
sprite['onViewUpdate'](); // protected; bracket notation required in TS
```

v8 removed event-based texture change notification for performance. Set `texture.dynamic = true` to restore auto-notification, or manually call `sprite['onViewUpdate']()` after modifying the texture.

Source: src/rendering/renderers/shared/texture/Texture.ts, src/__docs__/migrations/v8.md

### [HIGH] Using positional constructor args for NineSliceSprite

Wrong:
```ts
const ns = new NineSlicePlane(texture, 10, 10, 10, 10);
```

Correct:
```ts
const ns = new NineSliceSprite({
    texture,
    leftWidth: 10,
    topHeight: 10,
    rightWidth: 10,
    bottomHeight: 10,
});
```

`NineSlicePlane` was renamed to `NineSliceSprite` in v8 and switched to an options object constructor. Always use `NineSliceSprite` with the options object.

Source: src/__docs__/migrations/v8.md

---

See also: core-concepts (Container, transforms, textures), asset-loading (Assets.load for textures), spritesheet (animation frames from atlases), performance (sprite batching)

## Learn More

- [Sprite](https://pixijs.download/release/docs/scene.Sprite.html.md)
- [AnimatedSprite](https://pixijs.download/release/docs/scene.AnimatedSprite.html.md)
- [NineSliceSprite](https://pixijs.download/release/docs/scene.NineSliceSprite.html.md)
- [TilingSprite](https://pixijs.download/release/docs/scene.TilingSprite.html.md)
