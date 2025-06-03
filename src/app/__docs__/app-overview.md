---
title: Overview
category: app
---

# Application

The `Application` class provides a modern, extensible entry point to set up rendering in PixiJS. It abstracts common tasks like renderer setup, display management, and automatic updates while supporting both WebGL and WebGPU rendering backends.

## Creating an Application

Creating an application requires two steps: constructing an instance, then initializing it asynchronously using `.init()`:

```ts
import { Application } from 'pixi.js';

const app = new Application();

await app.init({
    width: 800,
    height: 600,
    backgroundColor: 0x1099bb,
});

document.body.appendChild(app.canvas);
```

## Core Features

### Scene Management

The application provides a root container (`stage`) where you can add all your visual elements:

```ts
import { Sprite } from 'pixi.js';

const sprite = Sprite.from('image.png');
app.stage.addChild(sprite);
```

### Automatic Updates

By default, the application includes the `TickerPlugin` which handles the rendering loop:

```ts
// Configure ticker on init
await app.init({
    autoStart: true, // Start ticker automatically
    sharedTicker: false, // Use dedicated ticker instance
});

// (Optional) Start/stop the rendering loop
app.start();
app.stop();

// Access ticker properties
console.log(app.ticker.FPS); // Current FPS
console.log(app.ticker.deltaMS); // MS since last update

// Add update callbacks
app.ticker.add(() => {
    // Animation logic here
});

app.ticker.addOnce(() => {
    // Logic to run once after the next frame
});
```

### Responsive Design

The `ResizePlugin` enables automatic resizing of the application to fit different containers or the window. You can specify a target element for resizing:

```ts
// Auto-resize to window
await app.init({ resizeTo: window });

// Auto-resize to container element
await app.init({ resizeTo: document.querySelector('#game') });

// Manual resize control
app.resize(); // Immediate resize
app.queueResize(); // Throttled resize
app.cancelResize(); // Cancel pending resize
```

## Configuration Options

The application can be configured with various options during initialization:

```ts
await app.init({
    // Rendering options
    width: 800, // Canvas width
    height: 600, // Canvas height
    backgroundColor: 0x1099bb, // Background color
    antialias: true, // Enable antialiasing
    resolution: window.devicePixelRatio, // Screen resolution
    preference: 'webgl', // 'webgl' or 'webgpu'

    // Plugin options
    autoStart: true, // Start ticker automatically
    sharedTicker: false, // Use dedicated ticker
    resizeTo: window, // Auto-resize target
});
```

## Cleanup

When you're done with the application, make sure to clean up resources:

```ts
// Basic cleanup
app.destroy();

// Full cleanup with options
app.destroy(
    { removeView: true }, // Renderer options
    {
        // Display options
        children: true,
        texture: true,
        textureSource: true,
    },
);
```

## Extending Functionality

The Application class is designed to be extensible through plugins. Each plugin can add new features and properties to the Application instance:

```ts
import { Application, ExtensionType, extensions } from 'pixi.js';

class MyPlugin {
    static extension = ExtensionType.Application;

    static init(options) {
        // Add features to Application instance
        Object.defineProperty(this, 'myFeature', {
            value: () => console.log('My feature!'),
        });
    }

    static destroy() {
        // Cleanup when application is destroyed
    }
}

// Register the plugin
extensions.add(MyPlugin);

// Initialize the application with the plugin
const app = new Application();
await app.init({...});

app.myFeature(); // Use the plugin feature
```

## Best Practices

-   Always `await app.init()` before using the application
-   Use `app.ticker` for animation updates rather than `requestAnimationFrame`
-   Clean up resources with `app.destroy()` when the application is no longer needed
-   Consider using `resizeTo` for responsive applications

## Related Documentation

- See {@link Application} for the full API reference
- See {@link ApplicationOptions} for all available configuration options
- See {@link ApplicationPlugin} for creating custom plugins
- See {@link TickerPlugin} for details on the ticker system
- See {@link ResizePlugin} for responsive design features
- See {@link CullerPlugin} for managing visible objects
- See {@link ExtensionType} for understanding extension types
- See {@link Renderer} for renderer-specific options and methods
- See {@link Container} for managing display objects

For more specific implementation details and advanced usage, refer to the API documentation of individual classes and interfaces.
