import * as core from '@pixi/core';
import * as math from '@pixi/math';
import * as constants from '@pixi/constants';
import * as app from '@pixi/app';
import * as sprite from '@pixi/sprite';
import * as spritesheet from '@pixi/spritesheet';
import * as text from '@pixi/text';
import * as textBitmap from '@pixi/text-bitmap';
import * as graphics from '@pixi/graphics';
import * as spriteAnimated from '@pixi/sprite-animated';
import * as spriteTiling from '@pixi/sprite-tiling';
import * as display from '@pixi/display';
import * as mesh from '@pixi/mesh';
import * as ticker from '@pixi/ticker';
import * as interaction from '@pixi/interaction';
import * as extract from '@pixi/extract';
import * as prepare from '@pixi/prepare';
import * as accessibility from '@pixi/accessibility';
import * as loaders from '@pixi/loaders';
import * as utils from '@pixi/utils';
import { settings } from '@pixi/settings';
import { FXAAFilter } from '@pixi/filter-fxaa';
import { NoiseFilter } from '@pixi/filter-noise';
import { DisplacementFilter } from '@pixi/filter-displacement';
import { BlurFilter, BlurXFilter, BlurYFilter } from '@pixi/filter-blur';
import { ColorMatrixFilter } from '@pixi/filter-color-matrix';
import { AlphaFilter } from '@pixi/filter-alpha';
import '@pixi/mixin-cache-as-bitmap';
import '@pixi/mixin-get-child-by-name';
import '@pixi/mixin-get-global-position';
import '@pixi/mixin-app-loader';
import deprecated from './deprecated';

// Install renderer plugins
core.Renderer.registerPlugin('accessibility', accessibility.AccessibilityManager);
core.Renderer.registerPlugin('extract', extract.Extract);
core.Renderer.registerPlugin('graphics', graphics.GraphicsRenderer);
core.Renderer.registerPlugin('interaction', interaction.InteractionManager);
core.Renderer.registerPlugin('mesh', mesh.MeshRenderer);
core.Renderer.registerPlugin('prepare', prepare.Prepare);
core.Renderer.registerPlugin('sprite', sprite.SpriteRenderer);
core.Renderer.registerPlugin('tilingSprite', spriteTiling.TilingSpriteRenderer);

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
 * Alias for {@link PIXI.loaders.shared}.
 * @name loader
 * @memberof PIXI
 * @type {PIXI.loader.Loader}
 */
const loader = loaders.shared;

/**
 * @namespace PIXI
 */
const PIXI = {};

/**
 * This namespace contains WebGL-only display filters that can be applied
 * to DisplayObjects using the {@link PIXI.DisplayObject#filters filters} property.
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
    FXAAFilter,
    NoiseFilter,
    DisplacementFilter,
    BlurFilter,
    BlurXFilter,
    BlurYFilter,
    ColorMatrixFilter,
    AlphaFilter,
};

// Add to namespace window object for people doing `import 'pixi.js'`
if (typeof window !== 'undefined')
{
    const namespaces = {
        accessibility,
        extract,
        interaction,
        loaders,
        prepare,
        filters,
        utils,
        settings,
        loader,
    };

    window.PIXI = Object.assign(
        PIXI,
        namespaces, 
        core,
        math,
        constants,
        app,
        sprite,
        spritesheet,
        text,
        textBitmap,
        graphics,
        spriteAnimated,
        spriteTiling,
        display,
        mesh,
        ticker,
    );

    // Deprecations only apply to Window object
    deprecated(PIXI);
}

// Export ES for those importing specifically by name,
// e.g., `import {autoDetectRenderer} from 'pixi.js'`
export * from '@pixi/core';
export * from '@pixi/math';
export * from '@pixi/constants';
export * from '@pixi/app';
export * from '@pixi/sprite';
export * from '@pixi/spritesheet';
export * from '@pixi/text';
export * from '@pixi/text-bitmap';
export * from '@pixi/graphics';
export * from '@pixi/sprite-animated';
export * from '@pixi/sprite-tiling';
export * from '@pixi/display';
export * from '@pixi/mesh';
export * from '@pixi/ticker';
export {
    accessibility,
    extract,
    interaction,
    loaders,
    prepare,
    filters,
    loader,
    utils,
    settings,
    VERSION,
    PIXI,
};
