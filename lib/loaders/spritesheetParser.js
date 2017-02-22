'use strict';

exports.__esModule = true;

exports.default = function () {
    return function spritesheetParser(resource, next) {
        var resourcePath = void 0;
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

        // Prepend url path unless the resource image is a data url
        if (resource.isDataUrl) {
            resourcePath = resource.data.meta.image;
        } else {
            resourcePath = _path2.default.dirname(resource.url.replace(this.baseUrl, '')) + '/' + resource.data.meta.image;
        }

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

var _resourceLoader = require('resource-loader');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _core = require('../core');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=spritesheetParser.js.map