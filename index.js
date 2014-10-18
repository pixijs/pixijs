var g = typeof window !== 'undefined' ? window : global

g.PIXI = exports

require('./src/pixi/Pixi');

require('./src/pixi/geom/Point');
require('./src/pixi/geom/Rectangle');
require('./src/pixi/geom/Polygon');
require('./src/pixi/geom/Circle');
require('./src/pixi/geom/Ellipse');
require('./src/pixi/geom/Matrix');

require('./src/pixi/display/DisplayObject');
require('./src/pixi/display/DisplayObjectContainer');
require('./src/pixi/display/Sprite');
require('./src/pixi/display/SpriteBatch');
require('./src/pixi/display/MovieClip');

require('./src/pixi/filters/FilterBlock');
require('./src/pixi/text/Text');
require('./src/pixi/text/BitmapText');
require('./src/pixi/InteractionData');
require('./src/pixi/InteractionManager');
require('./src/pixi/display/Stage');

require('./src/pixi/utils/Utils');
require('./src/pixi/utils/EventTarget');
require('./src/pixi/utils/Detector');
require('./src/pixi/utils/Polyk');

require('./src/pixi/renderers/webgl/utils/WebGLShaderUtils');
require('./src/pixi/renderers/webgl/shaders/PixiShader');
require('./src/pixi/renderers/webgl/shaders/PixiFastShader');
require('./src/pixi/renderers/webgl/shaders/StripShader');
require('./src/pixi/renderers/webgl/shaders/PrimitiveShader');
require('./src/pixi/renderers/webgl/shaders/ComplexPrimitiveShader');
require('./src/pixi/renderers/webgl/utils/WebGLGraphics');
require('./src/pixi/renderers/webgl/WebGLRenderer');
require('./src/pixi/renderers/webgl/utils/WebGLBlendModeManager');
require('./src/pixi/renderers/webgl/utils/WebGLMaskManager');
require('./src/pixi/renderers/webgl/utils/WebGLStencilManager');
require('./src/pixi/renderers/webgl/utils/WebGLShaderManager');
require('./src/pixi/renderers/webgl/utils/WebGLSpriteBatch');
require('./src/pixi/renderers/webgl/utils/WebGLFastSpriteBatch');
require('./src/pixi/renderers/webgl/utils/WebGLFilterManager');
require('./src/pixi/renderers/webgl/utils/FilterTexture');
require('./src/pixi/renderers/canvas/utils/CanvasBuffer');
require('./src/pixi/renderers/canvas/utils/CanvasMaskManager');
require('./src/pixi/renderers/canvas/utils/CanvasTinter');
require('./src/pixi/renderers/canvas/CanvasRenderer');
require('./src/pixi/renderers/canvas/CanvasGraphics');

require('./src/pixi/primitives/Graphics');

require('./src/pixi/extras/Strip');
require('./src/pixi/extras/Rope');
require('./src/pixi/extras/TilingSprite');
require('./src/pixi/extras/Spine');

require('./src/pixi/textures/BaseTexture');
require('./src/pixi/textures/Texture');
require('./src/pixi/textures/RenderTexture');

require('./src/pixi/loaders/AssetLoader');
require('./src/pixi/loaders/JsonLoader');
require('./src/pixi/loaders/AtlasLoader');
require('./src/pixi/loaders/SpriteSheetLoader');
require('./src/pixi/loaders/ImageLoader');
require('./src/pixi/loaders/BitmapFontLoader');
require('./src/pixi/loaders/SpineLoader');

require('./src/pixi/filters/AbstractFilter');
require('./src/pixi/filters/AlphaMaskFilter');
require('./src/pixi/filters/ColorMatrixFilter');
require('./src/pixi/filters/GrayFilter');
require('./src/pixi/filters/DisplacementFilter');
require('./src/pixi/filters/PixelateFilter');
require('./src/pixi/filters/BlurXFilter');
require('./src/pixi/filters/BlurYFilter');
require('./src/pixi/filters/BlurFilter');
require('./src/pixi/filters/InvertFilter');
require('./src/pixi/filters/SepiaFilter');
require('./src/pixi/filters/TwistFilter');
require('./src/pixi/filters/ColorStepFilter');
require('./src/pixi/filters/DotScreenFilter');
require('./src/pixi/filters/CrossHatchFilter');
require('./src/pixi/filters/RGBSplitFilter');
