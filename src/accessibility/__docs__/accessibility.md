---
description: Use PixiJS's built-in accessibility features to make your applications inclusive for users with disabilities.
category: accessibility
title: Overview
---

# Accessibility

Canvas elements are invisible to screen readers by default. PixiJS bridges this gap with a DOM-based overlay system: it places invisible `<div>` elements over your canvas, aligned to the bounds of accessible objects. These divs integrate with screen readers, keyboard navigation (`Tab` key), and other assistive technologies so that users who can't see the canvas can still interact with your application.

These overlay elements:

- Receive focus via keyboard (`tabIndex`)
- Announce `accessibleTitle` or `accessibleHint` to screen readers
- Dispatch `click`, `mouseover`, `mouseout` events as PixiJS pointer events
- Use `aria-live` and `aria-label` where appropriate

> [!IMPORTANT] The {@link AccessibilitySystem} is not available in a Web Worker. It requires the main thread where the DOM is accessible.

## Enabling the system

Accessibility is an opt-in module to keep the default bundle small. Import it before creating your renderer:

```ts
import 'pixi.js/accessibility';
```

PixiJS automatically installs the {@link AccessibilitySystem} onto your renderer.

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

## Configuration options

Configure the accessibility system when creating your application:

```ts
const app = new Application();
await app.init({
  accessibilityOptions: {
    enabledByDefault: true,      // Enable on startup instead of waiting for tab
    activateOnTab: true,         // Allow tab key to activate accessibility
    debug: false,                // Show accessibility divs for debugging
    deactivateOnMouseMove: true, // Disable when mouse is used
  },
});
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

## Programmatic control

Enable or disable the system at runtime:

```ts
app.renderer.accessibility.setAccessibilityEnabled(true);

console.log(app.renderer.accessibility.isActive);
console.log(app.renderer.accessibility.isMobileAccessibility);
```

## Debugging

Use debug mode during development to see the overlay divs:

```ts
await app.init({
  accessibilityOptions: {
    debug: true,
  },
});
```

## API reference

- {@link AccessibilitySystem}
- {@link AccessibleOptions}
- {@link AccessibilityOptions}
