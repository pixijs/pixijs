# Bundles

Named asset groups: `addBundle`, `loadBundle` result shapes and keys, unloading, and the silent failure of an unregistered bundle.

```ts
import { Assets, Sprite } from "pixi.js";

Assets.addBundle("level1", [
  { alias: "bg", src: "level1/background.png" },
  { alias: "config", src: "level1/config.json" },
]);

const resources = await Assets.loadBundle("level1", (progress) => console.log(progress));
const bg = Sprite.from("bg");
```

- `loadBundle(name)` returns a `Record<alias, asset>`, and each alias is also available via `Assets.get(alias)`. `loadBundle(["ui", "level1"])` loads in parallel and returns an object keyed by bundle name: `{ ui: {...}, level1: {...} }`.
- The second argument is only a progress function (`[0, 1]` across the bundle); an options object there throws ([assets](../assets.md#load-options-and-error-handling)).
- Entries use the `{ alias, src, data? }` shape of `Assets.add()`. Inside the resolver they are stored under a combined key, `'level1-bg'` by default; the plain `'bg'` still resolves. Change the format with `bundleIdentifier` in `Assets.init()`.
- `loadBundle` of a name the resolver does not know resolves `undefined` with no error or warning; the failure shows up later as a missing texture. A common cause is an `Assets.init({ manifest })` that ran after a `load` and was ignored ([assets](../assets.md#init-order)). Register bundles with `addBundle` or an `Assets.init` that runs first, and match names exactly.

## Unloading

```ts
import { Assets, type Container } from "pixi.js";

declare const level1Container: Container;

level1Container.destroy({ children: true });
await Assets.unloadBundle("level1");
```

`unloadBundle` destroys every asset in the bundle and removes the cached entries. Destroy or detach display objects that use them first, or the renderer hits freed GPU memory. There is no reference counting: if two bundles declare the same alias and `src`, the texture is loaded once and shared, and unloading either bundle destroys it, leaving the other bundle's alias broken until you reload it.
