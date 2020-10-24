/*!
 * @pixi/canvas-extract - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/canvas-extract is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
import { RenderTexture } from '@pixi/core';
import { CanvasRenderTarget, deprecation } from '@pixi/utils';
import { Rectangle } from '@pixi/math';
import { CanvasRenderer } from '@pixi/canvas-renderer';

var TEMP_RECT = new Rectangle();
/**
 * The extract manager provides functionality to export content from the renderers.
 *
 * An instance of this class is automatically created by default, and can be found at `renderer.plugins.extract`
 *
 * @class
 * @memberof PIXI
 */
var CanvasExtract = /** @class */ (function () {
    /**
     * @param {PIXI.CanvasRenderer} renderer - A reference to the current renderer
     */
    function CanvasExtract(renderer) {
        this.renderer = renderer;
    }
    /**
     * Will return a HTML Image of the target
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param {string} [format] - Image format, e.g. "image/jpeg" or "image/webp".
     * @param {number} [quality] - JPEG or Webp compression from 0 to 1. Default is 0.92.
     * @return {HTMLImageElement} HTML Image of the target
     */
    CanvasExtract.prototype.image = function (target, format, quality) {
        var image = new Image();
        image.src = this.base64(target, format, quality);
        return image;
    };
    /**
     * Will return a a base64 encoded string of this target. It works by calling
     *  `CanvasExtract.getCanvas` and then running toDataURL on that.
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @param {string} [format] - Image format, e.g. "image/jpeg" or "image/webp".
     * @param {number} [quality] - JPEG or Webp compression from 0 to 1. Default is 0.92.
     * @return {string} A base64 encoded string of the texture.
     */
    CanvasExtract.prototype.base64 = function (target, format, quality) {
        return this.canvas(target).toDataURL(format, quality);
    };
    /**
     * Creates a Canvas element, renders this target to it and then returns it.
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @return {HTMLCanvasElement} A Canvas element with the texture rendered on.
     */
    CanvasExtract.prototype.canvas = function (target) {
        var renderer = this.renderer;
        var context;
        var resolution;
        var frame;
        var renderTexture;
        if (target) {
            if (target instanceof RenderTexture) {
                renderTexture = target;
            }
            else {
                renderTexture = renderer.generateTexture(target);
            }
        }
        if (renderTexture) {
            context = renderTexture.baseTexture._canvasRenderTarget.context;
            resolution = renderTexture.baseTexture._canvasRenderTarget.resolution;
            frame = renderTexture.frame;
        }
        else {
            context = renderer.rootContext;
            resolution = renderer.resolution;
            frame = TEMP_RECT;
            frame.width = this.renderer.width;
            frame.height = this.renderer.height;
        }
        var width = Math.floor((frame.width * resolution) + 1e-4);
        var height = Math.floor((frame.height * resolution) + 1e-4);
        var canvasBuffer = new CanvasRenderTarget(width, height, 1);
        var canvasData = context.getImageData(frame.x * resolution, frame.y * resolution, width, height);
        canvasBuffer.context.putImageData(canvasData, 0, 0);
        // send the canvas back..
        return canvasBuffer.canvas;
    };
    /**
     * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA
     * order, with integer values between 0 and 255 (included).
     *
     * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
     *  to convert. If left empty will use the main renderer
     * @return {Uint8ClampedArray} One-dimensional array containing the pixel data of the entire texture
     */
    CanvasExtract.prototype.pixels = function (target) {
        var renderer = this.renderer;
        var context;
        var resolution;
        var frame;
        var renderTexture;
        if (target) {
            if (target instanceof RenderTexture) {
                renderTexture = target;
            }
            else {
                renderTexture = renderer.generateTexture(target);
            }
        }
        if (renderTexture) {
            context = renderTexture.baseTexture._canvasRenderTarget.context;
            resolution = renderTexture.baseTexture._canvasRenderTarget.resolution;
            frame = renderTexture.frame;
        }
        else {
            context = renderer.rootContext;
            frame = TEMP_RECT;
            frame.width = renderer.width;
            frame.height = renderer.height;
        }
        return context.getImageData(0, 0, frame.width * resolution, frame.height * resolution).data;
    };
    /**
     * Destroys the extract
     *
     */
    CanvasExtract.prototype.destroy = function () {
        this.renderer = null;
    };
    return CanvasExtract;
}());
/**
 * @method PIXI.CanvasRenderer#extract
 * @type {PIXI.CanvasExtract}
 * @see PIXI.CanvasRenderer#plugins
 * @deprecated since 5.3.0
 */
Object.defineProperty(CanvasRenderer.prototype, 'extract', {
    get: function () {
        deprecation('v5.3.0', 'CanvasRenderer#extract is deprecated, use CanvasRenderer#plugins.extract');
        return this.plugins.extract;
    },
});

export { CanvasExtract };
//# sourceMappingURL=canvas-extract.es.js.map
