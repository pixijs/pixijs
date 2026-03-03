---
title: Background Loader
description: Learn how to use the PixiJS background loader to load assets in the background, improving application responsiveness and reducing load times.
category: assets
---

# Background loader

The background loader queues asset downloads at low priority so they happen between frames while your application runs. Assets loaded this way are cached normally; when you later call `Assets.load()` or `Assets.loadBundle()` for the same asset, it resolves instantly if the background load already finished.

## Loading bundles

The most effective way to use the background loader is with bundles. Bundles are groups of related assets, such as all assets for a specific screen or level. Loading bundles in the background ensures assets are ready when needed without blocking the main thread.

```ts
const manifest = {
  bundles: [
    {
      name: 'home-screen',
      assets: [{ alias: 'flowerTop', src: 'https://pixijs.com/assets/flowerTop.png' }],
    },
    {
      name: 'game-screen',
      assets: [{ alias: 'eggHead', src: 'https://pixijs.com/assets/eggHead.png' }],
    },
  ],
};

// Initialize with a manifest
await Assets.init({ manifest });

// Start loading the game screen bundle in the background
Assets.backgroundLoadBundle(['game-screen']);

// Load only the first screen assets immediately
const resources = await Assets.loadBundle('home-screen');
```

## Loading individual assets

You can also load individual assets in the background using `Assets.backgroundLoad()`:

```ts
// Register assets first
Assets.add({ alias: 'flowerTop', src: 'https://pixijs.com/assets/flowerTop.png' });
Assets.add({ alias: 'eggHead', src: 'https://pixijs.com/assets/eggHead.png' });

// Load individual assets in the background
Assets.backgroundLoad(['flowerTop', 'eggHead']);
```

## Checking if an asset is ready

Background-loaded assets may or may not be ready when you need them. Use `Assets.load()` to wait for completion; it returns immediately if the asset is already cached:

```ts
// Start background loading early
Assets.backgroundLoadBundle(['game-screen']);

// Later, when the player navigates to the game screen:
const resources = await Assets.loadBundle('game-screen'); // instant if already loaded
```

## API reference

- {@link Assets}
- {@link BackgroundLoader}
