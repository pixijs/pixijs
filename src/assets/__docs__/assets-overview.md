---
title: Overview
category: assets
---

# Assets

The `Assets` class provides a modern, centralized system for managing and loading resources in PixiJS. It offers caching, background loading, bundle management, and smart format detection while supporting a wide range of file types.

## Basic Usage

Load assets using the global `Assets` singleton:

```ts
import { Assets, Texture } from 'pixi.js';

// Initialize the asset system
await Assets.init({
    basePath: 'assets/',
});

// Load a single asset
const texture = await Assets.load<Texture>('bunny.png');

// Load multiple assets
const assets = await Assets.load(['bunny.png', 'spritesheet.json', 'font.ttf']);
```

## Core Features

### Asset Loading

The system supports many file types out of the box:

```ts
// Load textures (avif, webp, png, jpg, gif, svg)
const texture = await Assets.load('sprite.{webp,png}');

// Load video textures (mp4, webm, ogg)
const video = await Assets.load('clip.{webm,mp4}');

// Load spritesheets
const sheet = await Assets.load('sprites.json');

// Load fonts (ttf, woff, woff2)
const font = await Assets.load('font.ttf');

// Load data files
const data = await Assets.load('config.json');
const text = await Assets.load('info.txt');
```

Supported Asset Types:
| Type | Extensions | Loaders |
| ------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| Textures | `.png`, `.jpg`, `.gif`, `.webp`, `.avif`, `.svg` | {@link loadTextures}, {@link loadSvg} |
| Video Textures | `.mp4`, `.m4v`, `.webm`, `.ogg`, `.ogv`, `.h264`, `.avi`, `.mov` | {@link loadVideoTextures} |
| Sprite Sheets | `.json` | {@link spritesheetAsset} |
| Bitmap Fonts | `.fnt`, `.xml`, `.txt` | {@link loadBitmapFont} |
| Web Fonts | `.ttf`, `.otf`, `.woff`, `.woff2` | {@link loadWebFont} |
| JSON | `.json` | {@link loadJson} |
| Text | `.txt` | {@link loadTxt} |
| Compressed Textures | `.basis`, `.dds`, `.ktx`, `.ktx2` | {@link loadBasis}, {@link loadDDS}, {@link loadKTX}, {@link loadKTX2} |

### Asset Bundles

Group related assets into bundles for organized loading:

```ts
// Define bundles
Assets.addBundle('loading-screen', [
    { alias: 'background', src: 'bg.png' },
    { alias: 'progress-bar', src: 'bar.png' },
]);

Assets.addBundle('game', [
    { alias: 'character', src: 'hero.png' },
    { alias: 'enemies', src: 'monsters.json' },
]);

// Load bundles
const loadingAssets = await Assets.loadBundle('loading-screen');
const gameAssets = await Assets.loadBundle('game');
```

### Background Loading

Load assets in the background while maintaining performance:

```ts
// Start background loading
Assets.backgroundLoad(['level1.json', 'level2.json']);

// Later, get the assets instantly
const level1 = await Assets.load('level1.json'); // Resolves immediately if loaded
const level2 = await Assets.load('level2.json'); // Resolves immediately if loaded
```

## Asset Configuration

### Manifests

Define all your game's assets in a manifest:

```ts
const manifest = {
    bundles: [
        {
            name: 'game-essential',
            assets: [
                {
                    alias: 'hero',
                    src: 'characters/hero.{webp,png}',
                },
                {
                    alias: 'ui',
                    src: 'interface.json',
                },
            ],
        },
    ],
};

await Assets.init({ manifest });
// Load a bundle from the manifest
const gameAssets = await Assets.loadBundle('game-essential');
// or load individual assets
const heroTexture = await Assets.load('hero');
```

### Format Preferences

Configure preferred asset formats and resolutions:

```ts
await Assets.init({
    texturePreference: {
        format: ['webp', 'png'], // Prefer WebP over PNG
        resolution: 2, // Prefer 2x resolution
    },
    defaultSearchParams: {
        // URL parameters
        version: '1.0.0',
    },
});
```

## Cache Management

Control the asset cache:

```ts
// Check if asset is cached
const isCached = Assets.cache.has('texture.png');

// Get cached asset
const texture = Assets.get('texture.png');

// Unload specific assets
await Assets.unload('texture.png');

// Reset entire cache
Assets.reset();
```

## Best Practices

- Use `Assets.init()` before loading any assets
- Leverage bundles for organized loading
- Use format fallbacks (e.g., `image.{webp,png}`)
- Take advantage of background loading for better performance
- Clean up unused assets with `Assets.unload()`
- Consider using manifests for large applications

## Related Documentation

- See {@link Assets} for the main asset manager
- See {@link AssetsManifest} for manifest configuration
- See {@link LoaderParser} for custom loaders
- See {@link CacheParser} for cache handling
- See {@link BackgroundLoader} for background loading
- See {@link Texture} for texture management
- See {@link Spritesheet} for sprite sheets
- See {@link loadTextures} for texture loading
- See {@link loadWebFont} for font loading

For more specific implementation details and advanced usage, refer to the API documentation of individual classes and interfaces.
