var EventTarget = require('../../utils/EventTarget'),
    BaseTexture = require('../../textures/BaseTexture');

/**
 * Supporting class to load images from spine atlases as per spine spec.
 *
 * @class
 * @mixes EventTarget
 * @namespace PIXI
 * @param basePath {string} Tha base path where to look for the images to be loaded
 * @param crossorigin {boolean} Whether requests should be treated as crossorigin
 */
function SpineTextureLoader(basePath, crossorigin) {
    EventTarget.call(this);

    this.basePath = basePath;
    this.crossorigin = crossorigin;
    this.loadingCount = 0;
}

SpineTextureLoader.prototype.constructor = SpineTextureLoader;
module.exports = SpineTextureLoader;

/**
 * Starts loading a base texture as per spine specification
 *
 * @param page {spine.AtlasPage} Atlas page to which texture belongs
 * @param file {string} The file to load, this is just the file path relative to the base path configured in the constructor
 */
SpineTextureLoader.prototype.load = function (page, file) {
    page.rendererObject = BaseTexture.fromImage(this.basePath + '/' + file, this.crossorigin);
    if (!page.rendererObject.hasLoaded) {
        var scope = this;
        ++scope.loadingCount;
        page.rendererObject.addEventListener('loaded', function (){
            --scope.loadingCount;
            scope.dispatchEvent({
                type: 'loadedBaseTexture',
                content: scope
            });
        });
    }
};

/**
 * Unloads a previously loaded texture as per spine specification
 *
 * @param texture {BaseTexture} Texture object to destroy
 */
SpineTextureLoader.prototype.unload = function (texture) {
    texture.destroy(true);
};
