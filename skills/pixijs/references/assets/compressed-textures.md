# Compressed textures

DDS, KTX, KTX2 and Basis textures: the side-effect import each needs, resolver fallbacks, and renderer limits.

```ts
import "pixi.js/ktx2";
import { Assets } from "pixi.js";

Assets.add({ alias: "background", src: "background.{ktx2,webp,png}" });
const texture = await Assets.load("background");
```

- Each format registers its loader only through its side-effect import: `pixi.js/dds`, `pixi.js/ktx`, `pixi.js/ktx2` (with Basis Universal support), `pixi.js/basis`. Without it, no parser recognises the extension, so the load logs "don't know how to parse it" and resolves `null` ([assets](../assets.md#forcing-a-parser-with-parser)). Import only the formats you use; each adds decoder code to the bundle.
- KTX2 + Basis is the usual choice for new projects; Basis transcodes to the GPU-native format at load time on a worker where supported, with nothing to await beyond `Assets.load`.
- List the compressed format first in the `src` pattern with a WebP/PNG fallback: the resolver falls back on browsers or hardware that can't sample it. The Canvas renderer can't sample compressed textures at all, so it needs that fallback too.
- On WebGL1 without extensions, some devices get an uncompressed Basis transcode, losing the memory savings. `await getSupportedCompressedTextureFormats()` (exported from `pixi.js`) lists what the device supports.
