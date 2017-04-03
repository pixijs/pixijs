/**
 * This namespace contains APIs which extends the {@link https://github.com/englercj/resource-loader resource-loader} module
 * for loading assets, data, and other resources dynamically.
 * @namespace PIXI.loaders
 */
export { default as Loader } from './loader';
export { default as bitmapFontParser, parse as parseBitmapFontData } from './bitmapFontParser';
export { default as spritesheetParser, getResourcePath } from './spritesheetParser';
export { default as textureParser } from './textureParser';

/**
 * Reference to **resource-loader**'s Resource class.
 * See https://github.com/englercj/resource-loader
 * @class Resource
 * @memberof PIXI.loaders
 */
export { Resource } from 'resource-loader';
