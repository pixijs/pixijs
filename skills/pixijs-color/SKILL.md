---
name: pixijs-color
description: >
  Manipulate colors with PixiJS Color class. Accepts hex integers (0xff0000),
  hex strings ('#ff0000'), CSS names ('red'), RGB/HSL objects, and normalized
  0-1 arrays. Methods: toHex(), toNumber(), toArray(), toRgbString(),
  setAlpha(). Note: arrays use 0-1 range, not 0-255. Use when the user asks
  about color conversion, hex to RGB, tint colors, color formats, HSL colors,
  color alpha, color multiplication, premultiplied alpha, Color.shared,
  ColorSource, or replacing utils.string2hex/hex2string. Covers Color,
  ColorSource.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  sources: "pixijs/pixijs:src/color/Color.ts"
---

## When to Use This Skill

Apply when creating, converting, or manipulating colors for tints, fills, strokes, or any API that accepts ColorSource.

**Related skills:** For applying tints to sprites use **sprite**; for fill and stroke colors use **graphics**; for color blending effects use **blend-modes**.

## Setup

```ts
import { Color, Graphics } from 'pixi.js';

const color = new Color('red');

const g = new Graphics()
    .rect(0, 0, 100, 100)
    .fill(color);
```

The `Color` class is used throughout PixiJS for tints, fills, strokes, and backgrounds. Most APIs accept `ColorSource` directly (hex number, string, etc.), so explicit `Color` construction is only needed for conversion or manipulation.

```ts
import { Sprite, Graphics, Text } from 'pixi.js';

// These all work without new Color()
const sprite = Sprite.from('image.png');
sprite.tint = 'red';

const g = new Graphics().rect(0, 0, 100, 100).fill({ color: 0xff0000 });

const text = new Text({ text: 'Hello', style: { fill: 'dodgerblue' } });
```

## Core Patterns

### Accepted input formats

```ts
import { Color } from 'pixi.js';

// Hex integer
new Color(0xff0000);

// Hex strings
new Color('#ff0000');
new Color('#f00');
new Color('ff0000');

// CSS color names
new Color('red');
new Color('dodgerblue');

// RGB/RGBA objects (components 0-255)
new Color({ r: 255, g: 0, b: 0 });
new Color({ r: 255, g: 0, b: 0, a: 0.5 });

// HSL/HSLA objects
new Color({ h: 0, s: 100, l: 50 });
new Color({ h: 0, s: 100, l: 50, a: 0.5 });

// HSV/HSVA objects
new Color({ h: 0, s: 100, v: 100 });

// CSS strings
new Color('rgb(255, 0, 0)');
new Color('rgba(255, 0, 0, 0.5)');
new Color('hsl(0, 100%, 50%)');

// Normalized 0-1 arrays (Float32Array or plain arrays)
new Color([1, 0, 0]);           // RGB
new Color([1, 0, 0, 0.5]);     // RGBA

// Uint8 arrays (components 0-255)
new Color(new Uint8Array([255, 0, 0]));
new Color(new Uint8ClampedArray([255, 0, 0, 128]));
```

### Conversion methods

```ts
import { Color } from 'pixi.js';

const color = new Color('#ff6600');

color.toHex();          // '#ff6600'
color.toHexa();         // '#ff6600ff' (hex with alpha)
color.toNumber();       // 0xff6600
color.toArray();        // [1, 0.4, 0, 1] (normalized RGBA)
color.toRgbArray();     // [1, 0.4, 0] (normalized RGB, no alpha)
color.toRgbaString();   // 'rgba(255,102,0,1)'
color.toRgba();         // { r: 1, g: 0.4, b: 0, a: 1 }
color.toRgb();          // { r: 1, g: 0.4, b: 0 }
color.toUint8RgbArray();// [255, 102, 0]

// setValue() is the chainable way to change a color's value
color.setValue(0xff0000).toHex(); // '#ff0000'
```

### Component access

```ts
import { Color } from 'pixi.js';

const color = new Color('rgba(255, 128, 0, 0.8)');

color.red;    // 1
color.green;  // ~0.502
color.blue;   // 0
color.alpha;  // 0.8
```

All component getters return normalized 0-1 values.

### Manipulation

```ts
import { Color } from 'pixi.js';

const color = new Color('red');

// Set alpha (chainable)
color.setAlpha(0.5);

// Multiply with another color (destructive, modifies in place)
color.multiply(0x808080);

// Premultiply alpha (destructive, RGB channels multiplied by alpha)
color.premultiply(0.8);

// Premultiply alpha only (RGB unchanged)
color.premultiply(0.8, false);

// Chain operations
new Color('white')
    .setAlpha(0.5)
    .multiply([0.8, 0.2, 0.2]);
```

`multiply()` and `premultiply()` are destructive; they modify the color and set `value` to null (original format is lost).

### Color.shared for temporary operations

```ts
import { Color } from 'pixi.js';

// One-off conversion without allocating a new Color
const hex = Color.shared.setValue('#ff6600').toNumber();
const arr = Color.shared.setValue(0xff0000).toArray();
```

`Color.shared` is a singleton that avoids allocating a new `Color` on every call. This matters in hot paths like render loops or per-frame tint calculations where repeated `new Color()` creates GC pressure. Do not store references to it; other code may mutate it.

```ts
import { Color } from 'pixi.js';

// Good: reuse shared instance in a per-frame callback
app.ticker.add(() => {
    const t = performance.now() / 1000;
    sprite.tint = Color.shared
        .setValue('white')
        .multiply([Math.sin(t) * 0.5 + 0.5, 0.2, 0.8])
        .toNumber();
});
```

## Common Mistakes

### [MEDIUM] Expecting toRgba() to return 0-255 values

Wrong:
```ts
import { Color } from 'pixi.js';

const { r, g, b } = new Color({ r: 255, g: 128, b: 0 }).toRgba();
// r = 1, g = ~0.502, b = 0 (NOT 255, 128, 0)
```

Correct:
```ts
import { Color } from 'pixi.js';

// Use toUint8RgbArray() for 0-255 output
const [r, g, b] = new Color({ r: 255, g: 128, b: 0 }).toUint8RgbArray();
// r = 255, g = 128, b = 0
```

RGB object *inputs* use 0-255 range (`{ r: 255, g: 0, b: 0 }`), but all output methods (`toRgba()`, `toRgb()`, `toArray()`, `toRgbArray()`) normalize to 0-1. Use `toUint8RgbArray()` when you need 0-255 integers for CSS or external APIs.

Source: src/color/Color.ts

### [MEDIUM] Using 0-255 range in color arrays

Wrong:
```ts
import { Color } from 'pixi.js';

new Color([255, 0, 0]); // NOT red; values are interpreted as 0-1
```

Correct:
```ts
import { Color } from 'pixi.js';

new Color([1, 0, 0]);                        // red via normalized array
new Color(0xff0000);                          // red via hex
new Color('red');                             // red via CSS name
new Color(new Uint8Array([255, 0, 0]));       // red via Uint8Array (0-255)
```

Plain number arrays (`number[]` and `Float32Array`) use normalized 0-1 range. `[255, 0, 0]` clamps to `[1, 0, 0]` because values are clamped, but `[200, 100, 50]` does not produce the expected color. Use `Uint8Array` or `Uint8ClampedArray` for 0-255 input.

Source: src/color/Color.ts

### [MEDIUM] Using utils.string2hex or utils.hex2string

Wrong:
```ts
import { utils } from 'pixi.js';

const hex = utils.string2hex('#ff0000');
```

Correct:
```ts
import { Color } from 'pixi.js';

const hex = new Color('#ff0000').toNumber();
const str = new Color(0xff0000).toHex();
```

The `utils` namespace was removed in v8. Use the `Color` class for all color conversions.

Source: src/__docs__/migrations/v8.md

---

See also: core-concepts (tint property), graphics (fill/stroke colors), blend-modes (color blending), migration-v8 (utils removal)

## Learn More

- [Color](https://pixijs.download/release/docs/color.Color.html.md)
- [ColorSource](https://pixijs.download/release/docs/color.ColorSource.html.md)
