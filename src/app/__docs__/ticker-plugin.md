---
title: Ticker Plugin
description: Use the TickerPlugin in PixiJS for rendering and frame updates.
category: app
---

# Ticker Plugin

The {@link TickerPlugin} provides a built-in update loop for your PixiJS {@link Application}. It calls `.render()` once per animation frame by default and integrates with PixiJS's {@link Ticker} system for frame-based control.

PixiJS includes this plugin automatically when you initialize an `Application`. You can also opt out and add it manually.

## Usage

```ts
const app = new Application();

await app.init({
  sharedTicker: false,
  autoStart: true,
});

app.ticker.add((ticker) => {
  bunny.rotation += 1 * ticker.deltaTime;
});
```

### Default behavior

The `TickerPlugin` is included automatically:

```ts
const app = new Application();

await app.init({
  autoStart: true, // Starts the render loop automatically
  sharedTicker: false, // Use a dedicated ticker
});
```

### Manual registration

If you're managing extensions yourself:

```ts
import { extensions, TickerPlugin } from 'pixi.js';

extensions.add(TickerPlugin);
```

## Shared vs dedicated ticker

The plugin supports two modes:

| Option                | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `sharedTicker: true`  | Uses `Ticker.shared`, shared across all applications.        |
| `sharedTicker: false` | Creates a private ticker instance scoped to the application. |

### Behavior differences

- With a **shared ticker**, other code can also register updates, so execution order can vary.
- With a **dedicated ticker**, you get full control over timing and update order.

### Update order

When using a shared ticker, updates run in this order:

1. **System ticker** (`Ticker.system`) -- internal PixiJS updates like interaction events and accessibility. Always runs first.
2. **Shared ticker** (`Ticker.shared`) -- your callbacks if `sharedTicker: true`.
3. **App ticker** -- a private `Ticker` instance created per-app if `sharedTicker: false`.

---

## Lifecycle control

Stop and start the ticker manually:

```ts
app.stop(); // Stop automatic rendering
app.start(); // Resume
```

Useful for:

- Pausing a game or animation
- Throttling on inactive tabs
- Managing visibility events

### Manual rendering

If you disable `autoStart`, you can manage the render loop yourself:

```ts
const app = new Application();
await app.init({ autoStart: false });

function animate() {
    app.ticker.update(); // fire any registered ticker callbacks
    app.render();
    requestAnimationFrame(animate);
}
animate();
```

---

## Adding update callbacks

Register callbacks to run every frame:

```ts
// Runs every frame
app.ticker.add((ticker) => {
    sprite.x += speed * ticker.deltaTime;
});

// Runs once on the next frame, then auto-removes
app.ticker.addOnce(() => {
    console.log('Ready');
});
```

### Priority-based execution

Control the order callbacks run in using {@link UPDATE_PRIORITY}:

```ts
import { UPDATE_PRIORITY } from 'pixi.js';

app.ticker.add(
    (ticker) => {
        // Physics: runs before normal-priority updates
    },
    null,
    UPDATE_PRIORITY.HIGH
);
```

---

## API reference

- {@link TickerPlugin}
- {@link TickerPluginOptions}
- {@link Ticker}
- {@link UPDATE_PRIORITY}
