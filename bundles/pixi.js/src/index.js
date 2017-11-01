// import polyfills. Done as an export to make sure polyfills are imported first
import '@pixi/polyfill';

import { FXAAFilter } from '@pixi/filter-fxaa';
import { NoiseFilter } from '@pixi/filter-noise';
import { DisplacementFilter } from '@pixi/filter-displacement';
import { ColorMatrixFilter } from '@pixi/filter-color-matrix';
import { AlphaFilter } from '@pixi/filter-alpha';
import { BlurFilter,
    BlurXFilter,
    BlurYFilter } from '@pixi/filter-blur';
import { InteractionData,
    InteractionManager,
    InteractionTrackingData,
    InteractionEvent } from '@pixi/interaction';
import { AccessibilityManager } from '@pixi/accessibility';
import { Loader,
    shared as sharedLoader,
    bitmapFontParser,
    parseBitmapFontData,
    spritesheetParser,
    getResourcePath,
    textureParser,
    Resource } from '@pixi/loaders';
import { Mesh,
    RawMesh,
    MeshRenderer,
    CanvasMeshRenderer,
    Plane,
    NineSlicePlane,
    Rope } from '@pixi/mesh';
import { webgl as WebGLExtract,
    canvas as CanvasExtract } from '@pixi/extract';
import { webgl as WebGLPrepare,
    canvas as CanvasPrepare,
    BasePrepare,
    CountLimiter,
    TimeLimiter } from '@pixi/prepare';
import { shared as sharedTicker,
    Ticker,
    UPDATE_PRIORITY } from '@pixi/ticker';
import { settings } from '@pixi/settings';
// import { ParticleContainer,
// ParticleRenderer } from '@pixi/particles';
import {
    isMobile,
    removeItems,
    EventEmitter,
    skipHello,
    isWebGLSupported,
    hex2rgb,
    hex2string,
    rgb2hex,
    premultiplyBlendMode,
    correctBlendMode,
    premultiplyRgba,
    premultiplyTint,
    premultiplyTintToRgba,
    createIndicesForQuads,
    uid,
    sign,
    ProgramCache,
    TextureCache,
    BaseTextureCache,
    destroyTextureCache,
    clearTextureCache,
    trimCanvas,
    decomposeDataUri,
    determineCrossOrigin,
    getResolutionOfUrl,
    mixins,
    DATA_URI,
} from '@pixi/utils';

// imported for side effect of extending the prototype only, contains no exports
import '@pixi/mixin-cache-as-bitmap';
import '@pixi/mixin-get-child-by-name';
import '@pixi/mixin-get-global-position';

// export core
export * from '@pixi/core';
export * from '@pixi/app';
export * from '@pixi/sprite';
export * from '@pixi/spritesheet';
export * from '@pixi/text';
export * from '@pixi/text-bitmap';
export * from '@pixi/graphics';
export * from '@pixi/sprite-animated';
export * from '@pixi/sprite-tiling';

// handle mixins now, after all code has been added
mixins.performMixins();

/**
 * Alias for {@link PIXI.loaders.shared}.
 * @name loader
 * @memberof PIXI
 * @type {PIXI.loader.Loader}
 */
export const loader = sharedLoader;

export const ticker = {
    shared: sharedTicker,
    Ticker,
    UPDATE_PRIORITY,
};

export { settings };

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
export const filters = {
    FXAAFilter,
    NoiseFilter,
    DisplacementFilter,
    BlurFilter,
    BlurXFilter,
    BlurYFilter,
    ColorMatrixFilter,
    AlphaFilter,
};

export const interaction = {
    InteractionData,
    InteractionManager,
    InteractionTrackingData,
    InteractionEvent,
};

export const accessibility = {
    AccessibilityManager,
};

export const loaders = {
    Loader,
    shared: sharedLoader,
    bitmapFontParser,
    parseBitmapFontData,
    spritesheetParser,
    getResourcePath,
    textureParser,
    Resource,
};

export const mesh = {
    Mesh,
    RawMesh,
    MeshRenderer,
    CanvasMeshRenderer,
    Plane,
    NineSlicePlane,
    Rope,
};

export const extract = {
    WebGLExtract,
    CanvasExtract,
};

export const prepare = {
    WebGLPrepare,
    CanvasPrepare,
    BasePrepare,
    CountLimiter,
    TimeLimiter,
};

// export const particles = {
//     ParticleRenderer,
//     ParticleContainer,
// };

export const utils = {
    isMobile,
    removeItems,
    EventEmitter,
    skipHello,
    isWebGLSupported,
    hex2rgb,
    hex2string,
    rgb2hex,
    premultiplyBlendMode,
    correctBlendMode,
    premultiplyRgba,
    premultiplyTint,
    premultiplyTintToRgba,
    createIndicesForQuads,
    uid,
    sign,
    ProgramCache,
    TextureCache,
    BaseTextureCache,
    destroyTextureCache,
    clearTextureCache,
    trimCanvas,
    decomposeDataUri,
    determineCrossOrigin,
    getResolutionOfUrl,
    mixins,
    DATA_URI,
};

// Export to window object
global.PIXI = exports; // eslint-disable-line

// Import deprecations, these are excuted in
// the Rollup outro, see rollup.config.js
import deprecation from './deprecation';
export { deprecation };
