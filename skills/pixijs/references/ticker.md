# ticker

Per-frame logic and the render loop: `Ticker` callbacks and time units, priorities, FPS caps, per-object `onRender`, and driving frames yourself.

```ts
import { UPDATE_PRIORITY, type Application, type Sprite } from "pixi.js";

declare const app: Application;
declare const sprite: Sprite;
declare function updatePhysics(ms: number): void;

app.ticker.add((ticker) => {
  sprite.rotation += 0.01 * ticker.deltaTime;
  sprite.x += (200 / 1000) * ticker.deltaMS; // 200 px per second
});

app.ticker.add((ticker) => updatePhysics(ticker.deltaMS), undefined, UPDATE_PRIORITY.HIGH);
```

The callback receives the `Ticker` instance, not v7's delta number. Under TypeScript `(dt) => obj.x += dt` is a compile error (TS2365); in JavaScript `dt` is the Ticker object, `+=` concatenates a string, and the transform becomes `NaN`.

## Frame order

```
requestAnimationFrame
  └─ Ticker: compute elapsed time (minFPS/maxFPS), call listeners by priority
      ├─ INTERACTION (50) / HIGH (25) / NORMAL (0, default) listeners
      ├─ LOW (-25): app.render()
      │    ├─ cull (only with CullerPlugin)
      │    └─ renderer.render({ container: app.stage })
      │         ├─ onRender hooks of attached containers
      │         ├─ update world transforms
      │         ├─ rebuild instructions where structure changed, upload
      │         └─ draw
      └─ UTILITY (-50) listeners: post-render (pixel readback, DOM sync)
```

A default-priority callback runs before the render of the same frame, so reading pixels back from the canvas there sees the previous frame; register readbacks at `UPDATE_PRIORITY.UTILITY`. Physics goes at `HIGH` so it runs before `NORMAL` animation.

`add(fn, context, priority)` and `addOnce(...)` (removes itself after one call) take the context as the second argument; `remove(fn, context)` must match both `fn` and `context`.

## Time units

| Property | Unit | Scaled by `speed`? | Capped by `minFPS`? |
| --- | --- | --- | --- |
| `deltaTime` | dimensionless, ~1.0 at 60fps | yes | yes |
| `deltaMS` | milliseconds | yes | yes |
| `elapsedMS` | milliseconds | no | no |

`deltaTime` is not milliseconds: it is `deltaMS * Ticker.targetFPMS`, where `targetFPMS` is 0.06 (1/16.67), so it is 1.0 at 60fps and 2.0 at 30fps. Use `deltaMS` for per-second rates and `deltaTime` as a "per 60fps frame" multiplier. `ticker.speed = 0.5` halves `deltaTime` and `deltaMS`, not `elapsedMS`.

## Frame rate capping

`maxFPS` (no cap by default) skips updates to enforce a ceiling. `minFPS` caps `deltaTime`/`deltaMS` so a frame drop doesn't produce an enormous delta: the default `minFPS` is 10, so at `speed` 1 `deltaMS` never exceeds 100 and `deltaTime` never exceeds 6. `elapsedMS` is never capped: after a tab returns from the background it reports the whole gap. Setting `maxFPS` below `minFPS` lowers `minFPS` to match; setting `minFPS` above `maxFPS` raises `maxFPS` to match.

`ticker.FPS` is `1000 / elapsedMS` of the last frame, unsmoothed; average it yourself before displaying it. `ticker.count` is the listener count.

## Per-object onRender hook

```ts
import { Sprite, type Application, type Texture } from "pixi.js";

declare const app: Application;

class Propeller extends Sprite {
  constructor(texture: Texture) {
    super(texture);
    this.onRender = () => this.tick(); // any name except _onRender
  }

  private tick(): void {
    this.rotation += 0.01 * app.ticker.deltaTime;
  }
}
```

`onRender` replaces v7's per-frame `updateTransform()` override. v8 never calls `updateTransform()` per frame; `updateTransform(opts)` is now a helper that sets position/scale/rotation/skew/pivot in one call, so the v7 override fails TypeScript (TS2416).

`onRender` is driven by rendering, not by the ticker. When a container with `onRender` is attached to a scene, it is registered with its render group, and every `renderer.render()` of that group calls it (with the renderer as its argument, not a delta) before transforms are updated and draw instructions are built. Consequences:

- It runs while the container has `visible = false` or `renderable = false`, is culled, or sits under an invisible parent. Check visibility yourself if the work should pause.
- It does not run while the container is detached from a rendered stage.
- It does not run after `app.stop()`, since nothing renders, unless something calls `app.render()`.
- It runs once per render: render the stage twice in a frame and it runs twice. Read `app.ticker.deltaTime` inside it for frame-rate independence.
- Never name a subclass method `_onRender`. That is the internal slot `onRender` writes to, so strict TypeScript rejects a `private _onRender()` (TS2415), and the method runs every frame even if you never set `onRender`.
- A class method named `onRender` is never registered (it shadows the setter that registers the hook) and fails tsc (TS2425). Assign `this.onRender = (renderer) => { ... }` in the constructor; set it to `null` to detach.

## Ticker.shared, Ticker.system, and new Ticker

| Ticker | Starts | Notes |
| --- | --- | --- |
| `app.ticker` | after `init()` unless `autoStart: false` | Per-app by default; `sharedTicker: true` makes it `Ticker.shared`. |
| `Ticker.shared` | `autoStart = true` | Singleton, protected: `destroy()` doesn't destroy it. |
| `Ticker.system` | auto-started | Protected like `Ticker.shared`; drives engine work (event hover ticks, GC scheduling, prepare uploads), independent of `app.ticker`. |
| `new Ticker()` | `autoStart = false` | Yours: set `autoStart = true` to start on the first `add`, or call `start()`; `stop()` and `destroy()` it when done. |

Without `sharedTicker: true`, `Ticker.shared` is a separate loop: callbacks added to it keep running after `app.stop()` and `app.destroy()`, so register game logic on `app.ticker`.

## App lifecycle and manual rendering

```ts
import { Application } from "pixi.js";

const app = new Application();
await app.init({ autoStart: false });

function animate(time: number) {
  app.ticker.update(time); // runs every callback, then app.render() at LOW
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

`app.start()` and `app.stop()` are added by the `TickerPlugin` and map to `ticker.start()` / `ticker.stop()`. The plugin registers `app.render` on `app.ticker` whether or not `autoStart` is set; `autoStart: false` only leaves the ticker stopped. So in a manual loop pick one driver:

- `app.ticker.update(time)` alone: runs callbacks and renders. Adding `app.render()` after it draws twice and runs every `onRender` twice.
- `app.render()` alone: renders without running ticker callbacks.
- `app.ticker.remove(app.render, app)` once after init, then call `app.ticker.update(time)` and `app.render()` when you choose.

Pass the `requestAnimationFrame` timestamp to `update()`. A ticker that was never started reports `deltaMS` 100 (the `minFPS` cap) on its first `update()`. With `sharedTicker: true`, `autoStart: false` has no effect: `Ticker.shared` starts itself as soon as `app.render` is added, so call `app.stop()` after init (which stops `Ticker.shared` for every user).

The ticker does not pause on blur or `visibilitychange`; browsers throttle `requestAnimationFrame` in hidden tabs, and the first frame back gets the capped delta. To pause explicitly, listen for `visibilitychange` and call `app.stop()` / `app.start()`.
