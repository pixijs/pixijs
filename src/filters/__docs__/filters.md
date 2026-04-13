---
title: Overview
category: filters
description: Learn how to apply post-processing effects like blur, color adjustments, noise, displacement, and custom shaders to display objects in PixiJS.
---

# Filters

Filters apply post-processing effects to any display object and its children. Use them for blurring, color adjustments, noise, displacement, or custom shader-based effects.

```ts
import { Assets, Sprite, BlurFilter, NoiseFilter } from 'pixi.js';

const texture = await Assets.load('photo.png');
const sprite = new Sprite(texture);

// Single filter
sprite.filters = new BlurFilter({ strength: 8 });

// Multiple filters (applied in sequence)
sprite.filters = [
    new BlurFilter({ strength: 8 }),
    new NoiseFilter({ noise: 0.5 }),
];
```

> [!NOTE]
> Filter order matters. They're applied in array order, so each filter processes the output of the previous one.

---

## Built-in filters

PixiJS ships with five built-in filters:

| Filter | Purpose |
| --- | --- |
| {@link AlphaFilter} | Applies uniform transparency |
| {@link BlurFilter} | Gaussian blur |
| {@link ColorMatrixFilter} | Color transformations via a 5x4 matrix |
| {@link DisplacementFilter} | Distorts using a displacement map texture |
| {@link NoiseFilter} | Adds random noise for a grainy look |

### AlphaFilter

```ts
import { AlphaFilter } from 'pixi.js';

sprite.filters = new AlphaFilter({ alpha: 0.5 });
```

### BlurFilter

```ts
import { BlurFilter } from 'pixi.js';

sprite.filters = new BlurFilter({
    strength: 8,      // blur intensity (default: 8)
    quality: 4,        // number of blur passes (default: 4)
    kernelSize: 5,     // kernel size (default: 5)
});
```

You can also blur on a single axis with `strengthX` / `strengthY`.

### ColorMatrixFilter

```ts
import { ColorMatrixFilter } from 'pixi.js';

const colorMatrix = new ColorMatrixFilter();

colorMatrix.brightness(0.5, false);
colorMatrix.contrast(0.8, false);
colorMatrix.saturate(1.2, true); // true = multiply with current matrix

sprite.filters = colorMatrix;
```

Available presets: `brightness`, `contrast`, `saturate`, `desaturate`, `greyscale`, `blackAndWhite`, `hue`, `negative`, `sepia`, `technicolor`, `polaroid`, `toBGR`, `kodachrome`, `browni`, `vintage`, `colorTone`, `night`, `predator`, `lsd`, `reset`.

### DisplacementFilter

```ts
import { Sprite, DisplacementFilter } from 'pixi.js';

const displacementSprite = Sprite.from('displacement-map.png');

sprite.filters = new DisplacementFilter({
    sprite: displacementSprite,
    scale: 20,
});
```

### NoiseFilter

```ts
import { NoiseFilter } from 'pixi.js';

sprite.filters = new NoiseFilter({
    noise: 0.5,                // noise intensity (default: 0.5)
    seed: Math.random(),       // random seed (default: Math.random())
});
```

---

## Advanced blend modes

PixiJS provides advanced blend modes through a separate import. These register as blend modes on containers, not as filters you apply directly.

```ts
import 'pixi.js/advanced-blend-modes';

sprite.blendMode = 'color-burn';
```

Available blend modes after importing:

| Blend mode string | Class |
| --- | --- |
| `'color'` | {@link ColorBlend} |
| `'color-burn'` | {@link ColorBurnBlend} |
| `'color-dodge'` | {@link ColorDodgeBlend} |
| `'darken'` | {@link DarkenBlend} |
| `'difference'` | {@link DifferenceBlend} |
| `'divide'` | {@link DivideBlend} |
| `'exclusion'` | {@link ExclusionBlend} |
| `'hard-light'` | {@link HardLightBlend} |
| `'hard-mix'` | {@link HardMixBlend} |
| `'lighten'` | {@link LightenBlend} |
| `'linear-burn'` | {@link LinearBurnBlend} |
| `'linear-dodge'` | {@link LinearDodgeBlend} |
| `'linear-light'` | {@link LinearLightBlend} |
| `'luminosity'` | {@link LuminosityBlend} |
| `'negation'` | {@link NegationBlend} |
| `'overlay'` | {@link OverlayBlend} |
| `'pin-light'` | {@link PinLightBlend} |
| `'saturation'` | {@link SaturationBlend} |
| `'soft-light'` | {@link SoftLightBlend} |
| `'subtract'` | {@link SubtractBlend} |
| `'vivid-light'` | {@link VividLightBlend} |

---

## Custom filters

Create custom filters with GLSL shaders. PixiJS v8 uses GLSL ES 3.0 style (`in`/`out` instead of `attribute`/`varying`, `texture()` instead of `texture2D`).

### Using `Filter.from()`

The simplest way to create a custom filter. You usually only need a fragment shader; PixiJS provides a default vertex shader that handles positioning. Pass `undefined` for the vertex to use the default:

```ts
const simpleFilter = Filter.from({
    gl: {
        fragment: `
            in vec2 vTextureCoord;
            out vec4 finalColor;
            uniform sampler2D uTexture;

            void main(void) {
                vec4 color = texture(uTexture, vTextureCoord);
                finalColor = vec4(1.0 - color.rgb, color.a); // invert colors
            }
        `,
    },
    resources: {},
});
```

For full control over both vertex and fragment shaders:

```ts
import { Filter } from 'pixi.js';

const waveFilter = Filter.from({
    gl: {
        vertex: `
            in vec2 aPosition;
            out vec2 vTextureCoord;

            uniform vec4 uInputSize;
            uniform vec4 uOutputFrame;
            uniform vec4 uOutputTexture;

            vec4 filterVertexPosition(void)
            {
                vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
                position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
                position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
                return vec4(position, 0.0, 1.0);
            }

            vec2 filterTextureCoord(void)
            {
                return aPosition * (uOutputFrame.zw * uInputSize.zw);
            }

            void main(void)
            {
                gl_Position = filterVertexPosition();
                vTextureCoord = filterTextureCoord();
            }
        `,
        fragment: `
            in vec2 vTextureCoord;

            out vec4 finalColor;

            uniform sampler2D uTexture;
            uniform float uWaveAmplitude;
            uniform float uWaveFrequency;
            uniform float uTime;

            void main(void)
            {
                vec2 coord = vTextureCoord;
                coord.x += sin(coord.y * uWaveFrequency + uTime) * uWaveAmplitude;
                finalColor = texture(uTexture, coord);
            }
        `,
    },
    resources: {
        waveUniforms: {
            uWaveAmplitude: { value: 0.05, type: 'f32' },
            uWaveFrequency: { value: 10.0, type: 'f32' },
            uTime: { value: 0.0, type: 'f32' },
        },
    },
});

sprite.filters = [waveFilter];

app.ticker.add((ticker) => {
    waveFilter.resources.waveUniforms.uniforms.uTime += 0.1 * ticker.deltaTime;
});
```

### Using `new Filter()` with pre-built programs

For more control, construct `GlProgram` and `GpuProgram` objects yourself:

```ts
import { Filter, GlProgram } from 'pixi.js';

const glProgram = new GlProgram({ vertex: vertexSrc, fragment: fragmentSrc });

const filter = new Filter({
    glProgram,
    resources: {
        timeUniforms: {
            uTime: { value: 0.0, type: 'f32' },
        },
    },
});
```

### Shader conventions

- Use `out vec4 finalColor;` in fragment shaders (not `gl_FragColor`)
- Use `texture()` to sample textures (not `texture2D`)
- The default vertex shader uses `filterVertexPosition()` and `filterTextureCoord()` helpers to handle output frame positioning
- Uniforms declared in `resources` are accessible at `filter.resources.<groupName>.uniforms.<uniformName>`

> [!NOTE]
> For dual-renderer support (WebGL + WebGPU), include both a `glProgram` and a `gpuProgram`.

### Filter options

All filters accept these base options:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `blendMode` | `string` | `'normal'` | Blend mode for filter output |
| `resolution` | `number \| 'inherit'` | `1` | Render resolution |
| `padding` | `number` | `0` | Extra pixels around the filter area |
| `antialias` | `FilterAntialias \| boolean` | `'off'` | Anti-aliasing mode |
| `blendRequired` | `boolean` | `false` | Whether blending with background is needed |
| `clipToViewport` | `boolean` | `true` | Clip filter to viewport bounds |

---

## Performance

- **Limit filter area**: By default, PixiJS computes the filter area from the object's bounds each frame. Set `sprite.filterArea` to a fixed `Rectangle` to skip this calculation and reduce the processed region.
- **Share filter instances**: The same filter instance can be assigned to multiple objects
- **Remove when unused**: Set `sprite.filters = null` to skip filter processing entirely
- **Tune quality**: Lower `quality` on `BlurFilter` reduces passes
- **Prefer sprite sheets**: For static effects, bake them into textures instead of using runtime filters

```ts
import { Rectangle, BlurFilter } from 'pixi.js';

// Constrain filter processing to a 200x200 area
sprite.filterArea = new Rectangle(0, 0, 200, 200);

// Share a single blur across multiple sprites
const sharedBlur = new BlurFilter({ strength: 4 });
sprite1.filters = [sharedBlur];
sprite2.filters = [sharedBlur];
```

---

## API reference

- {@link Filter} - Base filter class
- {@link FilterSystem} - Rendering system for filters
- {@link AlphaFilter} - Transparency filter
- {@link BlurFilter} - Gaussian blur filter
- {@link ColorMatrixFilter} - Color transformation filter
- {@link DisplacementFilter} - Displacement map filter
- {@link NoiseFilter} - Noise filter
