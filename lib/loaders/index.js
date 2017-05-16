'use strict';

exports.__esModule = true;
exports.shared = exports.Resource = exports.textureParser = exports.getResourcePath = exports.spritesheetParser = exports.parseBitmapFontData = exports.bitmapFontParser = exports.Loader = undefined;

var _bitmapFontParser = require('./bitmapFontParser');

Object.defineProperty(exports, 'bitmapFontParser', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_bitmapFontParser).default;
    }
});
Object.defineProperty(exports, 'parseBitmapFontData', {
    enumerable: true,
    get: function get() {
        return _bitmapFontParser.parse;
    }
});

var _spritesheetParser = require('./spritesheetParser');

Object.defineProperty(exports, 'spritesheetParser', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_spritesheetParser).default;
    }
});
Object.defineProperty(exports, 'getResourcePath', {
    enumerable: true,
    get: function get() {
        return _spritesheetParser.getResourcePath;
    }
});

var _textureParser = require('./textureParser');

Object.defineProperty(exports, 'textureParser', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_textureParser).default;
    }
});

var _resourceLoader = require('resource-loader');

Object.defineProperty(exports, 'Resource', {
    enumerable: true,
    get: function get() {
        return _resourceLoader.Resource;
    }
});

var _Application = require('../core/Application');

var _Application2 = _interopRequireDefault(_Application);

var _loader = require('./loader');

var _loader2 = _interopRequireDefault(_loader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This namespace contains APIs which extends the {@link https://github.com/englercj/resource-loader resource-loader} module
 * for loading assets, data, and other resources dynamically.
 * @example
 * const loader = new PIXI.loaders.Loader();
 * loader.add('bunny', 'data/bunny.png')
 *       .add('spaceship', 'assets/spritesheet.json');
 * loader.load((loader, resources) => {
 *    // resources.bunny
 *    // resources.spaceship
 * });
 * @namespace PIXI.loaders
 */
exports.Loader = _loader2.default;


/**
 * A premade instance of the loader that can be used to load resources.
 * @name shared
 * @memberof PIXI.loaders
 * @type {PIXI.loaders.Loader}
 */
var shared = new _loader2.default();

shared.destroy = function () {
    // protect destroying shared loader
};

exports.shared = shared;

// Mixin the loader construction

var AppPrototype = _Application2.default.prototype;

AppPrototype._loader = null;

/**
 * Loader instance to help with asset loading.
 * @name PIXI.Application#loader
 * @type {PIXI.loaders.Loader}
 */
Object.defineProperty(AppPrototype, 'loader', {
    get: function get() {
        if (!this._loader) {
            var sharedLoader = this._options.sharedLoader;

            this._loader = sharedLoader ? shared : new _loader2.default();
        }

        return this._loader;
    }
});

// Override the destroy function
// making sure to destroy the current Loader
AppPrototype._parentDestroy = AppPrototype.destroy;
AppPrototype.destroy = function destroy(removeView) {
    if (this._loader) {
        this._loader.destroy();
        this._loader = null;
    }
    this._parentDestroy(removeView);
};
//# sourceMappingURL=index.js.map