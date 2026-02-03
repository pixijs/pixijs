---
title: Overview
category: color
---

# Color

The `Color` class provides a unified way to work with colors in PixiJS. It supports multiple color formats and offers powerful color manipulation features while maintaining high performance.

## Color Formats

PixiJS supports a wide range of color formats through the {@link ColorSource} type:

```ts
import { Color } from 'pixi.js';

// CSS Color Names
const red = new Color('red');
const blue = new Color('blue');

// Hexadecimal (Hex)
const hexNumber = new Color(0xff0000);     // RGB integer
const hexString = new Color('#ff0000');    // 6-digit hex
const shortHex = new Color('#f00');        // 3-digit hex
const hexAlpha = new Color('#ff0000ff');   // 8-digit hex (with alpha)
const shortHexAlpha = new Color('#f00f');  // 4-digit hex (with alpha)

// RGB/RGBA Values
const rgb = new Color({ r: 255, g: 0, b: 0 });
const rgba = new Color({ r: 255, g: 0, b: 0, a: 0.5 });
const rgbString = new Color('rgb(255, 0, 0)');
const rgbaString = new Color('rgba(255, 0, 0, 0.5)');

// Arrays (normalized 0-1)
const rgbArray = new Color([1, 0, 0]);           // RGB
const rgbaArray = new Color([1, 0, 0, 0.5]);     // RGBA
const float32Array = new Color(new Float32Array([1, 0, 0, 0.5]));

// HSL/HSLA Values
const hsl = new Color({ h: 0, s: 100, l: 50 });
const hsla = new Color({ h: 0, s: 100, l: 50, a: 0.5 });
const hslString = new Color('hsl(0, 100%, 50%)');
```

## Using Colors

Colors can be used throughout the PixiJS API for properties like tint, fill, and stroke:

```ts
import { Sprite, Graphics, Text, TextStyle } from 'pixi.js';

// Sprite tinting
const sprite = Sprite.from('image.png');
sprite.tint = 'red';                    // CSS color name
sprite.tint = 0xff0000;                 // Hex number
sprite.tint = '#ff0000';                // Hex string
sprite.tint = new Color('red');         // Color instance

// Graphics fills and strokes
const graphics = new Graphics();
graphics.fill({ color: 'red' });        // CSS color name
graphics.fill({ color: 0xff0000 });     // Hex number
graphics.stroke({ color: '#ff0000' });  // Hex string
graphics.stroke({ color: new Color('red') }); // Color instance

// Text styles
import { Text, TextStyle } from 'pixi.js';
const style = new TextStyle({
    fill: 'red',                          // CSS color name
    // or
    fill: 0xff0000,                       // Hex number
    // or
    fill: 'rgb(255, 0, 0)',             // RGB string
});
const text = new Text('Hello, PixiJS!', style);
```

## Color Components

Access and modify individual color components:

```ts
const color = new Color('red');

// Get components (normalized 0-1)
console.log(color.red);   // 1
console.log(color.green); // 0
console.log(color.blue);  // 0
console.log(color.alpha); // 1

// Set alpha (transparency)
color.setAlpha(0.5);     // 50% transparent
```

## Color Conversions

Convert between different color formats:

```ts
const color = new Color('red');

// Different output formats
color.toNumber();     // 0xff0000
color.toHex();        // "#ff0000"
color.toHexa();       // "#ff0000ff"
color.toRgbString();  // "rgb(255,0,0)"
color.toRgbaString(); // "rgba(255,0,0,1)"

// Object representations
color.toRgb();        // { r: 1, g: 0, b: 0 }
color.toRgba();       // { r: 1, g: 0, b: 0, a: 1 }

// Array formats
color.toArray();      // [1, 0, 0, 1]
color.toRgbArray();   // [1, 0, 0]
```

## Color Manipulation

The Color class provides methods for color manipulation:

```ts
const color = new Color('red');

// Multiply colors
color.multiply([0.5, 0.5, 0.5]);    // 50% darker
color.multiply(new Color('#808080')); // Same effect

// Premultiply alpha
color.premultiply(0.5);              // 50% transparent with RGB adjustment
color.premultiply(0.5, false);       // 50% transparent, original RGB

// Chain operations
color
    .setValue('#ff0000')
    .setAlpha(0.8)
    .multiply([0.5, 0.5, 0.5])
    .premultiply(0.5);
```

## Static Utilities

Use static methods and properties for common operations:

```ts
// Shared instance for temporary operations
Color.shared.setValue('red').toHex();  // "#ff0000"

// Check valid color values
Color.isColorLike('red');          // true
Color.isColorLike('#ff0000');      // true
Color.isColorLike([1, 0, 0]);      // true
Color.isColorLike({ r: 1, g: 0, b: 0 }); // true
```

## Best Practices

- Use the `Color` class for consistent color handling
- Leverage the shared instance (`Color.shared`) for temporary operations
- Chain color operations for cleaner code
- Use appropriate color formats for different contexts
- Remember that color components are normalized (0-1) internally

## Related Documentation

- See {@link Color} for the full API reference
- See {@link ColorSource} for all supported color formats

For more specific implementation details and advanced usage, refer to the API documentation of individual classes and interfaces.
