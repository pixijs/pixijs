'use strict';

exports.__esModule = true;

var _TextureResource2 = require('./TextureResource');

var _TextureResource3 = _interopRequireDefault(_TextureResource2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BufferResource = function (_TextureResource) {
    _inherits(BufferResource, _TextureResource);

    function BufferResource(source) {
        _classCallCheck(this, BufferResource);

        var _this = _possibleConstructorReturn(this, _TextureResource.call(this, source));

        _this.uploadable = false;

        _this.load = new Promise(function (resolve) {
            resolve(_this);
        });
        return _this;
    }

    BufferResource.from = function from(array) {
        return new BufferResource(array);
    };

    return BufferResource;
}(_TextureResource3.default);

exports.default = BufferResource;
//# sourceMappingURL=BufferResource.js.map