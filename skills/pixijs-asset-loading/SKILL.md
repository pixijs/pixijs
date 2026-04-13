---
name: pixijs-asset-loading
description: >
  Load, cache, and manage resources with PixiJS Assets. Assets.init() for
  basePath and texturePreference. Assets.load() with onProgress and LoadOptions
  (strategy: throw/skip/retry, onError, retryCount). Assets.add() with
  alias/src objects. Assets.addBundle/loadBundle for grouped loading.
  Assets.get() for cached retrieval. Assets.unload() for GPU cleanup.
  SVG loading as texture vs Graphics (parseAsGraphicsContext in data field).
  Compressed textures (DDS, KTX, KTX2, Basis) require explicit import.
  Resolution detection (@2x, @0.5x patterns). Supported file types:
  textures, video, spritesheets, bitmap fonts, web fonts, JSON, text.
  Use when the user asks about loading images, loading textures, preloading
  assets, asset bundles, manifests, background loading, progress bars, load
  screens, caching resources, unloading textures, freeing GPU memory,
  compressed textures, SVG loading, resolution detection, or retrying failed
  loads. Covers Assets, Loader, Resolver, Cache, LoadOptions.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  sources: "pixijs/pixijs:src/assets/Assets.ts, pixijs/pixijs:src/assets/loader/Loader.ts, pixijs/pixijs:src/assets/resolver/Resolver.ts"
---

## When to Use This Skill

Apply when loading, caching, or managing any external resource (images, fonts, JSON, video, spritesheets, compressed textures) or when configuring asset resolution, bundles, manifests, or error handling strategies.

**Related skills:** For texture atlas frames use **spritesheet**; for displaying loaded textures use **sprite**; for memory cleanup strategies use **performance**.

## Setup

```ts
import { Application, Assets, Sprite } from 'pixi.js';

const app = new Application();
await app.init({ width: 800, height: 600 });
document.body.appendChild(app.canvas);

const texture = await Assets.load('bunny.png');
const sprite = new Sprite(texture);
app.stage.addChild(sprite);
```

`Assets.load()` auto-initializes the asset system on first call. For explicit configuration, call `Assets.init()` first.

## Supported file types

| Type                | Extensions                                                       | Loader               |
| ------------------- | ---------------------------------------------------------------- | -------------------- |
| Textures            | `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.svg`                | loadTextures, loadSvg |
| GIF (animated)      | `.gif`                                                           | Requires `import 'pixi.js/gif'` (returns GifSource, not Texture) |
| Video textures      | `.mp4`, `.m4v`, `.webm`, `.ogg`, `.ogv`, `.h264`, `.avi`, `.mov` | loadVideoTextures    |
| Sprite sheets       | `.json` (Spritesheet format)                                     | spritesheetAsset     |
| Bitmap fonts        | `.fnt`, `.xml`                                                   | loadBitmapFont       |
| Web fonts           | `.ttf`, `.otf`, `.woff`, `.woff2`                                | loadWebFont          |
| JSON                | `.json`                                                          | loadJson             |
| Text                | `.txt`                                                           | loadTxt              |
| Compressed textures | `.basis`, `.dds`, `.ktx`, `.ktx2`                                | Requires extra import (see below) |

## Core Patterns

### Initialization with preferences

```ts
import { Assets } from 'pixi.js';

await Assets.init({
    basePath: 'https://cdn.example.com/assets/',
    defaultSearchParams: { v: '1.0.0' },
    texturePreference: {
        resolution: window.devicePixelRatio,
        format: ['avif', 'webp', 'png'],
    },
});
```

`basePath` is prepended to all asset URLs. `texturePreference.format` tells the resolver which image format to prefer when multiple are available. `Assets.init()` can only be called once; subsequent calls are ignored with a warning.

### Loading single and multiple assets

```ts
import { Assets, Sprite } from 'pixi.js';

// Single asset; returns the asset directly
const texture = await Assets.load('hero.png');

// Multiple assets; returns a Record<string, T>
const assets = await Assets.load(['hero.png', 'enemy.png', 'map.json']);
const heroTexture = assets['hero.png'];

// With progress tracking
await Assets.load(['hero.png', 'enemy.png'], (progress) => {
    console.log(`${Math.round(progress * 100)}%`);
});

// With alias and format selection
Assets.add({ alias: 'hero', src: 'hero.{webp,png}' });
const hero = await Assets.load('hero');

// Cached retrieval (synchronous, returns undefined if not loaded)
const cached = Assets.get('hero');
```

`Assets.load()` caches results. Calling it again with the same key returns the cached asset immediately. `Assets.get()` is synchronous but returns undefined if the asset hasn't been loaded yet.

### Resolution wildcards

Combine format and resolution patterns to let the resolver pick the best match for the device:

```ts
Assets.add({ alias: 'hero', src: 'hero@{0.5,1,2}x.{webp,png}' });
const hero = await Assets.load('hero');
```

This expands to 6 candidates (`hero@0.5x.webp`, `hero@0.5x.png`, `hero@1x.webp`, etc.). The resolver selects based on `window.devicePixelRatio` and browser format support.

### Load strategies and error handling

The second parameter to `Assets.load()` accepts a `LoadOptions` object for error handling:

```ts
import { Assets } from 'pixi.js';

// Retry transient failures
const assets = await Assets.load(['hero.png', 'map.json'], {
    strategy: 'retry',
    retryCount: 4,
    retryDelay: 500,
    onProgress: (progress) => console.log(`${Math.round(progress * 100)}%`),
    onError: (err, asset) => console.warn('Failed:', asset.src, err.message),
});

// Skip missing optional assets
const optional = await Assets.load('badge.png', {
    strategy: 'skip',
    onError: (err, asset) => console.warn('Skipped:', asset.src),
});
```

| Strategy | Behavior |
| -------- | -------- |
| `'throw'` (default) | First failure rejects the promise |
| `'skip'` | Failed assets are skipped; others continue loading |
| `'retry'` | Retries up to `retryCount` (default 3) with `retryDelay` ms (default 250) between attempts |

Set defaults globally via `Assets.init({ loadOptions: { strategy: 'retry', retryCount: 3 } })`.

### Bundles and manifests

```ts
import { Assets, Sprite } from 'pixi.js';

// Programmatic bundles
Assets.addBundle('level1', [
    { alias: 'bg', src: 'level1/background.png' },
    { alias: 'tileset', src: 'level1/tiles.json' },
]);

const resources = await Assets.loadBundle('level1');
const bg = Sprite.from('bg');

// Manifest-based (declare all bundles upfront)
await Assets.init({
    manifest: {
        bundles: [
            {
                name: 'load-screen',
                assets: [{ alias: 'logo', src: 'logo.png' }],
            },
            {
                name: 'game',
                assets: [{ alias: 'hero', src: 'hero.{webp,png}' }],
            },
        ],
    },
});

await Assets.loadBundle('load-screen');

// Background-load next bundle while showing load screen
Assets.backgroundLoadBundle('game');

// When ready, this resolves fast if background load finished
await Assets.loadBundle('game');
```

### Unloading and cleanup

```ts
import { Assets } from 'pixi.js';

// Remove asset from cache and release GPU memory
await Assets.unload('hero.png');

// Unload an entire bundle
await Assets.unloadBundle('level1');
```

Remove all display objects referencing the asset before unloading. Textures are destroyed and cannot be used after unloading.

### SVG loading

SVGs load as rasterized textures by default (fast, but pixelates when scaled). To load as scalable vector geometry, pass `parseAsGraphicsContext: true` in the `data` field:

```ts
import { Assets, Sprite, Graphics } from 'pixi.js';

// As texture (default): fast rendering, fixed resolution
const svgTexture = await Assets.load('icon.svg');
const sprite = new Sprite(svgTexture);

// As Graphics: scalable, editable, higher parse cost
const svgContext = await Assets.load({
    src: 'icon.svg',
    data: { parseAsGraphicsContext: true },
});
const graphic = new Graphics(svgContext);

// Reuse a parsed SVG across multiple Graphics instances
const graphic2 = new Graphics(svgContext);
```

Use texture mode for backgrounds, decorations, and complex SVGs at fixed sizes. Use Graphics mode for icons, UI elements, and anything that needs to scale or be modified at runtime.

### Compressed textures

Compressed formats (DDS, KTX, KTX2, Basis) use 4-8x less GPU memory. They require explicit loader registration before any `Assets.load()` call:

```ts
import 'pixi.js/ktx2';
import 'pixi.js/basis';
import { Assets } from 'pixi.js';

const texture = await Assets.load('background.ktx2');
```

Available imports: `pixi.js/dds`, `pixi.js/ktx`, `pixi.js/ktx2`, `pixi.js/basis`. Only import what you use. Without the import, the loader silently skips the file.

## Common Mistakes

### [CRITICAL] Using Texture.from with a URL to load

Wrong:
```ts
import { Texture } from 'pixi.js';

const texture = Texture.from('https://example.com/image.png');
```

Correct:
```ts
import { Assets, Texture } from 'pixi.js';

await Assets.load('https://example.com/image.png');
const texture = Texture.from('https://example.com/image.png');
```

In v8, `Texture.from()` only retrieves from the cache; it does not fetch from a URL. Use `Assets.load()` first. The return value of `Assets.load()` is the texture itself, so you can also just use it directly:

```ts
const texture = await Assets.load('https://example.com/image.png');
```

Source: src/__docs__/migrations/v8.md

### [HIGH] Using old Assets.add positional signature

Wrong:
```ts
import { Assets } from 'pixi.js';

Assets.add('bunny', 'bunny.png');
```

Correct:
```ts
import { Assets } from 'pixi.js';

Assets.add({ alias: 'bunny', src: 'bunny.png' });
```

The positional `Assets.add(key, url)` form was removed in v8. Use the options object with `alias` and `src` properties.

Source: src/__docs__/migrations/v8.md

### [HIGH] Not using Assets.unload to free GPU memory

`Assets.load()` caches textures indefinitely. Without calling `Assets.unload()`, textures remain in GPU memory even when no display objects reference them. For level-based games or screens with distinct asset sets, unload previous bundles when transitioning.

```ts
import { Assets } from 'pixi.js';

// When leaving level 1
await Assets.unloadBundle('level1');

// Load level 2
await Assets.loadBundle('level2');
```

Source: src/__docs__/concepts/garbage-collection.md

---

See also: spritesheet (atlas loading), core-concepts (texture structure), performance (memory management), migration-v8 (upgrading from v7)

## Learn More

- [Assets](https://pixijs.download/release/docs/assets.Assets.html.md)
- [Loader](https://pixijs.download/release/docs/assets.Loader.html.md)
- [Resolver](https://pixijs.download/release/docs/assets.Resolver.html.md)
- [Cache](https://pixijs.download/release/docs/assets.Cache.html.md)
- [LoadOptions](https://pixijs.download/release/docs/assets.LoadOptions.html.md)
