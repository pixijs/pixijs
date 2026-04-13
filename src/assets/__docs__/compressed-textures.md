---
title: Compressed Textures
description: Learn how to use compressed textures in PixiJS for lower memory usage and faster GPU uploads.
category: assets
---

# Compressed textures

Compressed textures use 4-8x less GPU memory than standard PNG/JPG textures and upload faster, especially on mobile devices or lower-end hardware. PixiJS supports multiple compressed texture formats, but **you must register the appropriate loaders** before using them.

## Supported formats

| Format    | File Extension | Best for                          | Description                                                         |
| --------- | -------------- | --------------------------------- | ------------------------------------------------------------------- |
| **DDS**   | `.dds`         | Desktop, S3TC hardware            | DirectDraw Surface format, supports DXT variants (S3TC)             |
| **KTX**   | `.ktx`         | Mobile (ETC2/ASTC)                | Khronos format, supports ETC and other schemes                      |
| **KTX2**  | `.ktx2`        | Cross-platform (recommended)      | Supports Basis Universal and supercompressed formats                |
| **Basis** | `.basis`       | Cross-platform, smallest files    | Highly compressed format that transcodes to multiple GPU formats    |

## Registering loaders

PixiJS does **not include compressed texture support by default**. Import the loaders you need before loading any assets:

```ts
import 'pixi.js/dds';
import 'pixi.js/ktx';
import 'pixi.js/ktx2';
import 'pixi.js/basis';
```

> [!NOTE]
> You only need to import loaders for the formats you use. These imports must run **before** any call to `Assets.load`.

## Using compressed textures

Once loaders are registered, load compressed textures like any other asset:

```ts
import 'pixi.js/ktx2';
import { Assets } from 'pixi.js';

await Assets.load('textures/background.ktx2');
```

PixiJS parses and uploads the texture using the correct loader and GPU-compatible transcoding path based on the user's device.

---

## Integration with AssetPack

[**AssetPack**](https://pixijs.io/assetpack) supports automatic generation of compressed texture variants during your build step. You can:

- Convert `.png` or `.jpg` files into `.basis`, `.ktx2`, or `.dds` formats
- Reference compressed files in your manifest using the same aliases or wildcard patterns
- Use the same manifest and loading workflow; PixiJS resolves and loads the best variant based on the device

### Example

Your manifest can include multiple format candidates:

```json
{
  "bundles": [
    {
      "name": "scene",
      "assets": [
        {
          "alias": "bg",
          "src": ["assets/bg.ktx2", "assets/bg.basis", "assets/bg.png"]
        }
      ]
    }
  ]
}
```

PixiJS tries to load `bg.ktx2` or `bg.basis` first if the device supports it, falling back to `bg.png` as needed.
