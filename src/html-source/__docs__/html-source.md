---
title: HTML Source
category: rendering
description: Learn how to render live HTML elements and DOM snapshots as PixiJS textures with HTMLSource and ElementImageSource using the experimental HTML-in-Canvas browser APIs.
---

# HTML Source

The HTML source module renders DOM elements into textures. {@link HTMLSource} mirrors a live element into the GPU every time the browser repaints it, so forms stay editable, links stay clickable, and CSS animations keep running. {@link ElementImageSource} wraps a frozen snapshot that never changes. HTML source support is not included in the base `pixi.js` import; you must import from `pixi.js/html-source`.

> [!WARNING]
> This module is **experimental**. It relies on the HTML-in-Canvas API, which Chrome turns on by default from Chrome 157. Earlier Chrome versions need the origin trial or a browser flag, and other browsers don't support it yet. Without it, the texture uploader throws on the first render. The API may change between minor releases.

## Rendering a live element

The element must be inside the renderer's `<canvas>`. `HTMLSource` infers the owning canvas from the element's nearest `<canvas>` ancestor, sets `content="drawable"` on it (plus `layoutsubtree` for Chrome before 155), sets `drawable` on the element, listens for the canvas `paint` event, and requests one initial paint.

```ts
import { Application, Sprite } from 'pixi.js';
import { HTMLSource } from 'pixi.js/html-source';

const app = new Application();
await app.init({ resizeTo: window });
document.body.appendChild(app.canvas);

const form = document.createElement('form');
form.innerHTML = '<input value="still editable" />';
app.canvas.appendChild(form); // must be inside the canvas

const source = new HTMLSource({ resource: form });
const sprite = Sprite.from(source);

sprite.anchor.set(0.5);
sprite.position.set(app.screen.width / 2, app.screen.height / 2);
app.stage.addChild(sprite);
```

The constructor throws if the element has no canvas ancestor, so append the element to the canvas first.

### Nested elements

In Chrome 155+, the element can sit anywhere inside the canvas. Each `drawable` element captures its subtree, minus any nested `drawable` descendants, so a parent and a child can be separate sources:

```ts
const panel = document.createElement('div');
const button = document.createElement('button');

panel.appendChild(button);
app.canvas.appendChild(panel);

const panelSource = new HTMLSource({ resource: panel }); // panel without the button
const buttonSource = new HTMLSource({ resource: button }); // the button on its own
```

Chrome before 155 only draws direct children of the canvas. WebGPU in Chrome 156 still only accepts direct children and throws for a nested element; WebGL accepts both.

## Hit testing and accessibility

WebGL and WebGPU don't tell the browser where the element ended up on screen. In Chrome 155+, the element isn't hit-testable and has no bounds for assistive technology until you report its drawn position with `canvas.updateElementGeometry()`. The `canvasTransform` maps the element's border box to canvas CSS pixels. Call it whenever the sprite moves:

```ts
import type { HTMLSourceCanvas } from 'pixi.js/html-source';

const canvas = app.canvas as HTMLSourceCanvas;

app.ticker.add(() => {
  const { a, b, c, d, tx, ty } = sprite.getGlobalTransform();
  const transform = new DOMMatrix([a, b, c, d, tx, ty]).translate(
    -sprite.anchor.x * sprite.texture.width,
    -sprite.anchor.y * sprite.texture.height,
  );

  canvas.updateElementGeometry?.(form, { canvasTransform: transform });
});
```

This assumes one Pixi world unit per CSS pixel (`resolution: 1`, or `autoDensity: true`). Chrome before 155 has no `updateElementGeometry`; set the same matrix as the element's CSS `transform` instead, with the element at the canvas origin and `transform-origin: 0 0`. The interactive form example does both.

## Feature detection

The HTML-in-Canvas API is not available in every browser. Check for `requestPaint` on the canvas before relying on it:

```ts
import type { HTMLSourceCanvas } from 'pixi.js/html-source';

const canvas = app.canvas as HTMLSourceCanvas;

if (!canvas.requestPaint) {
  // Fall back to a static image or a DOMContainer overlay.
}
```

When the API is missing, `source.requestPaint()` returns `false` and the first render throws one of these errors:

```
[HTMLSource] WebGLRenderingContext.texElementSubImage2D is not available. Enable the browser HTML-in-Canvas API before using HTMLSource.
[HTMLSource] GPUQueue.drawElementImageToTexture is not available. Enable the browser HTML-in-Canvas API before using HTMLSource.
```

PixiJS picks the upload call the browser has: `texElementSubImage2D` and `drawElementImageToTexture` in Chrome 155+, and the older `texElementImage2D` and `copyElementImageToTexture` signatures in Chrome 150-154 and earlier.

## Repainting

A live element updates whenever the browser fires a `paint` event for it. Content that changes every frame needs a paint request each frame. Turn off the initial request and drive repaints from the ticker:

```ts
const source = new HTMLSource({ resource: clock, autoRequestPaint: false });
const sprite = Sprite.from(source);

app.ticker.add(() => {
  clock.textContent = new Date().toLocaleTimeString();
  source.requestPaint();
});
```

`source.isReady` is `false` until the first paint lands, so the texture is blank before then. Sources created with `autoUpdate: false` are ready immediately and never track later DOM changes.

## Options

All {@link TextureSourceOptions} apply. `resource` is required.

```ts
const source = new HTMLSource({
  resource: element,
  canvas: undefined, // owning canvas; inferred from the nearest <canvas> ancestor (default)
  autoLayout: true, // set `content="drawable"` and `layoutsubtree` on the canvas (default: true)
  autoUpdate: true, // re-upload on canvas `paint` events (default: true)
  autoRequestPaint: true, // request one initial paint (default: true)
});
```

Change the defaults for every source through `HTMLSource.defaultOptions`:

```ts
HTMLSource.defaultOptions.autoUpdate = false;
```

## Snapshots with ElementImageSource

`captureElementImage()` freezes an element's current pixels into an immutable {@link ElementImage}. Wrap it in an {@link ElementImageSource} for a texture that never repaints and can outlive the element. This suits transitions, trails, and "shatter" effects.

```ts
import { Sprite } from 'pixi.js';
import { ElementImageSource } from 'pixi.js/html-source';
import type { HTMLSourceCanvas } from 'pixi.js/html-source';

const canvas = app.canvas as HTMLSourceCanvas;
const snapshot = canvas.captureElementImage(element);

const source = new ElementImageSource({ resource: snapshot, autoClose: true });
app.stage.addChild(Sprite.from(source));
```

`autoClose` (default: `false`) calls `snapshot.close()` when the source is destroyed. Leave it off when several sources share one snapshot and close the snapshot yourself after the last source is destroyed.

## Slicing and meshes

Both sources are ordinary texture sources, so they work with `Texture` frames and meshes:

```ts
import { Rectangle, Texture } from 'pixi.js';

const chunk = new Texture({
  source,
  frame: new Rectangle(0, 0, 64, 64),
});
```

## Automatic detection

Once `pixi.js/html-source` is imported, `Texture.from` and `Sprite.from` accept a generic HTML element or an `ElementImage` directly. These sources register at the lowest priority, so image, video, and canvas elements keep their dedicated sources. Construct the source yourself when you need options or non-HTML elements such as SVG.

```ts
const sprite = Sprite.from(elementAlreadyInTheCanvas);
```

## Cleanup

```ts
source.destroy();
```

`HTMLSource.destroy()` removes the `paint` listener from the canvas. `ElementImageSource.destroy()` closes the snapshot only when `autoClose` was set.

## API reference

- {@link HTMLSource} - live element texture source
- {@link HTMLSourceOptions} - constructor options for HTMLSource
- {@link ElementImageSource} - immutable snapshot texture source
- {@link ElementImageSourceOptions} - constructor options for ElementImageSource
- {@link HTMLSourceCanvas} - canvas type with the experimental `requestPaint`, `captureElementImage`, and `updateElementGeometry` members
- {@link ElementImage} - snapshot returned by `captureElementImage()`
