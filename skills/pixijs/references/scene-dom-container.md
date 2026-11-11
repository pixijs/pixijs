# scene-dom-container

`DOMContainer`: HTML elements over the canvas driven by the scene graph; imports, what the pipe overwrites, click-through, detaching, and the shared root.

```ts
import { Application, DOMContainer } from "pixi.js";

declare const app: Application;

const input = document.createElement("input");
input.placeholder = "Enter name...";
input.style.width = "160px";

const dom = new DOMContainer({ element: input, anchor: 0.5 });
dom.position.set(app.screen.width / 2, app.screen.height / 2);
app.stage.addChild(dom);
```

`DOMContainer` is EXPERIMENTAL in v8 and may change between minor releases. It is a leaf (`allowChildren = false`): nest HTML inside its element, and put PixiJS siblings beside it in a plain `Container`. `element` defaults to a new `<div>`; `anchor` (default `0`, top-left) is relative to the element's own size, so `0.5` centers it on its position. Not available in Web Workers.

## Imports

Import the class from `pixi.js`; the default browser bundle registers the `DOMPipe`. Add a bare `import "pixi.js/dom";` only when you set `skipExtensionImports: true` (custom builds); without it there, `DOMContainer` still imports but has no pipe, so elements never appear or follow the scene graph. `import { DOMContainer } from "pixi.js/dom"` fails under strict TypeScript (TS7016): the subpath ships no type declarations.

## What the pipe writes

The pipe writes the world transform to the element as a CSS `matrix(...)`, shifted by `anchor` relative to its `offsetWidth`/`offsetHeight`, and writes `alpha` (including inherited parent alpha) to `style.opacity`.

- Every render it overwrites the element's inline `transform`, `transformOrigin` and `opacity`, so CSS transforms, opacity or transitions set on that element are lost. Put them on a child element inside it.
- Size the element with CSS (`element.style.width = "160px"`). `dom.width`/`dom.height` read `offsetWidth`/`offsetHeight`, and setting them changes `dom.scale`, which stretches the element (text and borders included) instead of resizing its layout box.
- `tint`, `filters`, `mask` and `blendMode` are accepted (inherited from `Container`) but do nothing: the element lives outside the WebGL/WebGPU pipeline. Use CSS on the element instead (`dom.element.style.filter = "blur(4px)"`, `mix-blend-mode`).

## Click-through overlays (pointer-events)

```ts
import { Application, DOMContainer } from "pixi.js";

declare const app: Application;

const css = document.createElement("style");
css.textContent = ".click-through { pointer-events: none !important; }";
document.head.appendChild(css);

const label = document.createElement("div");
label.textContent = "Lives: 3";
label.classList.add("click-through");

const dom = new DOMContainer({ element: label });
app.stage.addChild(dom);
```

The shared root `<div>` is `pointer-events: none`, but each time the pipe attaches an element (first render, and again after every hide/show or remove/add) it sets the element's inline `position = "absolute"` and `pointerEvents = "auto"`. An inline `element.style.pointerEvents = "none"` (even with `"important"` priority) set before that is silently replaced, and the overlay keeps swallowing clicks meant for the canvas. Use a stylesheet rule with `!important`, as above; it beats the inline value and survives re-attach.

## Detaching and destroy

The element is detached on the next render when the `DOMContainer` or any ancestor gets `visible = false`, when the `DOMContainer` itself is removed from its parent, or when it or an ancestor is destroyed. Restoring visibility re-attaches it.

Removing only an ancestor (`panel.removeFromParent()`) does NOT detach it: the element stays on the page, and later renders re-append it even after a manual `element.remove()`. To close a panel that holds DOM overlays, call `panel.destroy({ children: true })`, set `panel.visible = false`, or remove or destroy each `DOMContainer` itself.

`dom.destroy()` removes the element from its parent node and nulls internal references but preserves the element itself, so `const el = dom.element; dom.destroy(); document.body.appendChild(el);` re-uses it.

## The DOM container root

Every attached element lives in one shared root `<div>` with `z-index: 1000`, exposed as `app.domContainerRoot`. All `DOMContainer` elements render above canvas content; you can't interleave them between PixiJS draws.

On the first render that has an attached `DOMContainer`, the pipe appends the root to the canvas's parent node (unless the root already has a parent). The root is `position: absolute; top: 0; left: 0` and is translated by the canvas's viewport position (`getBoundingClientRect().left/top`), recomputed only when the canvas's CSS size changes. If the canvas's parent (or an ancestor between it and the page) is positioned (`position: relative/absolute`) and offset from the page origin, that offset is applied twice and every overlay is misplaced by it. Append the root to `document.body` yourself before the first render so it is positioned against the page:

```ts
import { Application } from "pixi.js";

declare const app: Application;

document.getElementById("game-wrapper")!.appendChild(app.canvas);
document.body.appendChild(app.domContainerRoot);
```
