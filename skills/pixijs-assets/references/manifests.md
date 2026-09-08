# Manifests

A manifest is a JSON-shaped description of every bundle in your application. Pass it to `Assets.init({ manifest })` and the resolver registers every bundle at startup, so later code can reference them by name. Use manifests when you know your asset graph upfront and want one source of truth.

## Quick Start

```ts
await Assets.init({
  manifest: {
    bundles: [
      {
        name: "load-screen",
        assets: [{ alias: "logo", src: "logo.png" }],
      },
      {
        name: "game",
        assets: [
          { alias: "hero", src: "hero.{webp,png}" },
          { alias: "enemies", src: "enemies.json" },
        ],
      },
    ],
  },
});

await Assets.loadBundle("load-screen");
await Assets.loadBundle("game");
```

Each bundle has a `name` and an `assets` array of `UnresolvedAsset` entries. Format expansions (`{webp,png}`) and resolution patterns (`@{1,2}x`) work inside `src`.

## Core Patterns

### Inline manifest object

```ts
const manifest = {
  bundles: [
    {
      name: "ui",
      assets: [
        { alias: "button", src: "ui/button.png" },
        { alias: "panel", src: "ui/panel.png" },
      ],
    },
  ],
};

await Assets.init({ manifest });
```

The manifest can be any plain object matching the `AssetsManifest` shape. Pass it directly to `init`.

### Manifest from a URL

```ts
await Assets.init({ manifest: "assets/manifest.json" });
```

When `manifest` is a string, PixiJS loads it as JSON first, then registers the bundles. Useful when your build tooling generates a manifest at deploy time (e.g., with `@assetpack/core`).

### Format and resolution patterns in manifests

```ts
const manifest = {
  bundles: [
    {
      name: "hero",
      assets: [{ alias: "hero", src: "hero@{0.5,1,2}x.{webp,avif,png}" }],
    },
  ],
};
```

The resolver expands the pattern to six candidates and picks the best match based on `window.devicePixelRatio` and browser format support. Configure preferences in `Assets.init({ texturePreference: {...} })`.

### Multiple aliases per entry

```ts
const manifest = {
  bundles: [
    {
      name: "characters",
      assets: [
        { alias: ["hero", "player"], src: "hero.png" },
        { alias: "npc1", src: "villager.png" },
      ],
    },
  ],
};
```

An asset can expose multiple aliases. `Assets.load('hero')` and `Assets.load('player')` return the same texture.

### Data options in manifest entries

```ts
const manifest = {
  bundles: [
    {
      name: "pixel-art",
      assets: [
        {
          alias: "tile",
          src: "tile.png",
          data: { scaleMode: "nearest" },
        },
      ],
    },
  ],
};
```

Each asset entry can include a `data` field forwarded to the loader. Use it for `scaleMode`, `autoGenerateMipmaps`, `parseAsGraphicsContext`, FontFace descriptors, etc.

### Background-loading from a manifest

```ts
await Assets.init({ manifest });
await Assets.loadBundle("load-screen");

Assets.backgroundLoadBundle("game");
await Assets.loadBundle("game");
```

After init, you can start background loading of other bundles immediately. The call is non-blocking; the `await Assets.loadBundle('game')` later resolves quickly if the background work finished.

## Common Mistakes

### [HIGH] Calling `Assets.init` twice

Wrong:

```ts
await Assets.init({ manifest });
await Assets.init({ basePath: "https://cdn.example.com/" });
```

Correct:

```ts
await Assets.init({ manifest, basePath: "https://cdn.example.com/" });
```

`Assets.init()` can only be called once. The second call is ignored with a warning. Combine all configuration into a single call.


### [MEDIUM] Missing format expansion on manifest entries

Wrong:

```ts
{ alias: 'hero', src: 'hero.webp' }
```

Correct:

```ts
{ alias: 'hero', src: 'hero.{webp,png}' }
```

Listing only one format blocks the resolver from falling back on browsers without WebP/AVIF support. Always list at least one fallback.


### [MEDIUM] Loading manifest after `Assets.add`

If you call `Assets.add(...)` or `Assets.addBundle(...)` before `Assets.init({ manifest })`, the manifest bundles will append to the existing state but preference-detection (format, resolution) hasn't run yet. Prefer calling `init` first, then adding ad-hoc assets.


## API Reference

- [AssetsManifest](https://pixijs.download/release/docs/assets.AssetsManifest.html.md)
- [Assets](https://pixijs.download/release/docs/assets.Assets.html.md)
- [Resolver](https://pixijs.download/release/docs/assets.Resolver.html.md)
- [UnresolvedAsset](https://pixijs.download/release/docs/assets.UnresolvedAsset.html.md)
