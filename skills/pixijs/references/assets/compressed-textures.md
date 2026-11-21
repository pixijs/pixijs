# Compressed textures

DDS, KTX, KTX2, Basis and raw ASTC textures: the side-effect import each needs, resolver fallbacks, and renderer limits.

```ts
import "pixi.js/ktx2";
import { Assets } from "pixi.js";

Assets.add({ alias: "background", src: "background.{ktx2,webp,png}" });
const texture = await Assets.load("background");
```

- Each format registers its loader only through its side-effect import: `pixi.js/dds`, `pixi.js/ktx`, `pixi.js/ktx2` (with Basis Universal support), `pixi.js/basis`, `pixi.js/astc` (raw `.astc` files from `astcenc`). Without it, no parser recognises the extension, so the load logs "don't know how to parse it" and resolves `null` ([assets](../assets.md#forcing-a-parser-with-parser)). Import only the formats you use; each adds decoder code to the bundle.
- `pixi.js/astc` uploads the file's ASTC blocks without transcoding, so on a device without ASTC `Assets.load` rejects with `Unsupported ASTC texture format`. List the `.astc` file before a WebP/PNG fallback. A raw file has one 2D image, no mipmaps and no color space. Leave `data.srgb` unset and it draws like the PNG it came from; `srgb: true` makes the GPU convert sRGB to linear when sampling, so mid-tones draw darker (gray 128 draws as 55).
- KTX2 + Basis is the usual choice for new projects; Basis transcodes to the GPU-native format at load time on a worker where supported, with nothing to await beyond `Assets.load`.
- List the compressed format first in the `src` pattern with a WebP/PNG fallback: the resolver falls back on browsers or hardware that can't sample it. The Canvas renderer can't sample compressed textures at all, so it needs that fallback too.
- On WebGL1 without extensions, some devices get an uncompressed Basis transcode, losing the memory savings. `await getSupportedCompressedTextureFormats()` (exported from `pixi.js`) lists what the device supports.
