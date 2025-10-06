# gl2D File Format Specification

## 1. Introduction

The **gl2D file format** is a JSON-based scene description format designed for 2D rendering engines. It provides a structured way to describe:

- **Scenes** (collections of nodes)
- **Nodes** (containers, sprites, etc.)
- **Resources** (textures, images, videos, fonts, etc.)
- **Extensions** (engine-specific metadata)

gl2D is inspired by **glTF** but tailored for **2D graphics**, focusing on lightweight serialization, hierarchical scene graphs, and efficient resource referencing.

---

## 2. File Structure Overview

A gl2D file is a single JSON object with the following top-level structure:

```json
{
  "asset": { ... },
  "scene": 0,
  "scenes": [ ... ],
  "nodes": [ ... ],
  "resources": [ ... ],
  "extensionsUsed": [],
  "extensionsRequired": []
}
```

| Name               | Type   | Description                   | Required |
| ------------------ | ------ | ----------------------------- | -------- |
| asset              | object | Metadata about the gl2D asset | ✅ Yes   |
| scene              | number | Index of the default scene    | No       |
| scenes             | array  | Array of scene definitions    | No       |
| nodes              | array  | Array of node definitions     | No       |
| resources          | array  | Array of resource definitions | No       |
| extensionsUsed     | array  | List of used extensions       | No       |
| extensionsRequired | array  | List of required extensions   | No       |

---

## 3. Asset Metadata

The `asset` object describes the generator and versioning:

```json
"asset": {
  "version": "1.0",
  "generator": "PixiJS",
  "minVersion": "1.0"
}
```

| Name       | Type   | Description                        | Required |
| ---------- | ------ | ---------------------------------- | -------- |
| version    | string | GL2D spec version (e.g., `"1.0"`)  | ✅ Yes   |
| generator  | string | Tool/library that created the file | No       |
| minVersion | string | Minimum GL2D version required      | No       |

---

## 4. Scenes

A **scene** is a collection of root nodes. Multiple scenes can exist in one file (e.g., menu, gameplay, credits).
The default `scene` is the first one defined in the `scenes` array.

```json
"scenes": [
  {
    "name": "MainScene",
    "nodes": [0, 1]
  }
],
"scene": 0
```

| Name  | Type     | Description                             | Required |
| ----- | -------- | --------------------------------------- | -------- |
| name  | string   | Human-readable name of the scene        | ✅ Yes   |
| nodes | number[] | Indices into the global `nodes[]` array | ✅ Yes   |

---

## 5. Nodes

Nodes are the **building blocks** of a gl2D scene. They represent containers, sprites, or other visual elements.

### 5.1 Container Node

Groups other nodes, applies hierarchical transforms.

```json
{
    "type": "container",
    "name": "Player",
    "children": [1],
    "translation": [200, 150],
    "rotation": 0.5,
    "scale": [1, 1],
    "alpha": 1,
    "visible": true
}
```

| Name        | Type                                             | Description                                 | Required |
| ----------- | ------------------------------------------------ | ------------------------------------------- | -------- |
| type        | string                                           | Node type (`"container"`, `"sprite"`, etc.) | ✅ Yes   |
| uid         | string                                           | Unique identifier                           | No       |
| name        | string                                           | Human-readable name                         | No       |
| children    | number[]                                         | Indices of child nodes                      | No       |
| translation | [number, number]                                 | Position `[x, y]`                           | No       |
| rotation    | number                                           | Rotation in radians                         | No       |
| scale       | [number, number]                                 | Scale `[x, y]`                              | No       |
| matrix      | [number, number, number, number, number, number] | Transformation matrix override              | No       |
| width       | number                                           | Explicit width override                     | No       |
| height      | number                                           | Explicit height override                    | No       |
| blendMode   | enum                                             | Blend mode (normal, multiply, etc.)         | No       |
| tint        | number                                           | Color tint (0xRRGGBB)                       | No       |
| alpha       | number                                           | Opacity (0.0–1.0)                           | No       |
| visible     | boolean                                          | Whether the node is visible                 | No       |

#### PixiJS Container Extension

```json
{
    "extensions": {
        "pixi_container_node": {
            "skew": [0, 0],
            "pivot": [0, 0],
            "origin": [0.5, 0.5],
            "zIndex": 1,
            "renderable": true,
            "sortableChildren": true
        }
    }
}
```

| Name             | Type             | Description                            | Required |
| ---------------- | ---------------- | -------------------------------------- | -------- |
| skew             | [number, number] | Skew in radians `[x, y]`               | No       |
| pivot            | [number, number] | Pivot point in pixels `[x, y]`         | No       |
| origin           | [number, number] | Origin point in pixels `[x, y]`        | No       |
| anchor           | [number, number] | Anchor point (normalized `[0–1, 0–1]`) | No       |
| zIndex           | number           | Depth sorting order                    | No       |
| isRenderGroup    | boolean          | Treat as render group                  | No       |
| renderable       | boolean          | Whether node is rendered               | No       |
| boundsArea       | number[]         | Cached bounds area                     | No       |
| sortableChildren | boolean          | Auto-sort children by zIndex           | No       |

### 5.2 Sprite Node

Represents a texture based drawable element.

```json
{
    "type": "sprite",
    "texture": 0
}
```

| Name    | Type     | Description                                            | Required |
| ------- | -------- | ------------------------------------------------------ | -------- |
| type    | "sprite" | Node type "sprite"                                     | ✅ Yes   |
| texture | number   | Indices of the texture resource in the resources array | ✅ Yes   |

#### PixiJS Sprite Extension

```json
{
    "extensions": {
        "pixi_sprite_node": {
            "roundPixels": true
        }
    }
}
```

| Name        | Type    | Description                                 | Required |
| ----------- | ------- | ------------------------------------------- | -------- |
| roundPixels | boolean | Whether to round pixel values for rendering | No       |

---

## 6. Resources

Resources define **textures, images, videos, and other assets**.

### 6.1 Base Resource

```json
{
    "type": "texture",
    "uid": "heroTexture",
    "name": "Hero",
    "uri": "/textures/hero.png"
}
```

| Name | Type   | Description                                         | Required |
| ---- | ------ | --------------------------------------------------- | -------- |
| type | string | Resource type (`"texture"`, `"image_source"`, etc.) | ✅ Yes   |
| uid  | string | Unique identifier                                   | No       |
| name | string | Human-readable name                                 | No       |
| uri  | string | Path/URL/data URI to the resource                   | No       |

### 6.2 Texture

A texture resource is a specialized type of resource that represents a portion of a texture source.
Therefore all texture resources must have a `source` assigned to them, which can be loaded by the engine.

```json
{
    "type": "texture",
    "source": 0,
    "frame": [0, 0, 64, 64]
}
```

| Name   | Type      | Description                                 | Required |
| ------ | --------- | ------------------------------------------- | -------- |
| type   | string    | `"texture"`                                 | ✅ Yes   |
| source | number    | Index into `resources[]` for texture source | ✅ Yes   |
| frame  | [x,y,w,h] | Rectangle frame of the texture              | No       |

#### PixiJS Texture Extension

```json
{
    "extensions": {
        "pixi_texture_resource": {
            "orig": [0, 0, 64, 64],
            "trim": [0, 0, 64, 64],
            "defaultAnchor": [0.5, 0.5],
            "defaultBorders": [0, 0, 0, 0],
            "rotate": 0,
            "dynamic": false
        }
    }
}
```

| Name           | Type                       | Description                                              | Required |
| -------------- | -------------------------- | -------------------------------------------------------- | -------- |
| orig           | [x,y,w,h]                  | Original rectangle of the texture                        | No       |
| trim           | [x,y,w,h]                  | Trimmed rectangle of the texture                         | No       |
| defaultAnchor  | [x,y]                      | Default anchor point of the texture                      | No       |
| defaultBorders | [left, top, right, bottom] | Default borders of the texture                           | No       |
| rotate         | number                     | Indicates how the texture was rotated by texture packer. | No       |
| dynamic        | boolean                    | Whether the texture is dynamic                           | No       |

### 6.3 Texture Source

There are many types of texture sources, including images, videos, buffers etc.

```json
{
    "type": "texture_source",
    "uid": "unique-id",
    "name": "Texture Name",
    "uri": "/textures/hero.png",
    "width": 256,
    "height": 256,
    "resolution": 1,
    "format": "RGBA",
    "antialias": true,
    "alphaMode": "premultiplied",
    "addressMode": "repeat",
    "addressModeU": "repeat",
    "addressModeV": "repeat",
    "addressModeW": "repeat",
    "scaleMode": "linear",
    "magFilter": "linear",
    "minFilter": "linear",
    "mipmapFilter": "linear",
    "lodMinClamp": 0,
    "lodMaxClamp": 100
}
```

| Name         | Type    | Description                                                                     | Required |
| ------------ | ------- | ------------------------------------------------------------------------------- | -------- |
| type         | string  | Discriminator for the resource type (e.g., `"image_source"`, `"video_source"`)  | ✅ Yes   |
| uid          | string  | Unique identifier for the resource                                              | No       |
| name         | string  | Human-readable name                                                             | No       |
| uri          | string  | Path/URL/data URI to the resource                                               | No       |
| width        | number  | Pixel width of the texture source (real pixel size, not resolution-scaled)      | No       |
| height       | number  | Pixel height of the texture source                                              | No       |
| resolution   | number  | Resolution scale factor (e.g., `2` for @2x assets)                              | No       |
| format       | string  | Texture format (from `Texture Formats`)                                         | No       |
| antialias    | boolean | Whether to use antialiasing (mainly for render textures)                        | No       |
| alphaMode    | string  | Alpha mode (from `Alpha Modes`)                                                 | No       |
| addressMode  | string  | Sets wrap mode for U, V, and W simultaneously (from `Wrap Modes`)               | No       |
| addressModeU | string  | Wrap mode for U (width) coordinate (from `Wrap Modes`)                          | No       |
| addressModeV | string  | Wrap mode for V (height) coordinate (from `Wrap Modes`)                         | No       |
| addressModeW | string  | Wrap mode for W (depth) coordinate (from `Wrap Modes`)                          | No       |
| scaleMode    | string  | Sets magFilter, minFilter, and mipmapFilter simultaneously (from `Scale Modes`) | No       |
| magFilter    | string  | Sampling behavior when footprint ≤ 1 texel (from `Scale Modes`)                 | No       |
| minFilter    | string  | Sampling behavior when footprint > 1 texel (from `Scale Modes`)                 | No       |
| mipmapFilter | string  | Sampling behavior between mipmap levels (from `Scale Modes`)                    | No       |
| lodMinClamp  | number  | Minimum level of detail clamp                                                   | No       |
| lodMaxClamp  | number  | Maximum level of detail clamp                                                   | No       |

#### Pixi Texture Source Extension

```json
{
    "extensions": {
        "pixi_texture_source_resource": {
            "dimensions": "2d",
            "mipLevelCount": 1,
            "autoGenerateMipmaps": true,
            "autoGarbageCollect": false,
            "compare": "less-equal",
            "maxAnisotropy": 1
        }
    }
}
```

| Name                | Type    | Description                                                                   | Required |
| ------------------- | ------- | ----------------------------------------------------------------------------- | -------- |
| dimensions          | string  | How many dimensions this texture has (from Texture Dimensions)                | No       |
| mipLevelCount       | number  | Number of mip levels to generate                                              | No       |
| autoGenerateMipmaps | boolean | Whether to automatically generate mipmaps                                     | No       |
| autoGarbageCollect  | boolean | If true, GC may unload this texture when unused                               | No       |
| compare             | string  | Creates a comparison sampler using the given function (from Compare Function) | No       |
| maxAnisotropy       | number  | Maximum anisotropy clamp used by the sampler                                  | No       |

#### Texture Dimensions

| Value | Description | Required |
| ----- | ----------- | -------- |
| '1d'  | 1D texture  | No       |
| '2d'  | 2D texture  | No       |
| '3d'  | 3D texture  | No       |

#### Compare Function

| Value           | Description             | Required |
| --------------- | ----------------------- | -------- |
| 'never'         | Comparison always false | No       |
| 'less'          | Pass if src < dst       | No       |
| 'equal'         | Pass if src == dst      | No       |
| 'less-equal'    | Pass if src <= dst      | No       |
| 'greater'       | Pass if src > dst       | No       |
| 'not-equal'     | Pass if src != dst      | No       |
| 'greater-equal' | Pass if src >= dst      | No       |
| 'always'        | Comparison always true  | No       |

#### Alpha Modes

| Name                          | Description                    | Required |
| ----------------------------- | ------------------------------ | -------- |
| 'no-premultiply-alpha'        | No premultiplication on upload | No       |
| 'premultiply-alpha-on-upload' | Premultiply on upload          | No       |
| 'premultiplied-alpha'         | Premultiplied alpha            | No       |

#### Wrap Modes

| Name     | Description        | Required |
| -------- | ------------------ | -------- |
| 'repeat' | Repeat the texture | No       |
| 'clamp'  | Clamp the texture  | No       |
| 'mirror' | Mirror the texture | No       |

#### Scale Modes

| Name      | Description              | Required |
| --------- | ------------------------ | -------- |
| 'linear'  | Linear scaling           | No       |
| 'nearest' | Nearest neighbor scaling | No       |

#### Texture Formats

| Format                | Description                                           |
| --------------------- | ----------------------------------------------------- |
| r8unorm               | 8-bit unsigned normalized R                           |
| r8snorm               | 8-bit signed normalized R                             |
| r8uint                | 8-bit unsigned integer R                              |
| r8sint                | 8-bit signed integer R                                |
| r16uint               | 16-bit unsigned integer R                             |
| r16sint               | 16-bit signed integer R                               |
| r16float              | 16-bit floating-point R                               |
| rg8unorm              | 8-bit unsigned normalized RG                          |
| rg8snorm              | 8-bit signed normalized RG                            |
| rg8uint               | 8-bit unsigned integer RG                             |
| rg8sint               | 8-bit signed integer RG                               |
| r32uint               | 32-bit unsigned integer R                             |
| r32sint               | 32-bit signed integer R                               |
| r32float              | 32-bit floating-point R                               |
| rg16uint              | 16-bit unsigned integer RG                            |
| rg16sint              | 16-bit signed integer RG                              |
| rg16float             | 16-bit floating-point RG                              |
| rgba8unorm            | 8-bit unsigned normalized RGBA                        |
| rgba8unorm-srgb       | 8-bit unsigned normalized RGBA (sRGB)                 |
| rgba8snorm            | 8-bit signed normalized RGBA                          |
| rgba8uint             | 8-bit unsigned integer RGBA                           |
| rgba8sint             | 8-bit signed integer RGBA                             |
| bgra8unorm            | 8-bit unsigned normalized BGRA                        |
| bgra8unorm-srgb       | 8-bit unsigned normalized BGRA (sRGB)                 |
| rgb9e5ufloat          | Packed RGB with shared 5-bit exponent (HDR)           |
| rgb10a2unorm          | 10-bit RGB + 2-bit A unsigned normalized              |
| rg11b10ufloat         | Packed 11-bit R/G + 10-bit B unsigned float (HDR)     |
| rg32uint              | 32-bit unsigned integer RG                            |
| rg32sint              | 32-bit signed integer RG                              |
| rg32float             | 32-bit floating-point RG                              |
| rgba16uint            | 16-bit unsigned integer RGBA                          |
| rgba16sint            | 16-bit signed integer RGBA                            |
| rgba16float           | 16-bit floating-point RGBA                            |
| rgba32uint            | 32-bit unsigned integer RGBA                          |
| rgba32sint            | 32-bit signed integer RGBA                            |
| rgba32float           | 32-bit floating-point RGBA                            |
| stencil8              | 8-bit stencil                                         |
| depth16unorm          | 16-bit unsigned normalized depth                      |
| depth24plus           | 24+ bit depth (implementation-defined)                |
| depth24plus-stencil8  | 24+ bit depth + 8-bit stencil                         |
| depth32float          | 32-bit floating-point depth                           |
| depth32float-stencil8 | 32-bit floating-point depth + 8-bit stencil           |
| bc1-rgba-unorm        | BC1/DXT1 compressed RGBA unsigned normalized          |
| bc1-rgba-unorm-srgb   | BC1/DXT1 compressed RGBA (sRGB)                       |
| bc2-rgba-unorm        | BC2/DXT3 compressed RGBA unsigned normalized          |
| bc2-rgba-unorm-srgb   | BC2/DXT3 compressed RGBA (sRGB)                       |
| bc3-rgba-unorm        | BC3/DXT5 compressed RGBA unsigned normalized          |
| bc3-rgba-unorm-srgb   | BC3/DXT5 compressed RGBA (sRGB)                       |
| bc4-r-unorm           | BC4 compressed R unsigned normalized                  |
| bc4-r-snorm           | BC4 compressed R signed normalized                    |
| bc5-rg-unorm          | BC5 compressed RG unsigned normalized                 |
| bc5-rg-snorm          | BC5 compressed RG signed normalized                   |
| bc6h-rgb-ufloat       | BC6H compressed RGB unsigned float (HDR)              |
| bc6h-rgb-float        | BC6H compressed RGB signed float (HDR)                |
| bc7-rgba-unorm        | BC7 compressed RGBA unsigned normalized               |
| bc7-rgba-unorm-srgb   | BC7 compressed RGBA (sRGB)                            |
| etc2-rgb8unorm        | ETC2 compressed RGB 8-bit unsigned normalized         |
| etc2-rgb8unorm-srgb   | ETC2 compressed RGB 8-bit (sRGB)                      |
| etc2-rgb8a1unorm      | ETC2 compressed RGB + 1-bit alpha unsigned normalized |
| etc2-rgb8a1unorm-srgb | ETC2 compressed RGB + 1-bit alpha (sRGB)              |
| etc2-rgba8unorm       | ETC2 compressed RGBA 8-bit unsigned normalized        |
| etc2-rgba8unorm-srgb  | ETC2 compressed RGBA 8-bit (sRGB)                     |
| eac-r11unorm          | EAC compressed R 11-bit unsigned normalized           |
| eac-r11snorm          | EAC compressed R 11-bit signed normalized             |
| eac-rg11unorm         | EAC compressed RG 11-bit unsigned normalized          |
| eac-rg11snorm         | EAC compressed RG 11-bit signed normalized            |
| astc-4x4-unorm        | ASTC 4x4 block, unsigned normalized                   |
| astc-4x4-unorm-srgb   | ASTC 4x4 block (sRGB)                                 |
| astc-5x4-unorm        | ASTC 5x4 block, unsigned normalized                   |
| astc-5x4-unorm-srgb   | ASTC 5x4 block (sRGB)                                 |
| astc-5x5-unorm        | ASTC 5x5 block, unsigned normalized                   |
| astc-5x5-unorm-srgb   | ASTC 5x5 block (sRGB)                                 |
| astc-6x5-unorm        | ASTC 6x5 block, unsigned normalized                   |
| astc-6x5-unorm-srgb   | ASTC 6x5 block (sRGB)                                 |
| astc-6x6-unorm        | ASTC 6x6 block, unsigned normalized                   |
| astc-6x6-unorm-srgb   | ASTC 6x6 block (sRGB)                                 |
| astc-8x5-unorm        | ASTC 8x5 block, unsigned normalized                   |
| astc-8x5-unorm-srgb   | ASTC 8x5 block (sRGB)                                 |
| astc-8x6-unorm        | ASTC 8x6 block, unsigned normalized                   |
| astc-8x6-unorm-srgb   | ASTC 8x6 block (sRGB)                                 |
| astc-8x8-unorm        | ASTC 8x8 block, unsigned normalized                   |
| astc-8x8-unorm-srgb   | ASTC 8x8 block (sRGB)                                 |
| astc-10x5-unorm       | ASTC 10x5 block, unsigned normalized                  |
| astc-10x5-unorm-srgb  | ASTC 10x5 block (sRGB)                                |
| astc-10x6-unorm       | ASTC 10x6 block, unsigned normalized                  |
| astc-10x6-unorm-srgb  | ASTC 10x6 block (sRGB)                                |
| astc-10x8-unorm       | ASTC 10x8 block, unsigned normalized                  |
| astc-10x8-unorm-srgb  | ASTC 10x8 block (sRGB)                                |
| astc-10x10-unorm      | ASTC 10x10 block, unsigned normalized                 |
| astc-10x10-unorm-srgb | ASTC 10x10 block (sRGB)                               |
| astc-12x10-unorm      | ASTC 12x10 block, unsigned normalized                 |
| astc-12x10-unorm-srgb | ASTC 12x10 block (sRGB)                               |
| astc-12x12-unorm      | ASTC 12x12 block, unsigned normalized                 |
| astc-12x12-unorm-srgb | ASTC 12x12 block (sRGB)                               |

Note: Availability of compressed formats depends on platform features (e.g., texture-compression-bc/etc2/astc).

### 6.3.1 Image Source

Extends TextureSource

An image source represents a 2D image that can be used as a texture.

```json
{
    "type": "image_source",
    "uri": "/textures/hero.png",
}
```

### 6.3.2 Video Source

Extends TextureSource

A video source represents a 2D video that can be used as a texture.

```json
{
    "type": "video_source",
    "uri": "/videos/intro.mp4",
    "autoPlay": true,
    "loop": true,
    "autoLoad": true,
    "crossorigin": "anonymous",
    "muted": true,
    "playsinline": true
}
```

| Name        | Type           | Description                | Required |
| ----------- | -------------- | -------------------------- | -------- |
| type        | string         | `"video_source"`           | ✅ Yes   |
| uri         | string         | Path/URL to video          | ✅ Yes   |
| autoLoad    | boolean        | Whether to preload video   | No       |
| autoPlay    | boolean        | Whether to autoplay video  | No       |
| crossorigin | string/boolean | Cross-origin attribute     | No       |
| loop        | boolean        | Whether video loops        | No       |
| muted       | boolean        | Whether video is muted     | No       |
| playsinline | boolean        | Whether video plays inline | No       |

---

## 7. Extensions

Extensions allow engines to add **custom metadata**.

- **extensionsUsed**: List of extensions present
- **extensionsRequired**: List of extensions required to load

Example:

```json
"extensionsUsed": ["pixi_container_node", "pixi_sprite_node"],
"extensionsRequired": ["pixi_texture_resource"]
```

---

## 8. Example Full File

```json
{
    "asset": {
        "version": "1.0",
        "generator": "PixiJS"
    },
    "scene": 0,
    "scenes": [
        {
            "name": "MainScene",
            "nodes": [0]
        }
    ],
    "nodes": [
        {
            "type": "container",
            "name": "Root",
            "children": [1],
            "translation": [100, 100]
        },
        {
            "type": "sprite",
            "name": "Hero",
            "texture": 0,
            "translation": [50, 0],
            "extensions": {
                "pixi_sprite_node": {
                    "roundPixels": true
                }
            }
        }
    ],
    "resources": [
        {
            "type": "texture",
            "source": 0,
            "extensions": {
                "pixi_texture_resource": {
                    "orig": [0, 0, 64, 64],
                    "trim": [0, 0, 64, 64],
                    "defaultAnchor": { "x": 0.5, "y": 0.5 },
                    "rotate": 0,
                    "dynamic": false
                }
            }
        },
        {
            "type": "image_source",
            "uri": "/textures/hero.png",
        }
    ],
    "extensionsUsed": ["pixi_sprite_node", "pixi_texture_resource"]
}
```
