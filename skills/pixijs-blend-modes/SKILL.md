---
name: pixijs-blend-modes
description: >
  Use standard and advanced blend modes in PixiJS. Standard: normal, add,
  multiply, screen via blendMode property. Advanced: color-burn, color-dodge,
  overlay, etc. via pixi.js/advanced-blend-modes import. Blend mode changes
  break batches; group same modes together for performance. Use when the
  user asks about additive blending, multiply blend, screen blend, overlay,
  color burn, color dodge, glow effects, light effects, erase mode, blend
  mode strings, BLEND_MODES enum, or advanced blend mode imports. Covers
  blendMode property, BLEND_MODES, advanced-blend-modes extension.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  sources: "pixijs/pixijs:src/advanced-blend-modes/init.ts, pixijs/pixijs:src/__docs__/concepts/performance-tips.md"
---

## When to Use This Skill

Apply when setting blend modes on display objects for compositing effects like additive lighting, multiply darkening, or Photoshop-style layer blending.

**Related skills:** For filter-based effects use **filters**; for batch optimization with blend modes use **performance**; for color manipulation use **color**.

## Setup

```ts
import { Sprite, Assets } from 'pixi.js';

const texture = await Assets.load('light.png');
const light = new Sprite(texture);
light.blendMode = 'add';
```

The `blendMode` property is available on all display objects. Standard modes work without extra imports.

## Core Patterns

### Standard blend modes

Standard modes are built in and use GPU blend equations directly:

```ts
import { Sprite } from 'pixi.js';

sprite.blendMode = 'normal';    // standard alpha compositing (effective default at root)
sprite.blendMode = 'add';       // additive (lighten, glow effects)
sprite.blendMode = 'multiply';  // multiply (darken, shadow effects)
sprite.blendMode = 'screen';    // screen (lighten, dodge effects)
sprite.blendMode = 'erase';     // erase pixels from render target
sprite.blendMode = 'none';      // no blending, overwrites destination
sprite.blendMode = 'inherit';   // inherit from parent (this is the actual default value)
sprite.blendMode = 'min';       // keeps minimum of source and destination (WebGL2+ only)
sprite.blendMode = 'max';       // keeps maximum of source and destination (WebGL2+ only)
```

These are hardware-accelerated and cheap. They do not require filters.

### Advanced blend modes

Advanced modes require an explicit import to register the extensions:

```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite, Assets } from 'pixi.js';

const texture = await Assets.load('overlay.png');
const overlay = new Sprite(texture);
overlay.blendMode = 'color-burn';
```

Available advanced modes:

| Mode | Effect |
|---|---|
| `color-burn` | Darkens by increasing contrast |
| `color-dodge` | Brightens by decreasing contrast |
| `darken` | Keeps darker of two layers |
| `difference` | Absolute difference |
| `divide` | Divides bottom by top |
| `exclusion` | Similar to difference, lower contrast |
| `hard-light` | Multiply or screen based on top layer |
| `hard-mix` | High contrast threshold blend |
| `lighten` | Keeps lighter of two layers |
| `linear-burn` | Adds and subtracts to darken |
| `linear-dodge` | Adds layers together |
| `linear-light` | Linear burn or dodge based on top layer |
| `luminosity` | Luminosity of top, hue/saturation of bottom |
| `negation` | Inverted difference |
| `overlay` | Multiply or screen based on bottom layer |
| `pin-light` | Replaces based on lightness comparison |
| `saturation` | Saturation of top, hue/luminosity of bottom |
| `soft-light` | Gentle overlay effect |
| `subtract` | Subtracts top from bottom |
| `vivid-light` | Color burn or dodge based on top layer |
| `color` | Hue and saturation of top, luminosity of bottom |

You set advanced blend modes the same way as standard ones, via the `blendMode` property. They use filters internally, so they cost more than standard modes.

### Batch-friendly ordering

Different blend modes break the rendering batch. Order objects to minimize transitions:

```ts
import { Container, Sprite } from 'pixi.js';

const scene = new Container();

// 2 draw calls (grouped by blend mode)
scene.addChild(screenSprite1);
scene.addChild(screenSprite2);
scene.addChild(normalSprite1);
scene.addChild(normalSprite2);

// 4 draw calls (alternating blend modes)
// scene.addChild(screenSprite1);
// scene.addChild(normalSprite1);
// scene.addChild(screenSprite2);
// scene.addChild(normalSprite2);
```

## Common Mistakes

### [HIGH] Not importing advanced-blend-modes extension

Wrong:
```ts
import { Sprite } from 'pixi.js';

sprite.blendMode = 'color-burn'; // silently falls back to normal
```

Correct:
```ts
import 'pixi.js/advanced-blend-modes';
import { Sprite } from 'pixi.js';

sprite.blendMode = 'color-burn';
```

Advanced blend modes (color-burn, overlay, etc.) require the extension import. Without it, only standard modes (normal, add, multiply, screen) are available. The invalid mode silently falls back.

Source: src/advanced-blend-modes/init.ts

### [MEDIUM] Mixing blend modes across adjacent objects

Different blend modes break the render batch. `screen / normal / screen / normal` produces 4 draw calls, while `screen / screen / normal / normal` produces 2. Sort children so objects with the same blend mode are adjacent.

Source: src/__docs__/concepts/performance-tips.md

### [MEDIUM] Using old BLEND_MODES enum values

Wrong:
```ts
import { BLEND_MODES } from 'pixi.js';

sprite.blendMode = BLEND_MODES.ADD;
```

Correct:
```ts
sprite.blendMode = 'add';
```

v8 uses string blend mode identifiers instead of enum constants. The old enums may still work as deprecated aliases, but prefer strings.

Source: src/__docs__/migrations/v8.md

---

See also: filters (advanced blends use filter pipeline), performance (batch optimization), core-concepts (blendMode property), migration-v8 (upgrading from v7)

## Learn More

- [BLEND_MODES](https://pixijs.download/release/docs/filters.BLEND_MODES.html.md)
