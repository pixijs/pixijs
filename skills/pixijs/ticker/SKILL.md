---
name: ticker
description: >
  Control the PixiJS render loop with Ticker. Covers deltaTime vs elapsedMS,
  add/addOnce/remove callbacks, UPDATE_PRIORITY, maxFPS/minFPS capping,
  Ticker.shared vs new instances, onRender per-object hooks, speed scaling,
  and manual rendering without a ticker. Use when the user asks about the game
  loop, frame rate, animation timing, deltaTime, frame-rate-independent movement,
  render callbacks, per-frame updates, slow motion, speed control, or FPS capping.
  Covers Ticker, UPDATE_PRIORITY, onRender, deltaTime, deltaMS, elapsedMS,
  maxFPS, minFPS, Ticker.shared, app.ticker.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  requires: pixijs
  sources: "pixijs/pixijs:src/ticker/Ticker.ts, pixijs/pixijs:src/__docs__/concepts/render-loop.md"
---

## When to Use This Skill

Apply when the user needs to run per-frame logic, control animation timing, manage the render loop, cap frame rate, or implement slow motion and speed scaling.

**Related skills:** For application setup use **getting-started**; for frame rate optimization use **performance**; for per-object animation use **sprite** or **core-concepts**.

This skill builds on pixijs. Read it first for foundational concepts.

## Setup

```ts
import { Application } from 'pixi.js';

const app = new Application();
await app.init({ width: 800, height: 600 });
document.body.appendChild(app.canvas);

app.ticker.add((ticker) => {
    app.stage.children.forEach((child) => {
        child.rotation += 0.01 * ticker.deltaTime;
    });
});
```

By default, `app.init()` creates a Ticker, starts it (`autoStart: true`), and registers `app.render()` at `UPDATE_PRIORITY.LOW`. Your callbacks run before rendering unless you specify a lower priority.

## Core Patterns

### Time units

The Ticker exposes three timing values, each for different use cases:

| Property    | Type        | Scaled by speed? | Capped by minFPS? | Use case                          |
|-------------|-------------|-------------------|--------------------|-----------------------------------|
| `deltaTime` | dimensionless (~1.0 at 60fps) | yes | yes | Frame-rate-independent animation multipliers |
| `deltaMS`   | milliseconds | yes              | yes                | Time-based calculations (pixels/sec) |
| `elapsedMS` | milliseconds | no               | no                 | Raw measurement, profiling        |

```ts
import { Application } from 'pixi.js';

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

### Priority ordering

```ts
import { Application, UPDATE_PRIORITY } from 'pixi.js';

const app = new Application();
await app.init({ width: 800, height: 600 });

// INTERACTION (50) > HIGH (25) > NORMAL (0) > LOW (-25) > UTILITY (-50)
// app.render() is registered at LOW by the TickerPlugin

app.ticker.add((ticker) => {
    // Physics runs before normal-priority callbacks
    updatePhysics(ticker.deltaMS);
}, undefined, UPDATE_PRIORITY.HIGH);

app.ticker.add((ticker) => {
    // Default priority (NORMAL = 0), runs after HIGH but before render
    updateAnimations(ticker.deltaTime);
});
```

### Frame rate capping

```ts
import { Ticker } from 'pixi.js';

const ticker = new Ticker();

ticker.maxFPS = 30; // Cap at 30fps (skips frames to maintain interval)
ticker.minFPS = 10; // Cap deltaTime so it never exceeds 10fps worth

// If maxFPS < minFPS, minFPS is lowered to match
// If minFPS > maxFPS, maxFPS is raised to match
```

`maxFPS` skips update calls to enforce a ceiling. `minFPS` caps deltaTime/deltaMS so large frame drops don't produce enormous deltas (default minFPS is 10).

### Per-object onRender hook

```ts
import { Sprite, Assets, Application } from 'pixi.js';

const app = new Application();
await app.init({ width: 800, height: 600 });

const texture = await Assets.load('bunny.png');
const sprite = new Sprite(texture);
app.stage.addChild(sprite);

sprite.onRender = (renderer) => {
    sprite.rotation += 0.01;
};
```

`onRender` is called during scene graph traversal, before GPU rendering. It is an alternative to a global ticker callback when logic is tied to a specific display object.

### Ticker.shared vs new Ticker

```ts
import { Ticker } from 'pixi.js';

// Ticker.shared: singleton, autoStart=true, protected from destroy()
const shared = Ticker.shared;

// new Ticker(): private instance, autoStart=false, you manage lifecycle
const custom = new Ticker();
custom.add((ticker) => {
    console.log(ticker.deltaMS);
});
custom.start();

// When done:
custom.destroy();
```

`Application` creates its own Ticker by default. Set `sharedTicker: true` in `app.init()` to use `Ticker.shared` instead.

### Speed scaling

```ts
import { Application } from 'pixi.js';

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

Source: src/__docs__/migrations/v8.md

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

Source: src/__docs__/migrations/v8.md

### [MEDIUM] Treating deltaTime as milliseconds

Wrong:
```ts
app.ticker.add((ticker) => {
    // Tries to move 100px/sec but deltaTime is ~1.0, not ~16.67
    sprite.x += 100 * ticker.deltaTime / 1000;
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

Source: src/ticker/Ticker.ts

---

See also: getting-started (Application setup), performance (frame rate optimization), migration-v8 (v7 ticker changes)

## Learn More

- [Ticker](https://pixijs.download/release/docs/ticker.Ticker.html.md)
- [UPDATE_PRIORITY](https://pixijs.download/release/docs/ticker.UPDATE_PRIORITY.html.md)
- [TickerPlugin](https://pixijs.download/release/docs/app.TickerPlugin.html.md)
