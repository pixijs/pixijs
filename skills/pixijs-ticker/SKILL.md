---
name: pixijs-ticker
description: "Use this skill when running per-frame logic or controlling the PixiJS v8 render loop. Covers Ticker.add/addOnce/remove, deltaTime vs deltaMS vs elapsedMS, UPDATE_PRIORITY ordering, maxFPS/minFPS capping, speed scaling, Ticker.shared vs new instances, per-object onRender hook, manual rendering. Triggers on: Ticker, UPDATE_PRIORITY, deltaTime, deltaMS, elapsedMS, onRender, app.ticker, maxFPS, minFPS, Ticker.shared."
license: MIT
---

`app.ticker` runs registered callbacks every frame and drives `app.render()` at `UPDATE_PRIORITY.LOW`. Each callback receives the Ticker instance; read `deltaTime` as a frame-rate-independent multiplier (≈1.0 at 60fps) or `deltaMS` for real-time calculations.

## Quick Start

```ts
app.ticker.add((ticker) => {
  sprite.rotation += 0.01 * ticker.deltaTime;
  sprite.x += (200 / 1000) * ticker.deltaMS;
});

app.ticker.add(
  (ticker) => {
    updatePhysics(ticker.deltaMS);
  },
  undefined,
  UPDATE_PRIORITY.HIGH,
);

app.ticker.maxFPS = 30;
app.ticker.speed = 0.5;

sprite.onRender = () => {
  sprite.scale.x = Math.sin(performance.now() / 500);
};
```

**Related skills:** `pixijs-application` (Application setup and sharedTicker option), `pixijs-performance` (frame rate optimization), `pixijs-migration-v8` (v7 ticker signature changes).

## Core Patterns

### Time units

The Ticker exposes three timing values, each for different use cases:

| Property    | Type                          | Scaled by speed? | Capped by minFPS? | Use case                                     |
| ----------- | ----------------------------- | ---------------- | ----------------- | -------------------------------------------- |
| `deltaTime` | dimensionless (~1.0 at 60fps) | yes              | yes               | Frame-rate-independent animation multipliers |
| `deltaMS`   | milliseconds                  | yes              | yes               | Time-based calculations (pixels/sec)         |
| `elapsedMS` | milliseconds                  | no               | no                | Raw measurement, profiling                   |

```ts
import { Application } from "pixi.js";

const app = new Application();
await app.init({ width: 800, height: 600 });

app.ticker.add((ticker) => {
  // deltaTime: dimensionless scalar, ~1.0 at 60fps
  sprite.rotation += 0.1 * ticker.deltaTime;

  // deltaMS: real milliseconds (speed-scaled, capped)
  sprite.x += (200 / 1000) * ticker.deltaMS; // 200 pixels per second

  // elapsedMS: raw milliseconds (no scaling, no cap)
  console.log(`Raw frame time: ${ticker.elapsedMS}ms`);
});
```

**Tension note:** `deltaTime` is not milliseconds. It is `deltaMS * Ticker.targetFPMS` where targetFPMS is 0.06 (i.e. 1/16.67). At exactly 60fps, deltaTime is 1.0. At 30fps, deltaTime is 2.0. This catches people who treat it as a time value.

### Priority ordering and context binding

```ts
import { Application, UPDATE_PRIORITY } from "pixi.js";

const app = new Application();
await app.init({ width: 800, height: 600 });

// INTERACTION (50) > HIGH (25) > NORMAL (0) > LOW (-25) > UTILITY (-50)
// app.render() is registered at LOW by the TickerPlugin

app.ticker.add(
  (ticker) => {
    // Physics runs before normal-priority callbacks
    updatePhysics(ticker.deltaMS);
  },
  undefined,
  UPDATE_PRIORITY.HIGH,
);

app.ticker.add((ticker) => {
  // Default priority (NORMAL = 0), runs after HIGH but before render
  updateAnimations(ticker.deltaTime);
});

// Pass `this` as the second argument to preserve context on class methods
class GameSystem {
  public speed = 5;
  public position = 0;

  public update(ticker: Ticker): void {
    this.position += this.speed * ticker.deltaTime;
  }
}

const system = new GameSystem();
app.ticker.add(system.update, system);
app.ticker.remove(system.update, system); // must match both fn and context
```

### Frame rate capping

```ts
import { Ticker } from "pixi.js";

const ticker = new Ticker();

ticker.maxFPS = 30; // Cap at 30fps (skips frames to maintain interval)
ticker.minFPS = 10; // Cap deltaTime so it never exceeds 10fps worth

// If maxFPS < minFPS, minFPS is lowered to match
// If minFPS > maxFPS, maxFPS is raised to match
```

`maxFPS` skips update calls to enforce a ceiling. `minFPS` caps deltaTime/deltaMS so large frame drops don't produce enormous deltas (default minFPS is 10).

### Per-object onRender hook

```ts
import { Sprite, Assets, Application } from "pixi.js";

const app = new Application();
await app.init({ width: 800, height: 600 });

const texture = await Assets.load("bunny.png");
const sprite = new Sprite(texture);
app.stage.addChild(sprite);

sprite.onRender = (renderer) => {
  sprite.rotation += 0.01;
};
```

`onRender` is called during scene graph traversal, before GPU rendering. It is an alternative to a global ticker callback when logic is tied to a specific display object.

### Ticker.shared, Ticker.system, and new Ticker

```ts
import { Ticker, UPDATE_PRIORITY } from "pixi.js";

// Ticker.shared: singleton, autoStart=true, protected from destroy()
const shared = Ticker.shared;

// Ticker.system: separate instance used by engine background tasks,
// independent of the main scene ticker. It's a plain Ticker instance
// (autoStart=true, _protected=true) with no intrinsic priority; listeners
// are typically added at UTILITY priority by convention.
const system = Ticker.system;

// new Ticker(): custom instance, autoStart=false, you manage the lifecycle
const custom = new Ticker();
custom.autoStart = true; // start when first listener is added
custom.add((ticker) => {
  console.log(ticker.deltaMS);
});

// One-shot callback that auto-removes after firing
custom.addOnce(() => console.log("fires once"), null, UPDATE_PRIORITY.NORMAL);

// When done:
custom.stop();
custom.destroy();
```

`Application` creates its own Ticker by default. Set `sharedTicker: true` in `app.init()` to use `Ticker.shared` instead. `Ticker.shared` and `Ticker.system` are both `_protected` and will not actually be destroyed if you call `destroy()` on them. Read `ticker.FPS` for the measured frame rate and `ticker.count` for the current listener count.

### App lifecycle and manual rendering

```ts
import { Application } from "pixi.js";

const app = new Application();
await app.init({ autoStart: false });

// Pause and resume the built-in render loop at any time.
app.start();
app.stop();

// Or drive the loop yourself (headless, visibility-gated, fixed timestep, etc.)
function animate() {
  app.ticker.update(); // fires registered callbacks
  app.render(); // renders the stage
  requestAnimationFrame(animate);
}
animate();
```

`app.start()` and `app.stop()` are added by the `TickerPlugin` and map to `ticker.start()` / `ticker.stop()`. Use `autoStart: false` plus your own frame driver when you need to pause on tab blur, run a fixed-timestep loop, or render offscreen.

### Speed scaling

```ts
import { Application } from "pixi.js";

const app = new Application();
await app.init({ width: 800, height: 600 });

app.ticker.speed = 0.5; // Half speed (slow motion)
app.ticker.speed = 2.0; // Double speed

// speed affects deltaTime and deltaMS, but NOT elapsedMS
```

## Common Mistakes

### [CRITICAL] Ticker callback expects delta as first argument

Wrong:

```ts
app.ticker.add((dt) => {
  bunny.rotation += dt;
});
```

Correct:

```ts
app.ticker.add((ticker) => {
  bunny.rotation += ticker.deltaTime;
});
```

v8 passes the Ticker instance as the callback argument, not a delta number. The v7 pattern `(dt) => ...` compiles but `dt` is the entire Ticker object, so arithmetic on it produces `NaN`.


### [HIGH] Using updateTransform for per-frame logic

Wrong:

```ts
class MySprite extends Sprite {
  updateTransform() {
    super.updateTransform();
    this.rotation += 0.01;
  }
}
```

Correct:

```ts
class MySprite extends Sprite {
  constructor() {
    super();
    this.onRender = this._onRender.bind(this);
  }
  private _onRender() {
    this.rotation += 0.01;
  }
}
```

`updateTransform` was removed in v8. Use the `onRender` callback for per-object per-frame logic.


### [MEDIUM] Treating deltaTime as milliseconds

Wrong:

```ts
app.ticker.add((ticker) => {
  // Tries to move 100px/sec but deltaTime is ~1.0, not ~16.67
  sprite.x += (100 * ticker.deltaTime) / 1000;
});
```

Correct:

```ts
app.ticker.add((ticker) => {
  // Using deltaMS for time-based movement
  sprite.x += (100 / 1000) * ticker.deltaMS;
  // Or using deltaTime as a frame-rate multiplier
  sprite.x += 1.5 * ticker.deltaTime;
});
```

`deltaTime` is a dimensionless scalar (~1.0 at 60fps), not milliseconds. Use `deltaMS` for real time calculations. Use `deltaTime` as a simple multiplier when you want "per frame at 60fps" behavior.


## API Reference

- [Ticker](https://pixijs.download/release/docs/ticker.Ticker.html.md)
- [TickerPlugin](https://pixijs.download/release/docs/app.TickerPlugin.html.md)
- [TickerPluginOptions](https://pixijs.download/release/docs/app.TickerPluginOptions.html.md)
