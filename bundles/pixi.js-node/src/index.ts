import { ResizePlugin } from '@pixi/app';
import { loadTextures, loadWebFont } from '@pixi/assets';
import { extensions, INSTALLED } from '@pixi/core';
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

// Export ES for those importing specifically by name
export * from '@pixi/app';
export * from '@pixi/assets';
export * from '@pixi/core';
export * from '@pixi/display';
export * from '@pixi/extract';
export * from '@pixi/filter-alpha';
export * from '@pixi/filter-blur';
export * from '@pixi/filter-color-matrix';
export * from '@pixi/filter-displacement';
export * from '@pixi/filter-fxaa';
export * from '@pixi/filter-noise';
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
