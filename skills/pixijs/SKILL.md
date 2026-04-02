---
name: pixijs
description: >
  Core overview and sub-skill router for PixiJS v8. Use when building PixiJS
  applications, working with 2D rendering, WebGL, WebGPU, or asking about any
  PixiJS API. Covers Application, Container, Sprite, Graphics, Text, BitmapText,
  HTMLText, Mesh, ParticleContainer, Assets, Ticker, Filters, Masking, BlendModes,
  Color, Events, Accessibility, DOMContainer, custom shaders, uniforms, batching,
  RenderPipe, and the extensions system. Routes agents to the correct sub-skill
  for setup, scene building, rendering content, loading assets, applying effects,
  interaction, custom rendering, performance, or migration from v7. Use when the
  user asks about pixi.js, PixiJS, 2D rendering, canvas rendering, WebGL rendering,
  WebGPU rendering, game graphics, sprite animation, or any PixiJS class or API.
metadata:
  type: core
  library: pixi.js
  library-version: "8.17.1"
---

## When to Use This Skill

This is the entry point for all PixiJS work. Start here when the task involves PixiJS and use the decision tree below to route to the correct sub-skill.

# PixiJS v8 Core Overview

PixiJS is a 2D rendering library for the web that targets WebGL, WebGPU, and Canvas backends through a unified API. The scene graph is built on Container as the base class (DisplayObject was removed in v8). Renderers use a systems-and-pipes architecture: systems manage GPU state (textures, shaders, buffers) while pipes handle type-specific rendering (SpritePipe, GraphicsPipe, etc.). Plugins register through `extensions.add()`. Application initialization is async via `app.init()`. Assets are loaded through a centralized `Assets` class with caching, resolution detection, and format negotiation. All DOM access goes through `DOMAdapter` for cross-environment compatibility.

## Sub-Skills

### Setting Up

| Task | Sub-Skill | Path |
|------|-----------|------|
| Create an app, configure canvas, responsive resize, choose renderer | Getting Started | `getting-started/SKILL.md` |
| Render loop, deltaTime, UPDATE_PRIORITY, maxFPS, manual rendering | Ticker | `ticker/SKILL.md` |
| Browser, Web Worker, OffscreenCanvas, DOMAdapter, CSP/unsafe-eval | Environments | `environments/SKILL.md` |

### Building Scenes

| Task | Sub-Skill | Path |
|------|-----------|------|
| Container hierarchy, transforms, Texture, Bounds, destroy, extensions | Core Concepts | `core-concepts/SKILL.md` |
| RenderLayer, render groups, culling, zIndex, sortableChildren | Scene Management | `scene-management/SKILL.md` |
| Point, Matrix, Rectangle, Circle, Polygon, coordinate transforms | Math | `math/SKILL.md` |

### Rendering Content

| Task | Sub-Skill | Path |
|------|-----------|------|
| Sprite, anchor, AnimatedSprite, NineSliceSprite, TilingSprite | Sprite | `sprite/SKILL.md` |
| Vector shapes, fill/stroke/cut, GraphicsContext, SVG, gradients | Graphics | `graphics/SKILL.md` |
| Text (canvas), BitmapText (MSDF), HTMLText (CSS), SplitText (per-char) | Text | `text/SKILL.md` |
| MeshGeometry, MeshSimple, MeshPlane, MeshRope, PerspectiveMesh | Mesh | `mesh/SKILL.md` |
| High-count particles with Particle class, dynamicProperties | Particle Container | `particle-container/SKILL.md` |
| Animated GIF loading and playback with GifSprite | GIF | `gif/SKILL.md` |

### Loading Assets

| Task | Sub-Skill | Path |
|------|-----------|------|
| Assets.load, bundles, caching, compressed textures, resolution | Asset Loading | `asset-loading/SKILL.md` |
| Texture atlases, SpritesheetData format, animations from sheets | Spritesheet | `spritesheet/SKILL.md` |

### Applying Effects

| Task | Sub-Skill | Path |
|------|-----------|------|
| BlurFilter, ColorMatrixFilter, DisplacementFilter, custom filters | Filters | `filters/SKILL.md` |
| Alpha, stencil, scissor, and color channel masks | Masking | `masking/SKILL.md` |
| Standard and advanced blend modes (color-burn, overlay, etc.) | Blend Modes | `blend-modes/SKILL.md` |
| Color class, hex/RGB/HSL conversion, tint values | Color | `color/SKILL.md` |

### Adding Interaction

| Task | Sub-Skill | Path |
|------|-----------|------|
| Pointer/mouse/touch events, eventMode, hitArea, cursor | Events | `events/SKILL.md` |
| Screen reader support, keyboard navigation, ARIA roles | Accessibility | `accessibility/SKILL.md` |
| Overlay HTML elements on canvas with DOMContainer | DOM Overlay | `dom-overlay/SKILL.md` |

### Custom Rendering

| Task | Sub-Skill | Path |
|------|-----------|------|
| Custom shaders, uniforms, GlProgram/GpuProgram, Batcher, RenderPipe | Custom Rendering | `custom-rendering/SKILL.md` |

### Optimizing

| Task | Sub-Skill | Path |
|------|-----------|------|
| Destroy patterns, texture GC, batching, PrepareSystem, object pooling | Performance | `performance/SKILL.md` |

### Migrating

| Task | Sub-Skill | Path |
|------|-----------|------|
| v7 to v8: async init, Graphics API, BaseTexture removal, settings removal | Migration v8 | `../pixijs-migration/SKILL.md` |

## Quick Decision Tree

- **"How do I create an app / set up PixiJS?"** -> Getting Started
- **"How does the render loop / game loop work?"** -> Ticker
- **"How do I run PixiJS in a Web Worker / handle CSP?"** -> Environments
- **"How do containers, transforms, textures work?"** -> Core Concepts
- **"How do I manage render order, layers, or culling?"** -> Scene Management
- **"How do I use Point, Matrix, or hit-test shapes?"** -> Math
- **"How do I display an image?"** -> Sprite
- **"How do I draw shapes or vector graphics?"** -> Graphics
- **"How do I render text?"** -> Text
- **"How do I create custom geometry / deformable surfaces?"** -> Mesh
- **"How do I render thousands of particles?"** -> Particle Container
- **"How do I play an animated GIF?"** -> GIF
- **"How do I load images, fonts, or other assets?"** -> Asset Loading
- **"How do I use a spritesheet / texture atlas?"** -> Spritesheet
- **"How do I blur, tint, or apply post-processing?"** -> Filters
- **"How do I clip / mask part of a display object?"** -> Masking
- **"How do I use blend modes like multiply or screen?"** -> Blend Modes
- **"How do I convert or manipulate colors?"** -> Color
- **"How do I handle clicks, taps, or pointer events?"** -> Events
- **"How do I add screen reader / keyboard support?"** -> Accessibility
- **"How do I overlay HTML elements on the canvas?"** -> DOM Overlay
- **"How do I write a custom shader or renderable?"** -> Custom Rendering
- **"How do I improve performance / reduce memory?"** -> Performance
- **"How do I migrate from v7 to v8?"** -> Migration v8

## Version

Targets pixi.js v8.17.1

## Learn More

- [PixiJS API Reference](https://pixijs.download/release/docs/llms.txt)
