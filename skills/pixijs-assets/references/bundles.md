# Bundles

A bundle is a named group of assets you can load or unload as a unit. Use bundles to batch assets per game level, UI screen, or feature so that a single `loadBundle(name)` call resolves everything needed for that context. Bundles play well with background loading and manifest-based workflows.

## Quick Start

```ts
Assets.addBundle("level1", [
  { alias: "bg", src: "level1/background.png" },
  { alias: "tileset", src: "level1/tiles.json" },
  { alias: "theme", src: "level1/music.mp3" },
]);

const resources = await Assets.loadBundle("level1");
const bg = Sprite.from("bg");
```

`loadBundle(name)` returns a `Record<alias, asset>`. Each alias is also available via `Assets.get(alias)` after the bundle resolves.

## Core Patterns

### Programmatic bundles

```ts
Assets.addBundle("ui", [
  { alias: "button", src: "ui/button.png" },
  { alias: "panel", src: "ui/panel.png" },
  { alias: "cursor", src: "ui/cursor.png" },
]);

await Assets.loadBundle("ui");
```

`addBundle(name, assets)` registers a bundle at runtime. The assets array uses the same `{ alias, src, data? }` shape as `Assets.add()`.

### Loading multiple bundles at once

```ts
await Assets.loadBundle(["ui", "level1", "sounds"]);
```

Pass an array of bundle names to load them in parallel. The returned object is keyed by bundle name: `{ ui: {...}, level1: {...}, sounds: {...} }`.

### Progress across a bundle

```ts
await Assets.loadBundle("level1", (progress) => {
  loadingBar.width = progress * maxBarWidth;
});
```

The second argument is a `ProgressCallback` that fires as each asset in the bundle completes. Progress is normalized `[0, 1]` across the entire bundle.

### Unloading a bundle

```ts
await Assets.unloadBundle("level1");
```

Tears down every asset in the bundle, releases GPU memory, and removes cached entries. Remove any Sprites or Text that reference the bundle's textures before unloading.

### Sharing assets between bundles

```ts
Assets.addBundle("main", [{ alias: "hero", src: "hero.png" }]);
Assets.addBundle("bossArea", [{ alias: "hero", src: "hero.png" }]);
```

If two bundles declare the same alias with the same `src`, the underlying texture is loaded once and shared. Unloading one bundle does not evict the shared asset if the other bundle still references it.

### Bundle IDs

```ts
const resources = await Assets.loadBundle("level1");
const bg = resources["bg"];

const fromCache = Assets.get("bg");

const fromNamespaced = Assets.get("level1-bg");
```

Inside the resolver, bundle assets are stored under a combined key like `'level1-bg'` by default. The plain `'bg'` alias still resolves thanks to resolver shortcuts. If you need to override the format, pass `bundleIdentifier` to `Assets.init()`.

## Common Mistakes

### [HIGH] Unloading while assets are still in use

Wrong:

```ts
await Assets.unloadBundle("level1");
// level1 sprites still on the stage; they now reference destroyed textures
```

Correct:

```ts
level1Container.destroy({ children: true });
await Assets.unloadBundle("level1");
```

Always destroy (or detach from the scene) any display objects that reference the bundle's textures before unloading. Otherwise the renderer hits freed GPU memory and errors.


### [MEDIUM] Confusing `addBundle` and `init` manifests

Wrong:

```ts
await Assets.init();
Assets.addBundle('ui', [...]);
await Assets.loadBundle('ui');
```

Both work; this is not actually wrong; but a manifest passed to `Assets.init({ manifest: {...} })` registers all bundles at init time in one place. Prefer manifests when you know all bundles upfront; prefer `addBundle` when bundles are discovered dynamically at runtime.


## API Reference

- [Assets](https://pixijs.download/release/docs/assets.Assets.html.md)
- [AssetsBundle](https://pixijs.download/release/docs/assets.AssetsBundle.html.md)
- [Resolver](https://pixijs.download/release/docs/assets.Resolver.html.md)
