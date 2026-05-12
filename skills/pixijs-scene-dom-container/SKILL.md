---
name: pixijs-scene-dom-container
description: "Use this skill when overlaying HTML elements on the PixiJS v8 canvas. Covers DOMContainer with element, anchor, and scene-graph-driven CSS transforms, the pixi.js/dom side-effect import, DOMPipe registration, visibility sync, pointer-events handling. Triggers on: DOMContainer, pixi.js/dom, DOMPipe, HTML overlay, input on canvas, iframe overlay, DOMContainerOptions, element, anchor, constructor options."
license: MIT
---

`DOMContainer` positions an HTML element over the PixiJS canvas and drives its CSS transform from the scene graph. Use it for native inputs, iframes, videos, or rich HTML that needs to follow a display object's position. The default `pixi.js` browser bundle registers the `DOMPipe` automatically; custom builds add a side-effect `import 'pixi.js/dom'`.

> `DOMContainer` is marked EXPERIMENTAL in PixiJS v8. The API may change between minor releases.

Assumes familiarity with `pixijs-scene-core-concepts`. `DOMContainer` extends `ViewContainer`, so it's a leaf: do not nest PixiJS children inside it. Nest DOM content inside the HTML element itself, or wrap multiple `DOMContainer` instances in a `Container`. Not available in Web Workers; a worker has no DOM to overlay.

## Quick Start

```ts
import "pixi.js/dom";

const input = document.createElement("input");
input.type = "text";
input.placeholder = "Enter name...";

const dom = new DOMContainer({
  element: input,
  anchor: 0.5,
});
dom.position.set(app.screen.width / 2, app.screen.height / 2);

app.stage.addChild(dom);
```

**Related skills:** `pixijs-scene-core-concepts` (scene graph basics), `pixijs-scene-container` (wrap multiple DOM overlays), `pixijs-events` (pointer handling on canvas vs DOM), `pixijs-accessibility` (screen-reader overlays).

## Constructor options

All `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

Leaf-specific options added by `DOMContainerOptions`:

| Option    | Type                  | Default                         | Description                                                                                                                                                                    |
| --------- | --------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `element` | `HTMLElement`         | `document.createElement('div')` | The HTML element the container drives. Any element is valid: `input`, `textarea`, `iframe`, `video`, `div`, etc. If omitted, a bare `<div>` is created.                        |
| `anchor`  | `PointData \| number` | `0`                             | Origin of the element relative to its own dimensions. `0` is top-left, `0.5` centers, `1` is bottom-right. A single number sets both axes; `{ x, y }` sets each independently. |

`tint`, `filters`, `mask`, and `blendMode` are accepted (inherited from `Container`) but have no visual effect — DOM elements live outside the WebGL/WebGPU pipeline. Style the element via CSS for those effects.

## Core Patterns

### Setup and the side-effect import

```ts
import "pixi.js/dom";
import { DOMContainer } from "pixi.js";
```

Or use the combined import that registers the pipe and re-exports the class:

```ts
import { DOMContainer } from "pixi.js/dom";
```

The default `pixi.js` browser bundle already imports `pixi.js/dom` for you via `browserAll.ts`, so `DOMContainer` works out of the box in a typical browser app. You only need the explicit `import 'pixi.js/dom'` line when you set `skipExtensionImports: true` (custom builds) or when running under a non-browser bundle.

### Transforms, anchor, and alpha

```ts
const dom = new DOMContainer({
  element: document.createElement("div"),
  anchor: 0.5,
});
dom.position.set(400, 300);
dom.scale.set(1.5);
dom.rotation = Math.PI / 8;
dom.alpha = 0.5;
```

Transforms on the `DOMContainer` propagate to the element as CSS `transform`. `anchor` shifts the element's origin relative to its own dimensions: `0` is top-left, `0.5` centers, `1` is bottom-right. A single number sets both axes; an object `{ x, y }` sets each independently. `alpha` (including inherited parent alpha) is written to the element's `style.opacity` every frame.

If no `element` is provided, a `<div>` is created by default.

### Styling the element directly

```ts
const panel = document.createElement("div");
panel.innerHTML = "<h2>Score</h2><p>1500</p>";
panel.style.color = "white";
panel.style.fontFamily = "Arial";
panel.style.pointerEvents = "none";

const dom = new DOMContainer({ element: panel });
dom.position.set(50, 50);
app.stage.addChild(dom);
```

PixiJS does not interfere with CSS styling on the element. The shared root `<div>` is set to `pointer-events: none`, and each attached element defaults to `pointer-events: auto`. Override to `none` on purely decorative overlays so the canvas still receives clicks underneath them.

### Visibility and cleanup

```ts
dom.visible = false;
dom.visible = true;

dom.destroy();
```

Setting `visible = false` or removing the `DOMContainer` from the scene graph detaches the element from the DOM. Restoring visibility re-attaches it. `destroy()` removes the element from its parent node and nulls internal references; the HTML element itself is preserved, so you can re-attach it elsewhere:

```ts
const element = dom.element;
dom.destroy();
document.body.appendChild(element);
```

### The DOM container root

The DOMPipe uses a shared root `<div>` with `z-index: 1000` that hosts every attached element. It's exposed as `app.domContainerRoot` (an `HTMLDivElement`). All `DOMContainer` elements render above canvas content; you can't interleave DOM elements between PixiJS draw calls.

On the first render that has an attached `DOMContainer`, the pipe automatically appends the root to the canvas's parent node. Append it yourself next to `app.canvas` if you need explicit, stable placement in the DOM tree (for example, when the canvas shares a wrapper with other layered content):

```ts
document.body.appendChild(app.canvas);
document.body.appendChild(app.domContainerRoot);
```

The root uses absolute positioning and its transform is recomputed from the canvas `getBoundingClientRect()` via a `ResizeObserver`, so CSS-scaled canvases stay aligned without extra work.

## Common Mistakes

### [MEDIUM] Missing the pixi.js/dom import in custom builds

The default browser bundle auto-registers `DOMPipe`, so most apps do not need an explicit import. It is only required when you opt out of auto-imports:

```ts
await app.init({ skipExtensionImports: true });
// Now you must add this yourself:
import "pixi.js/dom";
```

Without registration under a custom build, `DOMContainer` is still importable but the renderer has no pipe to process it; elements never synchronize with the scene graph and never appear.


### [MEDIUM] Expecting filters, masks, or blend modes to affect DOM elements

Wrong:

```ts
const dom = new DOMContainer();
dom.filters = [new BlurFilter()];
```

Correct:

```ts
dom.element.style.filter = "blur(4px)";
```

DOM elements are HTML overlays positioned via CSS transforms; they exist outside the WebGL/WebGPU pipeline. PixiJS filters, masks, and blend modes have no effect on them. Use CSS filters and CSS `mix-blend-mode` on the element directly.


### [MEDIUM] Do not nest children inside a DOMContainer

Wrong:

```ts
const dom = new DOMContainer();
dom.addChild(new Sprite(texture));
```

Correct:

```ts
const group = new Container();
group.addChild(dom, new Sprite(texture));
```

`DOMContainer` extends `ViewContainer`, which sets `allowChildren = false`. It is a leaf in the PixiJS scene graph. For PixiJS children, wrap the `DOMContainer` alongside them in a plain `Container`. For nested HTML, nest inside the element itself (`element.appendChild(...)`).


### [LOW] Forgetting to set anchor for centered positioning

The default anchor is `(0, 0)`, placing the element's top-left corner at the container's position. For centering a UI element on its scene-graph position, set `anchor: 0.5`:

```ts
const dom = new DOMContainer({ element: myElement, anchor: 0.5 });
dom.position.set(400, 300);
```


## API Reference

- [DOMContainer](https://pixijs.download/release/docs/scene.DOMContainer.html.md)
- [DOMContainerOptions](https://pixijs.download/release/docs/scene.DOMContainerOptions.html.md)
- [ViewContainer](https://pixijs.download/release/docs/scene.ViewContainer.html.md)
- [Container](https://pixijs.download/release/docs/scene.Container.html.md)
