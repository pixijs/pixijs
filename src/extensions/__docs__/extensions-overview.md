---
title: Overview
category: extensions
---

# Extensions

The extension system is a core architecture of PixiJS that enables modularity, flexibility, and extensibility. Every major system in PixiJS is implemented as an extension, from rendering pipelines to asset loading.

## Basic Usage

Register an extension using the global `extensions` object:

```ts
import { extensions, ExtensionType } from 'pixi.js';

const customLoader = {
    extension: {
        type: ExtensionType.LoadParser,
        name: 'custom-loader',
        priority: 100, // Optional priority for ordering
    },

    test(url: string) {
        return url.endsWith('.custom');
    },

    load(url: string) {
        // Custom loading logic
        return fetch(url).then(/* ... */);
    },
};

extensions.add(customLoader);
```

## Extension Management

### Adding Extensions

```ts
// Add single extension
extensions.add(customLoader);

// Add multiple extensions
extensions.add(customLoader, customSystem, customPlugin);
```

### Removing Extensions

```ts
// Remove single extension
extensions.remove(customLoader);

// Remove multiple extensions
extensions.remove(customLoader, customSystem);
```

### Priority System

Extensions can specify a priority to control their order of execution:

```ts
const highPriorityLoader = {
    extension: {
        type: ExtensionType.LoadParser,
        name: 'priority-loader',
        priority: 100, // Higher priority runs first
    },
};

const lowPriorityLoader = {
    extension: {
        type: ExtensionType.LoadParser,
        name: 'fallback-loader',
        priority: -1, // Lower priority runs last
    },
};
```

## Extension Types

### Asset Management

Asset management extensions handle loading, resolving, caching, and detecting assets. They can be combined into a single asset group extension.

```ts
// Asset group extension
const assetBundle = {
    extension: {
        type: ExtensionType.Asset,
        name: 'bundle-loader',
    },
    load: {
        /* loader config */
    },
    resolve: {
        /* resolver config */
    },
    cache: {
        /* cache config */
    },
    detection: {
        /* detection config */
    },
};
```

### Rendering Pipeline

Rendering extensions define how objects are rendered, including systems and pipes. They can be WebGL or WebGPU based.

```ts
// Renderer system extension
class CustomSystem {
    static extension = {
        type: [ExtensionType.WebGLSystem, ExtensionType.WebGPUSystem],
        name: 'custom-system',
    };

    init() {
        /* ... */
    }
    destroy() {
        /* ... */
    }
}

// Render pipe extension
const customPipe = {
    extension: {
        type: ExtensionType.WebGLPipes,
        name: 'custom-pipe',
    },
    render(object) {
        /* ... */
    },
};
```

### Application Plugins

Application plugins extend the core application functionality, allowing for custom features and behaviors.

```ts
class CustomPlugin {
    static extension = {
        type: ExtensionType.Application,
        name: 'custom-plugin',
    };

    static init(options) {
        // Add features to Application
        Object.defineProperty(this, 'customFeature', {
            value: () => console.log('Custom feature!'),
        });
    }

    static destroy() {
        // Cleanup
    }
}
```

## Best Practices

-   Give extensions unique, descriptive names
-   Use appropriate priority values for ordering
-   Clean up resources in destroy methods
-   Test extensions across different environments
-   Document extension requirements and dependencies
-   Follow the extension type's interface requirements
-   Consider backward compatibility

## Extension Types Reference

### Core Systems

-   `ExtensionType.Application`: Application plugins
-   `ExtensionType.Environment`: Environment configuration

### Asset Management

-   `ExtensionType.Asset`: Combined asset handling
-   `ExtensionType.LoadParser`: Resource loading
-   `ExtensionType.ResolveParser`: URL resolution
-   `ExtensionType.CacheParser`: Cache management
-   `ExtensionType.DetectionParser`: Format detection

### Rendering

-   `ExtensionType.WebGLSystem`: WebGL systems
-   `ExtensionType.WebGPUSystem`: WebGPU systems
-   `ExtensionType.CanvasSystem`: Canvas systems
-   `ExtensionType.WebGLPipes`: WebGL render pipes
-   `ExtensionType.WebGPUPipes`: WebGPU render pipes
-   `ExtensionType.CanvasPipes`: Canvas render pipes

### Advanced Features

-   `ExtensionType.MaskEffect`: Custom masking
-   `ExtensionType.BlendMode`: Blend modes
-   `ExtensionType.TextureSource`: Texture handling
-   `ExtensionType.ShapeBuilder`: Graphics shapes
-   `ExtensionType.Batcher`: Render batching

## Related Documentation

-   See {@link ExtensionType} for all extension types
-   See {@link ExtensionFormatLoose} for extension metadata format
-   See {@link extensions} for the extension registry
-   See {@link Application} for application plugins
-   See {@link Assets} for asset loading system
-   See {@link Renderer} for rendering extensions
-   See {@link LoaderParser} for asset loading
-   See {@link ResolveURLParser} for URL resolution
-   See {@link CacheParser} for caching behavior

For detailed implementation requirements and advanced usage, refer to the API documentation of individual extension types.
