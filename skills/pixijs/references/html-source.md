# html-source

Live DOM elements (`HTMLSource`) or frozen snapshots (`ElementImageSource`) as texture sources, via the experimental HTML-in-Canvas browser APIs.

Both are `TextureSource`s, not display objects: put them on screen with `Sprite.from(source)` or `new Sprite(Texture.from(source))`, slice them into `Texture` frames, or map them onto a `Mesh`. `HTMLSource` mirrors a live element's pixels into the GPU while the element stays editable and clickable in the browser; `ElementImageSource` wraps an immutable snapshot that never repaints. Not available in Web Workers (no DOM). For HTML layered *above* the canvas instead, see [scene-dom-container](scene-dom-container.md).

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

const source = new HTMLSource({ resource: form });
const sprite = Sprite.from(source);
app.stage.addChild(sprite);
```

Three rules every use needs:

- **Import from `pixi.js/html-source`, not `pixi.js`.** The classes and their WebGL/WebGPU `'html'` uploaders are exported only there. Importing anything from that path runs `extensions.add(...)` (the module is marked side-effectful, so bundlers keep it); without it the renderer has no `'html'` uploader and these sources never render. A bare `import "pixi.js/html-source"` is needed only when you import nothing else from it.
- **The element must be inside the canvas.** `app.canvas.appendChild(el)` before constructing the source; an element elsewhere (e.g. `document.body`) makes the constructor throw. Chrome before 155 also requires a direct child.
- **`new Sprite(source)` draws nothing.** It type-checks, but `new Sprite(x)` converts `x` only when it is a `Texture`; any `TextureSource` (`HTMLSource`, `ElementImageSource`, `CanvasSource`, ...) is spread as options and the sprite keeps `Texture.EMPTY` ([scene-sprite](scene-sprite.md#loading-before-creating)).

## Browser support and feature detection

Marked EXPERIMENTAL in PixiJS v8; the API may change between minor releases. Chrome turns the browser API on by default from Chrome 157; earlier Chrome needs the origin trial or a flag, and other browsers lack it. Where it's missing, the texture uploader throws on first render, so feature-detect first:

```ts
import type { HTMLSourceCanvas } from "pixi.js/html-source";

const canvas = app.canvas as HTMLSourceCanvas;
if (!canvas.requestPaint) {
  // Fall back to a static image, DOMContainer overlay, or a message.
}
```

Cast `app.canvas` to `HTMLSourceCanvas` for the typed `requestPaint`, `captureElementImage`, `updateElementGeometry` and `clearElementGeometry` members. `source.requestPaint()` returns `false` when the browser lacks the API.

The missing-API error is `[HTMLSource] WebGLRenderingContext.texElementSubImage2D is not available...` on WebGL or `[HTMLSource] GPUQueue.drawElementImageToTexture is not available...` on WebGPU. The uploaders use `texElementSubImage2D`/`drawElementImageToTexture` in Chrome 155+ and fall back to the older `texElementImage2D`/`copyElementImageToTexture` signatures in Chrome 150-154 and earlier.

## HTMLSource (live element)

Options: every `TextureSourceOptions` key (`resolution`, `scaleMode`, `addressMode`, `label`, ...) plus:

| Option             | Default | Notes |
| ------------------ | ------- | ----- |
| `resource`         | —       | Required. The live `Element`; the source sets `drawable` on it. |
| `canvas`           | inferred | The owning `HTMLSourceCanvas`. Must be the element's nearest `<canvas>` ancestor, or the constructor throws. |
| `autoLayout`       | `true`  | Sets `content="drawable"` (plus the pre-Chrome-155 `layoutsubtree`) on the owning canvas; the browser only lays out and paints canvas descendants when it is present. Set `false` if you write `<canvas content="drawable">` yourself. |
| `autoUpdate`       | `true`  | Listen for the canvas `paint` event and re-upload when the element repaints. `false` for a static, captured-once texture. |
| `autoRequestPaint` | `true`  | Request one initial paint after construction. |

Change defaults for every `HTMLSource` through the static `HTMLSource.defaultOptions` (e.g. `HTMLSource.defaultOptions.autoUpdate = false`).

`source.isReady` is `false` until the first paint lands, then `true`; it is `true` immediately when `autoUpdate` is `false`. `resourceWidth`/`resourceHeight` report the element's real-pixel size (`offsetWidth`/`offsetHeight`).

In Chrome 155+ the element can be nested: each `drawable` element captures its subtree minus nested `drawable` descendants, so a panel and a button inside it can be separate sources. WebGPU in Chrome 156 still throws for nested ones (WebGL accepts them).

### Continuous animation with requestPaint

The browser repaints canvas children only on demand. A static element updates on `paint` events by itself, but content that changes every frame never re-uploads unless something triggers a paint. Set `autoRequestPaint: false` and call `requestPaint()` in your ticker:

```ts
declare const clock: HTMLElement; // a child of app.canvas
const source = new HTMLSource({ resource: clock, autoRequestPaint: false });

app.ticker.add(() => {
  clock.textContent = new Date().toLocaleTimeString();
  source.requestPaint(); // re-snapshot the DOM this frame
});
```

### Hit testing with updateElementGeometry

WebGL and WebGPU never tell the browser where the element was drawn. In Chrome 155+ the element is not hit-testable and has no accessibility bounds until you call `canvas.updateElementGeometry(element, { canvasTransform })`, where `canvasTransform` maps the element's border box to canvas CSS pixels; setting `element.style.transform` no longer aligns hit testing there, and you shouldn't set both. Older builds use the element's CSS `transform` (element at the canvas origin, `transform-origin: 0 0`). Call it whenever the sprite moves:

```ts
declare const sprite: Sprite;
declare const form: HTMLFormElement;
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

The snippet assumes one world unit per CSS pixel (`resolution: 1` or `autoDensity: true`).

## ElementImageSource (immutable snapshot)

```ts
declare const element: HTMLElement;
const canvas = app.canvas as HTMLSourceCanvas;
const snapshot = canvas.captureElementImage!(element);

const source = new ElementImageSource({ resource: snapshot, autoClose: true });
const sprite = Sprite.from(source);
```

`captureElementImage()` freezes an element's current pixels into an immutable `ElementImage`. There is no owning canvas, no `paint` listener and no repaint lifecycle, so the source is ready the moment it is constructed. Use it for a frozen copy that outlives its element or is passed around (transitions, "shatter" or trail effects).

Options: `TextureSourceOptions` plus `resource` (required `ElementImage`) and `autoClose` (default `false`): call `snapshot.close()` when the source is destroyed. Set `autoClose: true` only when the source owns the snapshot exclusively; destroying one source closes a snapshot that other sources still use (use-after-free). For a shared snapshot leave it off and call `snapshot.close()` once, after the last source is destroyed.

## Auto-detection via Texture.from

A generic HTML element or an `ElementImage` passed to `Texture.from`/`Sprite.from` resolves to `HTMLSource` / `ElementImageSource` at the lowest texture-source priority (`-10`), so they only claim a resource no other built-in source handles. Image, video and canvas elements are deliberately rejected; they have dedicated, faster sources. Construct the source explicitly when you need options (`autoUpdate`, `autoClose`) or non-HTML elements such as SVG.

## Cleanup

`HTMLSource.destroy()` detaches the canvas `paint` listener and nulls its canvas reference. `ElementImageSource.destroy()` closes the snapshot when `autoClose` was set; otherwise call `snapshot.close()` yourself to release the memory.
