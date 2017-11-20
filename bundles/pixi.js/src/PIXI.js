export * from '@pixi/core';
export * from '@pixi/app';
export * from '@pixi/sprite';
export * from '@pixi/spritesheet';
export * from '@pixi/text';
export * from '@pixi/text-bitmap';
export * from '@pixi/graphics';
export * from '@pixi/sprite-animated';
export * from '@pixi/sprite-tiling';
export * from '@pixi/math';
export * from '@pixi/constants';
export * from '@pixi/display';
export * from '@pixi/mesh';
export * from '@pixi/ticker';
export * from '@pixi/particles';

import { Renderer } from '@pixi/core';
import * as interaction from '@pixi/interaction';
import * as extract from '@pixi/extract';
import * as prepare from '@pixi/prepare';
import { MeshRenderer } from '@pixi/mesh';
import { SpriteRenderer } from '@pixi/sprite';
import { TilingSpriteRenderer } from '@pixi/sprite-tiling';
import { GraphicsRenderer } from '@pixi/graphics';
import { ParticleRenderer } from '@pixi/particles';
import * as accessibility from '@pixi/accessibility';
import * as loaders from '@pixi/loaders';
import * as filters from './filters';
import * as utils from '@pixi/utils';
import { settings } from '@pixi/settings';

Renderer.registerPlugin('accessibility', accessibility.AccessibilityManager);
Renderer.registerPlugin('extract', extract.Extract);
Renderer.registerPlugin('graphics', GraphicsRenderer);
Renderer.registerPlugin('interaction', interaction.InteractionManager);
Renderer.registerPlugin('mesh', MeshRenderer);
Renderer.registerPlugin('prepare', prepare.Prepare);
Renderer.registerPlugin('sprite', SpriteRenderer);
Renderer.registerPlugin('tilingSprite', TilingSpriteRenderer);
Renderer.registerPlugin('particle', ParticleRenderer);

import '@pixi/mixin-cache-as-bitmap';
import '@pixi/mixin-get-child-by-name';
import '@pixi/mixin-get-global-position';
import '@pixi/mixin-app-loader';

utils.mixins.performMixins();

/**
 * Alias for {@link PIXI.loaders.shared}.
 * @name loader
 * @memberof PIXI
 * @type {PIXI.loader.Loader}
 */
export const loader = loaders.shared;

export {
    accessibility,
    extract,
    filters,
    interaction,
    loaders,
    prepare,
    utils,
    settings,
};
