---
title: Manifests and Bundles
description: Learn how to manage assets in PixiJS using manifests and bundles, and how to automate this with AssetPack.
category: assets
---

# Manifests and bundles

Instead of loading assets one at a time, you can group them into **bundles** (e.g., "load screen", "level 1") and list those bundles in a **manifest**. This lets you load an entire screen's assets in one call and preload the next screen in the background.

---

## What is a manifest?

A **manifest** is a descriptor object that defines your asset loading strategy. It lists bundles, each containing grouped assets by name and alias. This structure allows lazy-loading assets based on application context (e.g. load screen assets, level-specific content).

```js
const manifest = {
  bundles: [
    {
      name: 'load-screen',
      assets: [
        { alias: 'background', src: 'sunset.png' },
        { alias: 'bar', src: 'load-bar.{png,webp}' }, // picks best format per device
      ],
    },
    {
      name: 'game-screen',
      assets: [
        { alias: 'character', src: 'robot.png' },
        { alias: 'enemy', src: 'bad-guy.png' },
      ],
    },
  ],
};
```

### Initializing with a manifest

```js
import { Assets } from 'pixi.js';

await Assets.init({ manifest });
```

Once initialized, load bundles by name:

```js
const loadScreenAssets = await Assets.loadBundle('load-screen');
const gameScreenAssets = await Assets.loadBundle('game-screen');
```

You can still load individual assets by alias without loading an entire bundle:

```js
await Assets.init({ manifest });
const background = await Assets.load('background');
const bar = await Assets.load('bar');
```

---

## What is a bundle?

A **bundle** is a group of assets identified by a shared name. Bundles can be pre-defined in a manifest or registered dynamically at runtime.

### Adding a bundle dynamically

```js
import { Assets } from 'pixi.js';

Assets.addBundle('animals', [
  { alias: 'bunny', src: 'bunny.png' },
  { alias: 'chicken', src: 'chicken.png' },
  { alias: 'thumper', src: 'thumper.png' },
]);

const assets = await Assets.loadBundle('animals');

// Or load a specific asset from the bundle
const bunny = await Assets.load('bunny');
```

---

## Recommended tool: AssetPack

Managing manifests and bundles by hand is tedious and mistake-prone. [**AssetPack**](https://pixijs.io/assetpack) is a CLI tool that scans your assets folder and generates optimized manifests automatically.

### Key benefits

- Organizes assets by directory or pattern
- Outputs in PixiJS manifest format
- Reduces boilerplate and risk of manual mistakes

```bash
npm install --save-dev @assetpack/core
```

Integrate AssetPack into your build pipeline to generate the manifest file and load it with `Assets.init({ manifest })`.
