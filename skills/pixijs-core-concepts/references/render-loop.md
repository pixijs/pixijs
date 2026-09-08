# Render Loop

Every PixiJS frame runs a fixed sequence of ticker callbacks in priority order, with `app.render()` registered at `UPDATE_PRIORITY.LOW` — scene graph update and GPU draw happen _inside_ that one callback. The `Application`'s `TickerPlugin` drives this loop automatically. Understanding the priority order and when to render yourself is key for integrating game logic, physics, and custom frame pacing.

## Frame lifecycle

Each frame, the `Ticker` measures elapsed time, clamps it with `minFPS`/`maxFPS`, then calls every listener registered with `ticker.add()` in priority order. `app.render()` is itself one of those listeners, registered at `UPDATE_PRIORITY.LOW`. When it runs, it walks the display list from `app.stage`, recalculates world transforms (position/rotation/scale propagated parent-to-child), fires each object's `onRender` hook, culls off-screen objects if culling is enabled, then batches draw calls and issues GPU commands.

```
requestAnimationFrame
        │
    [Ticker._tick()]
        │
    ├─ Compute elapsed time (minFPS/maxFPS clamp)
    └─ Call listeners in priority order
        ├─ INTERACTION / HIGH / NORMAL listeners
        ├─ LOW: app.render()
        │   ├─ Traverse display list
        │   ├─ Update world transforms
        │   │   └─ object.onRender() (per-object during traversal)
        │   ├─ Cull display objects (if enabled)
        │   ├─ Upload data to GPU
        │   └─ Draw
        └─ UTILITY listeners (post-render)
```

Rendering is **retained mode**: objects persist across frames unless you explicitly remove them.

## Quick Start

```ts
app.ticker.add((ticker) => {
  sprite.rotation += 0.01 * ticker.deltaTime;
});

app.ticker.add(
  (ticker) => {
    updatePhysics(ticker.deltaMS);
  },
  undefined,
  UPDATE_PRIORITY.HIGH,
);
```

Callbacks receive a `Ticker` instance. Use `ticker.deltaTime` (dimensionless, ~1.0 at 60fps) for simple multipliers; use `ticker.deltaMS` (milliseconds) for time-based calculations.

## Core Patterns

### Priority order

The ticker runs registered callbacks in descending priority. The `TickerPlugin` registers `app.render()` at `UPDATE_PRIORITY.LOW`, so callbacks at `NORMAL`, `HIGH`, or `INTERACTION` run before the render.

```
UPDATE_PRIORITY.INTERACTION = 50   // pointer events
UPDATE_PRIORITY.HIGH        = 25   // physics, input sampling
UPDATE_PRIORITY.NORMAL      =  0   // gameplay (default)
UPDATE_PRIORITY.LOW         = -25  // app.render() registered here
UPDATE_PRIORITY.UTILITY     = -50  // post-render cleanup
```

```ts
import { UPDATE_PRIORITY } from "pixi.js";

app.ticker.add(
  (ticker) => {
    handleInput(ticker.deltaMS);
  },
  undefined,
  UPDATE_PRIORITY.HIGH,
);

app.ticker.add((ticker) => {
  updateAnimations(ticker.deltaTime);
});
```

### Time units

| Property    | Type                          | Scaled by speed? | Capped by minFPS? |
| ----------- | ----------------------------- | ---------------- | ----------------- |
| `deltaTime` | dimensionless (~1.0 at 60fps) | yes              | yes               |
| `deltaMS`   | milliseconds                  | yes              | yes               |
| `elapsedMS` | milliseconds                  | no               | no                |

Use `deltaTime` as a frame-rate multiplier for simple per-frame logic; use `deltaMS` for pixels-per-second or other time-based math; use `elapsedMS` only for profiling (raw, uncapped, unscaled).

### Manual rendering

```ts
await app.init({ autoStart: false, width: 800, height: 600 });

function frame(time: number) {
  updateGameState();
  app.renderer.render(app.stage);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
```

`autoStart: false` disables the `TickerPlugin`'s automatic render registration. You control when the scene draws, letting you integrate with a custom loop, an external animation library, or a fixed-timestep game clock.

### Stop and start

```ts
app.stop(); // pause the ticker and rendering
app.start(); // resume
```

Useful for a pause menu or when the user switches away from the tab. The ticker is automatically paused on page blur when `sharedTicker: false` (default).

### Per-object update via `onRender`

```ts
const sprite = new Sprite(texture);
sprite.onRender = () => {
  sprite.rotation += 0.01;
};

app.stage.addChild(sprite);
```

`onRender` is called during scene graph traversal, just before the object is drawn. It's a per-object hook; an alternative to a global ticker callback when the logic is tied to a specific display object.

### Frame rate capping

```ts
app.ticker.maxFPS = 30; // run at 30fps
app.ticker.minFPS = 10; // cap deltaTime at 10fps worth if frames drop
```

`maxFPS` enforces a ceiling by skipping updates. `minFPS` caps `deltaTime` so large frame drops don't produce enormous deltas that break physics. Defaults: no `maxFPS`, `minFPS: 10`.

## Common Mistakes

### [CRITICAL] Treating the ticker callback arg as a number

Wrong:

```ts
app.ticker.add((dt) => {
  sprite.rotation += dt; // dt is the Ticker instance, not a number
});
```

Correct:

```ts
app.ticker.add((ticker) => {
  sprite.rotation += ticker.deltaTime;
});
```

v8 passes the `Ticker` instance to the callback, not a delta. Old v7 code that used `(dt) => sprite.x += dt` compiles but produces `NaN` because `dt` is an object.


### [HIGH] Using `updateTransform` for per-frame logic

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
    this.onRender = () => {
      this.rotation += 0.01;
    };
  }
}
```

`updateTransform` was removed in v8. Use `onRender` for per-object per-frame logic.


### [MEDIUM] Assuming ticker callbacks run after render

Wrong:

```ts
app.ticker.add(() => {
  readPixelsFromCanvas(); // empty; render hasn't happened yet this frame
});
```

Correct:

```ts
app.ticker.add(
  () => {
    readPixelsFromCanvas();
  },
  undefined,
  UPDATE_PRIORITY.UTILITY,
);
```

Callbacks added at the default priority (`NORMAL = 0`) run _before_ the render call (at `LOW = -25`). Use `UTILITY = -50` for post-render work like pixel readbacks or DOM sync.


## API Reference

- [Ticker](https://pixijs.download/release/docs/ticker.Ticker.html.md)
- [TickerPlugin](https://pixijs.download/release/docs/app.TickerPlugin.html.md)
- [UPDATE_PRIORITY](https://pixijs.download/release/docs/ticker.UPDATE_PRIORITY.html.md)
- [Application](https://pixijs.download/release/docs/app.Application.html.md)
