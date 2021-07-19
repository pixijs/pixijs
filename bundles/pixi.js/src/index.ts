import '@pixi/polyfill';

import * as utils from '@pixi/utils';
import { AccessibilityManager } from '@pixi/accessibility';
import { InteractionManager } from '@pixi/interaction';
import { Application } from '@pixi/app';
import { Renderer, BatchRenderer } from '@pixi/core';
import { Extract } from '@pixi/extract';
import { Loader, AppLoaderPlugin } from '@pixi/loaders';
import { CompressedTextureLoader, DDSLoader, KTXLoader } from '@pixi/compressed-textures';
import { ParticleRenderer } from '@pixi/particle-container';
import { Prepare } from '@pixi/prepare';
import { SpritesheetLoader } from '@pixi/spritesheet';
import { TilingSpriteRenderer } from '@pixi/sprite-tiling';
import { BitmapFontLoader } from '@pixi/text-bitmap';
import { TickerPlugin } from '@pixi/ticker';
import { AlphaFilter } from '@pixi/filter-alpha';
import { BlurFilter, BlurFilterPass } from '@pixi/filter-blur';
import { ColorMatrixFilter } from '@pixi/filter-color-matrix';
import { DisplacementFilter } from '@pixi/filter-displacement';
import { FXAAFilter } from '@pixi/filter-fxaa';
import { NoiseFilter } from '@pixi/filter-noise';
import '@pixi/mixin-cache-as-bitmap';
import '@pixi/mixin-get-child-by-name';
import '@pixi/mixin-get-global-position';

// Install renderer plugins
Renderer.registerPlugin('accessibility', AccessibilityManager);
Renderer.registerPlugin('extract', Extract);
Renderer.registerPlugin('interaction', InteractionManager);
Renderer.registerPlugin('particle', ParticleRenderer);
Renderer.registerPlugin('prepare', Prepare);
Renderer.registerPlugin('batch', BatchRenderer);
Renderer.registerPlugin('tilingSprite', TilingSpriteRenderer);

// Install loader plugins
Loader.registerPlugin(BitmapFontLoader);
Loader.registerPlugin(CompressedTextureLoader);
Loader.registerPlugin(DDSLoader);
Loader.registerPlugin(KTXLoader);
Loader.registerPlugin(SpritesheetLoader);

// Install application plugins
Application.registerPlugin(TickerPlugin);
Application.registerPlugin(AppLoaderPlugin);

/**
 * String of the current PIXI version.
 *
 * @static
 * @constant
 * @memberof PIXI
 * @name VERSION
 * @type {string}
 */
export const VERSION = '$_VERSION';

/**
 * @namespace PIXI
 */

/**
 * This namespace contains WebGL-only display filters that can be applied
 * to DisplayObjects using the {@link PIXI.DisplayObject#filters filters} property.
 *
 * Since PixiJS only had a handful of built-in filters, additional filters
 * can be downloaded {@link https://github.com/pixijs/pixi-filters here} from the
 * PixiJS Filters repository.
 *
 * All filters must extend {@link PIXI.Filter}.
 *
 * @example
 * // Create a new application
 * const app = new PIXI.Application();
 *
 * // Draw a green rectangle
 * const rect = new PIXI.Graphics()
 *     .beginFill(0x00ff00)
 *     .drawRect(40, 40, 200, 200);
 *
 * // Add a blur filter
 * rect.filters = [new PIXI.filters.BlurFilter()];
 *
 * // Display rectangle
 * app.stage.addChild(rect);
 * document.body.appendChild(app.view);
 * @namespace PIXI.filters
 */
export const filters = {
    AlphaFilter,
    BlurFilter,
    BlurFilterPass,
    ColorMatrixFilter,
    DisplacementFilter,
    FXAAFilter,
    NoiseFilter,
};

// Export ES for those importing specifically by name,
export * from '@pixi/accessibility';
export * from '@pixi/app';
export * from '@pixi/constants';
export * from '@pixi/compressed-textures';
export * from '@pixi/core';
export * from '@pixi/display';
export * from '@pixi/extract';
export * from '@pixi/graphics';
export * from '@pixi/loaders';
export * from '@pixi/interaction';
export * from '@pixi/math';
export * from '@pixi/mesh';
export * from '@pixi/mesh-extras';
export * from '@pixi/particle-container';
export * from '@pixi/prepare';
export * from '@pixi/runner';
export * from '@pixi/sprite';
export * from '@pixi/spritesheet';
export * from '@pixi/sprite-animated';
export * from '@pixi/sprite-tiling';
export * from '@pixi/text';
export * from '@pixi/text-bitmap';
export * from '@pixi/ticker';
export * from '@pixi/settings';
export { utils };
