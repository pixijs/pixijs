# HTMLText

`HTMLText`: what `HTMLTextStyle` drops and adds, fonts it can see, and its asynchronous texture with synchronous size.

```ts
import { Application, HTMLText } from "pixi.js";

declare const app: Application;

const rich = new HTMLText({
  text: "<b>Bold</b>, <i>italic</i> and <warning>Low power</warning>",
  style: {
    fontSize: 24,
    fill: 0xffffff,
    wordWrap: true,
    wordWrapWidth: 400,
    tagStyles: { warning: { fill: 0xff3333, fontWeight: "bold" } },
  },
});
rich.x = (app.screen.width - rich.width) / 2;
app.stage.addChild(rich);

rich.style.addOverride("text-decoration: underline");
```

- `HTMLTextStyle` is `TextStyle` minus `leading`, `textBaseline`, `trim` and `filters` (unsupported by the SVG path). It adds `cssOverrides`, set with `style.addOverride("css-property: value")`, for CSS with no `TextStyle` equivalent (`text-decoration`, `text-transform`, `text-shadow`, anything supported inside SVG `<foreignObject>`).
- `tagStyles` maps custom or standard tag names to style overrides; nested tags inherit from outer ones. Standard `<b>`, `<i>`, `<u>`, `<br>` work as in HTML. Wrapping is done by the browser's layout, so CSS hyphenation, justification and RTL work when the font and CSS support them.
- Options are those of [Text](text.md), including `resolution`, `textureStyle` (scale mode only) and `autoGenerateMipmaps`. The last two are also instance properties, but they are read only when a new texture is generated (a text, style or resolution change); `onViewUpdate()` alone does not regenerate it.

## Size now, pixels later

`width`/`height` are measured synchronously from the HTML, so layout code can use them right after construction; waiting a tick before positioning gains nothing. Only the pixels are asynchronous: HTMLText renders to an SVG image, then a texture, and that work starts the first time the object is rendered while visible; the texture shows up a few frames later. A `visible = false` HTMLText never starts it, so hiding it and revealing on the next tick just delays the text further. To fade it in, keep it visible with `alpha = 0`.

## Fonts must come through Assets

HTMLText is drawn as an SVG image, which cannot see the page's fonts. It embeds only fonts loaded with `Assets.load` (fetched and inlined as base64 `@font-face`). A font from a CSS `@font-face` rule or a Google Fonts `<link>` renders in `Text` but falls back to a default font in HTMLText. Load it with `await Assets.load({ src: "fonts/Hero.woff2", data: { family: "Hero" } })` and use `fontFamily: "Hero"`. Cross-origin font files also need CORS headers (`Access-Control-Allow-Origin`), or the embed fails.
