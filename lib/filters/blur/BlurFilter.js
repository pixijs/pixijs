'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var _BlurXFilter = require('./BlurXFilter');

var _BlurXFilter2 = _interopRequireDefault(_BlurXFilter);

var _BlurYFilter = require('./BlurYFilter');

var _BlurYFilter2 = _interopRequireDefault(_BlurYFilter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The BlurFilter applies a Gaussian blur to an object.
 * The strength of the blur can be set for x- and y-axis separately.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
var BlurFilter = function (_core$Filter) {
    _inherits(BlurFilter, _core$Filter);

    /**
     * @param {number} strength - The strength of the blur filter.
     * @param {number} quality - The quality of the blur filter.
     * @param {number} resolution - The resolution of the blur filter.
     * @param {number} [kernelSize=5] - The kernelSize of the blur filter.Options: 5, 7, 9, 11, 13, 15.
     */
    function BlurFilter(strength, quality, resolution, kernelSize) {
        _classCallCheck(this, BlurFilter);

        var _this = _possibleConstructorReturn(this, _core$Filter.call(this));

        _this.blurXFilter = new _BlurXFilter2.default(strength, quality, resolution, kernelSize);
        _this.blurYFilter = new _BlurYFilter2.default(strength, quality, resolution, kernelSize);

        _this.padding = 0;
        _this.resolution = resolution || core.settings.RESOLUTION;
        _this.quality = quality || 4;
        _this.blur = strength || 8;
        return _this;
    }

    /**
     * Applies the filter.
     *
     * @param {PIXI.FilterManager} filterManager - The manager.
     * @param {PIXI.RenderTarget} input - The input target.
     * @param {PIXI.RenderTarget} output - The output target.
     */


    BlurFilter.prototype.apply = function apply(filterManager, input, output) {
        var renderTarget = filterManager.getRenderTarget(true);

        this.blurXFilter.apply(filterManager, input, renderTarget, true);
        this.blurYFilter.apply(filterManager, renderTarget, output, false);

        filterManager.returnRenderTarget(renderTarget);
    };

    /**
     * Sets the strength of both the blurX and blurY properties simultaneously
     *
     * @member {number}
     * @default 2
     */


    _createClass(BlurFilter, [{
        key: 'blur',
        get: function get() {
            return this.blurXFilter.blur;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this.blurXFilter.blur = this.blurYFilter.blur = value;
            this.padding = Math.max(Math.abs(this.blurXFilter.strength), Math.abs(this.blurYFilter.strength)) * 2;
        }

        /**
         * Sets the number of passes for blur. More passes means higher quaility bluring.
         *
         * @member {number}
         * @default 1
         */

    }, {
        key: 'quality',
        get: function get() {
            return this.blurXFilter.quality;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this.blurXFilter.quality = this.blurYFilter.quality = value;
        }

        /**
         * Sets the strength of the blurX property
         *
         * @member {number}
         * @default 2
         */

    }, {
        key: 'blurX',
        get: function get() {
            return this.blurXFilter.blur;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this.blurXFilter.blur = value;
            this.padding = Math.max(Math.abs(this.blurXFilter.strength), Math.abs(this.blurYFilter.strength)) * 2;
        }

        /**
         * Sets the strength of the blurY property
         *
         * @member {number}
         * @default 2
         */

    }, {
        key: 'blurY',
        get: function get() {
            return this.blurYFilter.blur;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this.blurYFilter.blur = value;
            this.padding = Math.max(Math.abs(this.blurXFilter.strength), Math.abs(this.blurYFilter.strength)) * 2;
        }
    }]);

    return BlurFilter;
}(core.Filter);

exports.default = BlurFilter;
//# sourceMappingURL=BlurFilter.js.map