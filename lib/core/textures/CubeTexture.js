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

var CubeTexture = function (_Texture) {
    _inherits(CubeTexture, _Texture);

    function CubeTexture(width, height, format) {
        _classCallCheck(this, CubeTexture);

        var _this = _possibleConstructorReturn(this, _Texture.call(this, null, 0, 1, width, height, format));

        _this.target = _const.TARGETS.TEXTURE_CUBE_MAP; // gl.TEXTURE_CUBE_MAP

        _this.resources = [];

        _this.positiveX = { side: 0, texture: _this, resource: null, texturePart: true, dirtyId: 0 };
        _this.negativeX = { side: 1, texture: _this, resource: null, texturePart: true, dirtyId: 0 };

        _this.positiveY = { side: 2, texture: _this, resource: null, texturePart: true, dirtyId: 0 };
        _this.negativeY = { side: 3, texture: _this, resource: null, texturePart: true, dirtyId: 0 };

        _this.positiveZ = { side: 4, texture: _this, resource: null, texturePart: true, dirtyId: 0 };
        _this.negativeZ = { side: 5, texture: _this, resource: null, texturePart: true, dirtyId: 0 };

        _this.sides = [_this.positiveX, _this.negativeX, _this.positiveY, _this.negativeY, _this.positiveZ, _this.negativeZ];
        return _this;
    }

    CubeTexture.prototype.setResource = function setResource(resource, index) {
        var _this2 = this;

        var side = this.sides[index];

        side.resource = resource;

        resource.load.then(function (resource) {
            if (side.resource === resource) {
                _this2.width = resource.width;
                _this2.height = resource.height;
                // we have not swapped half way!
                // side.dirtyId++;
                _this2.validate();

                _this2.dirtyId++;
            }
        });
    };

    CubeTexture.prototype.validate = function validate() {
        var valid = true;

        if (this.width === -1 || this.height === -1) {
            valid = false;
        }

        if (this.sides) {
            for (var i = 0; i < this.sides.length; i++) {
                var side = this.sides[i];

                if (side.resource && !side.resource.loaded) {
                    valid = false;
                    break;
                }
            }
        }

        this.valid = valid;
    };

    CubeTexture.from = function from() {
        var cubeTexture = new CubeTexture();

        for (var i = 0; i < 6; i++) {
            var _ref;

            cubeTexture.setResource(_ImageResource2.default.from((_ref = i % arguments.length, arguments.length <= _ref ? undefined : arguments[_ref])), i);
        }

        return cubeTexture;
    };

    return CubeTexture;
}(_BaseTexture2.default);

exports.default = CubeTexture;
//# sourceMappingURL=CubeTexture.js.map