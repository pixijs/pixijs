# PixiJS HTMLText

![npm (scoped)](https://img.shields.io/npm/v/@pixi/text-html)

An alternative to `PIXI.Text` that works with both WebGL and Canvas, however, it has some advantages:

* Supports [HTML tags](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML) for styling such as `<strong>`, or `<em>`, as well as `<span style="">`
* Better support for emojis and other HTML layout features, better compatibility with CSS line-height and letter-spacing.

Disadvantages:

* Unlike `PIXI.Text`, HTMLText rendering will vary slightly between platforms and browsers. HTMLText uses SVG/DOM to render text and not Context2D's fillText like `PIXI.Text`.
* Performance and memory usage is on-par with `PIXI.Text` (that is to say, slow and heavy)
* Only works with browsers that support [`<foreignObject>`](https://caniuse.com/?search=foreignObject).

## Usage

```js
import { HTMLText } from 'pixi.js';

const text = new HTMLText("Hello World", { fontSize: 20 });
```

_**Important:** Because the HTMLText object takes a raw HTML string, it's represents a potential vector for [XSS](https://en.wikipedia.org/wiki/Cross-site_scripting), it's strongly encourage you santize input especially if you're accepting user-strings._

### Custom Fonts

Because rendering within a `<foreignObject>` element does not have access to fonts available in the current document, therefore, you need to load the fonts explicitly.

```js
const text = new HTMLText("Hello World", { fontFamily: 'Custom' });

await text.style.loadFont('./path/to/custom-regular.ttf', { family: 'Custom' });
```

**Multiple Weights**

```js
const text = new HTMLText("Hello <b>World</b>", { fontFamily: 'Custom' });

await Promise.all([
    text.style.loadFont('./path/to/custom-regular.ttf', { family: 'Custom' }),
    text.style.loadFont('./path/to/custom-bold.ttf', { family: 'Custom', weight: 'bold' });
]);
```

## Styles

Not all styles and values are compatible between PIXI.Text, mainly because Text is rendered using a DOM element instead of Context2D's fillText API.

**Supported**

* `fill`
* `fontFamily`
* `fontSize`
* `fontWeight`
* `fontStyle`
* `fontVariant`
* `letterSpacing` †
* `align` (also supports `justify` value)
* `padding`
* `breakWords`
* `lineHeight` †
* `whiteSpace` (also supports `nowrap`, `pre-wrap` values)
* `wordWrap`
* `wordWrapWidth`
* `strokeThickness` ‡
* `dropShadow` ‡
* `dropShadowAngle`
* `dropShadowDistance`
* `dropShadowBlur` ‡
* `dropShadowColor`
* `stroke`
* `strokeThickness`

† _Values may differ slightly from PIXI.Text rendering._
‡ _Appearance may differ slightly between different browsers._

**Unsupported**

* `fillGradientStops`
* `fillGradientType`
* `lineJoin`
* `miterLimit`
* `textBaseline`
* `trim`
* `leading`
