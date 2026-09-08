---
name: pixijs-events
description: "Use this skill when handling pointer, mouse, touch, or wheel input in PixiJS v8. Covers eventMode (none, passive, auto, static, dynamic), FederatedEvent types, propagation and capture phase, hitArea, interactiveChildren, cursor and cursorStyles, global move events for drag, eventFeatures config. Triggers on: eventMode, FederatedPointerEvent, pointerdown, click, tap, globalpointermove, drag, hitArea, cursor, stopPropagation."
license: MIT
---

PixiJS's federated event system mirrors DOM events on the scene graph. Set `container.eventMode = 'static'` to opt an object in, then listen with `.on()`, `addEventListener()`, or `onEventName` property handlers. Move events fire only over the listening object; use `globalpointermove` for drag.

## Quick Start

```ts
const button = new Sprite(await Assets.load("button.png"));
button.eventMode = "static";
button.cursor = "pointer";
app.stage.addChild(button);

button.on("pointertap", (event) => {
  console.log("clicked at", event.global.x, event.global.y);
});

let dragging = false;
button.on("pointerdown", () => {
  dragging = true;
});
button.on("pointerup", () => {
  dragging = false;
});
button.on("pointerupoutside", () => {
  dragging = false;
});
button.on("globalpointermove", (event) => {
  if (dragging) button.parent.toLocal(event.global, undefined, button.position);
});
```

**Related skills:** `pixijs-accessibility` (screen reader + keyboard), `pixijs-scene-dom-container` (HTML overlays), `pixijs-performance` (event-heavy scenes).

## Core Patterns

### eventMode values

```ts
import { Sprite } from "pixi.js";

const sprite = new Sprite();

// No interaction at all; children also ignored
sprite.eventMode = "none";

// Default. Self not interactive; interactive children still work
sprite.eventMode = "passive";

// Hit tested only when a parent is interactive
sprite.eventMode = "auto";

// Standard interaction: receives pointer/mouse/touch events
sprite.eventMode = "static";

// Like static, but also fires synthetic events from the ticker
// when the pointer is stationary (for animated objects under cursor)
sprite.eventMode = "dynamic";
```

Use `'static'` for buttons, UI elements, and drag targets. Use `'dynamic'` only for objects that move under a stationary cursor and need continuous hover updates.

Use `isInteractive()` to check whether an object can receive events:

```ts
sprite.eventMode = "static";
sprite.isInteractive(); // true

sprite.eventMode = "passive";
sprite.isInteractive(); // false
```

### Event types

Pointer events (recommended for cross-device compatibility): `pointerdown`, `pointerup`, `pointerupoutside`, `pointermove`, `pointerover`, `pointerout`, `pointerenter`, `pointerleave`, `pointertap`, `pointercancel`.

Mouse events: `mousedown`, `mouseup`, `mouseupoutside`, `mousemove`, `mouseover`, `mouseout`, `mouseenter`, `mouseleave`, `click`, `rightdown`, `rightup`, `rightupoutside`, `rightclick`, `wheel`.

Touch events: `touchstart`, `touchend`, `touchendoutside`, `touchmove`, `touchcancel`, `tap`. Each touch carries `altKey`, `ctrlKey`, `metaKey`, and `shiftKey` copied from the native `TouchEvent`, so modifier keys work the same as with mouse or pointer events.

Global move events: `globalpointermove`, `globalmousemove`, `globaltouchmove`. These fire on every pointer movement regardless of whether the pointer is over the listening object.

Container lifecycle events (no `eventMode` required): `added`, `removed`, `destroyed`, `childAdded`, `childRemoved`, `visibleChanged`.

### Listening styles

```ts
import { Sprite } from "pixi.js";

const sprite = new Sprite();
sprite.eventMode = "static";

// EventEmitter style (recommended)
const handler = (e) => console.log("clicked");
sprite.on("pointerdown", handler);
sprite.once("pointerdown", handler); // one-time
sprite.off("pointerdown", handler);

// DOM style
sprite.addEventListener(
  "click",
  (event) => {
    console.log("Clicked!", event.detail);
  },
  { once: true },
);

// Property-based handlers
sprite.onclick = (event) => {
  console.log("Clicked!", event.detail);
};
```

### Pointer events and propagation

```ts
import { Sprite, Container } from "pixi.js";

const parent = new Container();
parent.eventMode = "static";

const child = new Sprite();
child.eventMode = "static";
parent.addChild(child);

child.on("pointerdown", (event) => {
  console.log("child pressed");
  event.stopPropagation(); // prevent parent from receiving this event
});

parent.on("pointerdown", () => {
  console.log("parent pressed (only if child did not stop propagation)");
});
```

### Capture phase events

All events support capture phase by appending `capture` to the event name (e.g., `pointerdowncapture`, `clickcapture`). Capture listeners fire during the capturing phase, before the event reaches its target.

```ts
container.addEventListener(
  "pointerdown",
  (event) => {
    event.stopImmediatePropagation(); // blocks event from reaching children
  },
  { capture: true },
);
```

### Hit testing

When a pointer event fires, PixiJS walks the display tree to find the top-most interactive element under the pointer. The traversal follows these rules:

- `eventMode = 'none'` on a container skips that element and its entire subtree.
- `interactiveChildren = false` on a container skips its children (the container itself can still be tested).
- A `hitArea` overrides bounds-based testing; only the shape is checked.
- Objects that are not visible, not renderable, or not measurable are skipped.

Set a custom `hitArea` to override bounds-based testing. This also speeds up hit tests on large or complex objects by reducing the geometry checked:

```ts
import { Sprite, Rectangle, Circle, Polygon } from "pixi.js";

const sprite = new Sprite();
sprite.eventMode = "static";

// Rectangular hit area
sprite.hitArea = new Rectangle(0, 0, 100, 50);

// Circular hit area
sprite.hitArea = new Circle(50, 50, 40);

// Polygon hit area
sprite.hitArea = new Polygon([0, 0, 100, 0, 50, 100]);

// Custom hit test via contains()
sprite.hitArea = {
  contains(x: number, y: number): boolean {
    return x >= 0 && x <= 100 && y >= 0 && y <= 100;
  },
};
```

### Global move events and drag

```ts
import { Sprite, FederatedPointerEvent } from "pixi.js";

const sprite = new Sprite();
sprite.eventMode = "static";
sprite.cursor = "grab";

let dragging = false;

sprite.on("pointerdown", (event: FederatedPointerEvent) => {
  dragging = true;
  sprite.cursor = "grabbing";
});

// globalpointermove fires even when pointer leaves the object
sprite.on("globalpointermove", (event: FederatedPointerEvent) => {
  if (dragging) {
    sprite.position.set(event.global.x, event.global.y);
  }
});

sprite.on("pointerup", () => {
  dragging = false;
  sprite.cursor = "grab";
});

sprite.on("pointerupoutside", () => {
  dragging = false;
  sprite.cursor = "grab";
});
```

### Cursor styles

Basic usage sets the `cursor` property per-object. For reusable cursors, register named styles on the event system:

```ts
app.renderer.events.cursorStyles.default = "url('bunny.png'), auto";
app.renderer.events.cursorStyles.hover = "url('bunny_saturated.png'), auto";

sprite.eventMode = "static";
sprite.cursor = "hover"; // uses the registered 'hover' style
```

Cursor styles can be strings (CSS cursor values), objects (applied as CSS styles), or functions (called with the mode string).

### Event properties

`FederatedPointerEvent` carries rich input data; the more useful fields are:

```ts
sprite.on("pointerdown", (event: FederatedPointerEvent) => {
  event.global; // scene-space Point where the event happened
  event.client; // CSS-pixel Point relative to the viewport
  event.offset; // Point w.r.t. target Container in world space (not supported at the moment)
  event.target; // the Container that received the event
  event.currentTarget; // the Container whose listener is running

  event.pointerType; // 'mouse' | 'pen' | 'touch'
  event.pointerId; // unique id for multi-touch tracking
  event.isPrimary; // first pointer in a multi-pointer gesture
  event.pressure; // 0-1 pen/touch pressure
  event.button; // 0 left, 1 middle, 2 right
  event.buttons; // bitmask of held buttons
  event.altKey; // modifier key state
  event.ctrlKey;
  event.shiftKey;
  event.metaKey;

  event.nativeEvent; // the underlying DOM PointerEvent / MouseEvent / Touch
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
});
```

`FederatedWheelEvent` adds `deltaX`, `deltaY`, `deltaZ`, and `deltaMode`. Wheel events fire on the same hit-tested object as pointer events.

### Event features

Toggle event categories globally for performance:

```ts
await app.init({
  eventFeatures: {
    move: true, // pointer/mouse/touch move events
    globalMove: true, // global move events (globalpointermove, etc.)
    click: true, // click/tap/press events
    wheel: true, // mouse wheel events
  },
});

// or configure after init
app.renderer.events.features.globalMove = false;
```

### Performance tips

- Set `eventMode = 'none'` on non-interactive subtrees to skip hit testing entirely.
- Set `interactiveChildren = false` on containers where only the container itself needs interaction.
- Use `hitArea` on large or complex objects to replace bounds-based hit testing with a cheap shape check.
- Prefer `'static'` for stationary elements; reserve `'dynamic'` for objects that move or animate under a stationary pointer.
- Disable unused event features via `eventFeatures` (e.g., `globalMove: false`) to cut per-frame work.

## Common Mistakes

### [HIGH] Default eventMode is passive

Wrong:

```ts
const sprite = new Sprite(texture);
sprite.on("pointerdown", () => {
  console.log("clicked");
});
```

Correct:

```ts
const sprite = new Sprite(texture);
sprite.eventMode = "static";
sprite.on("pointerdown", () => {
  console.log("clicked");
});
```

The default `eventMode` is `'passive'`, which means the object itself receives no events. You must explicitly set `eventMode` to `'static'` or `'dynamic'` before any listener will fire.


### [HIGH] buttonMode removed; use cursor

Wrong:

```ts
sprite.interactive = true;
sprite.buttonMode = true;
```

Correct:

```ts
sprite.eventMode = "static";
sprite.cursor = "pointer";
```

`buttonMode` was removed in v8. Use `cursor = 'pointer'` to show a hand cursor on hover. `interactive = true` still works as an alias for `eventMode = 'static'`, but `eventMode` is preferred.


### [HIGH] Move events only fire over the object in v8

Wrong:

```ts
sprite.eventMode = "static";
sprite.on("pointermove", (event) => {
  // expects to fire everywhere; only fires inside sprite bounds
  updateDrag(event.global.x, event.global.y);
});
```

Correct:

```ts
sprite.eventMode = "static";
sprite.on("globalpointermove", (event) => {
  // fires everywhere, even outside sprite bounds
  updateDrag(event.global.x, event.global.y);
});
```

In v8, `pointermove`, `mousemove`, and `touchmove` only fire when the pointer is over the display object. In v7 they fired on any canvas move. For drag operations or global tracking, use `globalpointermove`, `globalmousemove`, or `globaltouchmove`.


### [MEDIUM] Cursor does not inherit from parent

Setting `cursor` on a parent container has no effect on its children. Only the direct hit target's `cursor` value is applied.

```ts
// This does NOT make children show a pointer cursor
parent.cursor = "pointer";

// Each interactive child needs its own cursor
child.eventMode = "static";
child.cursor = "pointer";
```

If you want a uniform cursor for all children, set `cursor` on each interactive child individually, or set `hitArea` on the parent and make children non-interactive.


## API Reference

- [EventSystem](https://pixijs.download/release/docs/events.EventSystem.html.md)
- [FederatedEvent](https://pixijs.download/release/docs/events.FederatedEvent.html.md)
- [FederatedPointerEvent](https://pixijs.download/release/docs/events.FederatedPointerEvent.html.md)
- [FederatedMouseEvent](https://pixijs.download/release/docs/events.FederatedMouseEvent.html.md)
- [FederatedWheelEvent](https://pixijs.download/release/docs/events.FederatedWheelEvent.html.md)
- [EventBoundary](https://pixijs.download/release/docs/events.EventBoundary.html.md)
