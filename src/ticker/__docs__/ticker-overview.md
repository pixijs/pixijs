---
title: Overview
category: ticker
---

# Ticker

The `Ticker` class provides a powerful timing system for managing animation frames and game loops in PixiJS. It offers precise timing control, priority-based updates, and flexible callback management.

## Basic Usage

Create and start a ticker with callbacks:

```ts
import { Ticker } from 'pixi.js';

// Create a new ticker
const ticker = new Ticker();

// Add update callback
ticker.add((ticker) => {
    sprite.rotation += 0.1 * ticker.deltaTime;
});

// Start the ticker
ticker.start();
```

## Core Features

### Update Management

Control how callbacks are registered and executed:

```ts
// Regular updates
ticker.add((ticker) => {
    // Runs every frame
    console.log(`Delta time: ${ticker.deltaTime}ms`);
});

// One-time updates
ticker.addOnce(() => {
    // Runs on next frame only
    console.log('Initialization complete');
});

// Remove updates
ticker.remove(callback);
```

### Priority System

Organize updates with priority levels:

```ts
import { UPDATE_PRIORITY } from 'pixi.js';

// High priority (runs first)
ticker.add(
    (ticker) => {
        physics.update(ticker.deltaTime);
    },
    null,
    UPDATE_PRIORITY.HIGH
);

// Normal priority
ticker.add(
    (ticker) => {
        animations.update(ticker.deltaTime);
    },
    null,
    UPDATE_PRIORITY.NORMAL
);

// Low priority (runs last)
ticker.add(
    (ticker) => {
        ui.update(ticker.deltaTime);
    },
    null,
    UPDATE_PRIORITY.LOW
);
```

### Frame Rate Control

Manage update frequency and timing:

```ts
// Limit maximum FPS
ticker.maxFPS = 60;  // Cap at 60 FPS
ticker.maxFPS = 30;  // Cap at 30 FPS
ticker.maxFPS = 0;   // No FPS limit

// Set minimum FPS (affects deltaTime)
ticker.minFPS = 30;  // Prevent slow-motion below 30 FPS

// Speed control
ticker.speed = 0.5;  // Half speed (slow motion)
ticker.speed = 2.0;  // Double speed (fast forward)
```

### Timing Properties

Access detailed timing information:

```ts
// Time values
console.log(ticker.deltaTime);  // Scaled time since last update
console.log(ticker.deltaMS);    // Raw milliseconds since last update
console.log(ticker.elapsedMS);  // Time spent on last update
console.log(ticker.lastTime);   // Timestamp of last update
console.log(ticker.FPS);        // Current frames per second

// Frame counting
console.log(ticker.count);      // Number of active listeners
```

## Shared Ticker

Use the global shared ticker for application-wide timing:

```ts
import { Ticker } from 'pixi.js';

// Access the shared ticker
const shared = Ticker.shared;

// Configure shared ticker
shared.autoStart = true;     // Start automatically
shared.minFPS = 30;         // Set minimum FPS
shared.maxFPS = 60;         // Set maximum FPS

// Add updates to shared ticker
shared.add((ticker) => {
    // Global update logic
});
```

## Context Binding

Maintain proper `this` context in callbacks:

```ts
class GameSystem {
    update(ticker: Ticker) {
        this.position += this.speed * ticker.deltaTime;
    }
}

const system = new GameSystem();
ticker.add(system.update, system);  // Bind context
```

### Cleanup

Properly dispose of tickers:

```ts
// Stop updates
ticker.stop();

// Remove specific listener
ticker.remove(callback);

// Complete cleanup
ticker.destroy();
```

## Best Practices

- Use `deltaTime` for frame-rate independent animations
- Organize updates with appropriate priorities
- Clean up tickers when no longer needed
- Use `shared` ticker for application-wide timing

## Related Documentation

- See {@link Ticker} for the ticker class
- See {@link TickerCallback} for callback type definition
- See {@link UPDATE_PRIORITY} for priority constants
- See {@link TickerPlugin} for Application integration
- See {@link Application} for high-level usage
- See {@link AnimatedSprite} for sprite animation
- See {@link VideoResource} for video playback

For detailed implementation requirements and advanced usage, refer to the API documentation of individual classes and interfaces.
