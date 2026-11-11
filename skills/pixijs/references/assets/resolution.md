# Resolution and format detection

`texturePreference`, `@{1,2}x` and `{webp,png}` patterns in `src`, and how the resolver picks a file.

```ts
import { Assets } from "pixi.js";

await Assets.init({
  texturePreference: {
    resolution: window.devicePixelRatio,
    format: ["avif", "webp", "png"],
  },
});

Assets.add({ alias: "hero", src: "hero@{0.5,1,2}x.{avif,webp,png}" });
const texture = await Assets.load("hero");
```

- Patterns use braces (shell-style brace expansion). `hero@[1,2]x.png` is not recognised and the resolver tries to load that literal filename. Resolution and format patterns combine as a Cartesian product (3 × 3 = 9 candidates); the resolver picks the best match for both preferences.
- `texturePreference.resolution` is a single number (best-match threshold) or an array of acceptable resolutions. `format` is in preference order; the first one the browser supports wins. Format detection runs once during `Assets.init()`; `skipDetections` turns it off ([assets](../assets.md#init-options-preferences-and-fetch-routing)).
- The resolution encoded in the filename sets the texture source's resolution, so `width`/`height` stay at logical size whichever file is chosen. A file at a known resolution without the suffix takes `data: { resolution: 2 }`.
- `Resolver.RETINA_PREFIX` (default `/@([0-9\.]+)x/`) changes the filename pattern, e.g. `/@([0-9\.]+)density/` for `hero@{1,2}density.png`.
- List a format every target browser supports as the last fallback (`hero.{avif,png}`); with only `hero.avif`, the load fails where AVIF isn't supported.
- A spritesheet's resolution comes from its JSON `meta.scale`, not the filename ([spritesheet](spritesheet.md#metascale-sets-the-resolution)).
