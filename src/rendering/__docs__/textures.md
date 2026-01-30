---
title: Textures
description: Learn how PixiJS handles textures, their lifecycle, creation, and types, and how to manage GPU resources.
category: rendering
---

# Textures

A texture is an image that lives on the GPU, ready to be drawn to the screen. When you load a `.png` or `.jpg` and display it as a `Sprite`, PixiJS wraps that image in a `Texture`. Textures are central to the rendering pipeline; nearly every visible object uses one.

## Texture lifecycle

The texture system is built around two classes:

- **`TextureSource`**: Represents a pixel source (image, canvas, or video).
- **`Texture`**: A lightweight view into a `TextureSource`, including sub-rectangles, trims, and transformations.

### Lifecycle flow

```
Source File/Image -> TextureSource -> Texture -> Sprite (or other display object)
```

### Loading textures

Load textures asynchronously with the `Assets` system:

```ts
const texture = await Assets.load('myTexture.png');

const sprite = new Sprite(texture);
```

### Preparing textures

After loading, images still need to be decoded and uploaded to the GPU. For many images, this can cause a visible lag spike on first render. Use the {@link PrepareSystem} to pre-upload textures to the GPU before they appear on screen:

```ts
await renderer.prepare.upload(sprite);
```

## Texture vs. TextureSource

`TextureSource` handles raw pixel data and GPU upload. `Texture` is a lightweight view on that source with metadata like trimming, frame rectangle, and UV mapping. Multiple `Texture` instances can share a single `TextureSource`, as in a spritesheet.

```ts
const sheet = await Assets.load('spritesheet.json');
const heroTexture = sheet.textures['hero.png'];
```

## Texture creation

Create textures manually with the constructor:

```ts
const mySource = new TextureSource({ resource: myImage });
const texture = new Texture({ source: mySource });
```

Set `dynamic: true` in the `Texture` options if you plan to modify its `frame`, `trim`, or `source` at runtime. Without this flag, the texture won't notify the renderer of changes, and your modifications won't appear on screen.

## Destroying textures

To free memory (GPU buffers and browser-side), call `Assets.unload('texture.png')`, or `texture.destroy()` if you created the texture outside of Assets.

This is worth doing for short-lived imagery like cutscenes. If a texture loaded via `Assets` is destroyed, the cache entry is removed automatically.

## Unloading from the GPU

To remove a texture from the GPU while keeping it in memory:

```ts
const texture = await Assets.load('myTexture.png');

// ... use the texture ...

texture.source.unload();
```

## Texture source types

PixiJS supports multiple `TextureSource` types depending on the input data:

| Type                  | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| **ImageSource**       | HTMLImageElement, ImageBitmap, SVGs, VideoFrame                   |
| **CanvasSource**      | HTMLCanvasElement or OffscreenCanvas                              |
| **VideoSource**       | HTMLVideoElement with optional auto-play and update FPS           |
| **BufferImageSource** | TypedArray or ArrayBuffer with explicit width, height, and format |
| **CompressedSource**  | Array of compressed mipmaps (Uint8Array\[])                       |

## Texture properties

Key properties on `Texture`:

- `frame`: Rectangle defining the visible portion within the source.
- `orig`: Original untrimmed dimensions.
- `trim`: Trimmed region excluding transparent space.
- `uvs`: UV coordinates generated from `frame` and `rotate`.
- `rotate`: GroupD8 rotation value for atlas compatibility.
- `defaultAnchor`: Default anchor when used in Sprites.
- `defaultBorders`: Used for 9-slice scaling.
- `source`: The underlying `TextureSource` instance.

## TextureSource properties

Key properties on `TextureSource`:

- `resolution`: Render size relative to pixel size.
- `format`: Pixel format (e.g., `rgba8unorm`, `bgra8unorm`).
- `alphaMode`: How alpha is interpreted on upload.
- `wrapMode` / `scaleMode`: Sampling behavior outside bounds or when scaled.
- `autoGenerateMipmaps`: Whether to generate mipmaps on upload.

```ts
texture.source.scaleMode = 'linear';
texture.source.wrapMode = 'repeat';
```

---

## API reference

- {@link Texture}
- {@link TextureSource}
- {@link TextureStyle}
- {@link RenderTexture}
