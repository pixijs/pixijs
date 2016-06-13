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
    AsciiFilter:        require('./ascii/AsciiFilter'),
    BloomFilter:        require('./bloom/BloomFilter'),
    ConvolutionFilter:  require('./convolution/ConvolutionFilter'),
    CrossHatchFilter:   require('./crosshatch/CrossHatchFilter'),
    DotFilter:          require('./dot/DotFilter'),
    FXAAFilter:          require('./fxaa/FXAAFilter'),
    // DropShadowFilter:   require('./dropshadow/DropShadowFilter'),
    NoiseFilter:        require('./noise/NoiseFilter'),
    PixelateFilter:     require('./pixelate/PixelateFilter'),
    RGBSplitFilter:     require('./rgb/RGBSplitFilter'),
    EmbossFilter:       require('./emboss/EmbossFilter'),
    ShockwaveFilter:    require('./shockwave/ShockwaveFilter'),
    // SmartBlurFilter:    require('./blur/SmartBlurFilter'),
    TiltShiftFilter:    require('./tiltshift/TiltShiftFilter'),
    // TiltShiftXFilter:   require('./tiltshift/TiltShiftXFilter'),
    //TiltShiftYFilter:   require('./tiltshift/TiltShiftYFilter'),
    DisplacementFilter: require('./displacement/DisplacementFilter'),
    BlurFilter:         require('./blur/BlurFilter'),
    BlurXFilter:        require('./blur/BlurXFilter'),
    BlurYFilter:        require('./blur/BlurYFilter'),

    ColorMatrixFilter:  require('./colormatrix/ColorMatrixFilter'),
    TwistFilter:        require('./twist/TwistFilter'),
    VoidFilter:         require('./void/VoidFilter')
};
