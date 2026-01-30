---
title: Resize Plugin
description: Use the ResizePlugin in PixiJS to make your application responsive to window or element size changes.
category: app
---

# Resize Plugin

The {@link ResizePlugin} auto-resizes PixiJS applications. It listens to window or element resize events and adjusts the renderer to match.

Useful for:

- Making the canvas responsive to the browser window
- Fitting to container elements
- Handling layout changes without manual resize calls

PixiJS includes this plugin by default when initializing an {@link Application}. You can also register it manually for custom setups.

---

## Usage

```ts
import { Application } from 'pixi.js';

const app = new Application();

await app.init({
  width: 800,
  height: 600,
  resizeTo: window,
});
```

### Default behavior

- The `ResizePlugin` is installed automatically with `Application.init()`.
- When `resizeTo` is set, the renderer adjusts to match the target (`window` or `HTMLElement`).
- Resizing is throttled with `requestAnimationFrame` to avoid performance issues during rapid resize events.
- You can trigger a resize manually with `app.resize()` or cancel a scheduled resize with `app.cancelResize()`.

### Manual registration

If you're managing extensions manually:

```ts
import { extensions, ResizePlugin } from 'pixi.js';

extensions.add(ResizePlugin);
```

### Custom resize target

Resize the canvas to fit a specific element instead of the window:

```ts
await app.init({
  resizeTo: document.getElementById('game-container'),
});
```

### Changing the resize target at runtime

You can reassign `resizeTo` after initialization:

```ts
app.resizeTo = window;                                      // resize to window
app.resizeTo = document.getElementById('game-container');    // resize to an element
app.resizeTo = null;                                         // disable auto-resize
```

Setting `resizeTo` removes the previous listener and attaches a new one to the given target. Setting it to `null` removes the listener entirely; the canvas stays at its current size until you resize it manually with `app.resize()` or set a new `resizeTo` target.

### Queuing and canceling resizes

The plugin throttles resize events so only one resize fires per animation frame:

```ts
app.queueResize();   // schedule a resize for the next frame
app.cancelResize();  // cancel a pending resize
```

This is handled automatically when the window or element emits a `resize` event. You only need to call these methods when triggering resizes from your own code.

---

## How it works

When the `resizeTo` target is `window`, the plugin reads `innerWidth` and `innerHeight`. For an `HTMLElement`, it reads `clientWidth` and `clientHeight`. The renderer is resized to those dimensions, then a render pass runs to reflect the new size.

---

## API reference

- {@link ResizePlugin}
- {@link ResizePluginOptions}
