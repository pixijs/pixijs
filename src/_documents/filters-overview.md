---
title: Overview
category: filters
---

# Filters

Filters provide additional shading and post-processing effects to any display object and its children
they are attached to.
You attached filters to a display object using its `filters` array property.

```js
import { Sprite, BlurFilter, HardMixBlend } from 'pixi.js';
const sprite = Sprite.from('myTexture.png');
// single filter
sprite.filters = new BlurFilter({ strength: 8 });
// or multiple filters
sprite.filters = [new BlurFilter({ strength: 8 }), new HardMixBlend()];
```

Pixi has a number of built-in filters which can be used in your game or application:

-   {@link AlphaFilter} - Applies alpha to the display object and any of its children.
-   {@link BlurFilter} - Applies a Gaussian blur to the display object.
-   {@link BlurFilterPass} - Applies a blur pass to an object.
-   {@link ColorBurnBlend} - Blend mode to add color burn to display objects.
-   {@link ColorDodgeBlend} - Blend mode to add color dodge to display objects.
-   {@link ColorMatrixFilter} - Transform the color channels by matrix multiplication.
-   {@link DarkenBlend} - Blend mode to darken display objects.
-   {@link DisplacementFilter} - Applies a displacement map to distort an object.
-   {@link DivideBlend} - Blend mode to divide display objects.
-   {@link HardMixBlend} - Blend mode to hard mix display objects.
-   {@link LinearBurnBlend} - Blend mode to add linear burn to display objects.
-   {@link LinearDodgeBlend} - Blend mode to add linear dodge to display objects.
-   {@link LinearLightBlend} - Blend mode to add linear light to display objects.
-   {@link NoiseFilter} - Applies random noise to an object.
-   {@link PinLightBlend} - Blend mode to add pin light to display objects.
-   {@link SubtractBlend} - Blend mode to subtract display objects.

For more available filters, check out the [PixiJS Filters](https://pixijs.io/filters/docs/index.html) repository.
You can also check out the awesome [Filter Demo](https://pixijs.io/filters/examples) to see filters in action and combine them!
