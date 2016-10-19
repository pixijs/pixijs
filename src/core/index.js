/**
 * @namespace PIXI
 */
export * from './const';
export * from './math';

import * as utils from './utils';
import * as ticker from './ticker';
import CanvasRenderer from './renderers/canvas/CanvasRenderer';
import WebGLRenderer from './renderers/webgl/WebGLRenderer';

export { utils, ticker, CanvasRenderer, WebGLRenderer };

export { default as glCore } from 'pixi-gl-core';

export { default as DisplayObject } from './display/DisplayObject';
export { default as Container } from './display/Container';
export { default as Transform } from './display/Transform';
export { default as TransformStatic } from './display/TransformStatic';
export { default as TransformBase } from './display/TransformBase';
export { default as Sprite } from './sprites/Sprite';
export { default as CanvasSpriteRenderer } from './sprites/canvas/CanvasSpriteRenderer';
export { default as CanvasTinter } from './sprites/canvas/CanvasTinter';
export { default as SpriteRenderer } from './sprites/webgl/SpriteRenderer';
export { default as Text } from './text/Text';
export { default as TextStyle } from './text/TextStyle';
export { default as Graphics } from './graphics/Graphics';
export { default as GraphicsData } from './graphics/GraphicsData';
export { default as GraphicsRenderer } from './graphics/webgl/GraphicsRenderer';
export { default as CanvasGraphicsRenderer } from './graphics/canvas/CanvasGraphicsRenderer';
export { default as Texture } from './textures/Texture';
export { default as BaseTexture } from './textures/BaseTexture';
export { default as RenderTexture } from './textures/RenderTexture';
export { default as BaseRenderTexture } from './textures/BaseRenderTexture';
export { default as VideoBaseTexture } from './textures/VideoBaseTexture';
export { default as TextureUvs } from './textures/TextureUvs';
export { default as CanvasRenderTarget } from './renderers/canvas/utils/CanvasRenderTarget';
export { default as Shader } from './Shader';
export { default as WebGLManager } from './renderers/webgl/managers/WebGLManager';
export { default as ObjectRenderer } from './renderers/webgl/utils/ObjectRenderer';
export { default as RenderTarget } from './renderers/webgl/utils/RenderTarget';
export { default as Quad } from './renderers/webgl/utils/Quad';
export { default as SpriteMaskFilter } from './renderers/webgl/filters/spriteMask/SpriteMaskFilter';
export { default as Filter } from './renderers/webgl/filters/Filter';

/**
 * This helper function will automatically detect which renderer you should be using.
 * WebGL is the preferred renderer as it is a lot faster. If webGL is not supported by
 * the browser then this function will return a canvas renderer
 *
 * @memberof PIXI
 * @param {number} [width=800] - the width of the renderers view
 * @param {number} [height=600] - the height of the renderers view
 * @param {object} [options] - The optional renderer parameters
 * @param {HTMLCanvasElement} [options.view] - the canvas to use as a view, optional
 * @param {boolean} [options.transparent=false] - If the render view is transparent, default false
 * @param {boolean} [options.antialias=false] - sets antialias (only applicable in chrome at the moment)
 * @param {boolean} [options.preserveDrawingBuffer=false] - enables drawing buffer preservation, enable this if you
 *      need to call toDataUrl on the webgl context
 * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer, retina would be 2
 * @param {boolean} [noWebGL=false] - prevents selection of WebGL renderer, even if such is present
 * @return {PIXI.WebGLRenderer|PIXI.CanvasRenderer} Returns WebGL renderer if available, otherwise CanvasRenderer
 */
export function autoDetectRenderer(width = 800, height = 600, options, noWebGL)
{
    if (!noWebGL && utils.isWebGLSupported())
    {
        return new WebGLRenderer(width, height, options);
    }

    return new CanvasRenderer(width, height, options);
}
