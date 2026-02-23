---
title: Overview
category: events
description: Learn how to handle mouse, touch, and pointer input in PixiJS using the federated event system with bubbling, capturing, and delegation.
---

# Events

PixiJS provides a DOM-like federated event model for mouse, touch, and pointer input. The system supports bubbling, capturing, and delegation across the scene graph.

## Basic usage

Set `eventMode` on any container and subscribe to events:

```ts
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('image.png');
sprite.eventMode = 'static';
sprite.on('pointerdown', (event) => {
    console.log('Clicked at:', event.global.x, event.global.y);
});
```

## Event modes

The `eventMode` property controls how an object interacts with the event system:

| Mode | Description |
| --- | --- |
| `none` | Ignores all interaction events, including on children. Optimized for non-interactive elements. |
| `passive` | _(default)_ Does not respond to clicks/taps itself. Interactive children still receive events. |
| `auto` | Becomes clickable only when a parent is interactive. Does not emit events on its own. |
| `static` | Emits events and is hit tested. Use for stationary interactive elements like buttons. |
| `dynamic` | Same as `static`, but also checks for pointer overlap every frame (via the ticker), even when the pointer isn't moving. Use for objects that move or animate under a stationary cursor. |

```ts
import { Container } from 'pixi.js';

const container = new Container();

container.eventMode = 'none';      // no events (optimized)
container.eventMode = 'passive';   // only children receive events
container.eventMode = 'auto';      // events only when parent is interactive
container.eventMode = 'static';    // standard interaction events
container.eventMode = 'dynamic';   // events + synthetic updates for moving objects
```

## Event types

PixiJS supports pointer, mouse, and touch event types. Pointer events are recommended for cross-device compatibility.

### Pointer events (recommended)

| Event | Description |
| --- | --- |
| `pointerdown` | Pointer (mouse, pen, or touch) pressed on the object. |
| `pointerup` | Pointer released over the object. |
| `pointerupoutside` | Pointer released outside the object that received `pointerdown`. |
| `pointermove` | Pointer moves over the object. |
| `pointerover` | Pointer enters the object boundary. Bubbles. |
| `pointerout` | Pointer leaves the object boundary. Bubbles. |
| `pointerenter` | Pointer enters the object. Does not bubble. |
| `pointerleave` | Pointer leaves the object. Does not bubble. |
| `pointercancel` | Pointer interaction canceled (e.g., touch lost). |
| `pointertap` | Pointer completes a tap (press and release). |
| `globalpointermove` | Fires on every pointer move, regardless of hit target. |

### Mouse events

| Event | Description |
| --- | --- |
| `mousedown` | Mouse button pressed on the object. |
| `mouseup` | Mouse button released over the object. |
| `mouseupoutside` | Mouse button released outside the object that received `mousedown`. |
| `mousemove` | Mouse moves over the object. |
| `mouseover` | Mouse enters the object. |
| `mouseout` | Mouse leaves the object. |
| `mouseenter` | Mouse enters the object. Does not bubble. |
| `mouseleave` | Mouse leaves the object. Does not bubble. |
| `click` | Mouse click (press and release) on the object. |
| `rightdown` | Right mouse button pressed on the object. |
| `rightup` | Right mouse button released over the object. |
| `rightupoutside` | Right mouse button released outside the object that received `rightdown`. |
| `rightclick` | Right mouse click (press and release) on the object. |
| `globalmousemove` | Fires on every mouse move, regardless of hit target. |
| `wheel` | Mouse wheel scrolled over the object. |

### Touch events

| Event | Description |
| --- | --- |
| `touchstart` | Touch point placed on the object. |
| `touchend` | Touch point lifted from the object. |
| `touchendoutside` | Touch point ends outside the object that received `touchstart`. |
| `touchmove` | Touch point moves across the object. |
| `touchcancel` | Touch interaction canceled (e.g., device gesture). |
| `tap` | Touch tap on the object. |
| `globaltouchmove` | Fires on every touch move, regardless of hit target. |

### Global move events

> [!IMPORTANT]
> **v8 breaking change:** `pointermove`, `mousemove`, and `touchmove` now fire only when the pointer is over a display object. In v7, they fired on any canvas move. If you relied on the old behavior, switch to `globalpointermove`, `globalmousemove`, or `globaltouchmove`.

To get events on every move (regardless of what's under the pointer), use `globalpointermove`, `globalmousemove`, and `globaltouchmove`:

```ts
const sprite = Sprite.from('image.png');
sprite.eventMode = 'static';
sprite.on('globalpointermove', (event) => {
    console.log('Pointer moved:', event.global.x, event.global.y);
});
```

### Capture phase events

All events support capture phase listeners by appending `capture` to the event name (e.g., `pointerdowncapture`, `clickcapture`). Capture listeners fire during the capturing phase, before the event reaches its target.

```ts
container.addEventListener('pointerdown', (event) => {
    event.stopImmediatePropagation(); // blocks the event from reaching children
}, { capture: true });
```

## Hit testing

When an input event fires, PixiJS walks the display tree to find the top-most interactive element under the pointer:

- If `eventMode` is `'none'`, the element and its children are skipped entirely.
- If `interactiveChildren` is `false` on a container, its children are skipped.
- If a `hitArea` is set, it overrides bounds-based hit testing.
- Objects that are not visible, not renderable, or not measurable are skipped.

Once the target is found, the event dispatches to it and bubbles up the display tree.

### Custom hit areas

Define a custom hit area to override bounds-based testing. This can also improve performance by simplifying the geometry checked during hit tests.

```ts
import { Rectangle, Circle, Polygon, Sprite } from 'pixi.js';

const sprite = Sprite.from('image.png');
sprite.eventMode = 'static';

// rectangular hit area
sprite.hitArea = new Rectangle(0, 0, 100, 100);

// circular hit area
sprite.hitArea = new Circle(50, 50, 50);

// polygon hit area
sprite.hitArea = new Polygon([0, 0, 100, 0, 50, 100]);

// custom hit testing logic
sprite.hitArea = {
    contains(x, y) {
        return x >= 0 && x <= 100 && y >= 0 && y <= 100;
    }
};
```

## Listening to events

PixiJS supports three styles of event listening:

### `on()` / `off()` (EventEmitter style, recommended)

```ts
const handler = (e) => console.log('clicked');
sprite.on('pointerdown', handler);      // add listener
sprite.once('pointerdown', handler);    // one-time listener
sprite.off('pointerdown', handler);     // remove listener
```

### `addEventListener()` / `removeEventListener()` (DOM style)

```ts
sprite.addEventListener('click', (event) => {
    console.log('Clicked!', event.detail);
}, { once: true });
```

### Property-based callbacks

```ts
sprite.onclick = (event) => {
    console.log('Clicked!', event.detail);
};
```

## Checking interactivity

Use `isInteractive()` to check whether a container can receive events. Returns `true` when `eventMode` is `'static'` or `'dynamic'`.

```ts
sprite.eventMode = 'static';
sprite.isInteractive(); // true

sprite.eventMode = 'passive';
sprite.isInteractive(); // false
```

## Event features

Toggle event system features globally to control which event categories are active. All features default to `true`.

```ts
await app.init({
    eventFeatures: {
        move: true,           // pointer/mouse/touch move events
        globalMove: true,     // global move events (globalpointermove, etc.)
        click: true,          // click/tap/press events
        wheel: true,          // mouse wheel events
    }
});

// or configure after init
app.renderer.events.features.globalMove = false;
```

## Cursor management

Set a CSS cursor on interactive objects:

```ts
sprite.eventMode = 'static';
sprite.cursor = 'pointer';
sprite.cursor = 'grab';
sprite.cursor = 'url("custom.png"), auto';
```

### Custom cursor styles

Register named cursor styles on the event system and reference them by name:

```ts
const defaultIcon = "url('https://pixijs.com/assets/bunny.png'),auto";
const hoverIcon = "url('https://pixijs.com/assets/bunny_saturated.png'),auto";

app.renderer.events.cursorStyles.default = defaultIcon;
app.renderer.events.cursorStyles.hover = hoverIcon;

sprite.eventMode = 'static';
sprite.cursor = 'hover'; // uses the registered hover style
```

Cursor styles can be strings (CSS cursor values), objects (applied as CSS styles), or functions (called with the mode string).

## Performance tips

- Set `eventMode = 'none'` on non-interactive elements to skip hit testing entirely.
- Set `interactiveChildren = false` on containers where only the container itself needs interaction.
- Use `hitArea` for large or complex objects to simplify hit test geometry.
- Use `'static'` for stationary elements; reserve `'dynamic'` for elements that move or animate.
- Disable unused event features (e.g., `globalMove: false`) to reduce processing.

## API reference

- {@link EventSystem} - Core event management system
- {@link EventBoundary} - Event propagation and hit testing
- {@link EventMode} - Interaction mode type
- {@link Cursor} - Cursor type definition
- {@link FederatedEvent} - Base event class
- {@link FederatedPointerEvent} - Pointer event details
- {@link FederatedMouseEvent} - Mouse event details
- {@link FederatedWheelEvent} - Wheel event details
- {@link Container} - Display object event handling
