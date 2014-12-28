/**
 * @file        Main export of the PIXI library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/GoodBoyDigital/pixi.js/blob/master/LICENSE|MIT License}
 */

var WebGLRenderer = require('./renderers/webgl/WebGLRenderer'),
    CanvasRenderer = require('./renderers/canvas/CanvasRenderer');

/**
 * @namespace PIXI
 */
var PIXI = {
    math: require('./math'),
    CONST: require('./const'),

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
     * @return {WebGLRenderer|CanvasRenderer} Returns WebGL renderer if available, otherwise CanvasRenderer
     */
    autoDetectRenderer: function (width, height, options) {
        width = width || 800;
        height = height || 600;

        if (require('webgl-enabled')()) {
            return new WebGLRenderer(width, height, options);
        }

        return new CanvasRenderer(width, height, options);
    }
};

// export pixi
module.exports = PIXI;
