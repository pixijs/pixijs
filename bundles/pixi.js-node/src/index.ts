import { ResizePlugin } from '@pixi/app';
import { loadTextures, loadWebFont } from '@pixi/assets';
import { extensions, INSTALLED } from '@pixi/core';
import { AlphaFilter } from '@pixi/filter-alpha';
import { BlurFilter, BlurFilterPass } from '@pixi/filter-blur';
import { ColorMatrixFilter } from '@pixi/filter-color-matrix';
import { DisplacementFilter } from '@pixi/filter-displacement';
import { FXAAFilter } from '@pixi/filter-fxaa';
import { NoiseFilter } from '@pixi/filter-noise';
import '@pixi/mixin-cache-as-bitmap';
import '@pixi/mixin-get-child-by-name';
import '@pixi/mixin-get-global-position';
import { NodeCanvasResource } from './adapter';

// Remove the default loader plugins
extensions.remove(
    loadTextures,
    loadWebFont,
    ResizePlugin
);

// reset installed resources and remove resize plugin from Application
INSTALLED.length = 0;
INSTALLED.push(NodeCanvasResource);

export const filters = {
    AlphaFilter,
    BlurFilter,
    BlurFilterPass,
    ColorMatrixFilter,
    DisplacementFilter,
    FXAAFilter,
    NoiseFilter,
};

// Export ES for those importing specifically by name
export * from '@pixi/app';
export * from '@pixi/assets';
export * from '@pixi/core';
export * from '@pixi/display';
export * from '@pixi/extract';
export * from '@pixi/graphics';
export * from '@pixi/mesh';
export * from '@pixi/mesh-extras';
export * from '@pixi/particle-container';
export * from '@pixi/prepare';
export * from '@pixi/sprite';
export * from '@pixi/sprite-animated';
export * from '@pixi/sprite-tiling';
export * from '@pixi/spritesheet';
export * from '@pixi/text';
export * from '@pixi/text-bitmap';

// Export adapter
export * from './adapter';
