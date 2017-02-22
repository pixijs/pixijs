'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var _generateBlurVertSource = require('./generateBlurVertSource');

var _generateBlurVertSource2 = _interopRequireDefault(_generateBlurVertSource);

var _generateBlurFragSource = require('./generateBlurFragSource');

var _generateBlurFragSource2 = _interopRequireDefault(_generateBlurFragSource);

var _getMaxBlurKernelSize = require('./getMaxBlurKernelSize');

var _getMaxBlurKernelSize2 = _interopRequireDefault(_getMaxBlurKernelSize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The BlurXFilter applies a horizontal Gaussian blur to an object.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
var BlurXFilter = function (_core$Filter) {
    _inherits(BlurXFilter, _core$Filter);

    /**
     * @param {number} strength - The strength of the blur filter.
     * @param {number} quality - The quality of the blur filter.
     * @param {number} resolution - The resolution of the blur filter.
     * @param {number} [kernelSize=5] - The kernelSize of the blur filter.Options: 5, 7, 9, 11, 13, 15.
     */
    function BlurXFilter(strength, quality, resolution, kernelSize) {
        _classCallCheck(this, BlurXFilter);

        kernelSize = kernelSize || 5;
        var vertSrc = (0, _generateBlurVertSource2.default)(kernelSize, true);
        var fragSrc = (0, _generateBlurFragSource2.default)(kernelSize);

        var _this = _possibleConstructorReturn(this, _core$Filter.call(this,
        // vertex shader
        vertSrc,
        // fragment shader
        fragSrc));

        _this.resolution = resolution || core.settings.RESOLUTION;

        _this._quality = 0;

        _this.quality = quality || 4;
        _this.strength = strength || 8;

        _this.firstRun = true;
        return _this;
    }

    /**
     * Applies the filter.
     *
     * @param {PIXI.FilterManager} filterManager - The manager.
     * @param {PIXI.RenderTarget} input - The input target.
     * @param {PIXI.RenderTarget} output - The output target.
     * @param {boolean} clear - Should the output be cleared before rendering?
     */


    BlurXFilter.prototype.apply = function apply(filterManager, input, output, clear) {
        if (this.firstRun) {
            var gl = filterManager.renderer.gl;
            var kernelSize = (0, _getMaxBlurKernelSize2.default)(gl);

            this.vertexSrc = (0, _generateBlurVertSource2.default)(kernelSize, true);
            this.fragmentSrc = (0, _generateBlurFragSource2.default)(kernelSize);

            this.firstRun = false;
        }

        this.uniforms.strength = 1 / output.size.width * (output.size.width / input.size.width);

        // screen space!
        this.uniforms.strength *= this.strength;
        this.uniforms.strength /= this.passes; // / this.passes//Math.pow(1, this.passes);

        if (this.passes === 1) {
            filterManager.applyFilter(this, input, output, clear);
        } else {
            var renderTarget = filterManager.getRenderTarget(true);
            var flip = input;
            var flop = renderTarget;

            for (var i = 0; i < this.passes - 1; i++) {
                filterManager.applyFilter(this, flip, flop, true);

                var temp = flop;

                flop = flip;
                flip = temp;
            }

            filterManager.applyFilter(this, flip, output, clear);

            filterManager.returnRenderTarget(renderTarget);
        }
    };

    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @default 16
     */


    _createClass(BlurXFilter, [{
        key: 'blur',
        get: function get() {
            return this.strength;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this.padding = Math.abs(value) * 2;
            this.strength = value;
        }

        /**
        * Sets the quality of the blur by modifying the number of passes. More passes means higher
        * quaility bluring but the lower the performance.
        *
        * @member {number}
        * @default 4
        */

    }, {
        key: 'quality',
        get: function get() {
            return this._quality;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this._quality = value;
            this.passes = value;
        }
    }]);

    return BlurXFilter;
}(core.Filter);

exports.default = BlurXFilter;
//# sourceMappingURL=BlurXFilter.js.map