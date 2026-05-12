# Compressed Textures

GPU-compressed texture formats (DDS, KTX, KTX2, Basis) use 4–8x less GPU memory than PNG/JPEG and skip runtime decoding. Use them for large textures, high-asset-count games, and anywhere memory budget matters. Each format requires a side-effect import to register its loader.

## Quick Start

```ts
import "pixi.js/ktx2";
import { Assets, Sprite } from "pixi.js";

const texture = await Assets.load("background.ktx2");

const bg = new Sprite(texture);
app.stage.addChild(bg);
```

Without the side-effect import, the loader won't know how to parse the file and will skip it silently.

## Core Patterns

### Format imports

```ts
import "pixi.js/dds"; // DirectDraw Surface (.dds)
import "pixi.js/ktx"; // KTX (Khronos Texture) v1
import "pixi.js/ktx2"; // KTX v2 (with Basis Universal support)
import "pixi.js/basis"; // Basis Universal (.basis)
```

Each import registers a `LoaderParser` that can decode the matching file extension. Import only the formats you use; the loaders include decoder runtime that adds to your bundle size.

### Format selection matrix

| Format | Platforms | Notes                                                                                                           |
| ------ | --------- | --------------------------------------------------------------------------------------------------------------- |
| DDS    | All       | Legacy desktop formats (DXT, BC). Fast decoder; wide support.                                                   |
| KTX    | All       | Older Khronos container. Prefer KTX2 for new projects.                                                          |
| KTX2   | All       | Newer container; typically used with Basis Universal. GPU-native when available.                                |
| Basis  | All       | Supercompressed; transcodes to the GPU-native format at load time. Best for "one file, any platform" workflows. |

Use KTX2 + Basis for new projects unless you have a specific need for one of the others.

### With the resolver

```ts
import "pixi.js/ktx2";
import { Assets } from "pixi.js";

Assets.add({
  alias: "background",
  src: "background.{ktx2,webp,png}",
});

const texture = await Assets.load("background");
```

List compressed textures as first-preference format in the resolver. On browsers or hardware that can't sample the compressed format, the resolver falls back to WebP or PNG automatically.

### Async decoding

```ts
import "pixi.js/basis";
import { Assets } from "pixi.js";

const texture = await Assets.load("hero.basis");
```

Basis Universal decodes asynchronously on a worker thread (where supported). You don't need to await anything beyond the normal `Assets.load`; the loader handles decoding.

### Multiple compressed formats at once

```ts
import "pixi.js/ktx2";
import "pixi.js/basis";
import "pixi.js/dds";
```

Multiple format imports can coexist. Each registers an extension for its own file type. If you only use one format, import only that one to keep the bundle smaller.

## Common Mistakes

### [CRITICAL] Missing the format import

Wrong:

```ts
import { Assets } from "pixi.js";
await Assets.load("background.ktx2");
```

Correct:

```ts
import "pixi.js/ktx2";
import { Assets } from "pixi.js";
await Assets.load("background.ktx2");
```

Without the side-effect import, no loader parser is registered for `.ktx2` files. The load silently does nothing (or errors) and you get `undefined` back.


### [HIGH] Relying on mipmaps from compressed textures in Canvas2D

Compressed textures require WebGL or WebGPU. The Canvas2D backend can't sample them. If you need Canvas support, include a PNG/WebP fallback via the resolver format list:

```ts
Assets.add({ alias: "bg", src: "bg.{ktx2,png}" });
```


### [MEDIUM] Large Basis files in WebGL1

Basis Universal transcodes to different GPU formats based on what the device supports. On WebGL1 without extensions, some devices fall back to an uncompressed format, defeating the memory savings. Check `renderer.context.supports` for supported compressed formats if you're targeting older hardware.


## API Reference

- [Assets](https://pixijs.download/release/docs/assets.Assets.html.md)
- [loadKTX2](https://pixijs.download/release/docs/assets.loadKTX2.html.md)
- [TextureSource](https://pixijs.download/release/docs/rendering.TextureSource.html.md)
