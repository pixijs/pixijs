---
title: Text Style
description: Learn how to use the TextStyle class in PixiJS to style text objects, including fills, strokes, shadows, and more.
category: scene
---

# Text style

`TextStyle` controls how text looks: font, color, stroke, shadow, alignment, word wrap, line spacing. One `TextStyle` can be shared across multiple `Text` objects; changing the style updates all text that uses it.

```ts
import { TextStyle } from 'pixi.js';

const style = new TextStyle({
  fontFamily: 'Arial',
  fontSize: 30,
  fill: '#ffffff',
  stroke: { color: '#000000', width: 3 },
  dropShadow: {
    color: '#000000',
    blur: 5,
    distance: 4,
    angle: Math.PI / 4,
    alpha: 0.5,
  },
});

const label = new Text({
  text: 'Score: 1234',
  style,
});
```

## Fill and stroke

Fills and strokes work the same way as in the `Graphics` class. See [Graphics fills](../graphics/graphics-fill.md) for details.

```ts
// Using a number
const fill = 0xff0000;

// Using a hex string
const fill = '#ff0000';

// Using an array
const fill = [255, 0, 0];

// Using a Color object
const fill = new Color('red');

// Using a gradient
const fill = new FillGradient({
  type: 'linear',
  colorStops: [
    { offset: 0, color: 'yellow' },
    { offset: 1, color: 'green' },
  ],
});

// Using a pattern
const txt = await Assets.load<Texture>('https://pixijs.com/assets/bg_scene_rotate.jpg');
const fill = new FillPattern(txt, 'repeat');

// Use the fill in a TextStyle
const style = new TextStyle({
  fontSize: 48,
  fill: fill,
  stroke: {
    fill,
    width: 4,
  },
});
```

## Drop shadow

In v8, `dropShadow` is a configuration object (not individual flat properties like in v7). You can modify individual shadow properties after creation:

```ts
const style = new TextStyle({
  dropShadow: {
    color: '#000000',
    alpha: 0.5,
    angle: Math.PI / 4,
    blur: 5,
    distance: 4,
  },
});

style.dropShadow.color = '#ff0000'; // Change shadow color
```

## Tag styles

`tagStyles` enables per-tag inline styling for both `Text` and `HTMLText`. When set, markup like `<red>text</red>` applies the matching style override to that span of text.

```ts
const style = new TextStyle({
  fontSize: 24,
  fill: '#ffffff',
  tagStyles: {
    red: { fill: 'red' },
    blue: { fill: 'blue' },
    big: { fontSize: 48 },
  },
});

const text = new Text({
  text: '<red>Warning:</red> normal <big>BIG</big>',
  style,
});
```

Tags are only parsed when `tagStyles` has entries. If `tagStyles` is empty or undefined, `<` characters are treated as literal text. Nested tags are supported; inner tags inherit from outer tags.

For `HTMLText`, `tagStyles` uses `HTMLTextStyleOptions` (which includes CSS-specific properties). For canvas `Text`, it uses `TextStyleOptions`.

---

## API reference

- {@link TextStyle}
- {@link Text}
- {@link BitmapText}
- {@link HTMLText}
- {@link FillStyle}
- {@link StrokeStyle}
