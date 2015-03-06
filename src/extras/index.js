/**
 * @file        Main export of the PIXI extras library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/GoodBoyDigital/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI.extras
 */
module.exports = {
    MovieClip:      require('./MovieClip'),
    TilingSprite:   require('./TilingSprite'),
    mesh:           require('./mesh/index'),
    cacheAsBitmap:  require('./cacheAsBitmap'),
    getChildByName: require('./getChildByName')
};
