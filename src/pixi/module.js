window.PIXI = module.exports = require('./Pixi');

require('./core/Point');
require('./core/Point');
require('./core/Rectangle');
require('./core/Polygon');
require('./core/Circle');
require('./core/Ellipse');
require('./core/Matrix');

require('./display/DisplayObject');
require('./display/DisplayObjectContainer');
require('./display/Sprite');
require('./display/SpriteBatch');
require('./display/MovieClip');

require('./filters/FilterBlock');
require('./text/Text');
require('./text/BitmapText');
require('./InteractionData');
require('./InteractionManager');
require('./display/Stage');

require('./utils/Utils');
require('./utils/EventTarget');
require('./utils/Detector');
require('./utils/Polyk');

require('./renderers/webgl/utils/WebGLShaderUtils');
require('./renderers/webgl/shaders/PixiShader');
require('./renderers/webgl/shaders/PixiFastShader');
require('./renderers/webgl/shaders/StripShader');
require('./renderers/webgl/shaders/PrimitiveShader');
require('./renderers/webgl/shaders/ComplexPrimitiveShader');
require('./renderers/webgl/utils/WebGLGraphics');
require('./renderers/webgl/WebGLRenderer');
require('./renderers/webgl/utils/WebGLBlendModeManager');
require('./renderers/webgl/utils/WebGLMaskManager');
require('./renderers/webgl/utils/WebGLStencilManager');
require('./renderers/webgl/utils/WebGLShaderManager');
require('./renderers/webgl/utils/WebGLSpriteBatch');
require('./renderers/webgl/utils/WebGLFastSpriteBatch');
require('./renderers/webgl/utils/WebGLFilterManager');
require('./renderers/webgl/utils/FilterTexture');
require('./renderers/canvas/utils/CanvasMaskManager');
require('./renderers/canvas/utils/CanvasTinter');
require('./renderers/canvas/CanvasRenderer');
require('./renderers/canvas/CanvasGraphics');

require('./primitives/Graphics');

require('./extras/Strip');
require('./extras/Rope');
require('./extras/TilingSprite');
require('./extras/Spine');

require('./textures/BaseTexture');
require('./textures/Texture');
require('./textures/RenderTexture');

require('./loaders/AssetLoader');
require('./loaders/JsonLoader');
require('./loaders/AtlasLoader');
require('./loaders/SpriteSheetLoader');
require('./loaders/ImageLoader');
require('./loaders/BitmapFontLoader');
require('./loaders/SpineLoader');

require('./filters/AbstractFilter');
require('./filters/AlphaMaskFilter');
require('./filters/ColorMatrixFilter');
require('./filters/GrayFilter');
require('./filters/DisplacementFilter');
require('./filters/PixelateFilter');
require('./filters/BlurXFilter');
require('./filters/BlurYFilter');
require('./filters/BlurFilter');
require('./filters/InvertFilter');
require('./filters/SepiaFilter');
require('./filters/TwistFilter');
require('./filters/ColorStepFilter');
require('./filters/DotScreenFilter');
require('./filters/CrossHatchFilter');
require('./filters/RGBSplitFilter');
