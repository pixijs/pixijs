---
name: text
description: >
  Render text in PixiJS with four engines. Text (canvas-rendered, TextStyle,
  high quality, tagStyles for inline markup, expensive to update). BitmapText
  (pre-rendered atlas, MSDF/SDF, BitmapFont.install, fast for dynamic content).
  HTMLText (HTML/CSS via SVG foreignObject, HTMLTextStyle, tagStyles, async
  rendering). SplitText & SplitBitmapText (experimental; per-character/word/line
  animation, charAnchor/wordAnchor/lineAnchor). TextStyle options: fontFamily,
  fontSize, fill, stroke, dropShadow, wordWrap, wordWrapWidth, align,
  letterSpacing, lineHeight, padding, tagStyles. resolution and
  autoGenerateMipmaps for quality. Use when the user asks about rendering text,
  labels, scores, timers, rich text, HTML text, bitmap fonts, MSDF fonts, text
  styling, word wrap, text alignment, drop shadows on text, tagged/inline text
  markup, per-character animation, split text, custom fonts, or font loading.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  requires: "pixijs, core-concepts"
  sources: "pixijs/pixijs:src/scene/text/Text.ts, pixijs/pixijs:src/scene/text/TextStyle.ts, pixijs/pixijs:src/scene/text-bitmap/BitmapText.ts, pixijs/pixijs:src/scene/text-html/HTMLText.ts, pixijs/pixijs:src/scene/text-split/SplitText.ts, pixijs/pixijs:src/scene/text-split/SplitBitmapText.ts, pixijs/pixijs:src/scene/text-split/AbstractSplitText.ts"
---

## When to Use This Skill

Apply when the user needs to display text, labels, scores, or formatted content, whether using canvas rendering, bitmap fonts, or HTML/CSS-based text.

**Related skills:** For loading custom fonts use **asset-loading**; for text-to-texture workflows use **sprite**; for text rendering performance use **performance**; for anchoring and transforms use **core-concepts**.

This skill builds on pixijs and core-concepts. Read them first.

## Setup

```ts
import { Text, BitmapText, HTMLText } from 'pixi.js';

const text = new Text({
    text: 'Hello PixiJS',
    style: { fontSize: 24, fill: 0xffffff },
});
app.stage.addChild(text);
```

All text classes are leaf nodes (`allowChildren` is false). All use options objects for construction.

**Choosing the right text class:**

| Class | Best for | Cost of updates | Styling flexibility |
|-------|----------|-----------------|---------------------|
| Text | Static/infrequent labels | High (canvas re-render + GPU upload) | Full CSS font support, tagStyles |
| BitmapText | Scores, timers, dynamic content | Low (geometry update only) | Limited to pre-rendered glyphs |
| HTMLText | Rich formatted text | High (SVG render + GPU upload) | Full HTML/CSS, tagStyles |
| SplitText | Per-character animation (canvas) | Medium (wraps Text instances) | Same as Text |
| SplitBitmapText | Per-character animation (bitmap) | Low-Medium (wraps BitmapText) | Same as BitmapText |

## Core Patterns

### Canvas Text (Text)

```ts
import { Text, TextStyle } from 'pixi.js';

const style = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fill: 0xff1010,
    stroke: { color: '#4a1850', width: 5 },
    dropShadow: {
        color: '#000000',
        blur: 4,
        distance: 6,
        angle: Math.PI / 6,
    },
    align: 'center',
    wordWrap: true,
    wordWrapWidth: 300,
    lineHeight: 45,
    letterSpacing: 2,
    padding: 4,
});

const text = new Text({ text: 'Styled Text', style, anchor: 0.5 });
```

Key TextStyle properties:
- `fontFamily`, `fontSize`, `fontWeight`, `fontStyle`
- `fill`: color, gradient, or pattern (same FillInput as Graphics)
- `stroke`: `{ color, width }` object
- `dropShadow`: `{ color, blur, distance, angle, alpha }`
- `wordWrap`, `wordWrapWidth`, `breakWords`
- `align`: `'left'`, `'center'`, `'right'`, `'justify'`. Only affects multi-line text.
- `lineHeight`, `letterSpacing`, `leading`
- `padding`: extra space around the text texture. Increase when stroke or shadow gets clipped.
- `textBaseline`, `whiteSpace`, `trim`
- `tagStyles`: per-tag inline styling (see below)

Text renders to an internal canvas, then uploads as a GPU texture. This makes initial render and updates expensive but produces high-quality output.

#### Tagged text (tagStyles on canvas Text)

Canvas `Text` supports inline per-tag styling via `tagStyles` on `TextStyle`:

```ts
const text = new Text({
    text: '<red>Warning:</red> system <b>overloaded</b>',
    style: {
        fontSize: 24,
        fill: 0xffffff,
        tagStyles: {
            red: { fill: 0xff0000 },
            b: { fontWeight: 'bold' },
        },
    },
});
```

Tags are only parsed when `tagStyles` has entries. If `tagStyles` is empty or undefined, `<` characters are treated as literal text. Nested tags are supported via a style stack; inner tags inherit from outer tags.

#### Font loading

Load custom fonts via the Assets API before creating Text:

```ts
import { Assets, Text } from 'pixi.js';

await Assets.load({
    src: 'my-font.woff2',
    data: { family: 'MyFont' },
});

const text = new Text({
    text: 'Custom Font',
    style: { fontFamily: 'MyFont', fontSize: 36, fill: 0xffffff },
});
```

Supported formats: `woff2` (preferred), `woff`, `ttf`, `otf`. The `data` object maps to FontFace properties: `family`, `display`, `style`, `weight`, `stretch`, `unicodeRange`, `featureSettings`, `variant`.

#### Resolution and mipmaps

```ts
const text = new Text({
    text: 'Sharp Text',
    style: { fontSize: 36, fill: 0xffffff },
    resolution: 2,
    autoGenerateMipmaps: true,
});
```

- `resolution`: pixel density of the rendered text texture. Defaults to the renderer's resolution. Higher values produce sharper text on high-DPI displays.
- `autoGenerateMipmaps`: improves quality when text is scaled down. Without it, downscaled text can shimmer during animation. HTMLText also supports this.

### BitmapText

```ts
import { BitmapText, BitmapFont, Assets } from 'pixi.js';

// Option 1: Dynamic font (generated from system fonts at runtime)
const dynamicText = new BitmapText({
    text: 'Score: 0',
    style: { fontFamily: 'Arial', fontSize: 32, fill: 0xffffff },
});

// Option 2: Pre-installed font
BitmapFont.install({
    name: 'GameFont',
    style: { fontFamily: 'Arial', fontSize: 48 },
});

const installedText = new BitmapText({
    text: 'Level 1',
    style: { fontFamily: 'GameFont', fontSize: 48, fill: 0x00ff00 },
});

// Option 3: Loaded bitmap font (MSDF/SDF for crisp scaling)
await Assets.load('fonts/myFont.fnt');

const loadedText = new BitmapText({
    text: 'MSDF Text',
    style: { fontFamily: 'myFont', fontSize: 36 },
});
```

BitmapText renders glyphs from a pre-generated texture atlas. Updating `text` is cheap; it only repositions quads.

Dynamic fonts are generated on first use from system fonts. BitmapFont reuses existing fonts when possible, scaling up/down from the closest available size.

MSDF (Multi-channel Signed Distance Field) fonts stay crisp at any size. Generate them with tools like AssetPack.

#### BitmapText limitations

- **Resolution is not mutable.** `text.resolution = 2` logs a warning; resolution is fixed by the BitmapFont at creation time.
- **Missing glyphs are silently skipped.** Characters not in the font atlas won't render. Text may appear incomplete but won't crash.
- **Large character sets are impractical.** CJK, Arabic, or emoji-heavy content can exceed GPU texture size limits. Use Text or HTMLText for unpredictable character sets.

### HTMLText

```ts
import { HTMLText } from 'pixi.js';

const htmlText = new HTMLText({
    text: '<b>Bold</b> and <i>italic</i> text',
    style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0x333333,
        wordWrap: true,
        wordWrapWidth: 300,
        tagStyles: {
            b: { fontWeight: 'bold', fill: 0xff0000 },
            i: { fontStyle: 'italic', fill: 0x0000ff },
            custom: { fontSize: 32, fill: '#00ff00' },
        },
    },
});
```

HTMLText renders via SVG `foreignObject`, supporting real HTML tags and CSS. The `tagStyles` property maps HTML tag names to style overrides.

It handles line breaks, word wrap, and mixed formatting natively. Rendering is expensive (similar to Text), so avoid frequent updates.

**Async rendering:** HTMLText renders via SVG, so the text won't appear on the frame it's created. It typically appears one frame later. If you need the text ready before showing it, add it while hidden (`visible = false`) and show it after a frame.

For CSS properties without a TextStyle equivalent, use `addOverride` to inject raw CSS:

```ts
htmlText.style.addOverride('text-shadow: 2px 2px 4px rgba(0,0,0,0.5)');
htmlText.style.addOverride('text-decoration: underline');
```

### SplitText & SplitBitmapText

> **Experimental:** These classes are new and may evolve in future versions.

```ts
import { SplitText, SplitBitmapText, BitmapFont } from 'pixi.js';

// Canvas-based splitting
const split = new SplitText({
    text: 'Animate Me',
    style: { fontSize: 48, fill: 0xffffff },
    charAnchor: { x: 0.5, y: 1 },
});

app.stage.addChild(split);

// Bitmap-based splitting (better performance)
BitmapFont.install({
    name: 'GameFont',
    style: { fontFamily: 'Arial', fontSize: 48 },
});

const splitBitmap = new SplitBitmapText({
    text: 'Fast Animate',
    style: { fontFamily: 'GameFont', fontSize: 48 },
    charAnchor: { x: 0.5, y: 1 },
});
```

Both classes break text into accessible containers for lines, words, and characters. The API is identical; only the underlying renderer differs.

| Class | Base Type | Best For |
|-------|-----------|----------|
| SplitText | Text | Richly styled split text |
| SplitBitmapText | BitmapText | High-performance split text |

Properties:
- `lines`, `words`, `chars`: arrays of Container instances.
- `lineAnchor`, `wordAnchor`, `charAnchor`: 0-1 normalized anchor for transform origin.
- `autoSplit` (default true): re-splits when text or style changes.

#### Animating characters

```ts
split.chars.forEach((char, i) => {
    char.onRender = () => {
        char.y = Math.sin(performance.now() / 200 + i) * 5;
    };
});
```

#### Creating from existing text

Convert existing Text or BitmapText objects into split versions:

```ts
import { Text, SplitText, BitmapText, SplitBitmapText } from 'pixi.js';

const text = new Text({ text: 'Standard', style: { fontSize: 32 } });
const splitFromText = SplitText.from(text);

const bitmap = new BitmapText({
    text: 'Bitmap',
    style: { fontFamily: 'GameFont', fontSize: 32 },
});
const splitFromBitmap = SplitBitmapText.from(bitmap);
```

Each character in SplitText is a Text instance, so the same performance caveats apply. SplitBitmapText uses BitmapText for characters, making it more suitable for dynamic content. Both are best for animation effects on static strings.

## Common Mistakes

### [HIGH] Updating Text content every frame

Wrong:
```ts
app.ticker.add(() => {
    scoreText.text = `Score: ${score}`;
});
```

Correct:
```ts
// Use BitmapText for frequently changing content
const scoreText = new BitmapText({
    text: 'Score: 0',
    style: { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff },
});

app.ticker.add(() => {
    scoreText.text = `Score: ${score}`;
});
```

Each Text update re-renders the entire string to a canvas and uploads it to the GPU. At 60fps this creates massive overhead. BitmapText only repositions pre-rendered glyph quads, making updates near-free.

If you must use canvas Text, only update when the value actually changes:

```ts
app.ticker.add(() => {
    const newText = `Score: ${score}`;
    if (scoreText.text !== newText) {
        scoreText.text = newText;
    }
});
```

Source: src/__docs__/concepts/performance-tips.md

### [HIGH] Synchronous Text destroy and recreate

Destroying a Text object and immediately creating a new one in the same frame invalidates GPU caches, causing frame drops. Stagger destruction across frames:

```ts
// Wrong: destroy and recreate in same frame
oldText.destroy();
const newText = new Text({ text: 'new', style });

// Correct: defer destruction
setTimeout(() => oldText.destroy(), 0);
const newText = new Text({ text: 'new', style });
```

Or better, reuse the same Text instance by changing its `text` and `style` properties.

Source: GitHub issue #11927

### [HIGH] Using positional constructor args for Text

Wrong:
```ts
const text = new Text('Hello', { fontSize: 24 });
```

Correct:
```ts
const text = new Text({ text: 'Hello', style: { fontSize: 24 } });
```

v8 Text uses an options object. The positional `(string, style)` constructor form from v7 is not supported.

Source: src/__docs__/migrations/v8.md

### [HIGH] Not importing text-bitmap before loading bitmap fonts

Wrong:
```ts
import { Assets } from 'pixi.js';
await Assets.load('font.fnt'); // silently fails or returns raw data
```

Correct:
```ts
import 'pixi.js/text-bitmap';
import { Assets } from 'pixi.js';
await Assets.load('font.fnt');
```

The `pixi.js/text-bitmap` side-effect import registers the bitmap font loader and parser. Without it, `.fnt` and `.xml` bitmap font files are not recognized by the asset system.

**Tension note (cross-skill)**: This applies only to custom builds using selective imports. The standard `import { ... } from 'pixi.js'` bundle includes all extensions. If you use `manageImports` or tree-shaking, you must explicitly import extension modules like `pixi.js/text-bitmap`, `pixi.js/text-html`, etc.

Source: src/__docs__/migrations/v8.md

---

See also: core-concepts (anchor, transforms), asset-loading (loading fonts), performance (text caching strategies), sprite (Sprite.from for text-to-texture workflows)

## Learn More

- [Text](https://pixijs.download/release/docs/scene.Text.html.md)
- [BitmapText](https://pixijs.download/release/docs/scene.BitmapText.html.md)
- [HTMLText](https://pixijs.download/release/docs/scene.HTMLText.html.md)
