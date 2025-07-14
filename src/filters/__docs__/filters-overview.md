---
title: Overview
category: filters
---

# Filters

PixiJS filters provide powerful post-processing effects that can be applied to any display object and its children. They enable visual effects ranging from basic color adjustments to complex shader-based operations.

## Basic Usage

Apply filters to any display object using its `filters` property:

```ts
import { Sprite, BlurFilter } from 'pixi.js';

const sprite = Sprite.from('image.png');

// Single filter
sprite.filters = new BlurFilter({ strength: 8 });

// Multiple filters (applied in sequence)
sprite.filters = [
    new BlurFilter({ strength: 8 }),
    new NoiseFilter({ noise: 0.5 })
];
```

## Built-in Filters

### Basic Filters

```ts
import {
    AlphaFilter,
    BlurFilter,
    ColorMatrixFilter,
    DisplacementFilter,
    NoiseFilter
} from 'pixi.js';

// Transparency
sprite.filters = new AlphaFilter({ alpha: 0.5 });

// Gaussian blur
sprite.filters = new BlurFilter({
    strength: 8,
    quality: 4,
    repeatEdgePixels: false
});

// Color transformation
sprite.filters = new ColorMatrixFilter();
filter.blackAndWhite(); // Preset effect

// Displacement mapping
const displacementSprite = Sprite.from('displacement.png');
sprite.filters = new DisplacementFilter({
    sprite: displacementSprite,
    scale: 20
});

// Random noise
sprite.filters = new NoiseFilter({ noise: 0.5 });
```

### Blend Modes

Advanced blend modes require importing the blend modes extension:

```ts
import 'pixi.js/advanced-blend-modes';
import {
    ColorBurnBlend,
    ColorDodgeBlend,
    HardMixBlend
} from 'pixi.js';

sprite.filters = [
    new ColorBurnBlend(),  // Darkens base colors
    new ColorDodgeBlend(), // Brightens base colors
    new HardMixBlend()     // High contrast blend
];
```

## Creating Custom Filters

Create custom filters using WebGL/WebGPU shaders:

```ts
import { Filter, GlProgram } from 'pixi.js';

// Define shader programs
const vertex = `
    in vec2 aPosition;
    out vec2 vTextureCoord;

    uniform vec4 uInputSize;
    uniform vec4 uOutputFrame;
    uniform vec4 uOutputTexture;

    void main(void) {
        gl_Position = vec4(aPosition * 2.0 - 1.0, 0.0, 1.0);
        vTextureCoord = aPosition;
    }
`;

const fragment = `
    in vec2 vTextureCoord;

    uniform sampler2D uTexture;
    uniform float uWaveAmplitude;
    uniform float uWaveFrequency;
    uniform float uTime;

    void main(void) {
        vec2 coord = vTextureCoord;

        // Create wave effect
        coord.x += sin(coord.y * uWaveFrequency + uTime) * uWaveAmplitude;

        gl_FragColor = texture(uTexture, coord);
    }
`;

// Create the filter
const waveFilter = new Filter({
    // Shader programs
    glProgram: new GlProgram({ vertex, fragment }),

    // Resources (uniforms, textures, etc)
    resources: {
        waveUniforms: {
            uWaveAmplitude: { value: 0.05, type: 'f32' },
            uWaveFrequency: { value: 10.0, type: 'f32' },
            uTime: { value: 0.0, type: 'f32' }
        }
    }
});

// Apply the filter
sprite.filters = [waveFilter];

// Animate the effect
app.ticker.add((time) => {
    waveFilter.resources.waveUniforms.uniforms.uTime += 0.1;
});
```

## Filter Performance

Optimize filter performance with these techniques:

```ts
// Limit filter area
sprite.filterArea = new Rectangle(0, 0, 100, 100);

// Reuse filter instances
const sharedBlur = new BlurFilter({ strength: 4 });
sprite1.filters = [sharedBlur];
sprite2.filters = [sharedBlur];

// Disable when not needed
sprite.filters = null;

// Use appropriate quality settings
const blur = new BlurFilter({
    strength: 8,
    quality: 2, // Lower quality for better performance
});
```

## Best Practices

- Apply filters sparingly - they impact performance
- Share filter instances when possible
- Set `filterArea` to limit processing area
- Use appropriate quality settings for blur filters
- Consider using sprite sheet frames instead of filters for static effects
- Clean up filters when destroying objects

## Related Documentation

- See {@link Filter} for base filter class
- See {@link FilterSystem} for rendering system
- See {@link AlphaFilter} for transparency
- See {@link BlurFilter} for Gaussian blur
- See {@link ColorMatrixFilter} for color transformations
- See {@link DisplacementFilter} for distortion effects
- See {@link NoiseFilter} for noise effects
- See [PixiJS Filters](https://pixijs.io/filters/docs/) for community filters
- See [Filter Demo](https://pixijs.io/filters/examples) for examples

For detailed implementation requirements and advanced usage, refer to the API documentation of individual filter classes.
