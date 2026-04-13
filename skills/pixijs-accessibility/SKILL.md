---
name: pixijs-accessibility
description: >
  Enable screen reader and keyboard support in PixiJS. AccessibilitySystem
  with enabledByDefault, debug, activateOnTab options. Container properties:
  accessible, accessibleTitle, accessibleHint, accessibleType, tabIndex.
  Tab-key activation by default; set enabledByDefault for immediate activation.
  Use when the user asks about screen readers, keyboard navigation, ARIA
  labels, tab order, accessible canvas, a11y, assistive technology, focus
  management, or making PixiJS content accessible. Covers AccessibilitySystem,
  accessibleTitle, accessibleHint, accessibleText, accessibleType,
  accessibleChildren.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  sources: "pixijs/pixijs:src/accessibility/AccessibilitySystem.ts, pixijs/pixijs:src/accessibility/accessibilityTarget.ts"
---

## When to Use This Skill

Apply when the user needs to add screen reader support, keyboard navigation, ARIA roles, or tab-order management to a PixiJS application.

**Related skills:** For pointer/mouse/touch event handling use **events**; for overlaying HTML elements on canvas use **dom-overlay**; for Application setup use **getting-started**.

## Setup

```ts
import { Application, Sprite, Assets } from 'pixi.js';

const app = new Application();
await app.init({
    width: 800,
    height: 600,
    accessibilityOptions: {
        enabledByDefault: true,
    },
});
document.body.appendChild(app.canvas);

const texture = await Assets.load('button.png');
const button = new Sprite(texture);
button.accessible = true;
button.accessibleTitle = 'Play game';
button.accessibleHint = 'Starts a new game session';
button.eventMode = 'static'; // required for tabIndex to take effect
button.tabIndex = 0;
app.stage.addChild(button);
```

Key points:
- The AccessibilitySystem creates an invisible DOM overlay of `<div>` elements positioned over accessible containers.
- By default, the system activates only when the user presses Tab. Set `enabledByDefault: true` to activate immediately.
- Each accessible container gets a shadow DOM element that screen readers can discover.
- The system is included by default; no extra import needed unless using `manageImports: false`.
- On mobile, the system creates a hidden touch hook button. When a screen reader focuses it, accessibility activates and stays active for the session (mouse movement won't deactivate it, by design for assistive technology users).
- The system requires the main thread; it's not available in a Web Worker.

## Core Patterns

### Container accessible properties

```ts
import { Container, Sprite } from 'pixi.js';

const container = new Container();
container.accessible = true;
container.accessibleTitle = 'Navigation menu';
container.accessibleHint = 'Contains links to other pages';
container.eventMode = 'static'; // required for custom tabIndex to apply
container.tabIndex = 0;
container.accessibleType = 'div'; // defaults to 'button'

const sprite = new Sprite();
sprite.accessible = true;
sprite.accessibleTitle = 'Close dialog';
sprite.accessibleText = 'X'; // text content of the shadow div
sprite.eventMode = 'static';
sprite.tabIndex = 1;
```

Available properties on any Container:
- `accessible` (boolean) - enables the accessible overlay div
- `accessibleTitle` (string) - sets the `title` attribute on the shadow div
- `accessibleHint` (string) - sets the `aria-label` attribute
- `accessibleText` (string) - sets inner text content of the shadow div
- `accessibleType` (string) - HTML tag for the shadow element, defaults to `'button'`
- `tabIndex` (number) - tab order for keyboard navigation (only applied when `interactive` is true / `eventMode` is `'static'` or `'dynamic'`)
- `accessibleChildren` (boolean, default `true`) - when `false`, prevents child containers from being accessible
- `accessiblePointerEvents` (string) - CSS `pointer-events` value on the shadow div

### Programmatic control

```ts
import { Application } from 'pixi.js';

const app = new Application();
await app.init({ width: 800, height: 600 });

// Enable accessibility at runtime
app.renderer.accessibility.setAccessibilityEnabled(true);

// Check current state
console.log(app.renderer.accessibility.isActive);
console.log(app.renderer.accessibility.isMobileAccessibility);

// Full init options:
await app.init({
    accessibilityOptions: {
        enabledByDefault: true,       // activate immediately (default: false)
        debug: true,                  // makes overlay divs visible (default: false)
        activateOnTab: true,          // Tab key activates system (default: true)
        deactivateOnMouseMove: false, // stay active when mouse moves (default: true)
    },
});
```

The system can also be configured via static defaults before creating the Application:

```ts
import { AccessibilitySystem, Application } from 'pixi.js';

AccessibilitySystem.defaultOptions.enabledByDefault = true;
AccessibilitySystem.defaultOptions.deactivateOnMouseMove = false;

const app = new Application();
await app.init();
```

### Handling accessible interactions

```ts
import { Sprite } from 'pixi.js';

const button = new Sprite();
button.eventMode = 'static';
button.accessible = true;
button.accessibleTitle = 'Submit form';
button.tabIndex = 0;

// Screen readers trigger click/tap events through the shadow DOM element
button.on('pointertap', () => {
    submitForm();
});
```

When accessibility is active and a user activates a shadow div (via Enter/Space key or screen reader action), the system dispatches a `FederatedEvent` to the corresponding container. Both `eventMode` and `accessible` should be set for full keyboard + pointer support.

## Common Mistakes

### [MEDIUM] Expecting accessibility to be active without Tab key press

The AccessibilitySystem does not create its DOM overlay until the user presses Tab (or, on mobile, focuses the touch hook). If your application needs accessibility immediately:

```ts
const app = new Application();
await app.init({
    accessibilityOptions: {
        enabledByDefault: true,
    },
});
```

Or at runtime:
```ts
app.renderer.accessibility.setAccessibilityEnabled(true);
```

Without one of these, automated accessibility testing tools will not find the overlay elements.

Source: src/accessibility/AccessibilitySystem.ts

### [MEDIUM] Setting accessible without accessibleTitle

Wrong:
```ts
const sprite = new Sprite();
sprite.accessible = true;
// no title or hint set
```

Correct:
```ts
const sprite = new Sprite();
sprite.accessible = true;
sprite.accessibleTitle = 'Play button';
sprite.accessibleHint = 'Click to start the game';
```

A container with `accessible = true` but no `accessibleTitle` or `accessibleHint` gets a fallback title of `"container {tabIndex}"`. Screen readers will announce this generic label with no useful context. Always provide at least `accessibleTitle`.

Source: src/accessibility/AccessibilitySystem.ts

### [MEDIUM] Accessibility deactivates when moving mouse

By default, `deactivateOnMouseMove` is `true`. Any mouse movement after Tab-activation will deactivate the overlay. This is by design (assumes keyboard-only users don't use a mouse), but it makes testing with a mouse frustrating.

```ts
await app.init({
    accessibilityOptions: {
        deactivateOnMouseMove: false,
    },
});
```

Source: src/accessibility/AccessibilitySystem.ts

### [MEDIUM] Not importing accessibility extension with manageImports

When using `manageImports: false` for a custom build, the accessibility extension is not automatically registered. You must import it explicitly:

```ts
import 'pixi.js/accessibility';
import { Application } from 'pixi.js';

const app = new Application();
await app.init({ manageImports: false });
```

Without this import, `app.renderer.accessibility` will be undefined and no shadow DOM layer will be created.

Source: src/accessibility/init.ts

---

See also: events (pointer/mouse/touch handling), dom-overlay (HTML elements on canvas), getting-started (Application setup)

## Learn More

- [AccessibilitySystem](https://pixijs.download/release/docs/accessibility.AccessibilitySystem.html.md)
- [AccessibilityOptions](https://pixijs.download/release/docs/accessibility.AccessibilityOptions.html.md)
- [AccessibleOptions](https://pixijs.download/release/docs/accessibility.AccessibleOptions.html.md)
