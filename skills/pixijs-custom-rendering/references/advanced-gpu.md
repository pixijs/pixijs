# Advanced GPU features

Lower-level rendering APIs for custom draw code. Items marked WebGPU only are ignored or unavailable on the WebGL renderer; branch on `renderer.name === "webgpu"` before relying on them.

## Partial buffer updates

```ts
import { Buffer, BufferUsage } from "pixi.js";

const buffer = new Buffer({
  data: new Float32Array(4096),
  usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
});

buffer.data.set(newVertices, 256);
buffer.update(newVertices.byteLength, 256 * 4); // size and offset in bytes
```

`update()` with no arguments re-uploads the whole buffer. Pass a byte size and byte offset to upload only the range you changed. Works on WebGL and WebGPU.

## Partial texture uploads

```ts
import { BufferImageSource } from "pixi.js";

const data = new Float32Array(4096 * 64 * 4); // rgba32float: 4 floats per texel
const source = new BufferImageSource({ resource: data, width: 4096, height: 64 });

data.fill(1, 100 * 4, 116 * 4); // change texels 100 to 115
source.update(100, 116); // upload only those 16 texels
```

Texel `i` sits at `x = i % width`, `y = floor(i / width)`, and `end` is exclusive. The range applies to that call only, so track the lowest and highest changed texel yourself and call `update` once per frame. `update()` with no arguments uploads the whole texture. Works on WebGL and WebGPU.

## Vertex count, index count, winding, and culling

```ts
const count = geometry.vertexCount; // cached, from the first non-instanced attribute

// several geometries share one index buffer sized for the biggest batch;
// each draws only the prefix it currently uses
const quads = new Geometry({
  attributes: { aPosition: positions },
  indexBuffer: sharedIndices,
  indexCount: liveQuads * 6,
});
quads.indexCount = 12; // read at draw time; no re-upload

const state = new State();
state.culling = true;
state.clockwiseFrontFace = true; // or state.cullMode = "front"
```

`geometry.getSize()` is deprecated since 8.20.0; read `vertexCount` instead. `indexCount` of `0` (the default) draws the whole index buffer; any other value draws that many indices. A `size` passed to `encoder.draw()` still wins. `clockwiseFrontFace` selects which winding counts as front-facing on both renderers. When rendering into a texture PixiJS inverts the winding to match the flipped projection; call `renderer.renderTarget.isFrontFaceInverted()` if your own code needs the resolved orientation, or `isFrontFaceInverted(target, flipY)` to ask about a `RenderTarget` before binding it (`renderer.renderTarget.getRenderTarget(texture)` returns one for a texture).

## WGSL override constants (WebGPU only)

```ts
const source = /* wgsl */ `
  override BLUR_STEPS: u32 = 4u;
  // ...
`;

const shader = Shader.from({
  gpu: {
    vertex: { source, entryPoint: "vsMain" },
    fragment: { source, entryPoint: "fsMain" },
  },
  resources: { uniforms },
  overrides: { BLUR_STEPS: 8 },
});
```

`overrides` takes a plain `Record<string, number>` or a `ShaderOverrides` instance. Values are fixed when the shader is created and become part of the pipeline cache key, so every distinct set compiles its own pipeline. To change a value, create a new shader. On browsers without pipeline constants (Safari) PixiJS substitutes the values into the WGSL source; `renderer.limits.supportsOverrideConstants` tells you which path is active. WebGL ignores `overrides` entirely.

## Custom bind group layout (WebGPU only)

```ts
import { GpuProgram, extractStructAndGroups, generateGpuLayoutGroups } from "pixi.js";

const gpuLayout = generateGpuLayoutGroups(extractStructAndGroups(source));

// narrow one texture binding to the fragment stage
gpuLayout[0][1].visibility = GPUShaderStage.FRAGMENT;

const program = new GpuProgram({
  vertex: { source, entryPoint: "vsMain" },
  fragment: { source, entryPoint: "fsMain" },
  gpuLayout,
});
```

`generateGpuLayoutGroups` is the same generator `GpuProgram` runs when `gpuLayout` is omitted, and it marks every binding visible to both stages. Generate the default, edit the entries you care about, and pass the whole array back rather than hand-writing the layout.

## Sampling a depth texture with TextureView (WebGPU only)

```ts
import { RenderTarget, Shader, State, TextureSource, TextureView } from "pixi.js";

const depth = new TextureSource({ width: 512, height: 512, format: "depth24plus-stencil8" });
const color = new TextureSource({ width: 512, height: 512 });

// pass 1: write depth
const writeTarget = new RenderTarget({
  colorAttachments: [{ texture: color, loadOp: "clear", clearValue: [0, 0, 0, 1] }],
  depthStencilAttachment: { texture: depth, depthLoadOp: "clear", depthClearValue: 1 },
});

// pass 2: keep the same depth attached read-only while sampling it
const readTarget = new RenderTarget({
  colorAttachments: [{ texture: color, loadOp: "load" }],
  depthStencilAttachment: { texture: depth, depthReadOnly: true },
});

const shader = Shader.from({
  gpu: { vertex: { source, entryPoint: "vsMain" }, fragment: { source, entryPoint: "fsMain" } },
  resources: { uDepthTexture: new TextureView(depth, { aspect: "depth-only" }) },
});
```

Declare `@group(0) @binding(1) var uDepthTexture: texture_depth_2d;` in WGSL and read it with `textureLoad`. Use a `State` with `depthMask = false` in the read pass. A `TextureView` is a bind resource like a `TextureSource`; on WebGL it binds the underlying source and the descriptor is ignored.

## Integer textures

```ts
import { BufferImageSource, Shader } from "pixi.js";

const ids = new BufferImageSource({
  resource: new Uint32Array([1, 2, 3, 4]), // picks rgba32uint
  width: 1,
  height: 1,
  scaleMode: "nearest",
});

const shader = Shader.from({
  gl: { vertex: vertSrc, fragment: fragSrc },
  gpu: { vertex: { source, entryPoint: "vsMain" }, fragment: { source, entryPoint: "fsMain" } },
  resources: { uIds: ids },
});
```

Integer formats (`*uint`, `*sint`) hold exact integers. Use them where a float texture would lose bits, since small integers are denormal floats and GPUs may flush them to zero. They can't be filtered, so set `scaleMode: "nearest"`. `BufferImageSource` infers `rgba32uint` from a `Uint32Array` and `rgba16uint` from a `Uint16Array`; pass `format: "rgba32sint"` (or another signed format) explicitly for signed data. It defaults integer formats to `alphaMode: "no-premultiply-alpha"` because integer data can't be premultiplied on upload.

In GLSL ES 3.0, declare `uniform usampler2D uIds;` (or `isampler2D`) and read it with `texelFetch(uIds, ivec2(x, y), 0)`. Fragment shaders have no default precision for integer samplers, so add `precision highp usampler2D;`. In WGSL, declare `@group(0) @binding(1) var uIds: texture_2d<u32>;` (or `<i32>`) and read it with `textureLoad(uIds, vec2<i32>(x, y), 0)`; the generated bind group layout takes its `sampleType` from the `<u32>` / `<i32>` suffix. PixiJS can't render into integer textures yet.

## Render bundles (WebGPU only)

```ts
import { RenderContainer } from "pixi.js";
import type { RenderBundle, WebGPURenderer } from "pixi.js";

let bundle: RenderBundle | null = null;

const props = new RenderContainer({
  render: (renderer) => {
    const encoder = (renderer as WebGPURenderer).encoder;

    if (!bundle || !encoder.isBundleValid(bundle)) {
      encoder.beginBundle("static-props");
      encoder.draw({ geometry, shader, state });
      bundle = encoder.endBundle();
    }

    encoder.executeBundle(bundle);
  },
});
```

A bundle records draw calls once and replays them on later frames. It bakes the render target it was recorded in (formats, sample count, winding) and the device, so `isBundleValid` returns `false` after the target changes (a filter wrapping the container, `flipY` flipping) or after a device loss. Re-record when it does; otherwise WebGPU rejects the frame or draws inside out. Pass an array to `executeBundle` to replay several bundles in one call. The optional label names the bundle in GPU captures.

## Pooled scratch textures

```ts
import { TexturePool } from "pixi.js";

const scratch = TexturePool.getOptimalTexture({
  width: bounds.width,
  height: bounds.height,
  resolution: renderer.resolution,
  antialias: true,
  scaleMode: "nearest",
});

const { width, height } = TexturePool.getOptimalSize(bounds.width, bounds.height, renderer.resolution);

TexturePool.returnTexture(scratch);
```

`getOptimalTexture` takes one request object: `width` and `height` are the minimum frame size; `resolution`, `antialias`, `autoGenerateMipmaps`, `format`, and `scaleMode` are optional, and each combination has its own bucket, so ask for a float or depth format directly instead of restyling a returned texture. Each axis is rounded up to the next power of two or the renderer's screen size, whichever is smaller. `getOptimalSize` reports that backing size without taking a texture, and `getSameSizeTexture(texture)` matches an existing texture's frame and resolution. The positional `getOptimalTexture(width, height, resolution, antialias)` form, `TexturePool.textureStyle`, and `enableFullScreen` are deprecated since 8.21.0.

## API Reference

- [TexturePool](https://pixijs.download/release/docs/rendering.TexturePool.html.md)
- [Buffer](https://pixijs.download/release/docs/rendering.Buffer.html.md)
- [Geometry](https://pixijs.download/release/docs/rendering.Geometry.html.md)
- [State](https://pixijs.download/release/docs/rendering.State.html.md)
- [ShaderOverrides](https://pixijs.download/release/docs/rendering.ShaderOverrides.html.md)
- [GpuProgram](https://pixijs.download/release/docs/rendering.GpuProgram.html.md)
- [TextureView](https://pixijs.download/release/docs/rendering.TextureView.html.md)
- [RenderTarget](https://pixijs.download/release/docs/rendering.RenderTarget.html.md)
- [GpuEncoderSystem](https://pixijs.download/release/docs/rendering.GpuEncoderSystem.html.md)
- [RenderBundle](https://pixijs.download/release/docs/rendering.RenderBundle.html.md)
