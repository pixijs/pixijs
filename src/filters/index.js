/**
 * @file        Main export of the PIXI filters library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/GoodBoyDigital/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI
 */
module.exports = {
    AsciiFilter:        require('./ascii/AsciiFilter'),
    BloomFilter:        require('./bloom/BloomFilter'),
    BlurFilter:         require('./blur/BlurFilter'),
    BlurXFilter:        require('./blur/BlurXFilter'),
    BlurYFilter:        require('./blur/BlurYFilter'),
    ColorMatrixFilter:  require('./color/ColorMatrixFilter'),
    ColorStepFilter:    require('./color/ColorStepFilter'),
  //  ConvolutionFilter:  require('./ConvolutionFilter'),
  //  CrossHatchFilter:   require('./CrossHatchFilter'),
  //  DisplacementFilter: require('./DisplacementFilter'),
    DotScreenFilter:    require('./dot/DotScreenFilter'),
    GrayFilter:         require('./gray/GrayFilter'),
    InvertFilter:       require('./invert/InvertFilter'),
    NoiseFilter:        require('./noise/NoiseFilter'),
  //  NormalMapFilter:    require('./NormalMapFilter'),
    PixelateFilter:     require('./pixelate/PixelateFilter'),
  //  RGBSplitFilter:     require('./RGBSplitFilter'),
    ShockwaveFilter:    require('./shockwave/ShockwaveFilter'),
  //  SepiaFilter:        require('./SepiaFilter'),
  //  SmartBlurFilter:    require('./SmartBlurFilter'),
  //  TiltShiftFilter:    require('./TiltShiftFilter'),
  //  TiltShiftXFilter:   require('./TiltShiftXFilter'),
  //  TiltShiftYFilter:   require('./TiltShiftYFilter'),
  //  TwistFilter:        require('./TwistFilter')
};
