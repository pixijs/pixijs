/**
 * @file        Main export of the PIXI core library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI
 */
// export core and const. We assign core to const so that the non-reference types in const remain in-tact
var core = module.exports = Object.assign(require('./const'), require('./math'), {
    // utils
    utils: require('./utils'),
    ticker: require('./ticker'),

    // display
    DisplayObject:          require('./display/DisplayObject'),
    Container:              require('./display/Container'),
    Transform:              require('./display/Transform'),
    TransformStatic:        require('./display/TransformStatic'),

    // sprites
    Sprite:                 require('./sprites/Sprite'),
    CanvasSpriteRender:     require('./sprites/canvas/CanvasSpriteRenderer'),
    CanvasTinter:           require('./sprites/canvas/CanvasTinter'),
    SpriteRenderer:         require('./sprites/webgl/SpriteRenderer'),

    // text
    Text:                   require('./text/Text'),
    TextStyle:              require('./text/TextStyle'),
    // primitives
    Graphics:               require('./graphics/Graphics'),
    GraphicsData:           require('./graphics/GraphicsData'),
    GraphicsRenderer:       require('./graphics/webgl/GraphicsRenderer'),
    CanvasGraphicsRenderer: require('./graphics/canvas/CanvasGraphicsRenderer'),

    // textures
    Texture:                require('./textures/Texture'),
    BaseTexture:            require('./textures/BaseTexture'),
    RenderTexture:          require('./textures/RenderTexture'),
    BaseRenderTexture:      require('./textures/BaseRenderTexture'),
    VideoBaseTexture:       require('./textures/VideoBaseTexture'),
    TextureUvs:             require('./textures/TextureUvs'),

    // renderers - canvas
    CanvasRenderer:         require('./renderers/canvas/CanvasRenderer'),
    CanvasRenderTarget:     require('./renderers/canvas/utils/CanvasRenderTarget'),

    // renderers - webgl
    Shader:                 require('./Shader'),
    WebGLRenderer:          require('./renderers/webgl/WebGLRenderer'),
    WebGLManager:           require('./renderers/webgl/managers/WebGLManager'),
    ObjectRenderer:         require('./renderers/webgl/utils/ObjectRenderer'),
    RenderTarget:           require('./renderers/webgl/utils/RenderTarget'),
    Quad:                   require('./renderers/webgl/utils/Quad'),

    // filters - webgl
    SpriteMaskFilter:       require('./renderers/webgl/filters/spriteMask/SpriteMaskFilter'),
    Filter:                 require('./renderers/webgl/filters/Filter'),

    glCore:                   require('pixi-gl-core'),

    /**
     * This helper function will automatically detect which renderer you should be using.
     * WebGL is the preferred renderer as it is a lot faster. If webGL is not supported by
     * the browser then this function will return a canvas renderer
     *
     * @memberof PIXI
     * @param width=800 {number} the width of the renderers view
     * @param height=600 {number} the height of the renderers view
     * @param [options] {object} The optional renderer parameters
     * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
     * @param [options.transparent=false] {boolean} If the render view is transparent, default false
     * @param [options.antialias=false] {boolean} sets antialias (only applicable in chrome at the moment)
     * @param [options.preserveDrawingBuffer=false] {boolean} enables drawing buffer preservation, enable this if you
     *      need to call toDataUrl on the webgl context
     * @param [options.resolution=1] {number} the resolution of the renderer, retina would be 2
     * @param [noWebGL=false] {boolean} prevents selection of WebGL renderer, even if such is present
     *
     * @return {WebGLRenderer|CanvasRenderer} Returns WebGL renderer if available, otherwise CanvasRenderer
     */
    autoDetectRenderer: function (width, height, options, noWebGL)
    {
        width = width || 800;
        height = height || 600;

        if (!noWebGL && core.utils.isWebGLSupported())
        {
            return new core.WebGLRenderer(width, height, options);
        }

        return new core.CanvasRenderer(width, height, options);
    }
});
