---
title: Resolver
description: Learn how to use PixiJS's asset resolver for dynamic, multi-format asset loading with platform-aware optimizations.
category: assets
---

# Resolver

When you load `'bunny@{1,2}x.{png,webp}'`, PixiJS doesn't fetch all six combinations. It picks the best one: `.webp` on browsers that support it, `@2x` on high-DPI screens. This is the resolver at work.

The system is built around two concepts: `UnresolvedAsset` (what you provide) and `ResolvedAsset` (what PixiJS actually loads).

## Resolver lifecycle

The resolution process has four steps:

1. **UnresolvedAsset creation**
   Assets defined as a string or object are normalized into `UnresolvedAsset` instances. These include metadata such as aliases, wildcard paths, parser hints, and custom data.

2. **Source expansion**
   The `src` field of an `UnresolvedAsset` can be a string or array of strings. PixiJS expands any wildcard patterns (e.g. `myAsset@{1,2}x.{png,webp}`) into a list of concrete candidate URLs.

3. **Best-match selection**
   PixiJS evaluates all candidate URLs and uses platform-aware heuristics to pick the most suitable source. Factors include supported formats (e.g. WebP vs PNG), device pixel ratio, and custom configuration such as preferred formats.

4. **ResolvedAsset output**
   The result is a `ResolvedAsset` containing a specific URL and all required metadata, ready to be passed to the relevant parser and loaded into memory.

## Using unresolved assets

An `UnresolvedAsset` is the primary structure for defining assets in PixiJS. It specifies the source URL(s), alias(es), and any additional data needed for loading.

| Field            | Type                 | Description                                                                   |
| ---------------- | -------------------- | ----------------------------------------------------------------------------- |
| `alias`          | `string \| string[]` | One or more aliases to reference this asset later.                            |
| `src`            | `string \| string[]` | Path or paths to one or more asset candidates. Supports wildcards.            |
| `parser` (opt)   | `string`             | A specific parser to handle the asset (e.g. `'loadTextures'`, `'loadJson'`). |
| `data` (opt)     | `any`                | Extra data to pass into the loader. Varies by parser type.                    |

> [!NOTE]
> The `loadParser` field from v7 is deprecated. Use `parser` instead. If you're starting a new project, you can ignore `loadParser` entirely.

## Examples

### Loading a single asset

```ts
import { Assets } from 'pixi.js';

await Assets.load({
  alias: 'bunny',
  src: 'images/bunny.png',
});
```

### Loading with explicit parser and loader options

```ts
await Assets.load({
  alias: 'bunny',
  src: 'images/bunny.png',
  parser: 'loadTextures',
  data: {
    alphaMode: 'no-premultiply-alpha',
  },
});
```

### Using wildcards for responsive and format-aware loading

```ts
await Assets.load({
  alias: 'bunny',
  src: 'images/bunny@{0.5,1,2}x.{png,webp}',
});
```

This pattern expands internally to:

```ts
[
  'images/bunny@0.5x.png',
  'images/bunny@0.5x.webp',
  'images/bunny@1x.png',
  'images/bunny@1x.webp',
  'images/bunny@2x.png',
  'images/bunny@2x.webp',
];
```

PixiJS selects the best match based on runtime capabilities (e.g. chooses WebP if supported, 2x if on a high-res display).

---

## Removing aliases

Use `removeAlias` to unregister an alias from the resolver without destroying the underlying asset. This is useful when you need to remap an alias to a different asset, or when cleaning up aliases that are no longer needed.

```ts
import { Assets } from 'pixi.js';

// Add an alias
Assets.resolver.add({ alias: 'hero', src: 'hero-v1.png' });

// Remove it
Assets.resolver.removeAlias('hero');

// Conditionally remove: only if the alias currently points to a specific asset
const resolved = Assets.resolver.resolve('hero');
Assets.resolver.removeAlias('hero', resolved);
```

> [!NOTE]
> `removeAlias` only removes the alias mapping. It does **not** unload or destroy the asset itself. If the asset is already cached, it remains in memory until you call `Assets.unload`.

---

## Related tools and features

- **AssetPack**: For managing large asset sets, [AssetPack](https://pixijs.io/assetpack) can generate optimized manifests using glob patterns and output `UnresolvedAsset` structures automatically.
- **Asset manifests and bundles**: Use [manifests and bundles](./manifest.md) to predefine groups of unresolved assets and load them via `Assets.loadBundle`.
