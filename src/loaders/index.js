/**
 * @file        Main export of the PIXI loaders library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI.loaders
 */
module.exports = {
    Loader:             require('./loader'),

    // parsers
    bitmapFontParser:   require('./bitmapFontParser'),
    spritesheetParser:  require('./spritesheetParser'),
    textureParser:      require('./textureParser'),
    Resource:           require('resource-loader').Resource
};
