---
sidebar_position: -1
title: Architecture
description: A comprehensive guide to the architecture of PixiJS, including its major components and extension system.
category: core-concepts
---

# Architecture

PixiJS is composed of several major components that work together to render 2D content to the screen. This page gives you a map of those components so you know where to look when building or debugging your project.

## Major Components

| Component         | Description                                                                                                                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Renderer**      | The core of the PixiJS system is the renderer, which displays the scene graph and draws it to the screen. PixiJS will automatically determine whether to provide you the WebGPU or WebGL renderer under the hood. |
| **Container**     | Main scene object which creates a scene graph: the tree of renderable objects to be displayed, such as sprites, graphics and text. See [Scene Graph](./scene-graph.mdx) for more details.                               |
| **Assets**        | The Asset system provides tools for asynchronously loading resources such as images and audio files.                                                                                                              |
| **Ticker**        | Tickers provide periodic callbacks based on a clock. Your game update logic will generally be run in response to a tick once per frame. You can have multiple tickers in use at one time.                         |
| **Application**   | A convenience wrapper that sets up a Renderer and Ticker for you. Great for getting started quickly, prototyping, and building simple projects.            |
| **Events**        | PixiJS supports pointer-based interaction - making objects clickable, firing hover events, etc.                                                                                                                   |
| **Accessibility** | Woven through our display system is a rich set of tools for enabling keyboard and screen-reader accessibility.                                                                                                    |
| **Filters**       | PixiJS supports a variety of filters, including custom shaders, to apply effects to your renderable objects.                                                                                                      |

## Extensions

PixiJS v8 is built entirely around the concept of extensions. Every system in PixiJS is implemented as a modular extension. This allows PixiJS to remain lightweight, flexible, and easy to extend.

> [!NOTE]
> In most cases, you won’t need to interact with the extension system directly unless you are developing a third-party library or contributing to the PixiJS ecosystem itself.

## Extension Types

An extension is any object with an `extension` metadata field that tells PixiJS what role it plays. PixiJS supports a wide range of extension types:

### Assets

- `ExtensionType.Asset`: Groups together loaders, resolvers, cache and detection extensions into one convenient object instead of having to register each one separately.
- `ExtensionType.LoadParser`: Loads resources like images, JSON, videos.
- `ExtensionType.ResolveParser`: Converts asset URLs into a format that can be used by the loader.
- `ExtensionType.CacheParser`: Determines caching behavior for a particular asset.
- `ExtensionType.DetectionParser`: Identifies asset format support on the current platform.

### Renderer (WebGL, WebGPU, Canvas)

- `ExtensionType.WebGLSystem`, `ExtensionType.WebGPUSystem`, `ExtensionType.CanvasSystem`: Add systems to their respective renderers. These systems can vary widely in functionality, from managing textures to accessibility features.
- `ExtensionType.WebGLPipes`, `ExtensionType.WebGPUPipes`, `ExtensionType.CanvasPipes`: Add a new rendering pipe. RenderPipes are specifically used to render Renderables like a Mesh
- `ExtensionType.WebGLPipesAdaptor`, `ExtensionType.WebGPUPipesAdaptor`, `ExtensionType.CanvasPipesAdaptor`: Adapt rendering pipes for the respective renderers.

### Application

- `ExtensionType.Application`: Used for plugins that extend the `Application` lifecycle.
  For example the `TickerPlugin` and `ResizePlugin` are both application extensions.

### Environment

- `ExtensionType.Environment`: Used to detect and configure platform-specific behavior. This can be useful for configuring PixiJS to work in environments like Node.js, Web Workers, or the browser.

### Other (Primarily Internal Use)

These extension types are mainly used internally and are typically not required in most user-facing applications:

- `ExtensionType.MaskEffect`: Used by MaskEffectManager for custom masking behaviors.
- `ExtensionType.BlendMode`: A type of extension for creating a new advanced blend mode.
- `ExtensionType.TextureSource`: A type of extension that will be used to auto-detect a resource type E.g `VideoSource`
- `ExtensionType.ShapeBuilder`: A type of extension for building and triangulating custom shapes used in graphics.
- `ExtensionType.Batcher`: A type of extension for creating custom batchers used in rendering.

## Creating Extensions

The `extensions` object in PixiJS is a global registry for managing extensions. Extensions must declare an `extension` field with metadata, and are registered via `extensions.add(...)`.

```ts
import { extensions, ExtensionType } from 'pixi.js';

const myLoader = {
  extension: {
    type: ExtensionType.LoadParser,
    name: 'my-loader',
  },
  test(url) {
    // Return true if this loader should handle the given URL
    return url.endsWith('.custom');
  },
  async load(url) {
    // Fetch and return the parsed resource
    const response = await fetch(url);
    return response.json();
  },
};

extensions.add(myLoader);
```
