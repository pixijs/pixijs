---
title: Text Overview
category: text
---

# Text Rendering in PixiJS

PixiJS provides three powerful text rendering systems, each optimized for different use cases:

## Text Types

### Canvas Text (`Text`)

High-quality text rendering using the browser's canvas engine.

```ts
import { Text } from 'pixi.js';

// Basic text
const text = new Text({
    text: 'Hello PixiJS!',
    style: {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: '#ffffff',
    }
});

// Rich styling
const styledText = new Text({
    text: 'Styled Text',
    style: {
        fontFamily: 'Arial',
        fontSize: 48,
        fill: ['#ff0000', '#00ff00'], // Gradient
        stroke: { color: '#000000', width: 4 },
        dropShadow: {
            color: '#000000',
            blur: 4,
            distance: 6,
            angle: Math.PI / 6
        }
    }
});
```

**Best for:**
- Rich text styling
- Dynamic content
- Drop shadows and effects
- Single-line or paragraph text

### Bitmap Text (`BitmapText`)

High-performance text using pre-rendered font atlases.

```ts
import { BitmapFont, BitmapText } from 'pixi.js';

// Install a bitmap font
BitmapFont.install({
    name: 'Game Font',
    style: {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: '#ffffff'
    }
});

// Create bitmap text
const text = new BitmapText({
    text: 'High Performance!',
    style: {
        fontFamily: 'Game Font',
        fontSize: 32
    }
});

// Load external bitmap font
const font = await Assets.load('fonts/game.fnt');
const text2 = new BitmapText({
    text: 'Using loaded font',
    style: {
        fontFamily: font.fontFamily
    }
});
```

**Best for:**
- High-performance text
- Game UIs with lots of text
- Score counters and HUDs
- Text that changes frequently

### HTML Text (`HTMLText`)

HTML and CSS-based text rendering within the PixiJS scene.

```ts
import { HTMLText } from 'pixi.js';

// Basic HTML text
const text = new HTMLText({
    text: '<b>Bold</b> and <i>Italic</i>',
    style: {
        fontSize: 24,
        fill: '#ffffff'
    }
});

// Rich HTML text with styling
const richText = new HTMLText({
    text: '<custom>Custom Tag</custom>',
    style: {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: 0x4a4a4a,
        align: 'center',
        tagStyles: {
            custom: {
                fontSize: 32,
                fill: '#00ff00',
                fontStyle: 'italic'
            }
        }
    }
    textureStyle: {
        scaleMode: 'linear',
        resolution: 2
    }
});
```

**Best for:**
- Complex text formatting
- HTML/CSS styling
- Multi-line formatted content
- Emoji and special characters

## Performance Considerations

### Memory Usage
- `Text`: Medium (one texture per unique text)
- `BitmapText`: Low (shared texture atlas)
- `HTMLText`: High (DOM elements + textures)

### Rendering Speed
- `Text`: Medium
- `BitmapText`: Fast
- `HTMLText`: Slow

### Update Performance
- `Text`: Slow for frequent updates
- `BitmapText`: Fast for any updates
- `HTMLText`: Medium for updates

## Best Practices

1. **Choose the Right Type**
   - Use `Text` for styled, occasionally updated text
   - Use `BitmapText` for frequently updated or numerous text
   - Use `HTMLText` for rich formatting needs

2. **Performance Tips**
   - Cache static text using `cacheAsBitmap`
   - Reuse styles across text instances
   - Use resolution scaling for crisp text
   - Consider pooling for frequent text changes

3. **Memory Management**
   - Destroy unused text objects
   - Share bitmap fonts when possible
   - Clear text caches when appropriate

## See Also

- {@link Text} For canvas text rendering
- {@link BitmapText} For high-performance text
- {@link HTMLText} For HTML-based text
- {@link TextStyle} For text styling options
- {@link BitmapFont} For bitmap font management
