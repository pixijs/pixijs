# Caching

The `Assets` cache: lookup keys, `Assets.get` with arrays, unloading safely, and the low-level `Cache`.

- Everything loaded through `Assets` stays cached until unloaded. Repeated `Assets.load` calls for the same key return the same object, and concurrent calls share one load.
- `Assets.get(key)` is synchronous and returns `undefined` (with a "not found in the Cache" warning) when the key has not been loaded; `await Assets.load` first or use its return value. Get by the exact key you loaded: a bare URL is cached under that string only, so `Assets.get("hero")` misses unless you registered `Assets.add({ alias: "hero", src: "hero.png" })` first.
- `Assets.get([...])` returns an object keyed by array index (`"0"`, `"1"`), not by alias, so `all["hero"]` is `undefined`. For keyed access, call `Assets.load([...])` again (it returns cached entries without refetching) or `Assets.get(alias)` per key.

## Unloading

```ts
import { Assets, type Sprite } from "pixi.js";

declare const sprite: Sprite;

sprite.destroy();
await Assets.unload("hero.png");
```

`Assets.unload(id)` removes the asset from the cache, calls `destroy()` on the texture (releasing GPU memory), and removes loader-specific wrappers. A sprite still holding the texture renders `Texture.EMPTY` or crashes depending on the backend, so destroy display objects (or reassign their texture) first. Destroy them with plain `destroy()`, not `destroy(true)`, which destroys the shared texture under every other sprite ([scene-container](../scene-container.md#destroy)).

For level-based games, `Assets.unloadBundle(name)` after destroying the level's display objects; without unloading, GPU memory grows level after level until it hits browser limits. It has no reference counting: every asset in the bundle is destroyed, even if another bundle declares the same `src`, and that bundle's alias stays broken until reloaded.

The low-level `Cache` class (`import { Cache } from "pixi.js"`) backs `Assets.get` and exposes `has(key)`, `get(key)`, `set(key, value)` and `remove(key)`, for diagnostics or custom loader plugins.
