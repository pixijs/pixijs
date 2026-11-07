---
name: pixijs-html-source
description: "Use this skill when rendering live HTML/DOM elements (or frozen snapshots of them) as PixiJS v8 textures via the EXPERIMENTAL HTML-in-Canvas browser APIs. Covers the pixi.js/html-source import, feature detection with canvas.requestPaint, HTMLSource for a live, repainting element (autoLayout/autoUpdate/autoRequestPaint, requestPaint, isReady, defaultOptions, the inside-the-canvas + content=\"drawable\" rule, nested drawable elements), hit testing with canvas.updateElementGeometry, ElementImageSource for an immutable captureElementImage() snapshot (autoClose), using the source on a Sprite/Texture/Mesh, fallback-only auto-detection via Texture.from, uploader errors, and cleanup. Triggers on: HTMLSource, ElementImageSource, ElementImage, HTML in canvas, render DOM to texture, render HTML to texture, texElementSubImage2D, drawElementImageToTexture, texElementImage2D, copyElementImageToTexture, updateElementGeometry, content=drawable, layoutsubtree, HTMLSourceOptions, ElementImageSourceOptions, HTMLSourceCanvas."
license: MIT
---

`HTMLSource` and `ElementImageSource` turn a DOM element into a `TextureSource` you can use anywhere a normal texture works: on a `Sprite`, as a `Texture` frame, or mapped onto a `Mesh`. `HTMLSource` mirrors a live element's pixels into the GPU (the element stays editable and clickable in the browser); `ElementImageSource` wraps an immutable snapshot that never repaints. Both live in `pixi.js/html-source`; importing from that path registers their extensions.

> These sources rely on the experimental HTML-in-Canvas browser proposal and are marked EXPERIMENTAL in PixiJS v8. Chrome turns the browser API on by default from Chrome 157; earlier Chrome needs the origin trial or a flag, and other browsers lack it. Without it the texture uploader throws on first render, so feature-detect with `canvas.requestPaint` before relying on it. The API may change between minor releases.

Assumes familiarity with `pixijs-scene-sprite` and textures. These are texture *sources*, not display objects: wrap them in a `Sprite` (or `Texture`/`Mesh`) to put them on screen. Not available in Web Workers; a worker has no DOM to capture.

## Quick Start

```ts
import { Application, Sprite } from "pixi.js";
import { HTMLSource } from "pixi.js/html-source";

const app = new Application();
await app.init({ resizeTo: window });
document.body.appendChild(app.canvas);

// The element must be inside the Pixi canvas.
const form = document.createElement("form");
form.innerHTML = '<input value="still editable" />';
app.canvas.appendChild(form);

// Render the live form as a sprite. It stays interactive in the browser.
const source = new HTMLSource({ resource: form });
const sprite = Sprite.from(source);

sprite.anchor.set(0.5);
sprite.position.set(app.screen.width / 2, app.screen.height / 2);
app.stage.addChild(sprite);
```

**Related skills:** `pixijs-scene-sprite` (display the texture), `pixijs-scene-mesh` (map onto geometry, `PerspectiveMesh`), `pixijs-scene-dom-container` (the opposite: overlay HTML *above* the canvas, outside the GPU pipeline), `pixijs-assets` (texture sources vs the loader/cache), `pixijs-environments` (no DOM in Web Workers).

## Constructor options

Both sources extend `TextureSource`, so all `TextureSourceOptions` (`resolution`, `scaleMode`, `addressMode`, `label`, etc.) are valid. `resource` is required on each.

`HTMLSourceOptions` (live element):

| Option             | Type               | Default | Description                                                                                                                                              |
| ------------------ | ------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resource`         | `Element`          | —       | Required. The live DOM element to render. Must be inside the owning canvas (its nearest `<canvas>` ancestor), or the constructor throws. The source sets `drawable` on it. |
| `canvas`           | `HTMLSourceCanvas` | —       | The canvas that owns the element. Must be the element's nearest `<canvas>` ancestor, or the constructor throws. Leave it out and it's inferred. |
| `autoLayout`       | `boolean`          | `true`  | Set `content="drawable"` (plus the pre-Chrome-155 `layoutsubtree`) on the owning canvas. The browser only lays out and paints canvas descendants when it is present. Set `false` if you write `<canvas content="drawable">` yourself. |
| `autoUpdate`       | `boolean`          | `true`  | Listen for the canvas `paint` event and re-upload when the element repaints. Set `false` for a static, captured-once texture.                             |
| `autoRequestPaint` | `boolean`          | `true`  | Request one initial paint after construction. Set `false` and call `source.requestPaint()` yourself each frame for continuous animation.                  |

`ElementImageSourceOptions` (immutable snapshot):

| Option       | Type           | Default | Description                                                                                                                            |
| ------------ | -------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `resource`   | `ElementImage` | —       | Required. A snapshot from `canvas.captureElementImage(element)`.                                                                        |
| `autoClose`  | `boolean`      | `false` | Call `snapshot.close()` when the source is destroyed. Leave `false` when the snapshot is shared with other sources, or you risk a use-after-free. |

Change the defaults for every `HTMLSource` through the static `HTMLSource.defaultOptions` object, for example `HTMLSource.defaultOptions.autoUpdate = false`.

## Core Patterns

### Setup and the side-effect import

```ts
import "pixi.js/html-source";
import { HTMLSource, ElementImageSource } from "pixi.js/html-source";
```

`pixi.js/html-source` calls `extensions.add(...)` to register `HTMLSource`, `ElementImageSource`, and their WebGL/WebGPU uploaders. Without it, the renderer has no `'html'` uploader and these sources never render. The classes are exported from `pixi.js/html-source`, not `pixi.js`.

Importing a named export from `pixi.js/html-source` also triggers the side effect, so a bare `import 'pixi.js/html-source'` is only needed when you don't import anything else from that path.

### Feature detection and browser support

The HTML-in-Canvas API is on by default from Chrome 157 but missing in other browsers and older Chrome. Feature-detect before relying on it:

```ts
import type { HTMLSourceCanvas } from "pixi.js/html-source";

const canvas = app.canvas as HTMLSourceCanvas;

if (canvas.requestPaint) {
  // HTML-in-Canvas is available.
}
```

Cast `app.canvas` to `HTMLSourceCanvas` for the typed `requestPaint`, `captureElementImage`, `updateElementGeometry`, and `clearElementGeometry` members. `source.requestPaint()` returns `false` when the browser lacks the API; the texture uploader throws on first render when it is missing.

When the API is missing the first upload throws `[HTMLSource] WebGLRenderingContext.texElementSubImage2D is not available...` on WebGL or `[HTMLSource] GPUQueue.drawElementImageToTexture is not available...` on WebGPU. The uploaders use `texElementSubImage2D`/`drawElementImageToTexture` in Chrome 155+ and fall back to the older `texElementImage2D`/`copyElementImageToTexture` signatures in Chrome 150-154 and earlier.

### Live element with HTMLSource

```ts
const form = document.createElement("form");
app.canvas.appendChild(form); // inside the canvas

const source = new HTMLSource({ resource: form });
const sprite = Sprite.from(source);
```

The element must be inside the renderer's `<canvas>`; the source infers the owning canvas from the element's nearest `<canvas>` ancestor. It always sets `drawable` on the element. With the defaults, it sets `content="drawable"` and `layoutsubtree` on the canvas, listens for the canvas `paint` event, and requests one initial paint. In Chrome 155+ the element can be nested: each `drawable` element captures its subtree minus nested `drawable` descendants, so a panel and a button inside it can be separate sources. Chrome before 155 only draws direct canvas children, and WebGPU in Chrome 156 still throws for nested ones (WebGL accepts them). `source.isReady` is `false` until that first paint lands, then `true`. It is `true` immediately when `autoUpdate` is `false`. `resourceWidth`/`resourceHeight` report the element's real-pixel size (`offsetWidth`/`offsetHeight`).

### Hit testing with updateElementGeometry

```ts
const canvas = app.canvas as HTMLSourceCanvas;

app.ticker.add(() => {
  const { a, b, c, d, tx, ty } = sprite.getGlobalTransform();
  const transform = new DOMMatrix([a, b, c, d, tx, ty]).translate(
    -sprite.anchor.x * sprite.texture.width,
    -sprite.anchor.y * sprite.texture.height,
  );

  if (canvas.updateElementGeometry) {
    canvas.updateElementGeometry(form, { canvasTransform: transform }); // Chrome 155+
  } else {
    form.style.transform = transform.toString(); // older builds; needs transform-origin: 0 0
  }
});
```

WebGL and WebGPU never tell the browser where the element was drawn. In Chrome 155+, the element is not hit-testable and has no accessibility bounds until you call `canvas.updateElementGeometry(element, { canvasTransform })`, where `canvasTransform` maps the element's border box to canvas CSS pixels. Older builds use the element's CSS `transform` instead (element at the canvas origin, `transform-origin: 0 0`). Don't set both on Chrome 155+. The snippet assumes one world unit per CSS pixel (`resolution: 1` or `autoDensity: true`).

### Continuous animation with requestPaint

```ts
const source = new HTMLSource({ resource: clock, autoRequestPaint: false });
const sprite = Sprite.from(source);

app.ticker.add(() => {
  clock.textContent = new Date().toLocaleTimeString();
  source.requestPaint(); // re-snapshot the DOM this frame
});
```

The browser only repaints canvas children on demand. For an element whose content changes every frame, set `autoRequestPaint: false` and call `source.requestPaint()` in your own ticker to drive repaints on your schedule.

### Immutable snapshot with ElementImageSource

```ts
import { ElementImageSource } from "pixi.js/html-source";
import type { HTMLSourceCanvas } from "pixi.js/html-source";

const canvas = app.canvas as HTMLSourceCanvas;
const snapshot = canvas.captureElementImage!(element);

const source = new ElementImageSource({ resource: snapshot, autoClose: true });
const sprite = Sprite.from(source);
```

`captureElementImage()` freezes an element's current pixels into an immutable `ElementImage`. There is no owning canvas, no `paint` listener, and no repaint lifecycle, so the source is ready the moment it is constructed. Reach for it when you need a frozen copy that outlives its element or is transferred around (transitions, "shatter" or trail effects). Release the snapshot with `snapshot.close()` when done, or pass `autoClose: true` to let the source close it on `destroy()`.

### Using the source on a sprite, texture, or mesh

Both sources are normal `TextureSource`s. Wrap them with `Sprite.from(source)` / `Texture.from(source)`, frame or slice them into sub-textures, or map them onto a mesh:

```ts
import { Rectangle, Texture } from "pixi.js";

// A 64x64 slice of the rendered element.
const chunk = new Texture({
  source,
  frame: new Rectangle(0, 0, 64, 64),
});

// Mapped onto geometry (e.g. a perspective warp).
const mesh = new PerspectiveMesh({ texture: Texture.from(source) /* ... */ });
```

### Auto-detection and priority

```ts
// Resolves to an HTMLSource (element) or ElementImageSource (snapshot) only as a last resort.
const sprite = Sprite.from(elementAlreadyInTheCanvas);
```

A generic HTML element or an `ElementImage` passed to `Texture.from`/`Sprite.from` resolves to these sources at the lowest texture-source priority (`-10`), so they only claim a resource no other built-in source handles. Image, video, and canvas elements are deliberately rejected; they have dedicated, faster sources. Construct the source explicitly when you need options (`autoUpdate`, `autoClose`) or non-HTML elements such as SVG.

## Common Mistakes

### [HIGH] Importing from pixi.js instead of pixi.js/html-source

Wrong:

```ts
import { HTMLSource } from "pixi.js"; // not exported from the core entry
```

Correct:

```ts
import { HTMLSource } from "pixi.js/html-source";
```

`HTMLSource`, `ElementImageSource`, and the `'html'` uploaders live only in `pixi.js/html-source`. Importing anything from that path registers the extensions; the module is marked side-effectful, so bundlers keep the registration even when you only import a class.

### [HIGH] Assuming the browser API is enabled

The HTML-in-Canvas API only exists in Chrome 157+, or in earlier Chrome with the origin trial or a flag. Where it's missing, the uploader throws on first render. Feature-detect first:

```ts
const canvas = app.canvas as HTMLSourceCanvas;
if (!canvas.requestPaint) {
  // Fall back to a static image, DOMContainer overlay, or a message.
}
```

### [HIGH] Expecting clicks to reach the element without updateElementGeometry

In Chrome 155+, canvas descendants aren't hit-testable until `canvas.updateElementGeometry()` reports where they were drawn. Setting `element.style.transform` no longer aligns hit testing. Call `updateElementGeometry` whenever the sprite moves (see "Hit testing with updateElementGeometry").

### [MEDIUM] Element outside the canvas

```ts
document.body.appendChild(form); // wrong parent
const source = new HTMLSource({ resource: form }); // throws
```

`HTMLSource` requires the element to be inside the owning canvas (`app.canvas.appendChild(form)`) and throws otherwise. Append the element to the canvas before constructing the source. Chrome before 155 also requires it to be a direct child.

### [MEDIUM] Expecting a live element to update without requestPaint

A non-animating element updates automatically on browser `paint` events (`autoUpdate: true`). Content that changes every frame will not re-upload unless something triggers a paint; drive it with `source.requestPaint()` each frame (with `autoRequestPaint: false`).

### [MEDIUM] Closing an ElementImage still in use

```ts
const source = new ElementImageSource({ resource: snapshot, autoClose: true });
const other = new ElementImageSource({ resource: snapshot }); // shares the snapshot

source.destroy(); // closes the snapshot — `other` is now a use-after-free
```

Only set `autoClose: true` when the source owns the snapshot exclusively. For a shared snapshot, leave `autoClose` off and call `snapshot.close()` once, after the last source is destroyed.

## Cleanup

```ts
source.destroy();
```

`HTMLSource.destroy()` detaches the canvas `paint` listener and nulls its canvas reference. `ElementImageSource.destroy()` closes the snapshot when `autoClose` was set; otherwise call `snapshot.close()` yourself to release the memory.

## API Reference

- [HTMLSource](https://pixijs.download/release/docs/rendering.HTMLSource.html.md)
- [HTMLSourceOptions](https://pixijs.download/release/docs/rendering.HTMLSourceOptions.html.md)
- [ElementImageSource](https://pixijs.download/release/docs/rendering.ElementImageSource.html.md)
- [ElementImageSourceOptions](https://pixijs.download/release/docs/rendering.ElementImageSourceOptions.html.md)
- [HTMLSourceCanvas](https://pixijs.download/release/docs/rendering.HTMLSourceCanvas.html.md)
- [ElementImage](https://pixijs.download/release/docs/rendering.ElementImage.html.md)
