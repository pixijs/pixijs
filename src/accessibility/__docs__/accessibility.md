---
description: Use PixiJS's built-in accessibility features to make your applications inclusive for users with disabilities.
category: accessibility
title: Overview
---

# Accessibility

Canvas elements are invisible to screen readers. PixiJS solves this with a DOM-based overlay system: it places invisible `<div>` elements over your canvas, aligned to the bounds of accessible objects. These divs integrate with screen readers, keyboard navigation (`Tab` key), and other assistive technologies so users who can't see the canvas can still interact with your application.

These overlay elements:

- Receive focus via keyboard (`tabIndex`)
- Announce `accessibleTitle` or `accessibleHint` to screen readers
- Dispatch `click`, `mouseover`, `mouseout` events as PixiJS pointer events
- Use `aria-live` and `aria-label` where appropriate

> [!IMPORTANT] The {@link AccessibilitySystem} is not available in a Web Worker. It requires the main thread where the DOM is accessible.

## Enabling the system

The {@link AccessibilitySystem} is included in the default `pixi.js` bundle and installs automatically onto your renderer.

If you use `manageImports: false` for a custom build, import it explicitly before creating your renderer:

```ts
import 'pixi.js/accessibility';
```

## Basic usage

Enable accessibility on any container or display object:

```ts
import { Container } from 'pixi.js';

const button = new Container();
button.accessible = true;
button.accessibleTitle = 'Play Game';
button.accessibleHint = 'Press to start the game';
button.accessibleType = 'button';

app.stage.addChild(button);
```

## Accessible properties

| Property                  | Default      | Description                                                      |
| ------------------------- | ------------ | ---------------------------------------------------------------- |
| `accessible`              | `false`      | Enables accessibility for the object.                            |
| `accessibleTitle`         | `null`       | Sets the `title` attribute for screen readers.                   |
| `accessibleHint`          | `null`       | Sets the `aria-label` attribute.                                 |
| `accessibleText`          | `null`       | Alternative inner text for the div.                              |
| `accessibleType`          | `'button'`   | Tag name for the shadow element (`'button'`, `'div'`, etc.).     |
| `accessiblePointerEvents` | `'auto'`     | CSS `pointer-events` value (`'auto'`, `'none'`, etc.).           |
| `tabIndex`                | `0`          | Keyboard focus order.                                            |
| `accessibleChildren`      | `true`       | Whether children of this container are accessible.               |

A container with `accessible = true` but no `accessibleTitle` or `accessibleHint` gets a fallback title of `"container {tabIndex}"`. Always provide at least `accessibleTitle` so screen readers announce something meaningful.

## Configuration options

Configure the accessibility system when creating your application:

```ts
const app = new Application();
await app.init({
  accessibilityOptions: {
    enabledByDefault: true,      // Enable on startup instead of waiting for Tab
    activateOnTab: true,         // Allow Tab key to activate accessibility
    debug: false,                // Show accessibility divs for debugging
    deactivateOnMouseMove: true, // Disable when mouse is used
  },
});
```

You can also set defaults before creating any Application:

```ts
import { AccessibilitySystem } from 'pixi.js';

AccessibilitySystem.defaultOptions.enabledByDefault = true;
AccessibilitySystem.defaultOptions.deactivateOnMouseMove = false;
```

## Custom tab order

Control the tab order of accessible elements:

```ts
menuButton.tabIndex = 1;
playButton.tabIndex = 2;
settingsButton.tabIndex = 3;
```

## Container children

Control accessibility for nested elements:

```ts
const menu = new Container();
menu.accessible = true;
menu.accessibleChildren = true;  // Allow children to be accessible (default)

// Setting to false prevents all children from being accessible
menu.accessibleChildren = false;
```

## Handling interactions

Set both `eventMode` and `accessible` for full keyboard and pointer support. When a user activates a shadow div (via Enter/Space or screen reader action), the system dispatches a `FederatedEvent` to the corresponding container:

```ts
const button = new Sprite();
button.eventMode = 'static';
button.accessible = true;
button.accessibleTitle = 'Submit form';
button.tabIndex = 0;

button.on('pointertap', () => {
    submitForm();
});
```

## Programmatic control

Enable or disable the system at runtime:

```ts
app.renderer.accessibility.setAccessibilityEnabled(true);

console.log(app.renderer.accessibility.isActive);
console.log(app.renderer.accessibility.isMobileAccessibility);
```

## Mobile behavior

On mobile devices, the system creates a hidden touch hook button. When a screen reader user focuses this button, accessibility activates and stays active for the rest of the session (mouse movement won't deactivate it). This ensures assistive technology users don't lose their accessible overlay mid-interaction.

## Debugging

Use debug mode during development to see the overlay divs:

```ts
await app.init({
  accessibilityOptions: {
    debug: true,
  },
});
```

## Common pitfalls

**Overlay doesn't appear on load.** By default, the system waits for the user to press Tab before creating overlay divs. Set `enabledByDefault: true` or call `setAccessibilityEnabled(true)` if you need the overlay immediately (e.g., for automated accessibility testing tools).

**Overlay disappears when moving the mouse.** `deactivateOnMouseMove` defaults to `true`. Any mouse movement after Tab-activation removes the overlay. Set `deactivateOnMouseMove: false` during development to keep the overlay visible while testing with a mouse.

## API reference

- {@link AccessibilitySystem}
- {@link AccessibleOptions}
- {@link AccessibilityOptions}
