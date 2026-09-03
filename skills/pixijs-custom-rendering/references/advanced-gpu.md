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

## Vertex count, winding, and culling

```ts
const count = geometry.vertexCount; // cached, from the first non-instanced attribute

const state = new State();
state.culling = true;
state.clockwiseFrontFace = true; // or state.cullMode = "front"
```

`geometry.getSize()` is deprecated since 8.20.0 and warns once; read `vertexCount` instead. `clockwiseFrontFace` selects which winding counts as front-facing and is respected by both renderers. When rendering into a texture, PixiJS inverts the winding to match the flipped projection; read `renderer.renderTarget.frontFaceInverted` if your own code needs the resolved orientation.

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

A bundle records draw calls once and replays them on later frames. It bakes the render target it was recorded in (color formats, sample count, depth format, winding), so `isBundleValid` returns `false` after the target changes, for example when a filter wraps the container or `flipY` flips. Re-record when it does; WebGPU rejects the whole frame or draws inside out otherwise. Pass an array to `executeBundle` to replay several bundles in one call. The optional label names the bundle in GPU captures and validation errors.

## API Reference

- [Buffer](https://pixijs.download/release/docs/rendering.Buffer.html.md)
- [Geometry](https://pixijs.download/release/docs/rendering.Geometry.html.md)
- [State](https://pixijs.download/release/docs/rendering.State.html.md)
- [ShaderOverrides](https://pixijs.download/release/docs/rendering.ShaderOverrides.html.md)
- [GpuProgram](https://pixijs.download/release/docs/rendering.GpuProgram.html.md)
- [TextureView](https://pixijs.download/release/docs/rendering.TextureView.html.md)
- [RenderTarget](https://pixijs.download/release/docs/rendering.RenderTarget.html.md)
- [GpuEncoderSystem](https://pixijs.download/release/docs/rendering.GpuEncoderSystem.html.md)
- [RenderBundle](https://pixijs.download/release/docs/rendering.RenderBundle.html.md)
