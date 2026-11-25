# Multi-pass filters

Override `apply()` when one filter needs a scratch texture or combines several passes. This bloom blurs a copy of the input and adds it back over the original:

```ts
import { BlurFilter, Filter, RendererType, Texture, TexturePool, defaultFilterVert } from "pixi.js";
import type { FilterSystem, RenderSurface } from "pixi.js";

const combineFragment = `
in vec2 vTextureCoord;
out vec4 finalColor;
uniform sampler2D uTexture;
uniform sampler2D uBlurred;

void main() {
  finalColor = texture(uTexture, vTextureCoord) + texture(uBlurred, vTextureCoord);
}`;

class BloomFilter extends Filter {
  private readonly blur = new BlurFilter({ strength: 8 });
  private readonly combine = Filter.from({
    gl: { vertex: defaultFilterVert, fragment: combineFragment },
    resources: { uBlurred: Texture.EMPTY.source },
  });

  constructor() {
    // no program of its own, so declare which renderers the inner passes support
    super({ compatibleRenderers: RendererType.WEBGL, resources: {} });
    this.padding = this.blur.padding;
  }

  public override apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void {
    const blurred = TexturePool.getSameSizeTexture(input);

    this.blur.apply(filterManager, input, blurred, true);
    this.combine.resources.uBlurred = blurred.source;
    this.combine.blendMode = this.blendMode;
    filterManager.applyFilter(this.combine, input, output, clearMode);

    TexturePool.returnTexture(blurred);
  }
}

// sprite.filters = [new BloomFilter()];
```

Rules:

- **A filter with no program of its own is skipped unless it sets `compatibleRenderers`.** It defaults to the renderers its programs cover, which is none here. Use `RendererType.WEBGL | RendererType.WEBGPU` only when every inner pass has both programs.
- Run a pass with `innerFilter.apply(filterManager, input, output, clear)` (built-in filters such as `BlurFilter` run their own passes) or `filterManager.applyFilter(shaderFilter, input, output, clear)` for a shader-only filter.
- Borrow scratch textures with `TexturePool.getSameSizeTexture(input)` and give each back with `TexturePool.returnTexture()` in the same `apply()`. A same-size texture shares `vTextureCoord` with `input`, so pass it as a resource (`.source`) and sample it at `vTextureCoord`. v7's `filterManager.getFilterTexture()` / `returnFilterTexture()` don't exist.
- Only the outer filter's `padding`, `resolution` and `blendMode` count for the container. Copy the padding the inner passes need, and give the last pass `this.blendMode` so the filter's blend mode is honoured; intermediate passes write with `"normal"`.
