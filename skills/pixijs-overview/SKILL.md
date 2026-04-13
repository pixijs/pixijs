---
name: pixijs-overview
description: >
  High-level overview of PixiJS v8 architecture, core concepts, and the full
  family of pixijs-* skills. Load this when the user asks a general "what is
  PixiJS" question, wants an architectural summary, or is unsure which specific
  pixijs-* skill applies. Covers the systems-and-pipes renderer, Container-based
  scene graph (DisplayObject removed in v8), async app.init(), the unified
  Assets class, DOMAdapter, and the extensions system. For any concrete task
  (creating sprites, drawing graphics, loading assets, writing shaders, etc.)
  load the matching topic skill directly instead: pixijs-getting-started,
  pixijs-core-concepts, pixijs-sprite, pixijs-graphics, pixijs-text, pixijs-mesh,
  pixijs-particle-container, pixijs-gif, pixijs-asset-loading, pixijs-spritesheet,
  pixijs-ticker, pixijs-scene-management, pixijs-math, pixijs-environments,
  pixijs-filters, pixijs-masking, pixijs-blend-modes, pixijs-color, pixijs-events,
  pixijs-accessibility, pixijs-dom-overlay, pixijs-custom-rendering,
  pixijs-performance, pixijs-migration.
metadata:
  type: overview
  library: pixi.js
  library-version: "8.17.1"
---

# PixiJS v8 Overview

PixiJS is a 2D rendering library for the web that targets WebGL, WebGPU, and Canvas backends through a unified API. Its architecture:

- **Scene graph** is built on `Container` as the base class. `DisplayObject` was removed in v8.
- **Renderers** use a systems-and-pipes architecture: systems manage GPU state (textures, shaders, buffers); pipes handle type-specific rendering (`SpritePipe`, `GraphicsPipe`, etc.).
- **Plugins** register through `extensions.add()`.
- **Application initialization** is async via `await app.init(options)`.
- **Assets** are loaded through a centralized `Assets` class with caching, resolution detection, and format negotiation.
- **DOM access** flows through `DOMAdapter` for cross-environment compatibility (browser, Web Worker, OffscreenCanvas).

## Topic skills

Each topic is a standalone top-level skill. Load the one that matches the user's task.

### Setup & lifecycle

| Topic | Skill |
|---|---|
| Create an app, configure canvas, responsive resize, choose renderer | `pixijs-getting-started` |
| Render loop, deltaTime, UPDATE_PRIORITY, maxFPS, manual rendering | `pixijs-ticker` |
| Browser, Web Worker, OffscreenCanvas, DOMAdapter, CSP / unsafe-eval | `pixijs-environments` |

### Scene graph

| Topic | Skill |
|---|---|
| Container hierarchy, transforms, Texture, Bounds, destroy, extensions | `pixijs-core-concepts` |
| RenderLayer, render groups, culling, zIndex, sortableChildren | `pixijs-scene-management` |
| Point, Matrix, Rectangle, Circle, Polygon, coordinate transforms | `pixijs-math` |

### Rendering content

| Topic | Skill |
|---|---|
| Sprite, anchor, AnimatedSprite, NineSliceSprite, TilingSprite | `pixijs-sprite` |
| Vector shapes, fill/stroke/cut, GraphicsContext, SVG, gradients | `pixijs-graphics` |
| Text (canvas), BitmapText (MSDF), HTMLText (CSS), SplitText (per-char) | `pixijs-text` |
| MeshGeometry, MeshSimple, MeshPlane, MeshRope, PerspectiveMesh | `pixijs-mesh` |
| High-count particles with `Particle`, `dynamicProperties` | `pixijs-particle-container` |
| Animated GIF loading and playback with `GifSprite` | `pixijs-gif` |

### Assets

| Topic | Skill |
|---|---|
| `Assets.load`, bundles, caching, compressed textures, resolution | `pixijs-asset-loading` |
| Texture atlases, `SpritesheetData` format, animations from sheets | `pixijs-spritesheet` |

### Effects

| Topic | Skill |
|---|---|
| `BlurFilter`, `ColorMatrixFilter`, `DisplacementFilter`, custom filters | `pixijs-filters` |
| Alpha, stencil, scissor, and color channel masks | `pixijs-masking` |
| Standard and advanced blend modes (color-burn, overlay, etc.) | `pixijs-blend-modes` |
| `Color` class, hex/RGB/HSL conversion, tint values | `pixijs-color` |

### Interaction

| Topic | Skill |
|---|---|
| Pointer/mouse/touch events, `eventMode`, `hitArea`, cursor | `pixijs-events` |
| Screen reader support, keyboard navigation, ARIA roles | `pixijs-accessibility` |
| Overlay HTML elements on canvas with `DOMContainer` | `pixijs-dom-overlay` |

### Custom rendering & performance

| Topic | Skill |
|---|---|
| Custom shaders, uniforms, `GlProgram`/`GpuProgram`, `Batcher`, `RenderPipe` | `pixijs-custom-rendering` |
| Destroy patterns, texture GC, batching, `PrepareSystem`, object pooling | `pixijs-performance` |

### Migration

| Topic | Skill |
|---|---|
| v7 → v8: async init, Graphics API, `BaseTexture` removal, settings removal | `pixijs-migration` |

## Version

Targets `pixi.js` v8.17.1.

## Learn more

- [PixiJS API Reference](https://pixijs.download/release/docs/llms.txt)
