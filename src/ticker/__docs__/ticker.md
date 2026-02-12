---
title: Overview
description: Use the Ticker class in PixiJS to run game loops, animations, and time-based updates with priority control and FPS limiting.
category: ticker
---

# Ticker

The {@link Ticker} class executes callbacks on every animation frame. It handles game loops, animations, and any time-based updates with priority ordering and frame rate control.

```ts
import { Ticker } from 'pixi.js';

const ticker = new Ticker();

ticker.add((ticker) => {
    sprite.rotation += 0.1 * ticker.deltaTime;
});

ticker.start();
```

## Adding and removing listeners

You can register multiple listeners called each frame. Use `addOnce` for callbacks you only need to fire once, and `remove` to unregister a listener.

```ts
// Called every frame
ticker.add((ticker) => {
    console.log(`Delta: ${ticker.deltaTime}`);
});

// Called once on the next frame, then removed
ticker.addOnce(() => {
    console.log('Ready');
});

// Remove a specific listener
ticker.remove(myCallback);
```

Pass a context as the second argument to preserve the correct `this` reference:

```ts
class GameSystem {
    public speed = 5;
    public position = 0;

    public update(ticker: Ticker): void {
        this.position += this.speed * ticker.deltaTime;
    }
}

const system = new GameSystem();

ticker.add(system.update, system);
```

## Controlling the ticker

```ts
ticker.start(); // Begin calling listeners every frame
ticker.stop();  // Pause and cancel the animation frame
```

To start the ticker automatically when the first listener is added:

```ts
ticker.autoStart = true;
```

## Prioritizing listeners

Listeners can be assigned a priority. Higher values run earlier.

```ts
import { UPDATE_PRIORITY } from 'pixi.js';

ticker.add(physics.update, physics, UPDATE_PRIORITY.HIGH);   // runs first
ticker.add(render.update, render, UPDATE_PRIORITY.NORMAL);   // runs second
ticker.add(ui.update, ui, UPDATE_PRIORITY.LOW);              // runs last
```

Available constants:

- `UPDATE_PRIORITY.HIGH = 50`
- `UPDATE_PRIORITY.NORMAL = 0`
- `UPDATE_PRIORITY.LOW = -50`

## Configuring FPS

### `minFPS`

Caps how large `deltaTime` can get during slow frames. If the real frame rate drops below `minFPS`, PixiJS pretends the frame took `1 / minFPS` seconds. This prevents objects from teleporting across the screen during lag spikes:

```ts
ticker.minFPS = 30; // deltaTime won't exceed ~2.0, even if a frame takes 500ms
```

### `maxFPS`

Limits how _fast_ the ticker runs. Useful for conserving CPU/GPU:

```ts
ticker.maxFPS = 60; // will not tick faster than 60 fps
```

Set to `0` to allow unlimited frame rate:

```ts
ticker.maxFPS = 0;
```

## Speed control

Scale the passage of time for all listeners at once:

```ts
ticker.speed = 0.5; // half speed (slow motion)
ticker.speed = 2.0; // double speed (fast forward)
```

## Timing properties

```ts
ticker.deltaTime; // Frame-rate-independent multiplier (1.0 at 60fps). Affected by `speed`.
ticker.deltaMS;   // Actual milliseconds elapsed since the last frame. Not affected by `speed`.
ticker.elapsedMS; // Milliseconds spent processing the last frame
ticker.lastTime;  // Timestamp of the last frame
ticker.FPS;       // Current frames per second
```

## Shared ticker

PixiJS provides a global {@link Ticker} instance at `Ticker.shared`. The {@link Application} uses it by default, so most apps won't need to create their own.

```ts
const shared = Ticker.shared;

shared.add((ticker) => {
    // runs alongside Application updates
});
```

## Cleanup

```ts
ticker.stop();             // stop the loop
ticker.remove(myCallback); // remove one listener
ticker.destroy();          // remove all listeners and release resources
```

## API reference

- {@link Ticker}
- {@link TickerCallback}
- {@link UPDATE_PRIORITY}
- {@link TickerPlugin}
