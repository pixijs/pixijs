# PixiJS Skills: Full Index

Detailed routing table for the PixiJS v8 skill collection. Each entry lists the skill's full description and the trigger keywords that should match it. For a scannable short-form table, see the parent `SKILL.md`.

## Foundations

### pixijs-application
Create and configure a PixiJS v8 `Application`. Covers `new Application()` + async `app.init()` options (width, height, background, antialias, resolution, autoDensity, preference, resizeTo, autoStart, sharedTicker, canvas), `app.stage`/`renderer`/`canvas`/`screen` access, `ResizePlugin`, `TickerPlugin`, and `app.destroy()`.

**Triggers:** Application, app.init, app.stage, app.renderer, app.canvas, app.screen, ApplicationOptions, resizeTo, preference, autoStart, sharedTicker, app.destroy.

### pixijs-core-concepts
How PixiJS v8 renders frames: the systems-and-pipes renderer, the render loop, and how the library adapts to different environments. Covers `WebGLRenderer`/`WebGPURenderer`/`CanvasRenderer` selection, `renderer.render()` pipeline, environment detection, and pointers to per-topic deep dives.

**Triggers:** renderer, WebGL, WebGPU, Canvas, render loop, render pipeline, systems, environments, autoDetectRenderer.

### pixijs-create
Scaffold a new PixiJS v8 project with the `create-pixi` CLI. Covers npm/yarn/pnpm/bun create commands, interactive vs non-interactive flows, available template presets (bundler-vite, bundler-webpack, bundler-esbuild, bundler-import-map, creation-web, framework-react, extension-default), Node version requirements, and post-scaffold dev flow.

**Triggers:** create pixi.js, npm create, scaffold, template, bundler-vite, bundler-webpack, creation-web, framework-react, new project, getting started.

### pixijs-environments
Run PixiJS v8 outside a standard browser: Web Workers, `OffscreenCanvas`, Node/SSR, or CSP-restricted contexts. Covers `DOMAdapter.set`, `BrowserAdapter`, `WebWorkerAdapter`, custom `Adapter` interface, `pixi.js/unsafe-eval` for strict CSP.

**Triggers:** DOMAdapter, BrowserAdapter, WebWorkerAdapter, Web Worker, OffscreenCanvas, Node, headless, SSR, CSP, unsafe-eval, Adapter.

### pixijs-migration-v8
Upgrade a PixiJS project from v7 to v8 or diagnose broken v7 code after an upgrade. Covers async `app.init`, single `pixi.js` package (deprecated `@pixi/*` sub-packages), `Graphics` shape-then-fill, `BaseTexture` -> `TextureSource`, shader/uniform rework, `ParticleContainer`+`Particle`, constructor options objects, `DisplayObject` removal, `settings`/`utils` removal, `Ticker` signature, events rewrite.

**Triggers:** migrate v7, v8 breaking changes, @pixi/ import, DisplayObject, beginFill, endFill, cacheAsBitmap, BaseTexture, deprecated.

### pixijs-scene-core-concepts
The PixiJS v8 scene graph as a whole: how containers, leaves, transforms, and render order fit together. Covers leaf vs container distinction, local/world coordinates, culling, render groups, sortable children, masking, `RenderLayer`, and which leaf skill covers which display object.

**Triggers:** scene graph, display list, Container, Sprite, Graphics, Text, Mesh, ParticleContainer, DOMContainer, GifSprite, masking, render group, RenderLayer, world transform.

## Scene Objects

### pixijs-scene-container
Group, position, or transform display objects. Covers `Container` constructor options (`isRenderGroup`, `sortableChildren`, `boundsArea`), `addChild`/`removeChild`/`addChildAt`/`swapChildren`/`setChildIndex`, `position`/`scale`/`rotation`/`pivot`/`skew`/`alpha`/`tint`, `getBounds`/`getGlobalPosition`/`toLocal`/`toGlobal`, `zIndex` sorting, `cullable`, `destroy`.

**Triggers:** Container, addChild, removeChild, addChildAt, swapChildren, sortableChildren, zIndex, position, scale, rotation, pivot, getBounds, toGlobal, toLocal, destroy.

### pixijs-scene-dom-container
Overlay HTML elements on the PixiJS v8 canvas. Covers `DOMContainer` with `element`, `anchor`, and scene-graph-driven CSS transforms, the `pixi.js/dom` side-effect import, `DOMPipe` registration, visibility sync, pointer-events handling.

**Triggers:** DOMContainer, pixi.js/dom, DOMPipe, HTML overlay, input on canvas, iframe overlay, DOMContainerOptions, element, anchor.

### pixijs-scene-gif
Display animated GIFs. Covers the `pixi.js/gif` side-effect import, `Assets.load` returning a `GifSource`, `GifSprite` playback (`play`/`stop`/`currentFrame`/`animationSpeed`), `autoPlay`/`loop` options, `onComplete`/`onLoop`/`onFrameChange` callbacks, `GifSource` sharing, `clone`, `destroy`.

**Triggers:** GifSprite, GifSource, pixi.js/gif, animationSpeed, currentFrame, autoPlay, onComplete, onFrameChange.

### pixijs-scene-graphics
Draw vector shapes and paths. Covers the `Graphics` shape-then-fill API (`rect`/`circle`/`ellipse`/`poly`/`roundRect`/`star`), path methods (`moveTo`/`lineTo`/`bezierCurveTo`/`arc`), `fill`/`stroke`/`cut`, `FillGradient`, `FillPattern`, `GraphicsContext` sharing, SVG markup.

**Triggers:** Graphics, GraphicsContext, rect, circle, poly, roundRect, fill, stroke, cut, FillGradient, FillPattern, moveTo, bezierCurveTo, svg.

### pixijs-scene-mesh
Render custom geometry. Covers `Mesh` with `MeshGeometry` (positions, uvs, indices, topology), `MeshSimple` for per-frame vertex animation, `MeshPlane` for subdivided deformation, `MeshRope` for path-following textures, `PerspectiveMesh` for 2.5D corners.

**Triggers:** Mesh, MeshGeometry, MeshSimple, MeshPlane, MeshRope, PerspectiveMesh, positions, uvs, indices, topology, setCorners.

### pixijs-scene-particle-container
Render thousands of lightweight sprites. Covers `ParticleContainer` with `Particle` instances, `addParticle`/`removeParticle`, `particleChildren` array, `dynamicProperties` (vertex, position, rotation, uvs, color), `boundsArea`, `roundPixels`, `update`.

**Triggers:** ParticleContainer, Particle, IParticle, addParticle, particleChildren, dynamicProperties, boundsArea, particle effects.

### pixijs-scene-sprite
Draw images. Covers `Sprite` with `anchor`/`tint`/`texture`, `AnimatedSprite` for frame animation, `NineSliceSprite` for resizable UI panels, `TilingSprite` for scrolling/repeating backgrounds.

**Triggers:** Sprite, AnimatedSprite, NineSliceSprite, TilingSprite, Sprite.from, anchor, tint, tilePosition, animationSpeed, gotoAndPlay, leftWidth, topHeight.

### pixijs-scene-text
Render text. Covers `Text` for canvas-quality styled labels, `BitmapText` for cheap per-frame updates via glyph atlas, `HTMLText` for HTML/CSS markup via SVG, `SplitText` and `SplitBitmapText` for per-character animation, `TextStyle`, `tagStyles`.

**Triggers:** Text, BitmapText, HTMLText, SplitText, SplitBitmapText, TextStyle, HTMLTextStyle, BitmapFont.install, tagStyles, fontFamily, wordWrap.

## Utilities

### pixijs-assets
Load and manage resources. Covers `Assets.init`, `Assets.load`/`add`/`unload`, bundles, manifests, background loading, `onProgress`, caching, spritesheets, compressed textures, SVG as texture or Graphics, resolution detection.

**Triggers:** Assets, Assets.load, Assets.init, loadBundle, manifest, backgroundLoad, Spritesheet, Cache, LoadOptions, unload.

### pixijs-color
Create, convert, or manipulate colors. Covers `Color` class input formats (hex, CSS names, RGB/HSL objects, arrays, `Uint8Array`), conversion methods (`toHex`, `toNumber`, `toArray`, `toRgba`), component access, `setAlpha`/`multiply`/`premultiply`, `Color.shared` singleton.

**Triggers:** Color, ColorSource, hex, rgb, hsl, tint, premultiply, Color.shared, color conversion.

### pixijs-events
Handle pointer, mouse, touch, or wheel input. Covers `eventMode` (none, passive, auto, static, dynamic), `FederatedEvent` types, propagation and capture phase, `hitArea`, `interactiveChildren`, `cursor` and `cursorStyles`, global move events for drag, `eventFeatures` config.

**Triggers:** eventMode, FederatedPointerEvent, pointerdown, click, tap, globalpointermove, drag, hitArea, cursor, stopPropagation.

### pixijs-math
Coordinates, vectors, matrices, shapes, and hit testing. Covers `Point`/`ObservablePoint`, `Matrix` (2D affine, decompose, apply), shapes (`Rectangle`, `Circle`, `Ellipse`, `Polygon`, `RoundedRectangle`, `Triangle`), `toGlobal`/`toLocal`, `PointData` types, `DEG_TO_RAD`, and `pixi.js/math-extras` vector helpers.

**Triggers:** Point, ObservablePoint, Matrix, Rectangle, Circle, Polygon, toGlobal, toLocal, hitArea, math-extras, DEG_TO_RAD, PointData.

### pixijs-ticker
Run per-frame logic or control the render loop. Covers `Ticker.add`/`addOnce`/`remove`, `deltaTime` vs `deltaMS` vs `elapsedMS`, `UPDATE_PRIORITY` ordering, `maxFPS`/`minFPS` capping, speed scaling, `Ticker.shared` vs new instances, per-object `onRender` hook, manual rendering.

**Triggers:** Ticker, UPDATE_PRIORITY, deltaTime, deltaMS, elapsedMS, onRender, app.ticker, maxFPS, minFPS, Ticker.shared.

## Advanced

### pixijs-accessibility
Add screen reader and keyboard navigation to PixiJS v8 apps. Covers `AccessibilitySystem` options (`enabledByDefault`, `debug`, `activateOnTab`, `deactivateOnMouseMove`), per-container accessibility properties, shadow DOM overlay, mobile touch-hook activation.

**Triggers:** accessibility, a11y, screen reader, ARIA, keyboard navigation, tab order, AccessibilitySystem, accessibleTitle, accessibleHint, tabIndex, accessibleChildren.

### pixijs-blend-modes
Composite display objects with blend modes. Covers standard modes (`normal`, `add`, `multiply`, `screen`, `erase`, `min`, `max`), advanced modes via `pixi.js/advanced-blend-modes` (`color-burn`, `overlay`, `hard-light`, etc.), batch-friendly ordering.

**Triggers:** blendMode, additive, multiply, screen, overlay, color-burn, color-dodge, advanced-blend-modes, glow, erase.

### pixijs-custom-rendering
Write custom shaders, uniforms, or batchers. Covers `Shader.from({gl, gpu, resources})`, `GlProgram`/`GpuProgram`, `UniformGroup` with typed uniforms (`f32`, `vec2`, `mat4x4`), UBO mode, textures as resources, custom `Filter`, custom `Batcher` via extensions.

**Triggers:** Shader, GlProgram, GpuProgram, UniformGroup, Batcher, Filter, GLSL, WGSL, UBO, uniform, custom shader.

### pixijs-filters
Apply visual effects to containers via the filter pipeline. Covers built-in filters (`AlphaFilter`, `BlurFilter`, `ColorMatrixFilter`, `DisplacementFilter`, `NoiseFilter`), custom `Filter.from()` with GLSL/WGSL, options (`resolution`, `padding`, `antialias`, `blendRequired`), `filterArea` optimization, `pixi-filters` community package.

**Triggers:** filters, BlurFilter, ColorMatrixFilter, DisplacementFilter, NoiseFilter, Filter.from, GLSL filter, pixi-filters, filterArea.

### pixijs-performance
Profile or optimize a PixiJS v8 app for FPS, draw calls, or GPU memory. Covers destroy patterns (`cacheAsTexture(false)`, `releaseGlobalResources`), `GCSystem` and `TextureGCSystem`, `PrepareSystem`, object pooling, batching rules, `BitmapText` for dynamic text, culling (`Culler`, `CullerPlugin`, `cullable`, `cullArea`), resolution/antialias tradeoffs.

**Triggers:** FPS, jank, draw calls, batching, object pool, GCSystem, PrepareSystem, Culler, cacheAsTexture, memory leak, destroy patterns.
