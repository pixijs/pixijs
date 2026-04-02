---
name: events
description: >
  Handle user input with PixiJS events. eventMode property (none, passive,
  auto, static, dynamic). FederatedEvent types: pointer, mouse, touch,
  wheel. Capture phase events. Container lifecycle events: added, removed,
  childAdded, childRemoved, destroyed, visibleChanged. hitArea for custom
  hit testing. interactiveChildren flag. cursor and cursorStyles.
  eventFeatures configuration. Global move events. Use when the user asks
  about click handling, tap events, drag and drop, pointer events, mouse
  events, touch input, hit testing, cursor styles, event propagation,
  stopPropagation, interactive objects, or eventMode. Covers EventSystem,
  FederatedPointerEvent, FederatedEvent, EventBoundary, IHitArea.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  requires: "pixijs, core-concepts"
  sources: "pixijs/pixijs:src/events/EventSystem.ts, pixijs/pixijs:src/events/FederatedEvent.ts, pixijs/pixijs:src/events/FederatedEventTarget.ts, pixijs/pixijs:src/events/FederatedEventMap.ts"
---

## When to Use This Skill

Apply when the user needs to handle pointer, mouse, touch, or wheel input on PixiJS display objects, implement drag-and-drop, configure hit areas, manage event propagation, or customize cursor styles.

**Related skills:** For screen reader and keyboard support use **accessibility**; for HTML overlays on canvas use **dom-overlay**; for container hierarchy and transforms use **core-concepts**; for optimizing event-heavy scenes use **performance**.

This skill builds on pixijs and core-concepts. Read them first.

## Setup

```ts
import { Application, Sprite, Assets, Rectangle, Circle } from 'pixi.js';

const app = new Application();
await app.init({ width: 800, height: 600 });
document.body.appendChild(app.canvas);

const texture = await Assets.load('button.png');
const button = new Sprite(texture);
button.eventMode = 'static';
button.cursor = 'pointer';
button.on('pointerdown', (event) => {
    console.log('clicked at', event.global.x, event.global.y);
});
app.stage.addChild(button);
```

Key points:
- Every container starts with `eventMode: 'passive'` (receives no events on itself).
- Set `eventMode` to `'static'` or `'dynamic'` before attaching listeners.
- `cursor` sets the CSS cursor on hover. It must be set per-object; it does not inherit.
- Three listener styles: `.on()` / `.off()` (recommended), `addEventListener()` / `removeEventListener()` (DOM style), and property handlers (`sprite.onclick = fn`).

## Core Patterns

### eventMode values

```ts
import { Sprite } from 'pixi.js';

const sprite = new Sprite();

// No interaction at all; children also ignored
sprite.eventMode = 'none';

// Default. Self not interactive; interactive children still work
sprite.eventMode = 'passive';

// Hit tested only when a parent is interactive
sprite.eventMode = 'auto';

// Standard interaction: receives pointer/mouse/touch events
sprite.eventMode = 'static';

// Like static, but also fires synthetic events from the ticker
// when the pointer is stationary (for animated objects under cursor)
sprite.eventMode = 'dynamic';
```

Use `'static'` for buttons, UI elements, and drag targets. Use `'dynamic'` only for objects that move under a stationary cursor and need continuous hover updates.

Use `isInteractive()` to check whether an object can receive events:

```ts
sprite.eventMode = 'static';
sprite.isInteractive(); // true

sprite.eventMode = 'passive';
sprite.isInteractive(); // false
```

### Event types

Pointer events (recommended for cross-device compatibility): `pointerdown`, `pointerup`, `pointerupoutside`, `pointermove`, `pointerover`, `pointerout`, `pointerenter`, `pointerleave`, `pointertap`, `pointercancel`.

Mouse events: `mousedown`, `mouseup`, `mouseupoutside`, `mousemove`, `mouseover`, `mouseout`, `mouseenter`, `mouseleave`, `click`, `rightdown`, `rightup`, `rightupoutside`, `rightclick`, `wheel`.

Touch events: `touchstart`, `touchend`, `touchendoutside`, `touchmove`, `touchcancel`, `tap`.

Global move events: `globalpointermove`, `globalmousemove`, `globaltouchmove`. These fire on every pointer movement regardless of whether the pointer is over the listening object.

Container lifecycle events (no `eventMode` required): `added`, `removed`, `destroyed`, `childAdded`, `childRemoved`, `visibleChanged`.

### Listening styles

```ts
import { Sprite } from 'pixi.js';

const sprite = new Sprite();
sprite.eventMode = 'static';

// EventEmitter style (recommended)
const handler = (e) => console.log('clicked');
sprite.on('pointerdown', handler);
sprite.once('pointerdown', handler);  // one-time
sprite.off('pointerdown', handler);

// DOM style
sprite.addEventListener('click', (event) => {
    console.log('Clicked!', event.detail);
}, { once: true });

// Property-based handlers
sprite.onclick = (event) => {
    console.log('Clicked!', event.detail);
};
```

### Pointer events and propagation

```ts
import { Sprite, Container } from 'pixi.js';

const parent = new Container();
parent.eventMode = 'static';

const child = new Sprite();
child.eventMode = 'static';
parent.addChild(child);

child.on('pointerdown', (event) => {
    console.log('child pressed');
    event.stopPropagation(); // prevent parent from receiving this event
});

parent.on('pointerdown', () => {
    console.log('parent pressed (only if child did not stop propagation)');
});
```

### Capture phase events

All events support capture phase by appending `capture` to the event name (e.g., `pointerdowncapture`, `clickcapture`). Capture listeners fire during the capturing phase, before the event reaches its target.

```ts
container.addEventListener('pointerdown', (event) => {
    event.stopImmediatePropagation(); // blocks event from reaching children
}, { capture: true });
```

### Custom hit areas

```ts
import { Sprite, Rectangle, Circle, Polygon } from 'pixi.js';

const sprite = new Sprite();
sprite.eventMode = 'static';

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
    }
};
```

When `hitArea` is set, only that shape is tested; the display object's bounds are ignored. The `interactiveChildren` flag (default `true`) controls whether children are hit tested. Set it to `false` to block events from reaching children.

### Global move events and drag

```ts
import { Sprite, FederatedPointerEvent } from 'pixi.js';

const sprite = new Sprite();
sprite.eventMode = 'static';
sprite.cursor = 'grab';

let dragging = false;

sprite.on('pointerdown', (event: FederatedPointerEvent) => {
    dragging = true;
    sprite.cursor = 'grabbing';
});

// globalpointermove fires even when pointer leaves the object
sprite.on('globalpointermove', (event: FederatedPointerEvent) => {
    if (dragging) {
        sprite.position.set(event.global.x, event.global.y);
    }
});

sprite.on('pointerup', () => {
    dragging = false;
    sprite.cursor = 'grab';
});

sprite.on('pointerupoutside', () => {
    dragging = false;
    sprite.cursor = 'grab';
});
```

### Cursor styles

Basic usage sets the `cursor` property per-object. For reusable cursors, register named styles on the event system:

```ts
app.renderer.events.cursorStyles.default = "url('bunny.png'), auto";
app.renderer.events.cursorStyles.hover = "url('bunny_saturated.png'), auto";

sprite.eventMode = 'static';
sprite.cursor = 'hover'; // uses the registered 'hover' style
```

Cursor styles can be strings (CSS cursor values), objects (applied as CSS styles), or functions (called with the mode string).

### Event features

Toggle event categories globally for performance:

```ts
await app.init({
    eventFeatures: {
        move: true,        // pointer/mouse/touch move events
        globalMove: true,  // global move events (globalpointermove, etc.)
        click: true,       // click/tap/press events
        wheel: true,       // mouse wheel events
    }
});

// or configure after init
app.renderer.events.features.globalMove = false;
```

## Common Mistakes

### [HIGH] Default eventMode is passive

Wrong:
```ts
const sprite = new Sprite(texture);
sprite.on('pointerdown', () => { console.log('clicked'); });
```

Correct:
```ts
const sprite = new Sprite(texture);
sprite.eventMode = 'static';
sprite.on('pointerdown', () => { console.log('clicked'); });
```

The default `eventMode` is `'passive'`, which means the object itself receives no events. You must explicitly set `eventMode` to `'static'` or `'dynamic'` before any listener will fire.

Source: src/__docs__/migrations/v8.md

### [HIGH] buttonMode removed; use cursor

Wrong:
```ts
sprite.interactive = true;
sprite.buttonMode = true;
```

Correct:
```ts
sprite.eventMode = 'static';
sprite.cursor = 'pointer';
```

`buttonMode` was removed in v8. Use `cursor = 'pointer'` to show a hand cursor on hover. `interactive = true` still works as an alias for `eventMode = 'static'`, but `eventMode` is preferred.

Source: src/__docs__/migrations/v8.md

### [HIGH] Move events only fire over the object in v8

Wrong:
```ts
sprite.eventMode = 'static';
sprite.on('pointermove', (event) => {
    // expects to fire everywhere; only fires inside sprite bounds
    updateDrag(event.global.x, event.global.y);
});
```

Correct:
```ts
sprite.eventMode = 'static';
sprite.on('globalpointermove', (event) => {
    // fires everywhere, even outside sprite bounds
    updateDrag(event.global.x, event.global.y);
});
```

In v8, `pointermove`, `mousemove`, and `touchmove` only fire when the pointer is over the display object. In v7 they fired on any canvas move. For drag operations or global tracking, use `globalpointermove`, `globalmousemove`, or `globaltouchmove`.

Source: src/__docs__/migrations/v7.md

### [MEDIUM] Cursor does not inherit from parent

Setting `cursor` on a parent container has no effect on its children. Only the direct hit target's `cursor` value is applied.

```ts
// This does NOT make children show a pointer cursor
parent.cursor = 'pointer';

// Each interactive child needs its own cursor
child.eventMode = 'static';
child.cursor = 'pointer';
```

If you want a uniform cursor for all children, set `cursor` on each interactive child individually, or set `hitArea` on the parent and make children non-interactive.

Source: GitHub issue #11048

---

See also: accessibility (screen reader support), dom-overlay (HTML elements on canvas), core-concepts (Container basics), migration-v8 (v7 to v8 changes)

## Learn More

- [EventSystem](https://pixijs.download/release/docs/events.EventSystem.html.md)
- [FederatedPointerEvent](https://pixijs.download/release/docs/events.FederatedPointerEvent.html.md)
- [FederatedEvent](https://pixijs.download/release/docs/events.FederatedEvent.html.md)
- [EventBoundary](https://pixijs.download/release/docs/events.EventBoundary.html.md)
- [FederatedWheelEvent](https://pixijs.download/release/docs/events.FederatedWheelEvent.html.md)
