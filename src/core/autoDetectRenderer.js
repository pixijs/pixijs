import * as utils from './utils';
import CanvasRenderer from './renderers/canvas/CanvasRenderer';
import WebGLRenderer from './renderers/webgl/WebGLRenderer';

// eslint-disable-next-line valid-jsdoc
/**
 * This helper function will automatically detect which renderer you should be using.
 * WebGL is the preferred renderer as it is a lot faster. If webGL is not supported by
 * the browser then this function will return a canvas renderer
 *
 * @memberof PIXI
 * @function autoDetectRenderer
 * @param {object} [options] - The optional renderer parameters
 * @param {number} [options.width=800] - the width of the renderers view
 * @param {number} [options.height=600] - the height of the renderers view
 * @param {HTMLCanvasElement} [options.view] - the canvas to use as a view, optional
 * @param {boolean} [options.transparent=false] - If the render view is transparent, default false
 * @param {boolean} [options.antialias=false] - sets antialias (only applicable in chrome at the moment)
 * @param {boolean} [options.preserveDrawingBuffer=false] - enables drawing buffer preservation, enable this if you
 *      need to call toDataUrl on the webgl context
 * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer, retina would be 2
 * @param {boolean} [options.forceCanvas=false] - prevents selection of WebGL renderer, even if such is present
 * @return {PIXI.WebGLRenderer|PIXI.CanvasRenderer} Returns WebGL renderer if available, otherwise CanvasRenderer
 */
export function autoDetectRenderer(options, arg1, arg2, arg3)
{
    // Backward-compatible support for noWebGL option
    let forceCanvas = options && options.forceCanvas;

    if (arg3 !== undefined)
    {
        forceCanvas = arg3;
    }

    if (!forceCanvas && utils.isWebGLSupported())
    {
        return new WebGLRenderer(options, arg1, arg2);
    }

    return new CanvasRenderer(options, arg1, arg2);
}
