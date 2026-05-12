---
name: pixijs-filters
description: "Use this skill when applying visual effects to PixiJS v8 containers via the filter pipeline. Covers built-in filters (AlphaFilter, BlurFilter, ColorMatrixFilter, DisplacementFilter, NoiseFilter), custom Filter.from() with GLSL/WGSL, options (resolution, padding, antialias, blendRequired), filterArea optimization, pixi-filters community package. Triggers on: filters, BlurFilter, ColorMatrixFilter, DisplacementFilter, NoiseFilter, Filter.from, GLSL filter, pixi-filters, filterArea."
license: MIT
---

Attach visual effects by assigning one filter (or an array for chaining) to `container.filters`. Built-in filters cover blur, color matrix, displacement, alpha, and noise; custom filters wrap a GLSL/WGSL fragment shader via `Filter.from(...)`.

## Quick Start

```ts
const sprite = new Sprite(await Assets.load("hero.png"));
app.stage.addChild(sprite);

const blur = new BlurFilter({ strength: 4, quality: 4 });
const colorMatrix = new ColorMatrixFilter();
colorMatrix.brightness(1.2, false);

sprite.filters = [blur, colorMatrix];

const container = new Container();
container.filters = [new BlurFilter({ strength: 2 })];
container.filterArea = new Rectangle(0, 0, 800, 600);
app.stage.addChild(container);
```

**Related skills:** `pixijs-custom-rendering` (shader internals, uniform types), `pixijs-blend-modes` (composing with filters), `pixijs-performance` (filter tuning, filterArea).

## Core Patterns

### Built-in filters

```ts
import {
  AlphaFilter,
  BlurFilter,
  ColorMatrixFilter,
  DisplacementFilter,
  NoiseFilter,
  Assets,
  Sprite,
} from "pixi.js";

// Alpha (uniform transparency without per-child layering)
const alpha = new AlphaFilter({ alpha: 0.5 });

// Blur — strength/quality are uniform; strengthX/strengthY split axes;
// kernelSize must be odd (5, 7, 9, ... 15); repeatEdgePixels avoids transparent edges
const blur = new BlurFilter({
  strength: 4,
  quality: 4,
  kernelSize: 5,
  repeatEdgePixels: false,
});

// Color matrix — brightness is one of many presets. Others: tint, hue,
// contrast, saturate, desaturate, greyscale/grayscale, blackAndWhite,
// negative, sepia, technicolor, polaroid, kodachrome, browni, vintage,
// colorTone, night, predator, lsd, reset. Direct access via
// `colorMatrix.matrix` (20-element array) and `colorMatrix.alpha` (blend
// between original and transformed).
const colorMatrix = new ColorMatrixFilter();
colorMatrix.brightness(1.5, false);
colorMatrix.contrast(0.5, true); // multiply stacks on top of existing matrix
colorMatrix.alpha = 0.7; // blend at 70% strength

// Displacement — scale is a number or PointData
const displacementTexture = await Assets.load("displacement_map.png");
const displacementSprite = new Sprite(displacementTexture);
const displacement = new DisplacementFilter({
  sprite: displacementSprite,
  scale: { x: 20, y: 10 },
});

// Noise — seed is an arbitrary number that determines the noise pattern; same seed reproduces the same pattern
const noise = new NoiseFilter({ noise: 0.5, seed: Math.random() });

sprite.filters = [blur, colorMatrix];
```

### Custom filter with Filter.from()

The simplest way to create a custom filter. Only a fragment shader is needed; PixiJS provides a default vertex shader.

```ts
import { Filter } from "pixi.js";

const filter = Filter.from({
  gl: {
    fragment: `
            in vec2 vTextureCoord;
            out vec4 finalColor;
            uniform sampler2D uTexture;
            uniform float uTime;

            void main() {
                vec2 uv = vTextureCoord;
                uv.x += sin(uv.y * 10.0 + uTime) * 0.02;
                finalColor = texture(uTexture, uv);
            }
        `,
  },
  resources: {
    timeUniforms: {
      uTime: { value: 0, type: "f32" },
    },
  },
});

sprite.filters = filter;

app.ticker.add((ticker) => {
  filter.resources.timeUniforms.uniforms.uTime += 0.04 * ticker.deltaTime;
});
```

For more control, construct `GlProgram`/`GpuProgram` objects directly:

```ts
import { Filter, GlProgram } from "pixi.js";

const glProgram = GlProgram.from({ fragment: fragmentSrc, vertex: vertexSrc });

const filter = new Filter({
  glProgram,
  resources: {
    timeUniforms: {
      uTime: { value: 0, type: "f32" },
    },
  },
});
```

Key points:

- Use `out vec4 finalColor` in fragment shaders, not `gl_FragColor` (GLSL ES 3.0).
- Use `texture()` to sample, not `texture2D`.
- `glProgram` for WebGL, `gpuProgram` for WebGPU. Omitting one skips that renderer.
- Textures go in `resources`, not uniforms. The filter system auto-provides `uTexture` (the input).
- Access uniform values via `filter.resources.{groupName}.uniforms.{name}`.

### Filter options

```ts
import { Filter, GlProgram, Rectangle } from "pixi.js";

const filter = new Filter({
  glProgram: GlProgram.from({ fragment }),
  resources: {},
  resolution: 0.5, // default 1. Lower = faster, blurrier
  padding: 10, // default 0. Extra pixels for effects that extend bounds
  antialias: "off", // default 'off'. 'on' | 'off' | 'inherit'
  blendMode: "normal", // default 'normal'
  blendRequired: false, // default false. true if shader samples uBackTexture
  clipToViewport: true, // default true
});

// Optimization: set known bounds to avoid per-frame measurement
container.filterArea = new Rectangle(0, 0, 800, 600);

// Toggle without rebuilding the filter array
filter.enabled = false;

// Share one filter instance across many display objects
sprite1.filters = [filter];
sprite2.filters = [filter];
```

### Community filters (pixi-filters)

```ts
import { AdjustmentFilter } from "pixi-filters/adjustment";
import { GlowFilter } from "pixi-filters/glow";

sprite.filters = [
  new AdjustmentFilter({ brightness: 1.2, contrast: 1.1 }),
  new GlowFilter({ distance: 15, outerStrength: 2 }),
];
```

For v8, community filters use `pixi-filters/{name}` imports, not the old `@pixi/filter-*` packages.

### Advanced blend modes

Advanced blend modes (`color-burn`, `overlay`, `hard-light`, etc.) are powered by the filter system and must be imported before use. They also require `useBackBuffer: true` on WebGL; see the `pixijs-blend-modes` skill for the full list.

```ts
import "pixi.js/advanced-blend-modes";

await app.init({ useBackBuffer: true });
sprite.blendMode = "color-burn";
```

## Common Mistakes

### [CRITICAL] Using old Filter constructor (vertex, fragment, uniforms)

Wrong:

```ts
import { Filter } from "pixi.js";

const filter = new Filter(vertex, fragment, { uTime: 0 });
```

Correct:

```ts
import { Filter, GlProgram } from "pixi.js";

const filter = new Filter({
  glProgram: GlProgram.from({ fragment, vertex }),
  resources: {
    timeUniforms: { uTime: { value: 0, type: "f32" } },
  },
});
```

v8 uses an options object. Shaders must be wrapped in `GlProgram.from()` or `GpuProgram.from()`. Uniforms are grouped in `resources` with explicit types. Textures are resources, not uniforms.


### [HIGH] Using @pixi/filter-\* packages for v8

Wrong:

```ts
import { AdjustmentFilter } from "@pixi/filter-adjustment";
```

Correct:

```ts
import { AdjustmentFilter } from "pixi-filters/adjustment";
```

`@pixi/filter-*` packages are v7 only. For v8, the community filters package restructured to `pixi-filters/{name}`.


### [HIGH] Using too many filters without containerizing

Each filter application requires a framebuffer switch, bounds measurement, and render-to-texture pass. One filter on a parent container is much cheaper than the same filter on each child.

Wrong:

```ts
for (const child of container.children) {
  child.filters = [new BlurFilter({ strength: 4 })];
}
```

Correct:

```ts
container.filters = [new BlurFilter({ strength: 4 })];
```


### [HIGH] Using a blendRequired filter without useBackBuffer on WebGL

Custom filters and most advanced community filters that set `blendRequired: true` sample the back buffer. On WebGL that only works if the renderer was initialized with `useBackBuffer: true`; otherwise PixiJS logs a warning and the filter silently falls back:

```ts
await app.init({ useBackBuffer: true });
```

WebGPU enables the back buffer unconditionally, so this only affects WebGL.


### [MEDIUM] Not setting filterArea for known-size containers

Without `filterArea`, PixiJS measures the container bounds every frame via `getGlobalBounds()`, which recursively walks all children. For containers with known dimensions, set `filterArea` to avoid this cost:

```ts
import { Rectangle } from "pixi.js";

container.filterArea = new Rectangle(0, 0, 800, 600);
container.filters = [someFilter];
```


## API Reference

- [Filter](https://pixijs.download/release/docs/filters.Filter.html.md)
- [AlphaFilter](https://pixijs.download/release/docs/filters.AlphaFilter.html.md)
- [BlurFilter](https://pixijs.download/release/docs/filters.BlurFilter.html.md)
- [BlurFilterPass](https://pixijs.download/release/docs/filters.BlurFilterPass.html.md)
- [ColorMatrixFilter](https://pixijs.download/release/docs/filters.ColorMatrixFilter.html.md)
- [DisplacementFilter](https://pixijs.download/release/docs/filters.DisplacementFilter.html.md)
- [NoiseFilter](https://pixijs.download/release/docs/filters.NoiseFilter.html.md)
- [FilterSystem](https://pixijs.download/release/docs/rendering.FilterSystem.html.md)
