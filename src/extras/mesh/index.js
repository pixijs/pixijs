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
    Strip:          require('./Strip'),
    Rope:           require('./Rope'),
    MeshRenderer:   require('./webgl/MeshRenderer'),
    MeshShader:    require('./webgl/MeshShader')
};
