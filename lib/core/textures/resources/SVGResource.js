'use strict';

exports.__esModule = true;

var _utils = require('../../utils');

var _TextureResource2 = require('./TextureResource');

var _TextureResource3 = _interopRequireDefault(_TextureResource2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SVGResource = function (_TextureResource) {
    _inherits(SVGResource, _TextureResource);

    function SVGResource(svgSource, scale) {
        _classCallCheck(this, SVGResource);

        var _this = _possibleConstructorReturn(this, _TextureResource.call(this));

        _this.svgSource = svgSource;
        _this.scale = 1 || scale;
        _this.uploadable = true;

        _this.resolve = null;

        _this.load = new Promise(function (resolve) {
            _this.resolve = resolve;
            _this._loadSvgSourceUsingXhr();
        });
        return _this;
    }

    /**
     * Checks if `source` is an SVG image and whether it's loaded via a URL or a data URI. Then calls
     * `_loadSvgSourceUsingDataUri` or `_loadSvgSourceUsingXhr`.
     */


    SVGResource.prototype._loadSvgSource = function _loadSvgSource() {
        var dataUri = (0, _utils.decomposeDataUri)(this.svgSource);

        if (dataUri) {
            this._loadSvgSourceUsingDataUri(dataUri);
        } else {
            // We got an URL, so we need to do an XHR to check the svg size
            this._loadSvgSourceUsingXhr();
        }
    };

    /**
     * Loads an SVG string from `imageUrl` using XHR and then calls `_loadSvgSourceUsingString`.
     */


    SVGResource.prototype._loadSvgSourceUsingXhr = function _loadSvgSourceUsingXhr() {
        var _this2 = this;

        var svgXhr = new XMLHttpRequest();

        // This throws error on IE, so SVG Document can't be used
        // svgXhr.responseType = 'document';

        // This is not needed since we load the svg as string (breaks IE too)
        // but overrideMimeType() can be used to force the response to be parsed as XML
        // svgXhr.overrideMimeType('image/svg+xml');

        svgXhr.onload = function () {
            if (svgXhr.readyState !== svgXhr.DONE || svgXhr.status !== 200) {
                throw new Error('Failed to load SVG using XHR.');
            }

            _this2._loadSvgSourceUsingString(svgXhr.response);
        };

        svgXhr.onerror = function () {
            return _this2.emit('error', _this2);
        };

        svgXhr.open('GET', this.svgSource, true);
        svgXhr.send();
    };

    /**
     * Loads texture using an SVG string. The original SVG Image is stored as `origSource` and the
     * created canvas is the new `source`. The SVG is scaled using `sourceScale`. Called by
     * `_loadSvgSourceUsingXhr` or `_loadSvgSourceUsingDataUri`.
     *
     * @param  {string} svgString SVG source as string
     *
     * @fires loaded
     */


    SVGResource.prototype._loadSvgSourceUsingString = function _loadSvgSourceUsingString(svgString) {
        var svgSize = (0, _utils.getSvgSize)(svgString);

        // TODO do we need to wait for this to load?
        // seems instant!
        //
        var tempImage = new Image();

        tempImage.src = 'data:image/svg+xml,' + svgString;

        var svgWidth = svgSize.width;
        var svgHeight = svgSize.height;

        if (!svgWidth || !svgHeight) {
            throw new Error('The SVG image must have width and height defined (in pixels), canvas API needs them.');
        }

        // Scale realWidth and realHeight
        this.width = Math.round(svgWidth * this.scale);
        this.height = Math.round(svgHeight * this.scale);

        // Create a canvas element
        var canvas = document.createElement('canvas');

        canvas.width = this.width;
        canvas.height = this.height;
        canvas._pixiId = 'canvas_' + (0, _utils.uid)();

        // Draw the Svg to the canvas
        canvas.getContext('2d').drawImage(tempImage, 0, 0, svgWidth, svgHeight, 0, 0, this.width, this.height);

        this.source = canvas;

        this.resolve(this);
    };

    SVGResource.from = function from(url) {
        return new SVGResource(url);
    };

    return SVGResource;
}(_TextureResource3.default);

exports.default = SVGResource;
//# sourceMappingURL=SVGResource.js.map