---
title: Overview
category: color
description: Learn how to use the Color class in PixiJS for creating, converting, and manipulating colors across multiple formats including hex, RGB, HSL, and CSS color names.
---

# Color

The `Color` class provides a unified way to work with colors in PixiJS. It supports multiple color formats, offers color manipulation features, and is used throughout the rendering pipeline for tints, fills, strokes, gradients, and more.

```ts
import { Color, Sprite, Texture, Graphics } from 'pixi.js';

const red = new Color('red');
const green = new Color(0x00ff00);
const blue = new Color('#0000ff');
const rgba = new Color({ r: 255, g: 0, b: 0, a: 0.5 });

console.log(red.toArray());  // [1, 0, 0, 1]
console.log(green.toHex());  // "#00ff00"

const sprite = new Sprite(Texture.WHITE);
sprite.tint = red; // Works directly with a Color instance
```

## Color formats

PixiJS supports a wide range of color formats through the {@link ColorSource} type:

```ts
import { Color } from 'pixi.js';

// CSS color names
const red = new Color('red');
const blue = new Color('blue');

// Hexadecimal
const hexNumber = new Color(0xff0000);     // RGB integer
const hexString = new Color('#ff0000');    // 6-digit hex
const shortHex = new Color('#f00');        // 3-digit hex
const hexAlpha = new Color('#ff0000ff');   // 8-digit hex (with alpha)
const shortHexAlpha = new Color('#f00f');  // 4-digit hex (with alpha)

// RGB/RGBA objects: r, g, b are 0-255; alpha is 0-1
// (Note: output methods like toRgba() return all channels normalized to 0-1)
const rgb = new Color({ r: 255, g: 0, b: 0 });
const rgba = new Color({ r: 255, g: 0, b: 0, a: 0.5 });

// RGB/RGBA strings
const rgbString = new Color('rgb(255, 0, 0)');
const rgbaString = new Color('rgba(255, 0, 0, 0.5)');

// Arrays (normalized 0-1)
const rgbArray = new Color([1, 0, 0]);
const rgbaArray = new Color([1, 0, 0, 0.5]);
const float32Array = new Color(new Float32Array([1, 0, 0, 0.5]));

// HSL/HSLA objects (h: 0-360, s: 0-100, l: 0-100, a: 0-1) and strings
const hsl = new Color({ h: 0, s: 100, l: 50 });
const hsla = new Color({ h: 0, s: 100, l: 50, a: 0.5 });
const hslString = new Color('hsl(0, 100%, 50%)');

// HSV/HSVA objects (h: 0-360, s: 0-100, v: 0-100, a: 0-1)
const hsv = new Color({ h: 0, s: 100, v: 100 });

// Color instances
const copy = new Color(red);
```

## Using colors

Anywhere you see a color-related property (`tint`, `fill`, `stroke`), you can pass any `ColorSource` format. PixiJS converts it internally.

```ts
import { Sprite, Graphics, Text } from 'pixi.js';

// Sprite tinting
const sprite = Sprite.from('image.png');
sprite.tint = 'red';
sprite.tint = 0xff0000;
sprite.tint = '#ff0000';
sprite.tint = new Color('red');

// Graphics fills and strokes
const graphics = new Graphics();
graphics.fill({ color: 'red' });
graphics.fill({ color: 0xff0000 });
graphics.stroke({ color: '#ff0000' });
graphics.stroke({ color: new Color('red') });

// Text styles
const text = new Text({
    text: 'Hello, PixiJS!',
    style: {
        fill: 'red',
        // or: fill: 0xff0000,
        // or: fill: 'rgb(255, 0, 0)',
    },
});
```

## Color components

Access individual color components. All values are normalized to 0-1.

```ts
const color = new Color('red');

console.log(color.red);   // 1
console.log(color.green); // 0
console.log(color.blue);  // 0
console.log(color.alpha); // 1

color.setAlpha(0.5); // 50% transparent
```

## Color conversions

Convert between color formats:

```ts
const color = new Color('red');

// Numeric and string formats
color.toNumber();      // 0xff0000
color.toHex();         // "#ff0000"
color.toHexa();        // "#ff0000ff"
color.toRgbaString();  // "rgba(255,0,0,1)"

// Object representations (normalized 0-1)
color.toRgb();         // { r: 1, g: 0, b: 0 }
color.toRgba();        // { r: 1, g: 0, b: 0, a: 1 }

// Array formats (normalized 0-1)
color.toArray();       // [1, 0, 0, 1] (RGBA)
color.toRgbArray();    // [1, 0, 0]    (RGB only)

// Uint8 array (0-255 range)
color.toUint8RgbArray(); // [255, 0, 0]
```

> [!WARNING]
> `toRgb()`, `toRgba()`, `toArray()`, and `toRgbArray()` return values normalized to 0-1 (not 0-255). This trips up many developers. If you need 0-255 integers (e.g., for CSS or external APIs), use `toUint8RgbArray()`.

## Color manipulation

```ts
const color = new Color('red');

// Multiply colors (accepts any ColorSource)
color.multiply([0.5, 0.5, 0.5]);
color.multiply(new Color('#808080'));
color.multiply(0x808080);

// Premultiply alpha
// When applyToRGB is true (default), RGB channels are multiplied by alpha
color.premultiply(0.5);
// When false, only alpha is set; RGB stays unchanged
color.premultiply(0.5, false);

// Chain operations
color
    .setValue('#ff0000')
    .setAlpha(0.8)
    .multiply([0.5, 0.5, 0.5])
    .premultiply(0.5);
```

## Static utilities

```ts
import { Color } from 'pixi.js';

// Shared instance for temporary operations (avoids allocations)
Color.shared.setValue('red').toHex(); // "#ff0000"

// Check if a value is a valid color source
Color.isColorLike('red');             // true
Color.isColorLike('#ff0000');         // true
Color.isColorLike([1, 0, 0]);        // true
Color.isColorLike({ r: 1, g: 0, b: 0 }); // true
Color.isColorLike('not-a-color');     // false
```

> **Note:** `Color.isColorLike` checks structural shape (is it a string, number, array, or recognized object?). It does not validate that a string is an actual CSS color name or that array values are in range.

## API reference

- {@link Color} for the full API
- {@link ColorSource} for all supported color formats
