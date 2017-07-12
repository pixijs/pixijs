'use strict';

exports.__esModule = true;
exports.parse = parse;

exports.default = function () {
    return function bitmapFontParser(resource, next) {
        // skip if no data or not xml data
        if (!resource.data || resource.type !== _resourceLoader.Resource.TYPE.XML) {
            next();

            return;
        }

        // skip if not bitmap font data, using some silly duck-typing
        if (resource.data.getElementsByTagName('page').length === 0 || resource.data.getElementsByTagName('info').length === 0 || resource.data.getElementsByTagName('info')[0].getAttribute('face') === null) {
            next();

            return;
        }

        var xmlUrl = !resource.isDataUrl ? path.dirname(resource.url) : '';

        if (resource.isDataUrl) {
            if (xmlUrl === '.') {
                xmlUrl = '';
            }

            if (this.baseUrl && xmlUrl) {
                // if baseurl has a trailing slash then add one to xmlUrl so the replace works below
                if (this.baseUrl.charAt(this.baseUrl.length - 1) === '/') {
                    xmlUrl += '/';
                }

                // remove baseUrl from xmlUrl
                xmlUrl = xmlUrl.replace(this.baseUrl, '');
            }
        }

        // if there is an xmlUrl now, it needs a trailing slash. Ensure that it does if the string isn't empty.
        if (xmlUrl && xmlUrl.charAt(xmlUrl.length - 1) !== '/') {
            xmlUrl += '/';
        }

        var textureUrl = xmlUrl + resource.data.getElementsByTagName('page')[0].getAttribute('file');

        if (_core.utils.TextureCache[textureUrl]) {
            // reuse existing texture
            parse(resource, _core.utils.TextureCache[textureUrl]);
            next();
        } else {
            var loadOptions = {
                crossOrigin: resource.crossOrigin,
                loadType: _resourceLoader.Resource.LOAD_TYPE.IMAGE,
                metadata: resource.metadata.imageMetadata,
                parentResource: resource
            };

            // load the texture for the font
            this.add(resource.name + '_image', textureUrl, loadOptions, function (res) {
                parse(resource, res.texture);
                next();
            });
        }
    };
};

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _core = require('../core');

var _resourceLoader = require('resource-loader');

var _extras = require('../extras');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Register a BitmapText font from loader resource.
 *
 * @function parseBitmapFontData
 * @memberof PIXI.loaders
 * @param {PIXI.loaders.Resource} resource - Loader resource.
 * @param {PIXI.Texture} texture - Reference to texture.
 */
function parse(resource, texture) {
    resource.bitmapFont = _extras.BitmapText.registerFont(resource.data, texture);
}
//# sourceMappingURL=bitmapFontParser.js.map