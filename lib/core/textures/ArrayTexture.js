'use strict';

exports.__esModule = true;

var _BaseTexture = require('./BaseTexture');

var _BaseTexture2 = _interopRequireDefault(_BaseTexture);

var _ImageResource = require('./resources/ImageResource');

var _ImageResource2 = _interopRequireDefault(_ImageResource);

var _const = require('./../const');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ArrayTexture = function (_Texture) {
    _inherits(ArrayTexture, _Texture);

    function ArrayTexture(width, height, size, format) {
        _classCallCheck(this, ArrayTexture);

        var _this = _possibleConstructorReturn(this, _Texture.call(this, null, 0, 1, width, height, format));

        _this.target = _const.TARGETS.TEXTURE_2D_ARRAY;
        _this.size = size;
        _this._new = true;
        _this.array = [];
        return _this;
    }

    ArrayTexture.prototype.setResource = function setResource(resource, index) {
        var _this2 = this;

        var layer = this.array[index];

        if (!layer) {
            layer = this.array[index] = { index: index, texture: this, resource: null, texturePart: true, dirtyId: 0 };
        }

        layer.resource = resource;

        resource.load.then(function (resource) {
            if (layer.resource === resource) {
                _this2.validate();
                _this2.dirtyId++;
            }
        });
    };

    ArrayTexture.prototype.validate = function validate() {
        var valid = true;

        if (this.width === -1 || this.height === -1) {
            valid = false;
        }

        if (this.array) {
            for (var i = 0; i < this.array.length; i++) {
                var layer = this.array[i];

                if (layer.resource && !layer.resource.loaded) {
                    valid = false;
                    break;
                }
            }
        }

        this.valid = valid;
    };

    ArrayTexture.from = function from(width, height) {
        var arrayTexture = new ArrayTexture(width, height);

        for (var i = 0; i < 6; i++) {
            var _ref;

            arrayTexture.setResource(_ImageResource2.default.from((_ref = i % (arguments.length <= 2 ? 0 : arguments.length - 2) + 2, arguments.length <= _ref ? undefined : arguments[_ref])), i);
        }

        return arrayTexture;
    };

    return ArrayTexture;
}(_BaseTexture2.default);

exports.default = ArrayTexture;
//# sourceMappingURL=ArrayTexture.js.map