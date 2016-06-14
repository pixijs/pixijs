/**
 * @file        Main export of the PIXI filters library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI.filters
 */
module.exports = {
    FXAAFilter:          require('./fxaa/FXAAFilter'),
    NoiseFilter:        require('./noise/NoiseFilter'),
    DisplacementFilter: require('./displacement/DisplacementFilter'),
    BlurFilter:         require('./blur/BlurFilter'),
    BlurXFilter:        require('./blur/BlurXFilter'),
    BlurYFilter:        require('./blur/BlurYFilter'),
    ColorMatrixFilter:  require('./colormatrix/ColorMatrixFilter'),
    VoidFilter:         require('./void/VoidFilter')
};
