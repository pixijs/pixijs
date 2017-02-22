'use strict';

exports.__esModule = true;

exports.default = function () {
    return function textureParser(resource, next) {
        // create a new texture if the data is an Image object
        if (resource.data && resource.type === _resourceLoader.Resource.TYPE.IMAGE) {
            resource.texture = _Texture2.default.fromLoader(resource.data, resource.url, resource.name);
        }
        next();
    };
};

var _resourceLoader = require('resource-loader');

var _Texture = require('../core/textures/Texture');

var _Texture2 = _interopRequireDefault(_Texture);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=textureParser.js.map