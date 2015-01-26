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
  //  DotScreenFilter:    require('./DotScreenFilter'),
    GrayFilter:         require('./gray/GrayFilter')
  //  InvertFilter:       require('./InvertFilter'),
  //  NoiseFilter:        require('./NoiseFilter'),
  //  NormalMapFilter:    require('./NormalMapFilter'),
  //  PixelateFilter:     require('./PixelateFilter'),
  //  RGBSplitFilter:     require('./RGBSplitFilter'),
  //  SepiaFilter:        require('./SepiaFilter'),
  //  SmartBlurFilter:    require('./SmartBlurFilter'),
  //  TiltShiftFilter:    require('./TiltShiftFilter'),
  //  TiltShiftXFilter:   require('./TiltShiftXFilter'),
  //  TiltShiftYFilter:   require('./TiltShiftYFilter'),
  //  TwistFilter:        require('./TwistFilter')
};
