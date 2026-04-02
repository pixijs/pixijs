---
name: filters
description: >
  Apply visual filters in PixiJS. Filter class with glProgram/gpuProgram
  and resources (not uniforms for textures). Built-in filters: AlphaFilter,
  BlurFilter, ColorMatrixFilter, DisplacementFilter, NoiseFilter. Custom
  filter creation via Filter.from() or new Filter(). Filter resolution,
  padding, antialias, blendRequired. filterArea optimization. Community
  pixi-filters package via pixi-filters/{name} imports. Use when the user
  asks about blur, glow, drop shadow, color matrix, brightness, contrast,
  grayscale, displacement map, noise, custom shaders, GLSL filters,
  post-processing effects, pixi-filters, or filter performance. Covers
  Filter, GlProgram, GpuProgram, AlphaFilter, BlurFilter, ColorMatrixFilter,
  DisplacementFilter, NoiseFilter.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  requires: "pixijs, core-concepts"
  sources: "pixijs/pixijs:src/filters/Filter.ts, pixijs/pixijs:src/filters/__docs__/filters.md, pixijs/pixijs:src/__docs__/migrations/v8.md"
---

## When to Use This Skill

Apply when adding visual effects to display objects via the filter pipeline, writing custom GLSL/WGSL shaders for filters, or using community filter packages.

**Related skills:** For custom shader programs and uniform types use **custom-rendering**; for blend mode interactions use **blend-modes**; for filter performance tuning use **performance**.

This skill builds on pixijs and core-concepts. Read them first.

## Setup

```ts
import { BlurFilter, Sprite, Assets } from 'pixi.js';

const texture = await Assets.load('bunny.png');
const sprite = new Sprite(texture);

sprite.filters = new BlurFilter({ strength: 8 });
```

Filters are assigned to `container.filters` as a single filter or an array. Multiple filters chain in order. Setting `filters` to `null` or `[]` removes them.

## Core Patterns

### Built-in filters

```ts
import {
    AlphaFilter, BlurFilter, ColorMatrixFilter,
    DisplacementFilter, NoiseFilter, Assets, Sprite,
} from 'pixi.js';

// Alpha (uniform transparency without per-child layering)
const alpha = new AlphaFilter({ alpha: 0.5 });

// Blur
const blur = new BlurFilter({ strength: 4, quality: 4 });

// Color matrix (brightness, contrast, grayscale, etc.)
const colorMatrix = new ColorMatrixFilter();
colorMatrix.brightness(1.5, false);

// Displacement
const displacementTexture = await Assets.load('displacement_map.png');
const displacementSprite = new Sprite(displacementTexture);
const displacement = new DisplacementFilter({
    sprite: displacementSprite,
    scale: 20,
});

// Noise
const noise = new NoiseFilter({ noise: 0.5 });

sprite.filters = [blur, colorMatrix];
```

### Custom filter with Filter.from()

The simplest way to create a custom filter. Only a fragment shader is needed; PixiJS provides a default vertex shader.

```ts
import { Filter } from 'pixi.js';

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
            uTime: { value: 0, type: 'f32' },
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
import { Filter, GlProgram } from 'pixi.js';

const glProgram = GlProgram.from({ fragment: fragmentSrc, vertex: vertexSrc });

const filter = new Filter({
    glProgram,
    resources: {
        timeUniforms: {
            uTime: { value: 0, type: 'f32' },
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
import { Filter, GlProgram, Rectangle } from 'pixi.js';

const filter = new Filter({
    glProgram: GlProgram.from({ fragment }),
    resources: {},
    resolution: 0.5,        // half-res for performance
    padding: 10,            // extra pixels for effects that extend bounds
    antialias: 'inherit',   // 'on' | 'off' | 'inherit'
    blendMode: 'normal',
    blendRequired: false,   // true if shader needs uBackTexture
    clipToViewport: true,
});

// Optimization: set known bounds to avoid per-frame measurement
container.filterArea = new Rectangle(0, 0, 800, 600);
```

### Community filters (pixi-filters)

```ts
import { AdjustmentFilter } from 'pixi-filters/adjustment';
import { GlowFilter } from 'pixi-filters/glow';

sprite.filters = [
    new AdjustmentFilter({ brightness: 1.2, contrast: 1.1 }),
    new GlowFilter({ distance: 15, outerStrength: 2 }),
];
```

For v8, community filters use `pixi-filters/{name}` imports, not the old `@pixi/filter-*` packages.

## Common Mistakes

### [CRITICAL] Using old Filter constructor (vertex, fragment, uniforms)

Wrong:
```ts
import { Filter } from 'pixi.js';

const filter = new Filter(vertex, fragment, { uTime: 0 });
```

Correct:
```ts
import { Filter, GlProgram } from 'pixi.js';

const filter = new Filter({
    glProgram: GlProgram.from({ fragment, vertex }),
    resources: {
        timeUniforms: { uTime: { value: 0, type: 'f32' } },
    },
});
```

v8 uses an options object. Shaders must be wrapped in `GlProgram.from()` or `GpuProgram.from()`. Uniforms are grouped in `resources` with explicit types. Textures are resources, not uniforms.

Source: src/__docs__/migrations/v8.md

### [HIGH] Using @pixi/filter-* packages for v8

Wrong:
```ts
import { AdjustmentFilter } from '@pixi/filter-adjustment';
```

Correct:
```ts
import { AdjustmentFilter } from 'pixi-filters/adjustment';
```

`@pixi/filter-*` packages are v7 only. For v8, the community filters package restructured to `pixi-filters/{name}`.

Source: src/__docs__/migrations/v8.md

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

Source: src/__docs__/concepts/performance-tips.md

### [MEDIUM] Not setting filterArea for known-size containers

Without `filterArea`, PixiJS measures the container bounds every frame via `getGlobalBounds()`, which recursively walks all children. For containers with known dimensions, set `filterArea` to avoid this cost:

```ts
import { Rectangle } from 'pixi.js';

container.filterArea = new Rectangle(0, 0, 800, 600);
container.filters = [someFilter];
```

Source: src/__docs__/concepts/performance-tips.md

---

See also: custom-rendering (shader details, uniform types), blend-modes (blend mode interaction), performance (filter optimization), migration-v8 (upgrading from v7)

## Learn More

- [Filter](https://pixijs.download/release/docs/filters.Filter.html.md)
- [AlphaFilter](https://pixijs.download/release/docs/filters.AlphaFilter.html.md)
- [BlurFilter](https://pixijs.download/release/docs/filters.BlurFilter.html.md)
- [ColorMatrixFilter](https://pixijs.download/release/docs/filters.ColorMatrixFilter.html.md)
- [DisplacementFilter](https://pixijs.download/release/docs/filters.DisplacementFilter.html.md)
- [NoiseFilter](https://pixijs.download/release/docs/filters.NoiseFilter.html.md)
