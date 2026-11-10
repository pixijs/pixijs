# color

The `Color` class and `ColorSource`: accepted inputs and their ranges, output ranges, alpha in tints and fills, and `Color.shared`.

Every API that takes a colour (`tint`, `fill`, `stroke`, `TextStyle.fill`) accepts a `ColorSource` directly; `new Color(...)` is for converting or manipulating. v7's `utils.string2hex` / `utils.hex2string` are gone with the `utils` namespace: use `new Color("#ff0000").toNumber()` and `new Color(0xff0000).toHex()`.

## Input ranges

```ts
import { Color } from "pixi.js";

new Color(0xff0000);
new Color("#f00");
new Color("#ff000080");
new Color("dodgerblue");
new Color("rgba(255, 0, 0, 0.5)");
new Color("hsl(0, 100%, 50%)");
new Color({ r: 255, g: 0, b: 0, a: 0.5 });
new Color({ h: 0, s: 100, l: 50 });
new Color({ h: 0, s: 100, v: 100 });
new Color([1, 0, 0, 0.5]);
new Color(new Uint8ClampedArray([255, 0, 0, 128]));
new Color(new Color("red"));
```

| Input form                                   | r, g, b                           | alpha                                  |
| -------------------------------------------- | --------------------------------- | -------------------------------------- |
| number `0xRRGGBB`                            | packed bytes                      | always 1; anything above `0xffffff` throws "Unable to convert color" |
| hex string `"#rgb"`, `"#rrggbb"`, `"#rgba"`, `"#rrggbbaa"` (the `#` is optional) | hex digits | from the hex digits (`80` ≈ 0.5) |
| `{ r, g, b, a }` object, `"rgb()"`/`"rgba()"` string | 0-255                     | 0-1                                    |
| `{ h, s, l }` / `{ h, s, v }` object         | h 0-360, s/l/v 0-100              | 0-1                                    |
| `number[]`, `Float32Array` (length 3-4)      | 0-1, clamped                      | 0-1, clamped                           |
| `Uint8Array`, `Uint8ClampedArray` (length 3-4) | 0-255                           | 0-255 (default 255)                    |

So `new Color([180, 60, 90])` is white (each channel clamps to 1; `[255, 0, 0]` only happens to clamp to red), and `new Color(0x3366ff80)` throws. Wrap 0-255 data in a `Uint8Array` or use `{ r, g, b }`; for a colour with alpha use `"#3366ff80"` or `{ r: 51, g: 102, b: 255, a: 0.5 }`.

## Output ranges

Outputs are normalized 0-1 unless the method name says otherwise:

```ts
import { Color } from "pixi.js";

const color = new Color("#ff6600");
color.toHex(); // '#ff6600'
color.toHexa(); // '#ff6600ff'
color.toNumber(); // 0xff6600
color.toArray(); // [1, 0.4, 0, 1]
color.toRgbArray(); // [1, 0.4, 0]
color.toRgba(); // { r: 1, g: 0.4, b: 0, a: 1 }
color.toRgb(); // { r: 1, g: 0.4, b: 0 }
color.toUint8RgbArray(); // [255, 102, 0]
color.toRgbaString(); // 'rgba(255,102,0,1)'
```

`toRgba()`, `toRgb()`, `toArray()`, `toRgbArray()` and the `red`/`green`/`blue`/`alpha` getters are 0-1 even when the input was `{ r: 255, ... }`. 0-255 output comes only from `toUint8RgbArray()` and `toRgbaString()` (alpha stays 0-1); `toHexa()` encodes alpha as two hex digits. `toBgrNumber()` and `toLittleEndianNumber()` return the 24-bit value with R and B swapped, for packed vertex attributes.

`toArray(out?)` and `toRgbArray(out?)` accept a `number[]` or `Float32Array`; `toUint8RgbArray(out?)` accepts a `number[]`, `Uint8Array` or `Uint8ClampedArray`. Each writes into `out` and returns that array, not the `Color`, so they cannot be chained (`setValue`, `setAlpha`, `multiply` and `premultiply` return the `Color`). Pass your own buffer in hot paths to avoid allocating per frame; without it the `Color` returns its internal cache array.

## Alpha in tint and fill

`tint` keeps only RGB: `sprite.tint = "#3366ff80"` gives an opaque blue tint. Apply the alpha separately:

```ts
import { Color, Sprite } from "pixi.js";

declare const sprite: Sprite;

const c = new Color("#3366ff80");
sprite.tint = c.toNumber();
sprite.alpha = c.alpha;
```

A number is never range-checked on the tint fast path: `sprite.tint = 0xff000080` does not throw (unlike `fill(0xff000080)`), it silently keeps the low 24 bits and tints dark blue (`0x000080`). Keep tint numbers within `0x000000`-`0xffffff`.

`Graphics.fill(color)` and `stroke(color)` do honour a colour's alpha, and it multiplies with an explicit `alpha`: `fill({ color: "#ff000080", alpha: 0.5 })` draws at about 0.25, and the object's own `alpha` multiplies again on top. Give the alpha in one place.

## Manipulation

- `setValue(v)` and `setAlpha(a)` are chainable. `multiply(colorSource)` and `premultiply(alpha, applyToRGB = true)` modify the colour in place and set `value` to null (the original format is lost); `premultiply(a, false)` premultiplies only the alpha.
- `toPremultiplied(alpha, applyToRGB?)` returns a 32-bit `0xAARRGGBB` integer without mutating the colour (`new Color("red").setAlpha(0.5).toPremultiplied(0.5)` → `0x7F800000`; with `false`, only the alpha byte is packed: `0x7FFF0000`).
- `Color.isColorLike(v)` checks only the structural shape (string, number, array or recognised object); it does not validate CSS names or array ranges.

## Color.shared

`Color.shared` is a singleton for conversions in hot paths without allocating:

```ts
import { Application, Color, Sprite } from "pixi.js";

declare const app: Application;
declare const sprite: Sprite;

app.ticker.add(() => {
  const t = performance.now() / 1000;
  sprite.tint = Color.shared.setValue("white").multiply([Math.sin(t) * 0.5 + 0.5, 0.2, 0.8]).toNumber();
});
```

Extract a primitive (`toNumber()`, `toHex()`) immediately; a stored `Color.shared` reference changes the next time anything calls `setValue` on it, and PixiJS itself does (every non-number `tint` assignment goes through `Color.shared`).
