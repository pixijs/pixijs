'use strict';

exports.__esModule = true;

var _utils = require('../../utils');

var _const = require('../../const');

var _ObjectRenderer2 = require('../../renderers/webgl/utils/ObjectRenderer');

var _ObjectRenderer3 = _interopRequireDefault(_ObjectRenderer2);

var _WebGLRenderer = require('../../renderers/webgl/WebGLRenderer');

var _WebGLRenderer2 = _interopRequireDefault(_WebGLRenderer);

var _WebGLGraphicsData = require('./WebGLGraphicsData');

var _WebGLGraphicsData2 = _interopRequireDefault(_WebGLGraphicsData);

var _PrimitiveShader = require('./shaders/PrimitiveShader');

var _PrimitiveShader2 = _interopRequireDefault(_PrimitiveShader);

var _buildPoly = require('./utils/buildPoly');

var _buildPoly2 = _interopRequireDefault(_buildPoly);

var _buildRectangle = require('./utils/buildRectangle');

var _buildRectangle2 = _interopRequireDefault(_buildRectangle);

var _buildRoundedRectangle = require('./utils/buildRoundedRectangle');

var _buildRoundedRectangle2 = _interopRequireDefault(_buildRoundedRectangle);

var _buildCircle = require('./utils/buildCircle');

var _buildCircle2 = _interopRequireDefault(_buildCircle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Renders the graphics object.
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 */
var GraphicsRenderer = function (_ObjectRenderer) {
    _inherits(GraphicsRenderer, _ObjectRenderer);

    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this object renderer works for.
     */
    function GraphicsRenderer(renderer) {
        _classCallCheck(this, GraphicsRenderer);

        var _this = _possibleConstructorReturn(this, _ObjectRenderer.call(this, renderer));

        _this.graphicsDataPool = [];

        _this.primitiveShader = null;

        _this.gl = renderer.gl;

        // easy access!
        _this.CONTEXT_UID = 0;
        return _this;
    }

    /**
     * Called when there is a WebGL context change
     *
     * @private
     *
     */


    GraphicsRenderer.prototype.onContextChange = function onContextChange() {
        this.gl = this.renderer.gl;
        this.CONTEXT_UID = this.renderer.CONTEXT_UID;
        this.primitiveShader = new _PrimitiveShader2.default(this.gl);
    };

    /**
     * Destroys this renderer.
     *
     */


    GraphicsRenderer.prototype.destroy = function destroy() {
        _ObjectRenderer3.default.prototype.destroy.call(this);

        for (var i = 0; i < this.graphicsDataPool.length; ++i) {
            this.graphicsDataPool[i].destroy();
        }

        this.graphicsDataPool = null;
    };

    /**
     * Renders a graphics object.
     *
     * @param {PIXI.Graphics} graphics - The graphics object to render.
     */


    GraphicsRenderer.prototype.render = function render(graphics) {
        var renderer = this.renderer;
        var gl = renderer.gl;

        var webGLData = void 0;
        var webGL = graphics._webGL[this.CONTEXT_UID];

        if (!webGL || graphics.dirty !== webGL.dirty) {
            this.updateGraphics(graphics);

            webGL = graphics._webGL[this.CONTEXT_UID];
        }

        // This  could be speeded up for sure!
        var shader = this.primitiveShader;

        renderer.bindShader(shader);
        renderer.state.setBlendMode(graphics.blendMode);

        for (var i = 0, n = webGL.data.length; i < n; i++) {
            webGLData = webGL.data[i];
            var shaderTemp = webGLData.shader;

            renderer.bindShader(shaderTemp);
            shaderTemp.uniforms.translationMatrix = graphics.transform.worldTransform.toArray(true);
            shaderTemp.uniforms.tint = (0, _utils.hex2rgb)(graphics.tint);
            shaderTemp.uniforms.alpha = graphics.worldAlpha;

            renderer.bindVao(webGLData.vao);

            if (webGLData.nativeLines) {
                gl.drawArrays(gl.LINES, 0, webGLData.points.length / 6);
            } else {
                webGLData.vao.draw(gl.TRIANGLE_STRIP, webGLData.indices.length);
            }
        }
    };

    /**
     * Updates the graphics object
     *
     * @private
     * @param {PIXI.Graphics} graphics - The graphics object to update
     */


    GraphicsRenderer.prototype.updateGraphics = function updateGraphics(graphics) {
        var gl = this.renderer.gl;

        // get the contexts graphics object
        var webGL = graphics._webGL[this.CONTEXT_UID];

        // if the graphics object does not exist in the webGL context time to create it!
        if (!webGL) {
            webGL = graphics._webGL[this.CONTEXT_UID] = { lastIndex: 0, data: [], gl: gl, clearDirty: -1, dirty: -1 };
        }

        // flag the graphics as not dirty as we are about to update it...
        webGL.dirty = graphics.dirty;

        // if the user cleared the graphics object we will need to clear every object
        if (graphics.clearDirty !== webGL.clearDirty) {
            webGL.clearDirty = graphics.clearDirty;

            // loop through and return all the webGLDatas to the object pool so than can be reused later on
            for (var i = 0; i < webGL.data.length; i++) {
                this.graphicsDataPool.push(webGL.data[i]);
            }

            // clear the array and reset the index..
            webGL.data.length = 0;
            webGL.lastIndex = 0;
        }

        var webGLData = void 0;
        var webGLDataNativeLines = void 0;

        // loop through the graphics datas and construct each one..
        // if the object is a complex fill then the new stencil buffer technique will be used
        // other wise graphics objects will be pushed into a batch..
        for (var _i = webGL.lastIndex; _i < graphics.graphicsData.length; _i++) {
            var data = graphics.graphicsData[_i];

            // TODO - this can be simplified
            webGLData = this.getWebGLData(webGL, 0);

            if (data.nativeLines && data.lineWidth) {
                webGLDataNativeLines = this.getWebGLData(webGL, 0, true);
                webGL.lastIndex++;
            }

            if (data.type === _const.SHAPES.POLY) {
                (0, _buildPoly2.default)(data, webGLData, webGLDataNativeLines);
            }
            if (data.type === _const.SHAPES.RECT) {
                (0, _buildRectangle2.default)(data, webGLData, webGLDataNativeLines);
            } else if (data.type === _const.SHAPES.CIRC || data.type === _const.SHAPES.ELIP) {
                (0, _buildCircle2.default)(data, webGLData, webGLDataNativeLines);
            } else if (data.type === _const.SHAPES.RREC) {
                (0, _buildRoundedRectangle2.default)(data, webGLData, webGLDataNativeLines);
            }

            webGL.lastIndex++;
        }

        this.renderer.bindVao(null);

        // upload all the dirty data...
        for (var _i2 = 0; _i2 < webGL.data.length; _i2++) {
            webGLData = webGL.data[_i2];

            if (webGLData.dirty) {
                webGLData.upload();
            }
        }
    };

    /**
     *
     * @private
     * @param {WebGLRenderingContext} gl - the current WebGL drawing context
     * @param {number} type - TODO @Alvin
     * @param {number} nativeLines - indicate whether the webGLData use for nativeLines.
     * @return {*} TODO
     */


    GraphicsRenderer.prototype.getWebGLData = function getWebGLData(gl, type, nativeLines) {
        var webGLData = gl.data[gl.data.length - 1];

        if (!webGLData || webGLData.nativeLines !== nativeLines || webGLData.points.length > 320000) {
            webGLData = this.graphicsDataPool.pop() || new _WebGLGraphicsData2.default(this.renderer.gl, this.primitiveShader, this.renderer.state.attribsState);
            webGLData.nativeLines = nativeLines;
            webGLData.reset(type);
            gl.data.push(webGLData);
        }

        webGLData.dirty = true;

        return webGLData;
    };

    return GraphicsRenderer;
}(_ObjectRenderer3.default);

exports.default = GraphicsRenderer;


_WebGLRenderer2.default.registerPlugin('graphics', GraphicsRenderer);
//# sourceMappingURL=GraphicsRenderer.js.map