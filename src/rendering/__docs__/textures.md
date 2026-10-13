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

| Type                   | Description                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| **ImageSource**        | HTMLImageElement, ImageBitmap, SVGs, VideoFrame                                                 |
| **CanvasSource**       | HTMLCanvasElement or OffscreenCanvas                                                            |
| **VideoSource**        | HTMLVideoElement with optional auto-play and update FPS                                         |
| **BufferImageSource**  | TypedArray or ArrayBuffer with explicit width, height, and format                               |
| **CompressedSource**   | Array of compressed mipmaps (Uint8Array\[])                                                     |
| **HTMLSource**         | A live DOM element rendered through the experimental HTML-in-Canvas API (`pixi.js/html-source`) |
| **ElementImageSource** | An immutable `ElementImage` snapshot of a DOM element (`pixi.js/html-source`)                   |

`HTMLSource` and `ElementImageSource` are experimental and only register when you import `pixi.js/html-source`. See the [HTML Source guide](../../html-source/__docs__/html-source.md).

### Updating part of a buffer texture

A `BufferImageSource` holds texels in row-major order, so texel `i` sits at `x = i % width`, `y = floor(i / width)`. After changing the data, call `update(start, end)` with the texel range you changed to upload only that part. `end` is exclusive, like `TypedArray.subarray`. With no arguments, `update()` uploads the whole texture.

```ts
const data = new Float32Array(4096 * 64 * 4); // rgba32float: 4 floats per texel
const source = new BufferImageSource({ resource: data, width: 4096, height: 64 });

data.fill(1, 100 * 4, 116 * 4); // change texels 100 to 115
source.update(100, 116); // upload only those 16 texels
```

The upload happens during the `update` call on every renderer that already holds the texture. The range applies to that call only, so if you change several parts of the buffer in a frame, track the lowest and highest changed texel yourself and call `update` once with that span. Each call has a fixed cost on top of the bytes it moves, which reaches tens of microseconds on some mobile GPUs. One span usually beats many small calls. Partial uploads assume the buffer holds exactly `width * height` texels. A 3D texture (`depth`) or 2D array (`arrayLayerCount`) always uploads whole, so call `update()` with no range.

### 3D and array textures (advanced)

Pass `depth` to a `TextureSource` or `BufferImageSource` to make a `'3d'` texture, or `arrayLayerCount` above 1 to make a `'2d-array'` texture. A texture can't have both, and TypeScript rejects options that set both. Pass `viewDimension` only when the size doesn't decide it, such as `'cube'` for 6 layers viewed as a cube map. These textures need WebGL2 or WebGPU; WebGL1 has no 3D or array textures.

```ts
import { BufferImageSource } from 'pixi.js';

const size = 64;
const data = new Uint8Array(size * size * size * 4);

for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const i = (x + (y * size) + (z * size * size)) * 4;

            data[i] = data[i + 1] = data[i + 2] = Math.random() * 255;
            data[i + 3] = 255;
        }
    }
}

const noise = new BufferImageSource({
    resource: data,
    width: size,
    height: size,
    depth: size,
    format: 'rgba8unorm',
});
```

The buffer holds the slices (or layers) one after another, each in row-major order, so texel `(x, y, z)` sits at index `x + y * width + z * width * height`. `resolution` scales `width` and `height` but not `depth`. A 3D or array `BufferImageSource` defaults to `alphaMode: 'no-premultiply-alpha'`.

Sample a 3D texture with `uniform sampler3D` in GLSL or `texture_3d<f32>` in WGSL, and a 2D array with `sampler2DArray` or `texture_2d_array<f32>`. PixiJS declares `precision highp` for the sampler types GLSL ES 3.0 gives no default, such as `sampler3D`, `sampler2DArray`, `usampler2D` and `isampler2D`, so you don't need a precision line. A precision you write yourself is kept. `sampler2D` and `samplerCube` keep their `lowp` default.

A `Float32Array` gives `rgba32float` by default. On WebGPU, linear filtering of that format needs an optional feature PixiJS doesn't request, so use `scaleMode: 'nearest'` with it, or pick `rgba8unorm`, `r8unorm` or `rgba16float` for smooth sampling.

With `autoGenerateMipmaps`, WebGL fills a 3D texture's mip chain with `gl.generateMipmap`. WebGPU writes the mips with a compute shader, so the texture needs `storage: true` and the `rgba8unorm` or `rgba16float` format. To draw into one slice or layer, see the [rendering guide](./rendering.md).

The `dimensions` option is deprecated because PixiJS derives it from the view; leave it out.

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
- `format`: Pixel format (e.g., `rgba8unorm`, `bgra8unorm`). Integer formats such as `rgba32uint` need `scaleMode: 'nearest'`, and shaders read them with `texelFetch` or `textureLoad`.
- `alphaMode`: How alpha is interpreted on upload.
- `wrapMode` / `scaleMode`: Sampling behavior outside bounds or when scaled.
- `autoGenerateMipmaps`: Whether to generate mipmaps on upload.
- `depth`: Depth of a 3D texture in texels. Setting it makes a `'3d'` texture. `resolution` doesn't scale it.
- `arrayLayerCount`: Number of array layers. Above 1 makes a `'2d-array'` texture. Can't be combined with `depth`.
- `viewDimension`: How shaders view the texture, such as `'2d'`, `'2d-array'`, `'cube'` or `'3d'`. The size decides it unless you pass one, for example `'cube'` for 6 layers.
- `storage`: WebGPU only. Lets your own compute shaders write to the texture. WebGL ignores it.
- `transient`: WebGPU only. Marks an antialiased render texture as drawn in a single pass, so its multisample depth/stencil buffer is discarded instead of written to memory, and its colour buffer too on GPUs that aren't tile-based (tile-based GPUs discard colour already). Set at creation time.

```ts
texture.source.scaleMode = 'linear';
texture.source.wrapMode = 'repeat';
```

## Pooled textures (advanced)

Filters, masks, `cacheAsTexture`, and canvas text borrow their scratch textures from the shared `TexturePool`. Custom filters and plugins can use it too:

```ts
import { TexturePool } from 'pixi.js';

const scratch = TexturePool.getOptimalTexture({
    width: bounds.width,
    height: bounds.height,
    resolution: renderer.resolution,
    antialias: true,
    scaleMode: 'nearest',
});

// ... render into it ...

TexturePool.returnTexture(scratch);
```

`width` and `height` are the minimum frame size. `resolution`, `antialias`, `autoGenerateMipmaps`, `format`, and `scaleMode` are optional, and each combination keeps its own bucket. Each axis of the backing texture is rounded up to the next power of two or the renderer's screen size, whichever is smaller, so a full-screen request on a 1170x2532 phone gets a 1170x2532 texture instead of 2048x4096. `getOptimalSize(width, height, resolution)` reports the backing size without taking a texture, and `getSameSizeTexture(texture)` matches an existing one.

The positional `getOptimalTexture(width, height, resolution, antialias)` form and the `enableFullScreen` and `textureStyle` properties are deprecated since 8.21.0.

---

## API reference

- {@link Texture}
- {@link TextureSource}
- {@link BufferImageSource}
- {@link TextureStyle}
- {@link RenderTexture}
