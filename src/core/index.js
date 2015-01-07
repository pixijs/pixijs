/**
 * @file        Main export of the PIXI core library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/GoodBoyDigital/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI
 */
var core = module.exports = {
    CONST: require('./const'),

    // utils
    utils: require('./utils'),
    math: require('./math'),

    // display
    DisplayObject:          require('./display/DisplayObject'),
    DisplayObjectContainer: require('./display/DisplayObjectContainer'),
    Sprite:                 require('./display/Sprite'),
    SpriteBatch:            require('./display/SpriteBatch'),

    // primitives
    Graphics:               require('./primitives/Graphics'),
    GraphicsData:           require('./primitives/GraphicsData'),

    // textures
    Texture:                require('./textures/Texture'),
    BaseTexture:            require('./textures/BaseTexture'),
    RenderTexture:          require('./textures/RenderTexture'),
    VideoTexture:           require('./textures/VideoTexture'),

    // renderers - canvas
    CanvasRenderer:         require('./renderers/canvas/CanvasRenderer'),
    CanvasGraphics:         require('./renderers/canvas/utils/CanvasGraphics'),
    CanvasBuffer:           require('./renderers/canvas/utils/CanvasBuffer'),

    // renderers - webgl
    WebGLRenderer:         require('./renderers/webgl/WebGLRenderer'),
    WebGLGraphics:         require('./renderers/webgl/utils/WebGLGraphics'),

    /**
     * This helper function will automatically detect which renderer you should be using.
     * WebGL is the preferred renderer as it is a lot faster. If webGL is not supported by
     * the browser then this function will return a canvas renderer
     *
     * @param width=800 {number} the width of the renderers view
     * @param height=600 {number} the height of the renderers view
     * @param [options] {object} The optional renderer parameters
     * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
     * @param [options.transparent=false] {boolean} If the render view is transparent, default false
     * @param [options.antialias=false] {boolean} sets antialias (only applicable in chrome at the moment)
     * @param [options.preserveDrawingBuffer=false] {boolean} enables drawing buffer preservation, enable this if you
     *      need to call toDataUrl on the webgl context
     * @param [options.resolution=1] {number} the resolution of the renderer retina would be 2
     * @param [noWebGL=false] {Boolean} prevents selection of WebGL renderer, even if such is present
     *
     * @return {WebGLRenderer|CanvasRenderer} Returns WebGL renderer if available, otherwise CanvasRenderer
     */
    autoDetectRenderer: function (width, height, options, noWebGL) {
        width = width || 800;
        height = height || 600;

        if (!noWebGL && require('webgl-enabled')()) {
            return new core.WebGLRenderer(width, height, options);
        }

        return new core.CanvasRenderer(width, height, options);
    },

    /**
     * This helper function will automatically detect which renderer you should be using. This function is very
     * similar to the autoDetectRenderer function except that is will return a canvas renderer for android.
     * Even thought both android chrome supports webGL the canvas implementation perform better at the time of writing.
     * This function will likely change and update as webGL performance improves on these devices.
     *
     * @param width=800 {number} the width of the renderers view
     * @param height=600 {number} the height of the renderers view
     * @param [options] {object} The optional renderer parameters
     * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
     * @param [options.transparent=false] {boolean} If the render view is transparent, default false
     * @param [options.antialias=false] {boolean} sets antialias (only applicable in chrome at the moment)
     * @param [options.preserveDrawingBuffer=false] {boolean} enables drawing buffer preservation, enable this if you
     *      need to call toDataUrl on the webgl context
     * @param [options.resolution=1] {number} the resolution of the renderer retina would be 2
     *
     * @return {WebGLRenderer|CanvasRenderer} Returns WebGL renderer if available, otherwise CanvasRenderer
     */
    autoDetectRecommendedRenderer: function (width, height, options) {
        var isAndroid = /Android/i.test(navigator.userAgent);

        return core.autoDetectRenderer(width, height, options, isAndroid);
    }
};
