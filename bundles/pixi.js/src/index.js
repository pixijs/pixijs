import * as accessibility from '@pixi/accessibility';
import * as app from '@pixi/app';
import * as constants from '@pixi/constants';
import * as core from '@pixi/core';
import * as display from '@pixi/display';
import * as extract from '@pixi/extract';
import * as graphics from '@pixi/graphics';
import * as interaction from '@pixi/interaction';
import * as loaders from '@pixi/loaders';
import * as math from '@pixi/math';
import * as mesh from '@pixi/mesh';
import * as meshExtras from '@pixi/mesh-extras';
import * as particles from '@pixi/particles';
import * as prepare from '@pixi/prepare';
import * as sprite from '@pixi/sprite';
import * as spriteAnimated from '@pixi/sprite-animated';
import * as spritesheet from '@pixi/spritesheet';
import * as spriteTiling from '@pixi/sprite-tiling';
import * as text from '@pixi/text';
import * as textBitmap from '@pixi/text-bitmap';
import * as ticker from '@pixi/ticker';
import * as utils from '@pixi/utils';
import { settings } from '@pixi/settings';
import { AlphaFilter } from '@pixi/filter-alpha';
import { BlurFilter, BlurFilterPass } from '@pixi/filter-blur';
import { ColorMatrixFilter } from '@pixi/filter-color-matrix';
import { DisplacementFilter } from '@pixi/filter-displacement';
import { FXAAFilter } from '@pixi/filter-fxaa';
import { NoiseFilter } from '@pixi/filter-noise';
import '@pixi/mixin-cache-as-bitmap';
import '@pixi/mixin-get-child-by-name';
import '@pixi/mixin-get-global-position';
import deprecated from './deprecated';

// Install renderer plugins
core.Renderer.registerPlugin('accessibility', accessibility.AccessibilityManager);
core.Renderer.registerPlugin('extract', extract.Extract);
core.Renderer.registerPlugin('graphics', graphics.GraphicsRenderer);
core.Renderer.registerPlugin('interaction', interaction.InteractionManager);
core.Renderer.registerPlugin('mesh', mesh.MeshRenderer);
core.Renderer.registerPlugin('particle', particles.ParticleRenderer);
core.Renderer.registerPlugin('prepare', prepare.Prepare);
core.Renderer.registerPlugin('sprite', sprite.SpriteRenderer);
core.Renderer.registerPlugin('tilingSprite', spriteTiling.TilingSpriteRenderer);

loaders.Loader.registerPlugin(textBitmap.BitmapFontLoader);
loaders.Loader.registerPlugin(spritesheet.SpritesheetLoader);

app.Application.registerPlugin(ticker.TickerPlugin);
app.Application.registerPlugin(loaders.LoaderPlugin);

// Apply deplayed mixins
utils.mixins.performMixins();

/**
 * String of the current PIXI version.
 *
 * @static
 * @constant
 * @memberof PIXI
 * @name VERSION
 * @type {string}
 */
const VERSION = '__VERSION__';

/**
 * @namespace PIXI
 */
const PIXI = { VERSION };

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
const filters = {
    AlphaFilter,
    BlurFilter,
    BlurFilterPass,
    ColorMatrixFilter,
    DisplacementFilter,
    FXAAFilter,
    NoiseFilter,
};

// Add to namespace window object for people doing `import 'pixi.js'`
if (typeof window !== 'undefined')
{
    const namespaces = {
        accessibility,
        extract,
        filters,
        interaction,
        prepare,
        settings,
        utils,
    };

    window.PIXI = Object.assign(
        PIXI,
        namespaces,
        app,
        constants,
        core,
        display,
        graphics,
        loaders,
        math,
        mesh,
        meshExtras,
        particles,
        sprite,
        spriteAnimated,
        spritesheet,
        spriteTiling,
        text,
        textBitmap,
        ticker
    );

    // Deprecations only apply to Window object
    deprecated(PIXI);
}

// Export ES for those importing specifically by name,
// e.g., `import {autoDetectRenderer} from 'pixi.js'`
export * from '@pixi/app';
export * from '@pixi/constants';
export * from '@pixi/core';
export * from '@pixi/display';
export * from '@pixi/graphics';
export * from '@pixi/loaders';
export * from '@pixi/math';
export * from '@pixi/mesh';
export * from '@pixi/mesh-extras';
export * from '@pixi/particles';
export * from '@pixi/sprite';
export * from '@pixi/spritesheet';
export * from '@pixi/sprite-animated';
export * from '@pixi/sprite-tiling';
export * from '@pixi/text';
export * from '@pixi/text-bitmap';
export * from '@pixi/ticker';
export {
    PIXI,
    VERSION,
    accessibility,
    extract,
    filters,
    interaction,
    prepare,
    settings,
    utils,
};
