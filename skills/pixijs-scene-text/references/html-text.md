# HTMLText

Text rendered via an SVG `<foreignObject>` wrapping an HTML fragment. This gives you the full HTML/CSS box model for typography; real `<b>`, `<i>`, `<br>`, `<div>`, line-breaks, nested styles, emoji; rasterized to a texture. Use `HTMLText` for rich formatting, mixed content, inline custom tags, or markup that the canvas `Text` class can't express.

## Quick Start

```ts
const rich = new HTMLText({
  text: "<b>Bold</b> and <i>italic</i> text",
  style: {
    fontFamily: "Arial",
    fontSize: 24,
    fill: 0x333333,
    wordWrap: true,
    wordWrapWidth: 400,
  },
});

app.stage.addChild(rich);
```

`HTMLText` is a leaf. It uses `HTMLTextStyle`, which is `TextStyle` minus `leading`, `textBaseline`, `trim`, and `filters` (those four are unsupported by the SVG rendering path). Rendering is asynchronous; the text may not appear on the same frame it's created.

## Construction

```ts
const minimal = new HTMLText({ text: "<b>Hello</b>" });

const styled = new HTMLText({
  text: "<i>Styled</i>",
  style: { fontSize: 24, fill: 0xffffff },
  anchor: 0.5,
  resolution: 2,
  autoGenerateMipmaps: true,
  textureStyle: { scaleMode: "linear" },
});
```

### HTMLTextOptions

`HTMLText` extends the base `TextOptions` (typed with `HTMLTextStyle` / `HTMLTextStyleOptions` as its style) and adds HTML-specific fields. Inherited `text`, `style`, `anchor`, `resolution`, and `roundPixels` behave as documented in `references/text.md` — only the HTMLText-specific additions are listed here.

| Option                | Type                                    | Default                                            | Description                                                                                                                                               |
| --------------------- | --------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `style`               | `HTMLTextStyle \| HTMLTextStyleOptions` | `new HTMLTextStyle()`                              | HTML text style object or options. Matches `TextStyle` minus `leading`, `textBaseline`, `trim`, and `filters`. Adds `cssOverrides` for raw CSS injection. |
| `textureStyle`        | `TextureStyle \| TextureStyleOptions`   | `undefined`                                        | Override the generated texture's scale mode, wrap, etc. (@advanced)                                                                                       |
| `autoGenerateMipmaps` | `boolean`                               | `TextureSource.defaultOptions.autoGenerateMipmaps` | Generate mipmaps for the text texture; improves quality when scaled down.                                                                                 |

All base text options (`text`, `anchor`, `resolution`, `roundPixels`) are inherited from `TextOptions` — see `references/text.md`.

All `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

> Both `textureStyle` and `autoGenerateMipmaps` are also exposed as runtime instance properties, but mutating them after construction requires calling `htmlText.onViewUpdate()` to trigger a re-render.

## Core Patterns

### Custom tags via `tagStyles`

```ts
const message = new HTMLText({
  text: "<warning>Low power</warning> <custom>Press any key</custom>",
  style: {
    fontFamily: "Arial",
    fontSize: 28,
    fill: 0xffffff,
    tagStyles: {
      warning: { fill: 0xff3333, fontWeight: "bold" },
      custom: { fill: 0x66ccff, fontStyle: "italic" },
    },
  },
});
```

`tagStyles` maps custom (or standard) HTML tag names to style overrides. Inherit is automatic; a nested `<warning>` inside `<custom>` inherits the outer style. Standard tags like `<b>`, `<i>`, `<u>`, `<br>` work as expected.

### Raw CSS overrides

```ts
const styled = new HTMLText({
  text: "Underlined shadowed text",
  style: { fontSize: 24, fill: 0xffffff },
});

styled.style.addOverride("text-decoration: underline");
styled.style.addOverride("text-shadow: 2px 2px 4px rgba(0,0,0,0.5)");
```

For CSS properties without a `TextStyle` equivalent, use `addOverride` to inject raw CSS. Useful for `text-decoration`, `text-transform`, `letter-spacing` beyond what TextStyle exposes, and any other CSS property supported inside SVG `<foreignObject>`.

### Word wrap

```ts
const wrapped = new HTMLText({
  text: "A long paragraph of HTML text that should wrap automatically",
  style: {
    fontFamily: "Arial",
    fontSize: 20,
    fill: 0xffffff,
    wordWrap: true,
    wordWrapWidth: 300,
    align: "center",
  },
});
```

Word wrap is handled by the browser's SVG layout, so it supports everything CSS wrapping supports; including hyphenation, justification, and RTL scripts when the font and the rendered CSS support them.

### Resolution and mipmaps

```ts
const crisp = new HTMLText({
  text: "Retina crisp",
  style: { fontSize: 32, fill: 0xffffff },
  resolution: 2,
  autoGenerateMipmaps: true,
});
```

Same pattern as canvas `Text`: `resolution` controls the rasterized texture density; `autoGenerateMipmaps` improves quality when drawn smaller than native.

### Async rendering

```ts
const htmlText = new HTMLText({
  text: "Initial content",
  style: { fontSize: 24, fill: 0xffffff },
});
htmlText.visible = false;
app.stage.addChild(htmlText);

app.ticker.addOnce(() => {
  htmlText.visible = true;
});
```

HTMLText renders to an SVG blob, then a texture. The texture is available one frame after creation. If you need the text ready before showing it, add it while hidden and reveal it on the next tick.

## Common Mistakes

### [HIGH] Updating HTMLText content every frame

Wrong:

```ts
app.ticker.add(() => {
  htmlText.text = `Score: ${score}`;
});
```

Correct:

```ts
const bitmap = new BitmapText({ text: "Score: 0", style });
app.ticker.add(() => {
  bitmap.text = `Score: ${score}`;
});
```

Each `HTMLText.text` assignment re-renders the SVG, rasterizes it, and uploads to the GPU. At 60fps this is far too expensive. Use `BitmapText` for any text that changes per-frame.


### [HIGH] Missing CORS headers on fonts

If the HTML references a web font loaded from a different origin without CORS headers, the SVG `<foreignObject>` is tainted and the rasterization fails (or falls back to a default font). Host fonts on the same origin or include `Access-Control-Allow-Origin`.


### [MEDIUM] Expecting HTMLText frame on creation

Wrong:

```ts
const text = new HTMLText({ text: "Hello", style });
text.x = (app.screen.width - text.width) / 2; // text.width is 0 here
```

Correct:

```ts
const text = new HTMLText({ text: "Hello", style });
app.ticker.addOnce(() => {
  text.x = (app.screen.width - text.width) / 2;
});
```

HTMLText measurement happens asynchronously. Defer layout calculations to the next frame, or use canvas `Text` when you need immediate metrics.


## API Reference

- [HTMLText](https://pixijs.download/release/docs/scene.HTMLText.html.md)
- [HTMLTextStyle](https://pixijs.download/release/docs/text.HTMLTextStyle.html.md)
- [HTMLTextSystem](https://pixijs.download/release/docs/rendering.HTMLTextSystem.html.md)
