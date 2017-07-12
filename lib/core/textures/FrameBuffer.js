'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseTexture = require('./BaseTexture');

var _BaseTexture2 = _interopRequireDefault(_BaseTexture);

var _const = require('./../const');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FrameBuffer = function () {
    function FrameBuffer(width, height) {
        _classCallCheck(this, FrameBuffer);

        this.width = width || 100;
        this.height = height || 100;

        this.stencil = false;
        this.depth = false;

        this.dirtyId = 0;
        this.dirtyFormat = 0;
        this.dirtySize = 0;

        this.depthTexture = null;
        this.colorTextures = [];

        this.glFrameBuffers = {};
    }

    FrameBuffer.prototype.addColorTexture = function addColorTexture(index, texture) {
        // TODO add some validation to the texture - same width / height etc?
        this.colorTextures[index || 0] = texture || new _BaseTexture2.default(null, 0, 1, this.width, this.height); // || new Texture();

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    };

    FrameBuffer.prototype.addDepthTexture = function addDepthTexture(texture) {
        /* eslint-disable max-len */
        this.depthTexture = texture || new _BaseTexture2.default(null, 0, 1, this.width, this.height, _const.FORMATS.DEPTH_COMPONENT, _const.TYPES.UNSIGNED_SHORT); // UNSIGNED_SHORT;
        /* eslint-disable max-len */

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    };

    FrameBuffer.prototype.enableDepth = function enableDepth() {
        this.depth = true;

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    };

    FrameBuffer.prototype.enableStencil = function enableStencil() {
        this.stencil = true;

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    };

    FrameBuffer.prototype.resize = function resize(width, height) {
        if (width === this.width && height === this.height) return;

        this.width = width;
        this.height = height;

        this.dirtyId++;
        this.dirtySize++;

        for (var i = 0; i < this.colorTextures.length; i++) {
            this.colorTextures[i].resize(width, height);
        }

        if (this.depthTexture) {
            this.depthTexture.resize(width, height);
        }
    };

    _createClass(FrameBuffer, [{
        key: 'colorTexture',
        get: function get() {
            return this.colorTextures[0];
        }
    }]);

    return FrameBuffer;
}();

exports.default = FrameBuffer;
//# sourceMappingURL=FrameBuffer.js.map