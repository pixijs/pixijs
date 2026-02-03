---
title: Overview
category: events
---

# Events

PixiJS provides a flexible and performant event system designed for both mouse and touch input. The system uses a unified, DOM-like federated event model that supports bubbling, capturing, and delegation.

## Basic Usage

Enable interaction on any display object by setting its `eventMode`:

```ts
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('image.png');
sprite.eventMode = 'static';
sprite.on('pointerdown', (event) => {
    console.log('Clicked at:', event.global.x, event.global.y);
});

// check if the sprite is interactive
if (sprite.isInteractive()) {
    console.log('Sprite is interactive');
}
```

## Event Modes

The `eventMode` property controls how objects interact with the event system:

```ts
import { Container } from 'pixi.js';

const container = new Container();

// Different interaction modes
container.eventMode = 'none';      // No events (optimized)
container.eventMode = 'passive';   // Only children receive events
container.eventMode = 'auto';      // Events when parent is interactive
container.eventMode = 'static';    // Standard interaction events
container.eventMode = 'dynamic';   // Events + synthetic updates for moving objects
```

## Event Types

### Pointer Events (Recommended)

```ts
sprite.on('pointerdown', (event) => {/* Press */});
sprite.on('pointerup', (event) => {/* Release */});
sprite.on('pointermove', (event) => {/* Movement */});
sprite.on('pointerover', (event) => {/* Enter */});
sprite.on('pointerout', (event) => {/* Exit */});
sprite.on('globalpointermove', (event) => {/* Any movement */});
```

### Mouse Events

```ts
sprite.on('mousedown', (event) => {/* Mouse press */});
sprite.on('mouseup', (event) => {/* Mouse release */});
sprite.on('mousemove', (event) => {/* Mouse movement */});
sprite.on('click', (event) => {/* Click */});
sprite.on('rightclick', (event) => {/* Right click */});
sprite.on('wheel', (event) => {/* Scroll */});
```

### Touch Events

```ts
sprite.on('touchstart', (event) => {/* Touch begin */});
sprite.on('touchend', (event) => {/* Touch end */});
sprite.on('touchmove', (event) => {/* Touch movement */});
sprite.on('tap', (event) => {/* Quick tap */});
```

### Global Events

In previous versions of PixiJS, events such as `pointermove`, `mousemove`, and `touchmove` were fired when any move event was captured by the canvas, even if the pointer was not over a display object. This behavior changed in v8 and now these events are fired only when the pointer is over a display object.

To maintain the old behavior, you can use the `globalpointermove`, `globalmousemove`, and `globaltouchmove` events. These events are fired on every pointer/touch move, regardless of whether any display object is hit.

```ts
sprite.on('globalpointermove', (event) => {
    console.log('Pointer moved globally!', event);
});
```

## Event Handling

Multiple ways to listen for events:

```ts
// Using EventEmitter style (recommended)
sprite.on('pointerdown', onDown);          // Add listener
sprite.once('pointerdown', onDown);        // One-time listener
sprite.off('pointerdown', onDown);         // Remove listener

// Using DOM style
sprite.addEventListener('click', onClick);
sprite.removeEventListener('click', onClick);

// Using event properties
sprite.onclick = (event) => console.log('clicked');
```


## Optimizations

To optimize event handling and performance, consider the following:
- Use `eventMode = 'none'` for non-interactive objects to skip hit testing.
- Use a `hitArea` for hit testing instead of using the objects bounding box. This can improve performance, especially for complex shapes.
- Set `interactiveChildren = false` on containers to skip hit testing of child objects. This stops the event system from checking children for interaction, which can improve performance when you only need to interact with the container itself.

```ts
import { Rectangle } from 'pixi.js';

// Custom hit area
sprite.hitArea = new Rectangle(0, 0, 100, 100);
sprite.hitArea = new Circle(50, 50, 50); // Circle hit area
sprite.hitArea = new Polygon([0, 0, 100, 0, 50, 100]); // Polygon hit area

// Control child hit testing
container.interactiveChildren = false; // Skip children
```

### Event Features

Configuring different event system features through renderer options can help optimize performance and control behavior. You can enable or disable specific event features globally or per object.

```ts
await app.init({
    eventFeatures: {
        // Core features
        move: true,           // Enable movement events
        click: true,          // Enable click events
        wheel: true,          // Enable scroll events

        // Global tracking
        globalMove: false,    // Disable global movement
    }
});

// Or configure after initialization
app.renderer.events.features.globalMove = true;
```

## Cursor Management

Customize cursor appearance for interactive objects:

```ts
// Basic cursor styles
sprite.cursor = 'pointer';    // Hand cursor
sprite.cursor = 'grab';       // Grab cursor
sprite.cursor = 'crosshair';  // Precise selection

// Custom cursor image
sprite.cursor = 'url("custom.png"), auto';

// Global cursor styles
app.renderer.events.cursorStyles.default = 'pointer';
app.renderer.events.cursorStyles.hover = 'url("hover.png"), auto';
```

## Best Practices

- Use `pointerdown/up/move` events instead of mouse/touch for better cross-device support
- Set `eventMode = 'none'` on non-interactive elements for better performance
- Use `static` mode for stationary interactive elements
- Use `dynamic` mode only for moving interactive elements
- Consider using `hitArea` for precise or optimized hit testing
- Clean up event listeners when destroying objects

## Related Documentation

- See {@link EventSystem} for the event management system
- See {@link EventMode} for interaction mode details
- See {@link Cursor} for cursor customization options
- See {@link FederatedEvent} for base event properties
- See {@link FederatedPointerEvent} for pointer event details
- See {@link FederatedMouseEvent} for mouse event details
- See {@link FederatedWheelEvent} for wheel event details
- See {@link Container} for display object event handling
- See {@link EventBoundary} for event propagation control

For more specific implementation details and advanced usage, refer to the API documentation of individual classes and interfaces.
