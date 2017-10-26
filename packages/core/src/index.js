/**
 * @namespace PIXI
 */

/**
 * String of the current PIXI version.
 *
 * @static
 * @constant
 * @memberof PIXI
 * @name VERSION
 * @type {string}
 */
export const VERSION = '__VERSION__';

export * from '@pixi/math';
import * as utils from '@pixi/utils';
import * as ticker from '@pixi/ticker';
import { settings } from '@pixi/settings';
import CanvasRenderer from './renderers/canvas/CanvasRenderer';
import WebGLRenderer from './renderers/webgl/WebGLRenderer';

export { settings, utils, ticker, CanvasRenderer, WebGLRenderer };

export { default as FrameBuffer } from './textures/FrameBuffer';
export { default as CubeTexture } from './textures/CubeTexture';
export { default as BaseTexture } from './textures/BaseTexture';
export { default as ImageResource } from './textures/resources/ImageResource';
export { default as ArrayTexture } from './textures/ArrayTexture';
export { default as Texture } from './textures/Texture';
export { default as TextureMatrix } from './textures/TextureMatrix';
export { default as RenderTexture } from './textures/RenderTexture';
export { default as BaseRenderTexture } from './textures/BaseRenderTexture';
export { default as VideoBaseTexture } from './textures/VideoBaseTexture';
export { default as TextureUvs } from './textures/TextureUvs';
export { default as CanvasRenderTarget } from './renderers/canvas/utils/CanvasRenderTarget';
export { default as canUseNewCanvasBlendModes } from './renderers/canvas/utils/canUseNewCanvasBlendModes';
export { default as WebGLSystem } from './renderers/webgl/systems/WebGLSystem';
export { default as State } from './renderers/webgl/State';
export { default as ObjectRenderer } from './renderers/webgl/utils/ObjectRenderer';
export { default as RenderTarget } from './renderers/webgl/utils/RenderTarget';
export { default as Quad } from './renderers/webgl/utils/Quad';
export { default as checkMaxIfStatmentsInShader } from './renderers/webgl/utils/checkMaxIfStatmentsInShader';
export { default as Shader } from './shader/Shader';
export { default as Program } from './shader/Program';
export { default as UniformGroup } from './shader/UniformGroup';
export { default as SpriteMaskFilter } from './renderers/webgl/filters/spriteMask/SpriteMaskFilter';
export { default as Filter } from './renderers/webgl/filters/Filter';
export { default as Application } from './Application';
export { autoDetectRenderer } from './autoDetectRenderer';
export { default as Attribute } from './geometry/Attribute';
export { default as Buffer } from './geometry/Buffer';
export { default as Geometry } from './geometry/Geometry';
