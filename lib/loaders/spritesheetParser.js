'use strict';

exports.__esModule = true;

exports.default = function () {
    return function spritesheetParser(resource, next) {
        var imageResourceName = resource.name + '_image';

        // skip if no data, its not json, it isn't spritesheet data, or the image resource already exists
        if (!resource.data || resource.type !== _resourceLoader.Resource.TYPE.JSON || !resource.data.frames || this.resources[imageResourceName]) {
            next();

            return;
        }

        var loadOptions = {
            crossOrigin: resource.crossOrigin,
            loadType: _resourceLoader.Resource.LOAD_TYPE.IMAGE,
            metadata: resource.metadata.imageMetadata,
            parentResource: resource
        };

        var resourcePath = getResourcePath(resource, this.baseUrl);

        // load the image for this sheet
        this.add(imageResourceName, resourcePath, loadOptions, function onImageLoad(res) {
            var spritesheet = new _core.Spritesheet(res.texture.baseTexture, resource.data, resource.url);

            spritesheet.parse(function () {
                resource.spritesheet = spritesheet;
                resource.textures = spritesheet.textures;
                next();
            });
        });
    };
};

exports.getResourcePath = getResourcePath;

var _resourceLoader = require('resource-loader');

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _core = require('../core');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getResourcePath(resource, baseUrl) {
    // Prepend url path unless the resource image is a data url
    if (resource.isDataUrl) {
        return resource.data.meta.image;
    }

    return _url2.default.resolve(resource.url.replace(baseUrl, ''), resource.data.meta.image);
}
//# sourceMappingURL=spritesheetParser.js.map