/**
 * @file        Main export of the PIXI loaders library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/GoodBoyDigital/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI
 */
module.exports = {
	AssetLoader:        require('./AssetLoader'),
    AtlasLoader:        require('./AtlasLoader'),
    BitmapFontLoader:   require('./BitmapFontLoader'),
    ImageLoader:        require('./ImageLoader'),
    JsonLoader:         require('./JsonLoader'),
    SpineLoader:        require('./SpineLoader'),
    SpriteSheetLoader:  require('./SpriteSheetLoader')
};
