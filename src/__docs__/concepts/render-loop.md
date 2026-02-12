---
sidebar_position: 2
title: Render Loop
description: Understanding the PixiJS render loop, including how it updates the scene graph and renders frames efficiently.
category: core-concepts
---

# Render Loop

At the core of PixiJS lies its **render loop**, a repeating cycle that updates and redraws your scene every frame. Unlike traditional web development where rendering is event-based (e.g. on user input), PixiJS uses a continuous animation loop that provides full control over real-time rendering.

This guide provides a deep dive into how PixiJS structures this loop internally, from the moment a frame begins to when it is rendered to the screen. Understanding this will help you write more performant, well-structured applications.

## Overview

Each frame, PixiJS performs the following sequence:

1. **Tickers are executed** (user logic)
2. **Scene graph is updated** (transforms and culling)
3. **Rendering occurs** (GPU draw calls)

This cycle repeats as long as your application is running and its ticker is active.

## Step 1: Running Ticker Callbacks

The render loop is driven by the `Ticker` class, which uses `requestAnimationFrame` to schedule work. Each tick:

- Measures elapsed time since the previous frame
- Caps it based on `minFPS` and `maxFPS`
- Calls every listener registered with `ticker.add()` or `app.ticker.add()`

### Example

```ts
app.ticker.add((ticker) => {
  bunny.rotation += ticker.deltaTime * 0.1;
});
```

Every callback receives the current `Ticker` instance. You can access `ticker.deltaTime` (scaled frame delta) and `ticker.elapsedMS` (unscaled delta in ms) to time animations.

## Step 2: Updating the Scene Graph

PixiJS uses a hierarchical [scene graph](./scene-graph.mdx) to represent all visual objects. Before rendering, the engine traverses the tree to:

- Recalculate world transforms (position, rotation, scale propagated from parent to child)
- Run `onRender` callbacks on individual display objects
- Skip off-screen objects if [culling](./scene-graph.mdx#culling) is enabled

The `onRender` hook lets you attach per-frame logic directly to a display object, as an alternative to a global ticker callback:

```ts
sprite.onRender = () => {
  sprite.rotation += 0.01;
};
```

## Step 3: Rendering the Scene

Once the scene graph is ready, the renderer walks the display list starting at `app.stage`:

1. Applies global and local transformations
2. Batches draw calls when possible
3. Uploads geometry, textures, and uniforms
4. Issues GPU commands

All rendering is **retained mode**: objects persist across frames unless explicitly removed.

Rendering is done via either WebGL or WebGPU, depending on your environment. The renderer abstracts away the differences behind a common API.

## Full Frame Lifecycle Diagram

```
requestAnimationFrame
        │
    [Ticker._tick()]
        │
    ├─ Compute elapsed time
    ├─ Call user ticker listeners
    ├─ Update world transforms
    │   └─ sprite.onRender (called per-object during traversal)
    ├─ Cull display objects (if enabled)
    └─ Render stage
            ├─ Traverse display list
            ├─ Upload data to GPU
            └─ Draw
```

## Controlling the Loop

You can pause the loop by stopping the ticker, and resume it later:

```ts
app.ticker.stop();  // Pause rendering
app.ticker.start(); // Resume rendering
```

To cap the frame rate (useful for reducing battery usage on mobile):

```ts
app.ticker.maxFPS = 30; // Cap at 30 FPS
```

For manual rendering without a ticker at all:

```ts
app.ticker.stop();

function customLoop() {
  requestAnimationFrame(customLoop);
  app.renderer.render(app.stage);
}
customLoop();
```
