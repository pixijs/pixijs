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
    BloomFilter:        require('./bloom/BloomFilter'),
  //  AlphaMaskFilter:    require('./AlphaMaskFilter'),
  //  AsciiFilter:        require('./AsciiFilter'),
    BlurFilter:         require('./blur/BlurFilter'),
    BlurXFilter:        require('./blur/BlurXFilter'),
    BlurYFilter:        require('./blur/BlurYFilter'),
  //  ColorMatrixFilter:  require('./ColorMatrixFilter'),
  //  ColorStepFilter:    require('./ColorStepFilter'),
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
