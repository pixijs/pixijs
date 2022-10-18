# @pixi/compressed-textures

This packages contains the loaders for compressed texture file formats, namely:

| Extension  | Description                                 | Notes                                         |
| ---------- | ------------------------------------------- | --------------------------------------------- |
| .dds       | DirectDraw Surface                          | Support for cubemap, 3D textures not included |
| .ktx       | Khronos Texture Container                   | Support for cubemap, 3D textures not included |
| .json      | PixiJS Compressed Textures Manifest         | Fallback to uncompressed textures included    |

## Installation

```bash
npm install @pixi/compressed-textures
```

## Usage

```js
import '@pixi/compressed-textures';
```
