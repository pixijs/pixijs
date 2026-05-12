# Background Loading

Background loading lets PixiJS fetch and prepare assets passively while other work happens. Use it to prime the next level while the current one is playing, preload assets during a splash screen, or prepare UI assets during initial load. `backgroundLoad` and `backgroundLoadBundle` are non-blocking and return immediately.

## Quick Start

```ts
await Assets.loadBundle("menu");
showMenu();

Assets.backgroundLoadBundle("level1");

playerClicksStart(() => {
  Assets.loadBundle("level1").then(() => startLevel());
});
```

The `backgroundLoadBundle` call starts loading `level1` immediately without blocking. The later `loadBundle` call resolves quickly if background loading finished in the meantime.

## Core Patterns

### Background-loading a single asset

```ts
Assets.backgroundLoad("images/level2-assets.png");

// later, when we need it:
const texture = await Assets.load("images/level2-assets.png");
```

Fire-and-forget. Background loading happens one asset at a time to avoid blocking the main thread. When your code later calls `Assets.load(url)` for the same asset, it either resolves immediately (if background work finished) or waits for the already-in-progress load.

### Background-loading an array

```ts
Assets.backgroundLoad([
  "images/sprite1.png",
  "images/sprite2.png",
  "images/background.png",
]);
```

Queues multiple assets for background loading. They're processed sequentially.

### Background-loading a bundle

```ts
await Assets.init({
  manifest: {
    bundles: [
      { name: "home", assets: [{ alias: "bg", src: "home-bg.png" }] },
      { name: "level-1", assets: [{ alias: "map", src: "level1-map.json" }] },
    ],
  },
});

await Assets.loadBundle("home");
showHome();

Assets.backgroundLoadBundle("level-1");

onPlayClicked(async () => {
  await Assets.loadBundle("level-1");
  startLevel();
});
```

Same idea for bundles. Bundle assets are queued one at a time. Requires the bundle to exist via the manifest or `addBundle`.

### Interrupting background loading

```ts
Assets.backgroundLoadBundle("level-2");

onPlayerDecidedLevel3(async () => {
  await Assets.loadBundle("level-3");
});
```

Calling `Assets.load()` or `Assets.loadBundle()` interrupts background loading safely. The current background asset finishes, then the explicit load takes priority. Your explicit load resolves normally.

### Combining with a progress bar

Background loading has no progress callback; it runs silently. To show a loading bar, use `Assets.loadBundle(name, onProgress)` in the foreground instead. Typical pattern: use background loading for nice-to-have preloads and foreground loading for the bundles you're actually waiting on.

## Common Mistakes

### [HIGH] Expecting progress from background loading

Wrong:

```ts
Assets.backgroundLoadBundle("level2", (p) => updateBar(p));
```

Correct:

```ts
Assets.backgroundLoadBundle("level2");
// show a spinner or no UI while it runs
```

`backgroundLoad` and `backgroundLoadBundle` don't accept progress callbacks. They're silent. For visible progress, use the foreground `Assets.load` / `Assets.loadBundle` with an `onProgress` argument.


### [MEDIUM] Assuming background load completes before next foreground load

Wrong:

```ts
Assets.backgroundLoadBundle("level-2");
setTimeout(() => startLevel2(), 0);
```

Correct:

```ts
Assets.backgroundLoadBundle("level-2");

onStart(async () => {
  await Assets.loadBundle("level-2");
  startLevel2();
});
```

Background loading is best-effort. If the player hits Start before it finishes, the foreground `loadBundle` still needs to await the remaining work. Always `await` the real load before using the assets.


### [MEDIUM] Background-loading assets that are never used

Each queued background load consumes bandwidth and GPU memory. If the player never visits level 2, you've wasted that bandwidth. Background-load only what you're confident will be needed soon.


## API Reference

- [Assets](https://pixijs.download/release/docs/assets.Assets.html.md)
- [BackgroundLoader](https://pixijs.download/release/docs/assets.BackgroundLoader.html.md)
