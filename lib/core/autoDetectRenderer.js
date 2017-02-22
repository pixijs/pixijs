'use strict';

exports.__esModule = true;
exports.autoDetectRenderer = autoDetectRenderer;

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var _CanvasRenderer = require('./renderers/canvas/CanvasRenderer');

var _CanvasRenderer2 = _interopRequireDefault(_CanvasRenderer);

var _WebGLRenderer = require('./renderers/webgl/WebGLRenderer');

var _WebGLRenderer2 = _interopRequireDefault(_WebGLRenderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * This helper function will automatically detect which renderer you should be using.
 * WebGL is the preferred renderer as it is a lot faster. If webGL is not supported by
 * the browser then this function will return a canvas renderer
 *
 * @memberof PIXI
 * @function autoDetectRenderer
 * @param {number} [width=800] - the width of the renderers view
 * @param {number} [height=600] - the height of the renderers view
 * @param {object} [options] - The optional renderer parameters
 * @param {HTMLCanvasElement} [options.view] - the canvas to use as a view, optional
 * @param {boolean} [options.transparent=false] - If the render view is transparent, default false
 * @param {boolean} [options.antialias=false] - sets antialias (only applicable in chrome at the moment)
 * @param {boolean} [options.preserveDrawingBuffer=false] - enables drawing buffer preservation, enable this if you
 *      need to call toDataUrl on the webgl context
 * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer, retina would be 2
 * @param {boolean} [noWebGL=false] - prevents selection of WebGL renderer, even if such is present
 * @return {PIXI.WebGLRenderer|PIXI.CanvasRenderer} Returns WebGL renderer if available, otherwise CanvasRenderer
 */
function autoDetectRenderer() {
    var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 800;
    var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 600;
    var options = arguments[2];
    var noWebGL = arguments[3];

    if (!noWebGL && utils.isWebGLSupported()) {
        return new _WebGLRenderer2.default(width, height, options);
    }

    return new _CanvasRenderer2.default(width, height, options);
}
//# sourceMappingURL=autoDetectRenderer.js.map