'use strict';

exports.__esModule = true;

var _miniRunner = require('mini-runner');

var _miniRunner2 = _interopRequireDefault(_miniRunner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TextureResource = function () {
    function TextureResource(source) {
        _classCallCheck(this, TextureResource);

        this.source = source;

        this.loaded = false; // TODO rename to ready?

        this.width = -1;
        this.height = -1;

        this.uploadable = true;

        this.resourceUpdated = new _miniRunner2.default('resourceUpdated');

        // create a prommise..
        this.load = null;
    }

    TextureResource.prototype.destroy = function destroy() {
        // somthing
    };

    return TextureResource;
}();

exports.default = TextureResource;
//# sourceMappingURL=TextureResource.js.map