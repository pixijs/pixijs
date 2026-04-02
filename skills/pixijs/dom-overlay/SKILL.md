---
name: dom-overlay
description: >
  Overlay HTML elements on the PixiJS canvas using DOMContainer. Requires
  pixi.js/dom import. Properties: element (HTMLElement), anchor for
  positioning. Transforms synchronize with scene graph. DOM elements do not
  respect PixiJS filters, masks, or blend modes. Use when the user asks
  about HTML on canvas, text input fields in PixiJS, DOM elements over
  WebGL, overlaying HTML, input boxes, forms on canvas, video overlays,
  or mixing HTML with PixiJS. Covers DOMContainer, DOMPipe.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  requires: pixijs
  sources: "pixijs/pixijs:src/dom/DOMContainer.ts, pixijs/pixijs:src/dom/DOMPipe.ts, pixijs/pixijs:src/dom/init.ts"
---

## When to Use This Skill

Apply when the user needs to overlay HTML elements (inputs, videos, rich text, iframes) on the PixiJS canvas, or synchronize DOM element positions with the scene graph.

**Related skills:** For pointer/mouse/touch event handling use **events**; for screen reader support use **accessibility**; for Application setup use **getting-started**.

This skill builds on pixijs. Read it first for foundational concepts.

## Setup

```ts
import 'pixi.js/dom';
import { Application, DOMContainer } from 'pixi.js';

const app = new Application();
await app.init({ width: 800, height: 600 });
document.body.appendChild(app.canvas);

const input = new DOMContainer({
    element: document.createElement('input'),
    anchor: 0.5,
});
input.position.set(400, 300);
app.stage.addChild(input);
```

Alternatively, use a single import that both registers the pipe and exports the class:

```ts
import { DOMContainer } from 'pixi.js/dom';
```

Key points:
- `import 'pixi.js/dom'` is required. It registers the `DOMPipe` extension that synchronizes DOM element transforms with the scene graph. Without it, `DOMContainer` is importable from `'pixi.js'` but the renderer has no pipe to process it.
- `DOMContainer` extends `ViewContainer`; it participates in the scene graph but cannot have PixiJS children (`allowChildren` is `false`). Nest DOM content inside the HTML element itself instead.
- The DOM element is positioned via CSS transforms to match the container's world transform.
- If no `element` is provided, a `<div>` is created by default.
- All DOM elements render above the canvas (the DOMPipe container has `z-index: 1000`). DOM elements cannot interleave with canvas-rendered content.
- Setting `visible = false` or removing the `DOMContainer` from the scene graph removes the DOM element from the page. Restoring visibility re-attaches it.
- DOMPipe sets `pointer-events: auto` on each managed element. Interactive elements (inputs, buttons) work by default. Set `pointer-events: none` on the element's style when it should not capture input.
- This API is experimental. Behavior may change across releases.

## Core Patterns

### Text input field

```ts
import 'pixi.js/dom';
import { DOMContainer } from 'pixi.js';

const inputElement = document.createElement('input');
inputElement.type = 'text';
inputElement.placeholder = 'Enter name...';
inputElement.style.fontSize = '16px';
inputElement.style.padding = '4px 8px';
inputElement.style.border = '1px solid #ccc';
inputElement.style.outline = 'none';

const inputContainer = new DOMContainer({
    element: inputElement,
    anchor: 0.5,
});
inputContainer.position.set(400, 200);
app.stage.addChild(inputContainer);

// Read value from the native DOM element
inputElement.addEventListener('input', () => {
    console.log('Current value:', inputElement.value);
});
```

Style the DOM element directly through its standard properties. PixiJS does not interfere with CSS styling on the element.

### Rich content overlay

```ts
import 'pixi.js/dom';
import { DOMContainer } from 'pixi.js';

const panel = document.createElement('div');
panel.innerHTML = '<h2>Score</h2><p>1500</p>';
panel.style.color = 'white';
panel.style.fontFamily = 'Arial';
panel.style.textAlign = 'center';
panel.style.pointerEvents = 'none';

const domContainer = new DOMContainer({ element: panel });
domContainer.position.set(50, 50);
domContainer.scale.set(1.5);
app.stage.addChild(domContainer);
```

Transforms on the `DOMContainer` (position, scale, rotation, parent transforms) are applied via CSS transforms on the element. The element follows the scene graph hierarchy. The `pointer-events: none` on the panel prevents it from blocking clicks on the canvas beneath it; DOMPipe defaults each element to `pointer-events: auto`, so override it when the element is purely visual.

### Anchor positioning

```ts
import 'pixi.js/dom';
import { DOMContainer } from 'pixi.js';

// Default: anchor at top-left (0, 0)
const topLeft = new DOMContainer();
topLeft.position.set(100, 100); // element's top-left corner at (100, 100)

// Centered: anchor at (0.5, 0.5)
const centered = new DOMContainer({ anchor: 0.5 });
centered.position.set(100, 100); // element's center at (100, 100)

// Bottom-right: anchor at (1, 1)
const bottomRight = new DOMContainer({ anchor: { x: 1, y: 1 } });
bottomRight.position.set(100, 100); // element's bottom-right corner at (100, 100)
```

The anchor shifts the element's origin relative to its own dimensions, similar to `Sprite.anchor`. A single number sets both `x` and `y`.

### Cleanup

```ts
const domContainer = new DOMContainer({ element: document.createElement('textarea') });
app.stage.addChild(domContainer);

// Later: removes element from DOM and cleans up
domContainer.destroy();
```

`destroy()` removes the DOM element from its parent node and nulls internal references. The element itself is not destroyed; only its DOM attachment is removed. To preserve the element, save a reference and re-attach it to the DOM after destroying:

```ts
const element = domContainer.element;
domContainer.destroy();
document.body.appendChild(element); // re-attach if needed
```

### Accessing the DOM container root

Use `app.domContainerRoot` to get the root DOM element that holds all `DOMContainer` elements:

```ts
const root = app.domContainerRoot; // the DOMPipe's container div
```

## Common Mistakes

### [HIGH] Not importing the dom extension

Wrong:
```ts
import { DOMContainer } from 'pixi.js';
```

Correct:
```ts
import 'pixi.js/dom';
import { DOMContainer } from 'pixi.js';
```

The `pixi.js/dom` import registers the `DOMPipe` render pipe via `extensions.add(DOMPipe)`. Without it, the class may be importable but the renderer has no pipe to process it; DOM elements will not appear or synchronize with the scene graph.

Source: src/dom/init.ts

### [MEDIUM] Expecting DOM elements to respect PixiJS filters

DOM elements are HTML overlays positioned via CSS transforms. They exist outside the WebGL/WebGPU render pipeline. PixiJS filters, masks, and blend modes have no effect on them.

```ts
import 'pixi.js/dom';
import { DOMContainer, BlurFilter } from 'pixi.js';

const dom = new DOMContainer();
dom.filters = [new BlurFilter()]; // has no visible effect on the DOM element
```

If you need to apply effects to DOM content, use CSS filters on the element directly:

```ts
dom.element.style.filter = 'blur(4px)';
```

Source: src/dom/DOMContainer.ts

### [LOW] Not setting anchor for centered positioning

The default anchor is `(0, 0)`, placing the element's top-left corner at the container's position. For centering an element on its scene graph position, set `anchor: 0.5`:

```ts
// Element top-left at (400, 300); likely not what you want for centered UI
const dom = new DOMContainer({ element: myElement });
dom.position.set(400, 300);

// Element centered at (400, 300)
const domCentered = new DOMContainer({ element: myElement, anchor: 0.5 });
domCentered.position.set(400, 300);
```

Source: src/dom/DOMContainer.ts

---

See also: events (pointer/mouse/touch handling), accessibility (screen reader support), getting-started (Application setup)

## Learn More

- [DOMContainer](https://pixijs.download/release/docs/scene.DOMContainer.html.md)
- [DOMContainerOptions](https://pixijs.download/release/docs/scene.DOMContainerOptions.html.md)
