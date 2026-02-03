---
title: Accessibility Overview
category: accessibility
---

# Accessibility

The accessibility system in PixiJS provides screen reader support and keyboard navigation for your application, making your content more accessible to users with disabilities. The system works by creating an accessible DOM layer over your canvas that can be navigated and interpreted by assistive technologies.

## Getting Started

The accessibility module is included by default in PixiJS. However, if you're managing your own renderer, you'll need to import it explicitly:

```js
import 'pixi.js/accessibility';
```

> [!IMPORTANT] The AccessibilitySystem is not available when used in a Web Worker. It must be used in the main thread where the DOM is accessible.

## Basic Usage

Enable accessibility for any container or display object:

```js
const button = new Container();

// Enable accessibility
button.accessible = true;
button.accessibleTitle = 'Play Game'; // Screen reader label
button.accessibleHint = 'Press to start the game'; // Additional description
button.accessibleType = 'button'; // DOM element type to create

// Add to your scene
app.stage.addChild(button);
```

## Configuration Options

Configure the accessibility system when creating your application:

```js
const app = new Application();
await app.init({
    accessibilityOptions: {
        enabledByDefault: true,     // Enable immediately instead of waiting for tab
        activateOnTab: true,        // Enable/disable tab key activation
        debug: false,               // Show accessibility divs (for development)
        deactivateOnMouseMove: true // Auto-disable when mouse is used
    }
});
```

## Advanced Features

### Custom Tab Order

Control the tab order of accessible elements:

```js
menuButton.tabIndex = 1;    // First in tab order
playButton.tabIndex = 2;    // Second in tab order
settingsButton.tabIndex = 3; // Third in tab order
```

### Container Behavior

Control accessibility for nested elements:

```js
const menu = new Container();
menu.accessible = true;
menu.accessibleChildren = true; // Allow children to be accessible (default)
```

### Programmatic Control

Control the accessibility system at runtime:

```js
// Enable/disable the system
app.renderer.accessibility.setAccessibilityEnabled(true);

// Check if accessibility is active
console.log(app.renderer.accessibility.isActive);

// Check if mobile accessibility is active
console.log(app.renderer.accessibility.isMobileAccessibility);
```

## Best Practices

1. **Meaningful Labels**: Always provide clear `accessibleTitle` and `accessibleHint` values:
```js
button.accessibleTitle = 'Start Game';
button.accessibleHint = 'Begins a new game session';
```

2. **Logical Tab Order**: Organize `tabIndex` values in a meaningful sequence:
```js
headerMenu.tabIndex = 1;
mainContent.tabIndex = 2;
footerControls.tabIndex = 3;
```

3. **Testing**: Use the debug mode during development:
```js
await app.init({
    accessibilityOptions: {
        debug: true // Shows accessibility elements
    }
});
```

## Related Documentation

- See {@link AccessibilitySystem} for system implementation details
- See {@link AccessibleOptions} for all available object properties

For more specific implementation details and advanced usage, refer to the API documentation of individual classes and interfaces.
