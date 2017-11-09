/**
 * Reference to **{@link https://github.com/englercj/resource-loader
 * resource-loader}**'s Resource class.
 * @see http://englercj.github.io/resource-loader/Resource.html
 * @class Resource
 * @memberof PIXI.loaders
 */
export { Resource } from 'resource-loader';

/**
 * This namespace contains APIs which extends the {@link https://github.com/englercj/resource-loader resource-loader} module
 * for loading assets, data, and other resources dynamically.
 * @example
 * const loader = new PIXI.loaders.Loader();
 * loader.add('bunny', 'data/bunny.png')
 *       .add('spaceship', 'assets/spritesheet.json');
 * loader.load((loader, resources) => {
 *    // resources.bunny
 *    // resources.spaceship
 * });
 * @namespace PIXI.loaders
 */
export { Loader, shared } from './Loader';
export { default as textureParser } from './textureParser';
