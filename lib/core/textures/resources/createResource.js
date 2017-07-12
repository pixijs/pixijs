'use strict';

exports.__esModule = true;
exports.default = createResource;

var _ImageResource = require('./ImageResource');

var _ImageResource2 = _interopRequireDefault(_ImageResource);

var _SVGResource = require('./SVGResource');

var _SVGResource2 = _interopRequireDefault(_SVGResource);

var _CanvasResource = require('./CanvasResource');

var _CanvasResource2 = _interopRequireDefault(_CanvasResource);

var _VideoResource = require('./VideoResource');

var _VideoResource2 = _interopRequireDefault(_VideoResource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createResource(source) {
    if (typeof source === 'string') {
        // check if its a video..
        if (source.match(/\.(mp4|webm|ogg|h264|avi|mov)$/)) {
            return new _VideoResource2.default.fromUrl(source);
            // video!
            // return Texture.fromVideoUrl(source);
            // return SVGResource.from(url);
        } else if (source.match(/\.(svg)$/)) {
            // SVG
            return _SVGResource2.default.from(source);
        }

        // probably an image!
        return _ImageResource2.default.from(source);
    } else if (source instanceof HTMLImageElement) {
        return new _ImageResource2.default(source);
    } else if (source instanceof HTMLCanvasElement) {
        return new _CanvasResource2.default(source);
    } else if (source instanceof HTMLVideoElement) {
        return new _VideoResource2.default(source);
    }

    return source;
}
//# sourceMappingURL=createResource.js.map