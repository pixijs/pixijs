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
    // AsciiFilter:        require('./ascii/AsciiFilter'),
    // BloomFilter:        require('./bloom/BloomFilter'),
    // BlurDirFilter:      require('./blur/BlurDirFilter'),
    // ColorStepFilter:    require('./color/ColorStepFilter'),
    // ConvolutionFilter:  require('./convolution/ConvolutionFilter'),
    // CrossHatchFilter:   require('./crosshatch/CrossHatchFilter'),
    // DotScreenFilter:    require('./dot/DotScreenFilter'),
    // DropShadowFilter:   require('./dropshadow/DropShadowFilter'),
    // InvertFilter:       require('./invert/InvertFilter'),
    // NoiseFilter:        require('./noise/NoiseFilter'),
    // PixelateFilter:     require('./pixelate/PixelateFilter'),
    // RGBSplitFilter:     require('./rgb/RGBSplitFilter'),
    // ShockwaveFilter:    require('./shockwave/ShockwaveFilter'),
    // SepiaFilter:        require('./sepia/SepiaFilter'),
    // SmartBlurFilter:    require('./blur/SmartBlurFilter'),
    // TiltShiftFilter:    require('./tiltshift/TiltShiftFilter'),
    // TiltShiftXFilter:   require('./tiltshift/TiltShiftXFilter'),
    //TiltShiftYFilter:   require('./tiltshift/TiltShiftYFilter'),
    DisplacementFilter: require('./displacement/DisplacementFilter'),
    BlurFilter:         require('./blur/BlurFilter'),
    BlurXFilter:        require('./blur/BlurXFilter'),
    BlurYFilter:        require('./blur/BlurYFilter'),
   
    ColorMatrixFilter:  require('./colormatrix/ColorMatrixFilter'),
    TwistFilter:        require('./twist/TwistFilter'),
    GrayFilter:         require('./gray/GrayFilter'),
    GodrayFilter:         require('./godray/GodrayFilter')
};
