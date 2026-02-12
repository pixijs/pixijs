---
sidebar_position: 3
title: Render Groups
description: Learn how to use Render Groups in PixiJS to optimize rendering performance by grouping scene elements for efficient GPU processing.
category: core-concepts
---

# Render Groups

A RenderGroup is a Container that PixiJS treats as a self-contained rendering unit. Moving, rotating, scaling, or fading a RenderGroup happens on the GPU, so the CPU cost is near zero. This makes them the primary tool for optimizing scenes with large stable sub-trees or distinct visual layers like a game world and a HUD.

### How They Work

When you mark a Container as a RenderGroup, PixiJS builds a separate set of render instructions for everything inside it. The group's own transform (position, scale, rotation) and visual properties (alpha, tint) are applied as a single GPU operation rather than being recalculated per-child on the CPU. If nothing inside the group changes, PixiJS can skip rebuilding its instructions entirely.

### Why Use Render Groups?

The main advantage of using Render Groups lies in their optimization capabilities. They allow for certain calculations, like transformations (position, scale, rotation), tint, and alpha adjustments, to be offloaded to the GPU. This means that operations like moving or adjusting the Render Group can be done with minimal CPU impact, making your application more performance-efficient.

In practice, you're utilizing Render Groups even without explicit awareness. The root element you pass to the render function in PixiJS is automatically converted into a RenderGroup as this is where its render instructions will be stored. Though you also have the option to explicitly create additional RenderGroups as needed to further optimize your project.

This feature is particularly beneficial for:

- **Stable sub-trees:** When the children of a group aren't being added or removed frequently, PixiJS can reuse the group's cached render instructions. The objects inside can still move, rotate, or change alpha freely; "stable" means the *structure* (which children exist) stays the same, not that the objects are frozen.
- **Distinct Scene Parts:** You can separate your scene into logical parts, such as the game world and the HUD (Heads-Up Display). Each part can be optimized individually, leading to overall better performance.

### Examples

```ts
const myGameWorld = new Container({
  isRenderGroup: true,
});

const myHud = new Container({
  isRenderGroup: true,
});

scene.addChild(myGameWorld, myHud);

renderer.render(scene); // this action will actually convert the scene to a render group under the hood
```

Check out the [render group example](/8.x/examples/?example=rendering_render-group).

### Best Practices

- **Don't Overuse:** While Render Groups are powerful, using too many can actually degrade performance. The goal is to find a balance that optimizes rendering without overwhelming the system with too many separate groups. Make sure to profile when using them. The majority of the time you won't need to use them at all!
- **Strategic Grouping:** Consider what parts of your scene change together and which parts remain static. Grouping dynamic elements separately from static elements can lead to performance gains.

For related optimization strategies, see [Performance Tips](./performance-tips.md) and [Garbage Collection](./garbage-collection.md).
