---
title: Overview
category: extensions
description: Learn how to use the PixiJS extension system to register, remove, and create modular plugins for rendering, asset loading, and more.
---

# Extensions

PixiJS is built as a set of swappable parts called **extensions**. Renderers, asset loaders, event systems, and application plugins are all extensions. You can add your own, replace built-in ones, or remove ones you don't need. This is how PixiJS stays lightweight while supporting a wide range of features.

## Basic usage

Register an extension using the global `extensions` object:

```ts
import { extensions, ExtensionType } from 'pixi.js';

const spriteSheetLoader = {
    extension: {
        type: ExtensionType.LoadParser,
        name: 'sprite-sheet-loader',
        priority: 100,
    },

    id: 'spriteSheet', // Unique name; the renderer/loader uses this to look up the extension

    test(url: string) {
        return url.endsWith('.json');
    },

    async load(url: string) {
        const response = await fetch(url);
        return response.json();
    },
};

extensions.add(spriteSheetLoader);
```

## Extension management

### Adding extensions

```ts
// Single extension
extensions.add(spriteSheetLoader);

// Multiple extensions
extensions.add(spriteSheetLoader, customSystem, customPipe);
```

### Removing extensions

```ts
// Single extension
extensions.remove(spriteSheetLoader);

// Multiple extensions
extensions.remove(spriteSheetLoader, customSystem);
```

### Priority system

Extensions can specify a priority to control execution order. Higher priority numbers run first. The default priority is `-1` when unspecified.

```ts
const highPriorityLoader = {
    extension: {
        type: ExtensionType.LoadParser,
        name: 'priority-loader',
        priority: 100, // runs first
    },
};

const lowPriorityLoader = {
    extension: {
        type: ExtensionType.LoadParser,
        name: 'fallback-loader',
        priority: -1, // runs last
    },
};
```

## Extension types

### Asset management

Asset extensions handle loading, resolving, caching, and detecting assets. You can combine them into a single `Asset` group extension using the `loader`, `resolver`, `cache`, and `detection` properties:

```ts
const spriteAsset = {
    extension: ExtensionType.Asset,
    loader: {
        id: 'spriteLoader',
        test(url: string) { return url.endsWith('.sprite'); },
        async load(url: string) { /* load logic */ },
    },
    resolver: {
        test(url: string) { return url.endsWith('.sprite'); },
        parse(url: string) { /* resolve logic */ },
    },
    cache: {
        test(asset: any) { return asset.isSprite; },
        getCacheableAssets(keys: string[], asset: any) { /* cache logic */ },
    },
    detection: {
        test: async () => true,
        add: async (formats: string[]) => [...formats, 'sprite'],
        remove: async (formats: string[]) => formats.filter((f) => f !== 'sprite'),
    },
};
```

### Rendering pipeline

Rendering extensions define how objects are drawn. Systems manage specific rendering aspects (textures, shaders, buffers), while pipes handle rendering for specific display object types.

Extensions can target WebGL, WebGPU, or both:

```ts
// Renderer system targeting both WebGL and WebGPU
class CustomSystem {
    static extension = {
        type: [ExtensionType.WebGLSystem, ExtensionType.WebGPUSystem],
        name: 'custom-system',
    };

    init() { /* setup */ }
    destroy() { /* cleanup */ }
}

// Render pipe targeting all renderers
const customPipe = {
    extension: {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'custom-pipe',
    },
    render(object) { /* draw logic */ },
};
```

### Application plugins

Application plugins extend the core `Application` class. Plugins use static `init` and `destroy` methods. During `init`, `this` refers to the Application instance:

```ts
class MyPlugin {
    static extension = ExtensionType.Application;

    static init(options) {
        // `this` is the Application instance
        Object.defineProperty(this, 'myFeature', {
            value: () => { /* feature logic */ },
        });
    }

    static destroy() {
        // cleanup
    }
}
```

Plugins initialize in registration order and destroy in reverse order.

## Extension types reference

### Core systems

- `ExtensionType.Application`: Application plugins
- `ExtensionType.Environment`: Environment configuration

### Asset management

- `ExtensionType.Asset`: Combined asset handling
- `ExtensionType.LoadParser`: Resource loading
- `ExtensionType.ResolveParser`: URL resolution
- `ExtensionType.CacheParser`: Cache management
- `ExtensionType.DetectionParser`: Format detection

### Rendering

- `ExtensionType.WebGLSystem`: WebGL systems
- `ExtensionType.WebGLPipes`: WebGL render pipes
- `ExtensionType.WebGLPipesAdaptor`: WebGL render pipe adaptors
- `ExtensionType.WebGPUSystem`: WebGPU systems
- `ExtensionType.WebGPUPipes`: WebGPU render pipes
- `ExtensionType.WebGPUPipesAdaptor`: WebGPU render pipe adaptors
- `ExtensionType.CanvasSystem`: Canvas systems
- `ExtensionType.CanvasPipes`: Canvas render pipes
- `ExtensionType.CanvasPipesAdaptor`: Canvas render pipe adaptors

### Advanced features

These extension types are for specialized use cases. Most applications won't need them.

- `ExtensionType.MaskEffect`: Custom masking strategies
- `ExtensionType.BlendMode`: Custom blend mode implementations
- `ExtensionType.TextureSource`: Auto-detect and create texture sources from raw data
- `ExtensionType.ShapeBuilder`: Add new shape types to the Graphics API
- `ExtensionType.Batcher`: Custom batch grouping for draw call optimization

## Related documentation

- See {@link ExtensionType} for all extension types
- See {@link ExtensionFormatLoose} for extension metadata format
- See {@link extensions} for the extension registry
- See {@link Application} for application plugins
- See {@link Assets} for the asset loading system
- See {@link Renderer} for rendering extensions
- See {@link LoaderParser} for asset loader interface
- See {@link ResolveURLParser} for URL resolution interface
- See {@link CacheParser} for cache parser interface
