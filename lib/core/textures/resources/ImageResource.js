'use strict';

exports.__esModule = true;

var _determineCrossOrigin = require('../../utils/determineCrossOrigin');

var _determineCrossOrigin2 = _interopRequireDefault(_determineCrossOrigin);

var _TextureResource2 = require('./TextureResource');

var _TextureResource3 = _interopRequireDefault(_TextureResource2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ImageResource = function (_TextureResource) {
    _inherits(ImageResource, _TextureResource);

    function ImageResource(source) {
        _classCallCheck(this, ImageResource);

        var _this = _possibleConstructorReturn(this, _TextureResource.call(this, source));

        _this.url = source.src;

        _this.load = new Promise(function (resolve) {
            var source = _this.source;

            source.onload = function () {
                _this.loaded = true;
                source.onload = null;
                source.onerror = null;
                _this.width = source.width;
                _this.height = source.height;

                if (window.createImageBitmap) {
                    window.createImageBitmap(source).then(function (imageBitmap) {
                        _this.source = imageBitmap;

                        resolve(_this);
                    });
                } else {
                    resolve(_this);
                }
            };

            if (source.complete && source.src) {
                _this.loaded = true;
                source.onload = null;
                source.onerror = null;
                _this.width = source.width;
                _this.height = source.height;

                if (window.createImageBitmap) {
                    window.createImageBitmap(source).then(function (imageBitmap) {
                        _this.source = imageBitmap;

                        resolve(_this);
                    });
                } else {
                    resolve(_this);
                }
            }

            //    source.onerror = () => {
            //      reject('unable to load "' + source.src + '" resource cannot be found')
            // }
        });
        return _this;
    }

    ImageResource.prototype.destroy = function destroy() {
        this.source.src = '';
    };

    ImageResource.from = function from(url, crossorigin) {
        var image = new Image();

        if (crossorigin === undefined && url.indexOf('data:') !== 0) {
            image.crossOrigin = (0, _determineCrossOrigin2.default)(url);
        }

        image.src = url;

        return new ImageResource(image);
    };

    return ImageResource;
}(_TextureResource3.default);

exports.default = ImageResource;
//# sourceMappingURL=ImageResource.js.map