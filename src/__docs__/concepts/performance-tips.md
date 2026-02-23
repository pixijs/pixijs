---
sidebar_position: 6
title: Performance Tips
description: Performance tips for optimizing PixiJS applications, covering general practices and specific techniques for maximizing rendering efficiency.
category: core-concepts
---

# Performance Tips

This page collects practical advice for improving frame rate and reducing memory usage in PixiJS applications. Start with the General section; the rest are organized by feature area. Profile before optimizing; PixiJS handles a lot of content well out of the box.

### General

- Profile first! PixiJS can handle a large amount of content without optimization
- Be mindful of the complexity of your scene. The more objects you add the slower things will end up
- Group similar object types together in the scene graph. `sprite / sprite / graphic / graphic` produces 2 draw calls, while `sprite / graphic / sprite / graphic` produces 4, because each type change breaks the batch
- Some older mobile devices run things a little slower. Passing in the option `backgroundAlpha: 1` and `antialias: false` to the Renderer or Application can help with performance
- Culling is disabled by default as it's often better to do this at an application level or set objects to be `cullable = true`. If you are GPU-bound it will improve performance; if you are CPU-bound it will degrade performance

### Sprites

- Use Spritesheets where possible to minimize total textures
- Sprites can be batched with up to 16 different textures (dependent on hardware)
- This is the fastest way to render content
- On older devices use smaller low-resolution textures
- Add the extension `@0.5x.png` to the 50% scale-down spritesheet so PixiJS will visually-double them automatically
- Draw order can be important

### Graphics

- Graphics objects are fastest when they are not modified constantly (not including the transform, alpha or tint!)
- Graphics objects are batched when under a certain size (100 points or smaller)
- Small Graphics objects are as fast as Sprites (rectangles, triangles)
- Using 100s of graphics complex objects can be slow, in this instance use sprites (you can create a texture)

### Texture

- Textures are automatically managed by a Texture Garbage Collector
- You can also manage them yourself by using `texture.source.unload()` or `Assets.unload()`
- When destroying many textures at once, stagger the calls across multiple frames (e.g., destroy 5 per frame) to avoid a single-frame freeze

### Text

- Avoid changing it on every frame as this can be expensive (each time it draws to a canvas and then uploads to GPU)
- Bitmap Text gives much better performance for dynamically changing text
- Text resolution matches the renderer resolution, decrease resolution yourself by setting the `resolution` property, which can consume less memory

### Masks

- Masks can be expensive if too many are used: e.g., 100s of masks will really slow things down
- Axis-aligned Rectangle masks are the fastest (as they use scissor rect)
- Graphics masks are second fastest (as they use the stencil buffer)
- Sprite masks are the third fastest (they use filters). They are really expensive. Do not use too many in your scene!

### Filters

- Release memory: `container.filters = null`
- If you know the size of them: `container.filterArea = new Rectangle(x,y,w,h)`. This can speed things up as it means the object does not need to be measured
- Filters are expensive, using too many will start to slow things down!

### BlendModes

- Different blend modes break batches, just like mixing object types (see General section above). Group objects with the same blend mode together:
  - `Screen / Normal / Screen / Normal` = 4 draw calls
  - `Screen / Screen / Normal / Normal` = 2 draw calls

### Events

- If an object has no interactive children use `interactiveChildren = false`. The event system will then be able to avoid crawling through the object
- Setting `hitArea = new Rectangle(x, y, w, h)` on a container tells the event system to use that rectangle for hit testing instead of recursively checking all children
