---
name: pixijs-blend-modes
description: "Use this skill when compositing display objects with blend modes in PixiJS v8. Covers standard modes (normal, add, multiply, screen, erase, min, max), advanced modes via pixi.js/advanced-blend-modes (color-burn, overlay, hard-light, etc.), batch-friendly ordering. Triggers on: blendMode, additive, multiply, screen, overlay, color-burn, color-dodge, advanced-blend-modes, glow, erase."
license: MIT
---

Set `container.blendMode` to composite display objects with GPU blend equations (standard modes) or filter-based advanced modes. Blend-mode transitions break render batches, so group like-mode siblings together.

## Quick Start

```ts
const light = new Sprite(await Assets.load("light.png"));
light.blendMode = "add";
app.stage.addChild(light);

const shadow = new Sprite(await Assets.load("shadow.png"));
shadow.blendMode = "multiply";
app.stage.addChild(shadow);

import "pixi.js/advanced-blend-modes";
const overlay = new Sprite(await Assets.load("overlay.png"));
overlay.blendMode = "color-burn";
app.stage.addChild(overlay);
```

**Related skills:** `pixijs-filters` (advanced modes use the filter pipeline), `pixijs-performance` (batching with blend modes), `pixijs-color` (color manipulation).

## Core Patterns

### Standard blend modes

Standard modes are built in and use GPU blend equations directly:

```ts
import { Sprite } from "pixi.js";

sprite.blendMode = "normal"; // standard alpha compositing (effective default at root)
sprite.blendMode = "add"; // additive (lighten, glow effects)
sprite.blendMode = "multiply"; // multiply (darken, shadow effects)
sprite.blendMode = "screen"; // screen (lighten, dodge effects)
sprite.blendMode = "erase"; // erase pixels from render target
sprite.blendMode = "none"; // no blending, overwrites destination
sprite.blendMode = "inherit"; // inherit from parent (this is the actual default value)
sprite.blendMode = "min"; // keeps minimum of source and destination (WebGL2+ only)
sprite.blendMode = "max"; // keeps maximum of source and destination (WebGL2+ only)
```

These are hardware-accelerated and cheap. They do not require filters.

### Advanced blend modes

Advanced modes require an explicit import to register the extensions. On the WebGL renderer they also require `useBackBuffer: true` at init time, or PixiJS logs a warning and the blend silently falls back:

```ts
import "pixi.js/advanced-blend-modes";
import { Application, Sprite, Assets } from "pixi.js";

const app = new Application();
await app.init({ useBackBuffer: true }); // required for advanced modes on WebGL

const texture = await Assets.load("overlay.png");
const overlay = new Sprite(texture);
overlay.blendMode = "color-burn";
```

Available advanced modes:

| Mode           | Effect                                          |
| -------------- | ----------------------------------------------- |
| `color-burn`   | Darkens by increasing contrast                  |
| `color-dodge`  | Brightens by decreasing contrast                |
| `darken`       | Keeps darker of two layers                      |
| `difference`   | Absolute difference                             |
| `divide`       | Divides bottom by top                           |
| `exclusion`    | Similar to difference, lower contrast           |
| `hard-light`   | Multiply or screen based on top layer           |
| `hard-mix`     | High contrast threshold blend                   |
| `lighten`      | Keeps lighter of two layers                     |
| `linear-burn`  | Adds and subtracts to darken                    |
| `linear-dodge` | Adds layers together                            |
| `linear-light` | Linear burn or dodge based on top layer         |
| `luminosity`   | Luminosity of top, hue/saturation of bottom     |
| `negation`     | Inverted difference                             |
| `overlay`      | Multiply or screen based on bottom layer        |
| `pin-light`    | Replaces based on lightness comparison          |
| `saturation`   | Saturation of top, hue/luminosity of bottom     |
| `soft-light`   | Gentle overlay effect                           |
| `subtract`     | Subtracts top from bottom                       |
| `vivid-light`  | Color burn or dodge based on top layer          |
| `color`        | Hue and saturation of top, luminosity of bottom |

You set advanced blend modes the same way as standard ones, via the `blendMode` property. They use filters internally, so they cost more than standard modes.

### Batch-friendly ordering

Different blend modes break the rendering batch. Order objects to minimize transitions:

```ts
import { Container, Sprite } from "pixi.js";

const scene = new Container();
scene.addChild(screenSprite1); // 'screen'
scene.addChild(screenSprite2); // 'screen'
scene.addChild(normalSprite1); // 'normal'
scene.addChild(normalSprite2); // 'normal'
```

2 draw calls. Alternating order (`screen, normal, screen, normal`) would produce 4.

## Common Mistakes

### [HIGH] Not importing advanced-blend-modes extension

Wrong:

```ts
import { Sprite } from "pixi.js";

sprite.blendMode = "color-burn"; // silently falls back to normal
```

Correct:

```ts
import "pixi.js/advanced-blend-modes";
import { Sprite } from "pixi.js";

sprite.blendMode = "color-burn";
```

Advanced blend modes (color-burn, overlay, etc.) require the extension import. Without it, only standard modes (normal, add, multiply, screen) are available. The invalid mode silently falls back.


### [MEDIUM] Mixing blend modes across adjacent objects

Different blend modes break the render batch. `screen / normal / screen / normal` produces 4 draw calls, while `screen / screen / normal / normal` produces 2. Sort children so objects with the same blend mode are adjacent.


### [HIGH] Using the v7 BLEND_MODES enum

Wrong:

```ts
import { BLEND_MODES } from "pixi.js";

sprite.blendMode = BLEND_MODES.ADD; // runtime error: BLEND_MODES is undefined
```

Correct:

```ts
sprite.blendMode = "add";
```

In v8, `BLEND_MODES` is a TypeScript type only (a union of string literals). There is no runtime enum export, so `BLEND_MODES.ADD` evaluates to accessing a property on `undefined`. Use the string form.


### [HIGH] Advanced blend modes without useBackBuffer

Wrong:

```ts
import "pixi.js/advanced-blend-modes";
await app.init({
  /* no useBackBuffer */
});
sprite.blendMode = "color-burn"; // logs a warning, falls back
```

Correct:

```ts
import "pixi.js/advanced-blend-modes";
await app.init({ useBackBuffer: true });
sprite.blendMode = "color-burn";
```

Advanced modes read from the back buffer. On WebGL, the blend silently falls back if the back buffer is not enabled. WebGPU enables the back buffer unconditionally.


## API Reference

- [Container.blendMode](https://pixijs.download/release/docs/scene.Container.html.md)
- [OverlayBlend](https://pixijs.download/release/docs/filters.OverlayBlend.html.md)
- [ColorBurnBlend](https://pixijs.download/release/docs/filters.ColorBurnBlend.html.md)
- [ColorDodgeBlend](https://pixijs.download/release/docs/filters.ColorDodgeBlend.html.md)
- [HardLightBlend](https://pixijs.download/release/docs/filters.HardLightBlend.html.md)
- [SoftLightBlend](https://pixijs.download/release/docs/filters.SoftLightBlend.html.md)
- [DifferenceBlend](https://pixijs.download/release/docs/filters.DifferenceBlend.html.md)
