import './adapter';

import { BatchRenderer, extensions, INSTALLED } from '@pixi/core';
import { Extract } from '@pixi/extract';
import { AlphaFilter } from '@pixi/filter-alpha';
import { BlurFilter, BlurFilterPass } from '@pixi/filter-blur';
import { ColorMatrixFilter } from '@pixi/filter-color-matrix';
import { DisplacementFilter } from '@pixi/filter-displacement';
import { FXAAFilter } from '@pixi/filter-fxaa';
import { NoiseFilter } from '@pixi/filter-noise';
import '@pixi/mixin-cache-as-bitmap';
import '@pixi/mixin-get-child-by-name';
import '@pixi/mixin-get-global-position';
import { ParticleRenderer } from '@pixi/particle-container';
import { Prepare } from '@pixi/prepare';
import { TilingSpriteRenderer } from '@pixi/sprite-tiling';
import { TickerPlugin } from '@pixi/ticker';
import * as utils from '@pixi/utils';
// eslint-disable-next-line @typescript-eslint/no-duplicate-imports
import { loadNodeBase64, loadNodeBitmapFont, loadNodeFont, loadNodeTexture, NodeCanvasResource } from './adapter';
import { loadBitmapFont, loadTextures, loadWebFont } from '@pixi/assets';
import { ResizePlugin } from '@pixi/app';

// Remove the default loader plugins
extensions.remove(
    loadTextures,
    loadWebFont,
    loadBitmapFont,
    ResizePlugin
);
extensions.add(
    // Install renderer plugins
    Extract,
    ParticleRenderer,
    Prepare,
    BatchRenderer,
    TilingSpriteRenderer,

    // Install application plugins
    TickerPlugin,

    // Install loader plugins
    loadNodeTexture,
    loadNodeBase64,
    loadNodeFont,
    loadNodeBitmapFont
);

// reset installed resources and remove resize plugin from Application
INSTALLED.length = 0;
INSTALLED.push(NodeCanvasResource);

export const VERSION = '$_VERSION';

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
export * from '@pixi/app';
export * from './adapter';
export * from '@pixi/assets';
export * from '@pixi/constants';
export * from '@pixi/core';
export * from '@pixi/display';
export * from '@pixi/extract';
export * from '@pixi/graphics';
export * from '@pixi/math';
export * from '@pixi/mesh';
export * from '@pixi/mesh-extras';
export * from '@pixi/particle-container';
export * from '@pixi/prepare';
export * from '@pixi/runner';
export * from '@pixi/settings';
export * from '@pixi/sprite';
export * from '@pixi/sprite-animated';
export * from '@pixi/sprite-tiling';
export * from '@pixi/spritesheet';
export * from '@pixi/text';
export * from '@pixi/text-bitmap';
export * from '@pixi/ticker';
export { utils };

