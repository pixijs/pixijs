# Resolution and Format Detection

PixiJS's asset resolver can pick the best asset variant for the current device based on pixel density (`@0.5x`, `@1x`, `@2x`) and supported image formats (`avif`, `webp`, `png`). Use resolution and format patterns to serve one asset spec that adapts to retina displays, format support, and bandwidth budgets.

## Quick Start

```ts
await Assets.init({
  texturePreference: {
    resolution: window.devicePixelRatio,
    format: ["avif", "webp", "png"],
  },
});

Assets.add({ alias: "hero", src: "hero@{0.5,1,2}x.{webp,png}" });

const texture = await Assets.load("hero");
```

The resolver expands the pattern to six candidates (`hero@0.5x.webp`, `hero@0.5x.png`, `hero@1x.webp`, ...) and picks the best match based on device pixel ratio and format support.

## Core Patterns

### Configuring preferences at init

```ts
await Assets.init({
  texturePreference: {
    resolution: window.devicePixelRatio, // e.g., 2 on retina
    format: ["avif", "webp", "png"], // preferred-first order
  },
});
```

- `resolution` is a single number (best-match threshold) or array of acceptable resolutions.
- `format` is ordered by preference. The resolver tries each in turn and uses the first one the browser supports.

### Resolution patterns in src

```ts
Assets.add({ alias: "bg", src: "bg@{0.5,1,2}x.png" });
```

The resolver expands this to `bg@0.5x.png`, `bg@1x.png`, `bg@2x.png` and picks based on `texturePreference.resolution`. Encoded resolution sets the texture's source resolution automatically, so the sprite's `width` / `height` appear as logical size regardless of the file chosen.

### Format patterns in src

```ts
Assets.add({ alias: "icon", src: "icon.{avif,webp,png}" });
```

Format detection runs once during `Assets.init()`. The resolver learns which formats the browser supports, then picks the highest-preference supported format per load.

### Combined resolution + format

```ts
Assets.add({ alias: "hero", src: "hero@{0.5,1,2}x.{avif,webp,png}" });
```

Both patterns can appear in the same `src`. The resolver does a Cartesian product: 3 resolutions × 3 formats = 9 candidates. It picks the best combination based on both preferences.

### Manual resolution override

```ts
Assets.add({
  alias: "sharp",
  src: "sharp.png",
  data: { resolution: 2 },
});
```

If a file is already at a known resolution but lacks the `@2x` filename suffix, pass `resolution` in `data` to tell the loader. Useful when your tooling doesn't produce suffixed filenames.

### Custom retina prefix

```ts
import { Resolver } from "pixi.js";

Resolver.RETINA_PREFIX = /@([0-9\.]+)density/;

Assets.add({ alias: "hero", src: "hero@{1,2}density.png" });
```

Change the resolution filename pattern if your build pipeline uses a different convention. Default is `/@([0-9\.]+)x/`.

### Skipping format detection

```ts
await Assets.init({
  skipDetections: true,
  texturePreference: { format: ["webp"] },
});
```

If you know your target browser supports a specific format, `skipDetections: true` skips the runtime detection (a small init-time saving). Useful for embedded or kiosk deployments where format support is fixed.

## Common Mistakes

### [HIGH] Wrong pattern syntax

Wrong:

```ts
Assets.add({ alias: "hero", src: "hero@[1,2]x.png" });
```

Correct:

```ts
Assets.add({ alias: "hero", src: "hero@{1,2}x.png" });
```

The expansion syntax uses `{}` (like shell brace expansion), not `[]`. Square brackets aren't recognized and the resolver tries to load the literal filename.


### [MEDIUM] Missing fallback format

Wrong:

```ts
Assets.add({ alias: "hero", src: "hero.avif" });
```

Correct:

```ts
Assets.add({ alias: "hero", src: "hero.{avif,png}" });
```

If a browser doesn't support AVIF, the loader fails. Always list at least one fallback format that all target browsers support.


### [MEDIUM] Mismatch between spritesheet.json `meta.scale` and actual image

In v8, a spritesheet's `meta.scale` field directly sets the resolution of the atlas texture. If the JSON says `"1"` but the image was exported at 2x, frames render at double the intended size. Verify `meta.scale` matches the actual image resolution; atlas tools like TexturePacker set this automatically.


## API Reference

- [Assets](https://pixijs.download/release/docs/assets.Assets.html.md)
- [Resolver](https://pixijs.download/release/docs/assets.Resolver.html.md)
- [AssetInitOptions](https://pixijs.download/release/docs/assets.AssetInitOptions.html.md)
