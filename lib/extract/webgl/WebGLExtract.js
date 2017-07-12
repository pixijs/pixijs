'use strict';

exports.__esModule = true;

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TEMP_RECT = new core.Rectangle();
var BYTES_PER_PIXEL = 4;

/**
 * The extract manager provides functionality to export content from the renderers.
 *
 * An instance of this class is automatically created by default, and can be found at renderer.plugins.extract
 *
 * @class
 * @memberof PIXI.extract
 */

var WebGLExtract = function () {
    /**
     * @param {PIXI.WebGLRenderer} renderer - A reference to the current renderer
     */
    function WebGLExtract(renderer) {
        _classCallCheck(this, WebGLExtract);

        this.renderer = renderer;
        /**
         * Collection of methods for extracting data (image, pixels, etc.) from a display object or render texture
         *
         * @member {PIXI.extract.WebGLExtract} extract
         * @memberof PIXI.WebGLRenderer#
         * @see PIXI.extract.WebGLExtract
         */
        renderer.extract = this;
    }

    /**
     * Will return a HTML Image of the target
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use use the main renderer
     * @return {HTMLImageElement} HTML Image of the target
     */


    WebGLExtract.prototype.image = function image(target) {
        var image = new Image();

        image.src = this.base64(target);

        return image;
    };

    /**
     * Will return a a base64 encoded string of this target. It works by calling
     *  `WebGLExtract.getCanvas` and then running toDataURL on that.
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use use the main renderer
     * @return {string} A base64 encoded string of the texture.
     */


    WebGLExtract.prototype.base64 = function base64(target) {
        return this.canvas(target).toDataURL();
    };

    /**
     * Creates a Canvas element, renders this target to it and then returns it.
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use use the main renderer
     * @return {HTMLCanvasElement} A Canvas element with the texture rendered on.
     */


    WebGLExtract.prototype.canvas = function canvas(target) {
        var renderer = this.renderer;
        var textureBuffer = void 0;
        var resolution = void 0;
        var frame = void 0;
        var flipY = false;
        var renderTexture = void 0;

        if (target) {
            if (target instanceof core.RenderTexture) {
                renderTexture = target;
            } else {
                renderTexture = this.renderer.generateTexture(target);
            }
        }

        if (renderTexture) {
            textureBuffer = renderTexture.baseTexture._glRenderTargets[this.renderer.CONTEXT_UID];
            resolution = textureBuffer.resolution;
            frame = renderTexture.frame;
            flipY = false;
        } else {
            textureBuffer = this.renderer.rootRenderTarget;
            resolution = textureBuffer.resolution;
            flipY = true;

            frame = TEMP_RECT;
            frame.width = textureBuffer.size.width;
            frame.height = textureBuffer.size.height;
        }

        var width = frame.width * resolution;
        var height = frame.height * resolution;

        var canvasBuffer = new core.CanvasRenderTarget(width, height);

        if (textureBuffer) {
            // bind the buffer
            renderer.bindRenderTarget(textureBuffer);

            // set up an array of pixels
            var webglPixels = new Uint8Array(BYTES_PER_PIXEL * width * height);

            // read pixels to the array
            var gl = renderer.gl;

            gl.readPixels(frame.x * resolution, frame.y * resolution, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webglPixels);

            // add the pixels to the canvas
            var canvasData = canvasBuffer.context.getImageData(0, 0, width, height);

            canvasData.data.set(webglPixels);

            canvasBuffer.context.putImageData(canvasData, 0, 0);

            // pulling pixels
            if (flipY) {
                canvasBuffer.context.scale(1, -1);
                canvasBuffer.context.drawImage(canvasBuffer.canvas, 0, -height);
            }
        }

        // send the canvas back..
        return canvasBuffer.canvas;
    };

    /**
     * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA
     * order, with integer values between 0 and 255 (included).
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use use the main renderer
     * @return {Uint8ClampedArray} One-dimensional array containing the pixel data of the entire texture
     */


    WebGLExtract.prototype.pixels = function pixels(target) {
        var renderer = this.renderer;
        var textureBuffer = void 0;
        var resolution = void 0;
        var frame = void 0;
        var renderTexture = void 0;

        if (target) {
            if (target instanceof core.RenderTexture) {
                renderTexture = target;
            } else {
                renderTexture = this.renderer.generateTexture(target);
            }
        }

        if (renderTexture) {
            textureBuffer = renderTexture.baseTexture._glRenderTargets[this.renderer.CONTEXT_UID];
            resolution = textureBuffer.resolution;
            frame = renderTexture.frame;
        } else {
            textureBuffer = this.renderer.rootRenderTarget;
            resolution = textureBuffer.resolution;

            frame = TEMP_RECT;
            frame.width = textureBuffer.size.width;
            frame.height = textureBuffer.size.height;
        }

        var width = frame.width * resolution;
        var height = frame.height * resolution;

        var webglPixels = new Uint8Array(BYTES_PER_PIXEL * width * height);

        if (textureBuffer) {
            // bind the buffer
            renderer.bindRenderTarget(textureBuffer);
            // read pixels to the array
            var gl = renderer.gl;

            gl.readPixels(frame.x * resolution, frame.y * resolution, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webglPixels);
        }

        return webglPixels;
    };

    /**
     * Destroys the extract
     *
     */


    WebGLExtract.prototype.destroy = function destroy() {
        this.renderer.extract = null;
        this.renderer = null;
    };

    return WebGLExtract;
}();

exports.default = WebGLExtract;


core.WebGLRenderer.registerPlugin('extract', WebGLExtract);
//# sourceMappingURL=WebGLExtract.js.map