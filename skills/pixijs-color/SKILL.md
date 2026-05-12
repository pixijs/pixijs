---
name: pixijs-color
description: "Use this skill when creating, converting, or manipulating colors in PixiJS v8. Covers Color class input formats (hex, CSS names, RGB/HSL objects, arrays, Uint8Array), conversion methods (toHex, toNumber, toArray, toRgba), component access, setAlpha/multiply/premultiply, Color.shared singleton. Triggers on: Color, ColorSource, hex, rgb, hsl, tint, premultiply, Color.shared, color conversion."
license: MIT
---

The `Color` class creates and converts colors for tints, fills, strokes, and anywhere PixiJS accepts a `ColorSource`. Most APIs accept raw hex/strings directly, so explicit `new Color(...)` is only needed when converting formats or manipulating values.

## Quick Start

```ts
const fillColor = new Color("#ff6600");
console.log(fillColor.toHex()); // '#ff6600'
console.log(fillColor.toNumber()); // 0xff6600
console.log(fillColor.toArray()); // [1, 0.4, 0, 1]

const g = new Graphics().rect(0, 0, 200, 100).fill(fillColor);
app.stage.addChild(g);

const sprite = Sprite.from("hero.png");
sprite.tint = "dodgerblue";
app.stage.addChild(sprite);

const t = Color.shared.setValue(0xffffff).multiply([1, 0.5, 0.5]).toNumber();
sprite.tint = t;
```

**Related skills:** `pixijs-scene-graphics` (fill/stroke colors), `pixijs-scene-sprite` (tint), `pixijs-blend-modes` (compositing).

## Core Patterns

### Accepted input formats

```ts
import { Color } from "pixi.js";

// Hex integer
new Color(0xff0000);

// Hex strings
new Color("#ff0000");
new Color("#f00");
new Color("ff0000");

// CSS color names
new Color("red");
new Color("dodgerblue");

// RGB/RGBA objects (components 0-255)
new Color({ r: 255, g: 0, b: 0 });
new Color({ r: 255, g: 0, b: 0, a: 0.5 });

// HSL/HSLA objects
new Color({ h: 0, s: 100, l: 50 });
new Color({ h: 0, s: 100, l: 50, a: 0.5 });

// HSV/HSVA objects
new Color({ h: 0, s: 100, v: 100 });

// CSS strings
new Color("rgb(255, 0, 0)");
new Color("rgba(255, 0, 0, 0.5)");
new Color("hsl(0, 100%, 50%)");

// Normalized 0-1 arrays (Float32Array or plain arrays)
new Color([1, 0, 0]); // RGB
new Color([1, 0, 0, 0.5]); // RGBA

// Uint8 arrays (components 0-255)
new Color(new Uint8Array([255, 0, 0]));
new Color(new Uint8ClampedArray([255, 0, 0, 128]));

// 8-digit hex with alpha
new Color("#ff0000ff");
new Color("#f00f");

// Copy from another Color instance
const red = new Color("red");
const copy = new Color(red);
```

### Conversion methods

```ts
import { Color } from "pixi.js";

const color = new Color("#ff6600");

color.toHex(); // '#ff6600'
color.toHexa(); // '#ff6600ff' (hex with alpha)
color.toNumber(); // 0xff6600
color.toArray(); // [1, 0.4, 0, 1] (normalized RGBA)
color.toRgbArray(); // [1, 0.4, 0] (normalized RGB, no alpha)
color.toRgbaString(); // 'rgba(255,102,0,1)'
color.toRgba(); // { r: 1, g: 0.4, b: 0, a: 1 }
color.toRgb(); // { r: 1, g: 0.4, b: 0 }
color.toUint8RgbArray(); // [255, 102, 0]

// setValue() is the chainable way to change a color's value
color.setValue(0xff0000).toHex(); // '#ff0000'
```

### Component access

```ts
import { Color } from "pixi.js";

const color = new Color("rgba(255, 128, 0, 0.8)");

color.red; // 1
color.green; // ~0.502
color.blue; // 0
color.alpha; // 0.8
```

All component getters return normalized 0-1 values.

### Manipulation

```ts
import { Color } from "pixi.js";

const color = new Color("red");

// Set alpha (chainable)
color.setAlpha(0.5);

// Multiply with another color (destructive, modifies in place)
color.multiply(0x808080);

// Premultiply alpha (destructive, RGB channels multiplied by alpha)
color.premultiply(0.8);

// Premultiply alpha only (RGB unchanged)
color.premultiply(0.8, false);

// Chain operations
new Color("white").setAlpha(0.5).multiply([0.8, 0.2, 0.2]);
```

`multiply()` and `premultiply()` are destructive; they modify the color and set `value` to null (original format is lost).

### Non-destructive premultiplied output

```ts
import { Color } from "pixi.js";

const color = new Color("red").setAlpha(0.5);

const packed = color.toPremultiplied(color.alpha); // 0x7F7F0000
const alphaOnly = color.toPremultiplied(color.alpha, false); // 0x7FFF0000
```

`toPremultiplied(alpha, applyToRGB?)` returns a 32-bit `0xAARRGGBB` integer without mutating `this`. Use it in batchers and tint math where the source color must be reused. When `applyToRGB` is `false`, only the alpha byte is packed; the RGB stays at its full value.

### Reusing output buffers

```ts
import { Color } from "pixi.js";

const rgba = new Float32Array(4);
const rgb = new Float32Array(3);
const rgb8 = new Uint8Array(3);

app.ticker.add(() => {
  Color.shared.setValue(sprite.tint).toArray(rgba).toRgbArray(rgb);

  Color.shared.toUint8RgbArray(rgb8);
});
```

`toArray(out?)`, `toRgbArray(out?)`, and `toUint8RgbArray(out?)` accept a reusable `number[]`, `Float32Array`, `Uint8Array`, or `Uint8ClampedArray` and write into it. Pass your own buffer in hot paths to avoid allocating per frame; omit the argument and the `Color` instance returns its internal cache array.

### Packing for GPU buffers

| Method                   | Returns                                                      |
| ------------------------ | ------------------------------------------------------------ |
| `toBgrNumber()`          | 24-bit `0xBBGGRR` integer with R/B swapped                   |
| `toLittleEndianNumber()` | Same 24-bit swap, convenient for little-endian vertex writes |

Both are cheap and useful when emitting colors straight into packed vertex attributes.

### Color.shared for temporary operations

```ts
import { Color } from "pixi.js";

// One-off conversion without allocating a new Color
const hex = Color.shared.setValue("#ff6600").toNumber();
const arr = Color.shared.setValue(0xff0000).toArray();
```

`Color.shared` is a singleton that avoids allocating a new `Color` on every call. This matters in hot paths like render loops or per-frame tint calculations where repeated `new Color()` creates GC pressure. Do not store references to it; other code may mutate it.

```ts
import { Color } from "pixi.js";

// Good: reuse shared instance in a per-frame callback
app.ticker.add(() => {
  const t = performance.now() / 1000;
  sprite.tint = Color.shared
    .setValue("white")
    .multiply([Math.sin(t) * 0.5 + 0.5, 0.2, 0.8])
    .toNumber();
});
```

### Validating input

```ts
import { Color } from "pixi.js";

Color.isColorLike("red"); // true
Color.isColorLike("#ff0000"); // true
Color.isColorLike(0xff0000); // true
Color.isColorLike([1, 0, 0]); // true
Color.isColorLike({ r: 1, g: 0, b: 0 }); // true
Color.isColorLike({ foo: 1 }); // false
Color.isColorLike(null); // false
```

`Color.isColorLike()` checks the structural shape (string, number, array, or recognized object). It doesn't validate that a string is a real CSS color name, nor that array values fall in range. Use it as a type guard before passing user input to `new Color()` or `setValue()`.

## Common Mistakes

### [MEDIUM] Expecting toRgba() to return 0-255 values

Wrong:

```ts
import { Color } from "pixi.js";

const { r, g, b } = new Color({ r: 255, g: 128, b: 0 }).toRgba();
// r = 1, g = ~0.502, b = 0 (NOT 255, 128, 0)
```

Correct:

```ts
import { Color } from "pixi.js";

// Use toUint8RgbArray() for 0-255 output
const [r, g, b] = new Color({ r: 255, g: 128, b: 0 }).toUint8RgbArray();
// r = 255, g = 128, b = 0
```

RGB object _inputs_ use 0-255 range (`{ r: 255, g: 0, b: 0 }`), but all output methods (`toRgba()`, `toRgb()`, `toArray()`, `toRgbArray()`) normalize to 0-1. Use `toUint8RgbArray()` when you need 0-255 integers for CSS or external APIs.


### [MEDIUM] Using 0-255 range in color arrays

Wrong:

```ts
import { Color } from "pixi.js";

new Color([255, 0, 0]); // NOT red; values are interpreted as 0-1
```

Correct:

```ts
import { Color } from "pixi.js";

new Color([1, 0, 0]); // red via normalized array
new Color(0xff0000); // red via hex
new Color("red"); // red via CSS name
new Color(new Uint8Array([255, 0, 0])); // red via Uint8Array (0-255)
```

Plain number arrays (`number[]` and `Float32Array`) use normalized 0-1 range. `[255, 0, 0]` clamps to `[1, 0, 0]` because values are clamped, but `[200, 100, 50]` does not produce the expected color. Use `Uint8Array` or `Uint8ClampedArray` for 0-255 input.


### [MEDIUM] Using utils.string2hex or utils.hex2string

Wrong:

```ts
import { utils } from "pixi.js";

const hex = utils.string2hex("#ff0000");
```

Correct:

```ts
import { Color } from "pixi.js";

const hex = new Color("#ff0000").toNumber();
const str = new Color(0xff0000).toHex();
```

The `utils` namespace was removed in v8. Use the `Color` class for all color conversions.


## API Reference

- [Color](https://pixijs.download/release/docs/color.Color.html.md)
- [ColorSource](https://pixijs.download/release/docs/color.ColorSource.html.md)
