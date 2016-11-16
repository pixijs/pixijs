'use strict';

exports.__esModule = true;

exports.default = function () {
    return function textureParser(resource, next) {
        // create a new texture if the data is an Image object
        if (resource.data && resource.isImage) {
            var baseTexture = new core.BaseTexture(resource.data, null, core.utils.getResolutionOfUrl(resource.url));

            baseTexture.imageUrl = resource.url;
            resource.texture = new core.Texture(baseTexture);

            // lets also add the frame to pixi's global cache for fromFrame and fromImage fucntions
            core.utils.BaseTextureCache[resource.name] = baseTexture;
            core.utils.TextureCache[resource.name] = resource.texture;

            // also add references by url if they are different.
            if (resource.name !== resource.url) {
                core.utils.BaseTextureCache[resource.url] = baseTexture;
                core.utils.TextureCache[resource.url] = resource.texture;
            }
        }

        next();
    };
};

var _core = require('../core');

var core = _interopRequireWildcard(_core);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
//# sourceMappingURL=textureParser.js.map