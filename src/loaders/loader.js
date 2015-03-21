var ResourceLoader = require('resource-loader'),
    textureParser = require('./textureParser'),
    spritesheetParser = require('./spritesheetParser'),
    spineAtlasParser = require('./spineAtlasParser'),
    bitmapFontParser = require('./bitmapFontParser');

/**
 *
 * The new loader, extends Resource Loader by Chad Engler : https://github.com/englercj/resource-loader
 *
 * ```js
 * var loader = new PIXI.loader();
 *
 * loader.add('spineboy',"data/spineboy.json");
 *
 * loader.once('complete',onAssetsLoaded);
 *
 * loader.load();
 * ```
 *
 * @class
 * @extends ResourceLoader
 * @memberof PIXI.loaders
 * @param [baseUrl=''] {string} The base url for all resources loaded by this loader.
 * @param [concurrency=10] {number} The number of resources to load concurrently.
 */
function Loader(baseUrl, concurrency)
{
    ResourceLoader.call(this, baseUrl, concurrency);

    // parse any blob into more usable objects (e.g. Image)
    this.use(ResourceLoader.middleware.parsing.blob());

    // parse any Image objects into textures
    this.use(textureParser());

    // parse any spritesheet data into multiple textures
    this.use(spritesheetParser());

    // parse any spine data into a spine object
    this.use(spineAtlasParser());

    // parse any spritesheet data into multiple textures
    this.use(bitmapFontParser());
}

Loader.prototype = Object.create(ResourceLoader.prototype);
Loader.prototype.constructor = Loader;

module.exports = Loader;
