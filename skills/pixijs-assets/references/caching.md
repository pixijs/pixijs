# Caching

Every asset loaded through `Assets` is cached until you explicitly unload it. The cache is a global singleton keyed by the resolved URL, alias, and any bundle identifier. Use the cache to avoid double-loading, retrieve loaded assets synchronously, and reclaim GPU memory when an asset is no longer needed.

## Quick Start

```ts
await Assets.load("hero.png");

const cached = Assets.get("hero.png");
const sprite = new Sprite(cached);

await Assets.unload("hero.png");
```

`Assets.load` adds the asset to the cache; `Assets.get` retrieves it synchronously; `Assets.unload` removes it and releases the underlying GPU resource.

## Core Patterns

### Synchronous access to already-loaded assets

```ts
await Assets.load(["hero.png", "enemy.png"]);

const hero = Assets.get("hero");
const enemy = Assets.get("enemy");

if (hero) {
  app.stage.addChild(new Sprite(hero));
}
```

`Assets.get(alias)` returns `undefined` if the asset has not been loaded yet. It is synchronous; use it in tight loops or anywhere `await` would be awkward.

### Multiple keys at once

```ts
await Assets.load(["hero", "enemy", "boss"]);

const all = Assets.get(["hero", "enemy", "boss"]);
const heroTex = all["hero"];
```

Passing an array returns an object keyed by alias. Useful for retrieving all the assets a scene needs in one call.

### Deduping load calls

```ts
const tex1 = await Assets.load("hero.png");
const tex2 = await Assets.load("hero.png");
console.log(tex1 === tex2); // true
```

Calling `Assets.load` with the same key multiple times returns the same cached result immediately on subsequent calls. Safe to call from multiple async functions concurrently.

### Unloading

```ts
sprite.destroy();
await Assets.unload("hero.png");
```

`Assets.unload(id)` removes the asset from the cache, calls `destroy()` on the texture (releasing GPU memory), and removes any loader-specific wrappers. Always destroy or detach display objects that reference the asset before unloading, or you'll hit freed GPU memory.

### Unloading a bundle

```ts
level1Container.destroy({ children: true });
await Assets.unloadBundle("level1");
```

Prefer `unloadBundle` over manually iterating. It releases every asset in the bundle and respects reference counting; if another bundle also uses one of the assets, it stays in the cache.

### Inspecting the cache

```ts
import { Cache } from "pixi.js";

const key = "hero.png";
if (Cache.has(key)) {
  const texture = Cache.get(key);
}
```

The low-level `Cache` class backs `Assets.get`. It exposes `has(key)`, `get(key)`, `set(key, value)`, and `remove(key)`. Most code should go through `Assets.get/unload` instead, but direct `Cache` access is useful for diagnostics or custom loader plugins.

## Common Mistakes

### [CRITICAL] Using `Assets.get` before `Assets.load`

Wrong:

```ts
const texture = Assets.get("hero.png");
const sprite = new Sprite(texture); // texture is undefined
```

Correct:

```ts
await Assets.load("hero.png");
const texture = Assets.get("hero.png");
const sprite = new Sprite(texture);
```

`Assets.get` is synchronous and returns `undefined` if the asset hasn't been loaded yet. Always await `Assets.load` first, or use the return value of `Assets.load` directly.


### [HIGH] Not unloading between levels

Textures stay in the cache indefinitely. A game that loads level after level without calling `Assets.unload` or `Assets.unloadBundle` slowly accumulates GPU memory until it hits browser limits.

```ts
await Assets.unloadBundle("level1");
await Assets.loadBundle("level2");
```


### [MEDIUM] Using sprites after unload

Wrong:

```ts
const sprite = new Sprite(texture);
await Assets.unload("hero.png");
// sprite still references the destroyed texture
```

Correct:

```ts
sprite.destroy();
await Assets.unload("hero.png");
```

`Assets.unload` destroys the underlying texture. Any sprite still referencing it will render Texture.EMPTY or crash depending on the backend. Destroy the leaf (or reassign its texture) before unloading.


## API Reference

- [Assets](https://pixijs.download/release/docs/assets.Assets.html.md)
- [Cache](https://pixijs.download/release/docs/assets.Cache.html.md)
- [Texture](https://pixijs.download/release/docs/rendering.Texture.html.md)
