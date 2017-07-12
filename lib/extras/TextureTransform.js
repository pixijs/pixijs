'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Matrix = require('../core/math/Matrix');

var _Matrix2 = _interopRequireDefault(_Matrix);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var tempMat = new _Matrix2.default();

/**
 * class controls uv transform and frame clamp for texture
 *
 * @class
 * @memberof PIXI.extras
 */

var TextureTransform = function () {
    /**
     *
     * @param {PIXI.Texture} texture observed texture
     * @param {number} [clampMargin] Changes frame clamping, 0.5 by default. Use -0.5 for extra border.
     * @constructor
     */
    function TextureTransform(texture, clampMargin) {
        _classCallCheck(this, TextureTransform);

        this._texture = texture;

        this.mapCoord = new _Matrix2.default();

        this.uClampFrame = new Float32Array(4);

        this.uClampOffset = new Float32Array(2);

        this._lastTextureID = -1;

        /**
         * Changes frame clamping
         * Works with TilingSprite and Mesh
         * Change to 1.5 if you texture has repeated right and bottom lines, that leads to smoother borders
         *
         * @default 0
         * @member {number}
         */
        this.clampOffset = 0;

        /**
         * Changes frame clamping
         * Works with TilingSprite and Mesh
         * Change to -0.5 to add a pixel to the edge, recommended for transparent trimmed textures in atlas
         *
         * @default 0.5
         * @member {number}
         */
        this.clampMargin = typeof clampMargin === 'undefined' ? 0.5 : clampMargin;
    }

    /**
     * texture property
     * @member {PIXI.Texture}
     */


    /**
     * Multiplies uvs array to transform
     * @param {Float32Array} uvs mesh uvs
     * @param {Float32Array} [out=uvs] output
     * @returns {Float32Array} output
     */
    TextureTransform.prototype.multiplyUvs = function multiplyUvs(uvs, out) {
        if (out === undefined) {
            out = uvs;
        }

        var mat = this.mapCoord;

        for (var i = 0; i < uvs.length; i += 2) {
            var x = uvs[i];
            var y = uvs[i + 1];

            out[i] = x * mat.a + y * mat.c + mat.tx;
            out[i + 1] = x * mat.b + y * mat.d + mat.ty;
        }

        return out;
    };

    /**
     * updates matrices if texture was changed
     * @param {boolean} forceUpdate if true, matrices will be updated any case
     * @returns {boolean} whether or not it was updated
     */


    TextureTransform.prototype.update = function update(forceUpdate) {
        var tex = this._texture;

        if (!tex || !tex.valid) {
            return false;
        }

        if (!forceUpdate && this._lastTextureID === tex._updateID) {
            return false;
        }

        this._lastTextureID = tex._updateID;

        var uvs = tex._uvs;

        this.mapCoord.set(uvs.x1 - uvs.x0, uvs.y1 - uvs.y0, uvs.x3 - uvs.x0, uvs.y3 - uvs.y0, uvs.x0, uvs.y0);

        var orig = tex.orig;
        var trim = tex.trim;

        if (trim) {
            tempMat.set(orig.width / trim.width, 0, 0, orig.height / trim.height, -trim.x / trim.width, -trim.y / trim.height);
            this.mapCoord.append(tempMat);
        }

        var texBase = tex.baseTexture;
        var frame = this.uClampFrame;
        var margin = this.clampMargin / texBase.resolution;
        var offset = this.clampOffset;

        frame[0] = (tex._frame.x + margin + offset) / texBase.width;
        frame[1] = (tex._frame.y + margin + offset) / texBase.height;
        frame[2] = (tex._frame.x + tex._frame.width - margin + offset) / texBase.width;
        frame[3] = (tex._frame.y + tex._frame.height - margin + offset) / texBase.height;
        this.uClampOffset[0] = offset / texBase.realWidth;
        this.uClampOffset[1] = offset / texBase.realHeight;

        return true;
    };

    _createClass(TextureTransform, [{
        key: 'texture',
        get: function get() {
            return this._texture;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this._texture = value;
            this._lastTextureID = -1;
        }
    }]);

    return TextureTransform;
}();

exports.default = TextureTransform;
//# sourceMappingURL=TextureTransform.js.map