'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Plane2 = require('./Plane');

var _Plane3 = _interopRequireDefault(_Plane2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DEFAULT_BORDER_SIZE = 10;

/**
 * The NineSlicePlane allows you to stretch a texture using 9-slice scaling. The corners will remain unscaled (useful
 * for buttons with rounded corners for example) and the other areas will be scaled horizontally and or vertically
 *
 *```js
 * let Plane9 = new PIXI.NineSlicePlane(PIXI.Texture.fromImage('BoxWithRoundedCorners.png'), 15, 15, 15, 15);
 *  ```
 * <pre>
 *      A                          B
 *    +---+----------------------+---+
 *  C | 1 |          2           | 3 |
 *    +---+----------------------+---+
 *    |   |                      |   |
 *    | 4 |          5           | 6 |
 *    |   |                      |   |
 *    +---+----------------------+---+
 *  D | 7 |          8           | 9 |
 *    +---+----------------------+---+

 *  When changing this objects width and/or height:
 *     areas 1 3 7 and 9 will remain unscaled.
 *     areas 2 and 8 will be stretched horizontally
 *     areas 4 and 6 will be stretched vertically
 *     area 5 will be stretched both horizontally and vertically
 * </pre>
 *
 * @class
 * @extends PIXI.mesh.Plane
 * @memberof PIXI.mesh
 *
 */

var NineSlicePlane = function (_Plane) {
    _inherits(NineSlicePlane, _Plane);

    /**
     * @param {PIXI.Texture} texture - The texture to use on the NineSlicePlane.
     * @param {int} [leftWidth=10] size of the left vertical bar (A)
     * @param {int} [topHeight=10] size of the top horizontal bar (C)
     * @param {int} [rightWidth=10] size of the right vertical bar (B)
     * @param {int} [bottomHeight=10] size of the bottom horizontal bar (D)
     */
    function NineSlicePlane(texture, leftWidth, topHeight, rightWidth, bottomHeight) {
        _classCallCheck(this, NineSlicePlane);

        var _this = _possibleConstructorReturn(this, _Plane.call(this, texture, 4, 4));

        var uvs = _this.uvs;

        // right and bottom uv's are always 1
        uvs[6] = uvs[14] = uvs[22] = uvs[30] = 1;
        uvs[25] = uvs[27] = uvs[29] = uvs[31] = 1;

        _this._origWidth = texture.width;
        _this._origHeight = texture.height;
        _this._uvw = 1 / _this._origWidth;
        _this._uvh = 1 / _this._origHeight;

        /**
         * The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
         *
         * @member {number}
         * @memberof PIXI.NineSlicePlane#
         * @override
         */
        _this.width = texture.width;

        /**
         * The height of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
         *
         * @member {number}
         * @memberof PIXI.NineSlicePlane#
         * @override
         */
        _this.height = texture.height;

        uvs[2] = uvs[10] = uvs[18] = uvs[26] = _this._uvw * leftWidth;
        uvs[4] = uvs[12] = uvs[20] = uvs[28] = 1 - _this._uvw * rightWidth;
        uvs[9] = uvs[11] = uvs[13] = uvs[15] = _this._uvh * topHeight;
        uvs[17] = uvs[19] = uvs[21] = uvs[23] = 1 - _this._uvh * bottomHeight;

        /**
         * The width of the left column (a)
         *
         * @member {number}
         */
        _this.leftWidth = typeof leftWidth !== 'undefined' ? leftWidth : DEFAULT_BORDER_SIZE;

        /**
         * The width of the right column (b)
         *
         * @member {number}
         */
        _this.rightWidth = typeof rightWidth !== 'undefined' ? rightWidth : DEFAULT_BORDER_SIZE;

        /**
         * The height of the top row (c)
         *
         * @member {number}
         */
        _this.topHeight = typeof topHeight !== 'undefined' ? topHeight : DEFAULT_BORDER_SIZE;

        /**
         * The height of the bottom row (d)
         *
         * @member {number}
         */
        _this.bottomHeight = typeof bottomHeight !== 'undefined' ? bottomHeight : DEFAULT_BORDER_SIZE;
        return _this;
    }

    /**
     * Updates the horizontal vertices.
     *
     */


    NineSlicePlane.prototype.updateHorizontalVertices = function updateHorizontalVertices() {
        var vertices = this.vertices;

        vertices[9] = vertices[11] = vertices[13] = vertices[15] = this._topHeight;
        vertices[17] = vertices[19] = vertices[21] = vertices[23] = this._height - this._bottomHeight;
        vertices[25] = vertices[27] = vertices[29] = vertices[31] = this._height;
    };

    /**
     * Updates the vertical vertices.
     *
     */


    NineSlicePlane.prototype.updateVerticalVertices = function updateVerticalVertices() {
        var vertices = this.vertices;

        vertices[2] = vertices[10] = vertices[18] = vertices[26] = this._leftWidth;
        vertices[4] = vertices[12] = vertices[20] = vertices[28] = this._width - this._rightWidth;
        vertices[6] = vertices[14] = vertices[22] = vertices[30] = this._width;
    };

    /**
     * Renders the object using the Canvas renderer
     *
     * @private
     * @param {PIXI.CanvasRenderer} renderer - The canvas renderer to render with.
     */


    NineSlicePlane.prototype._renderCanvas = function _renderCanvas(renderer) {
        var context = renderer.context;

        context.globalAlpha = this.worldAlpha;

        var transform = this.worldTransform;
        var res = renderer.resolution;

        if (renderer.roundPixels) {
            context.setTransform(transform.a * res, transform.b * res, transform.c * res, transform.d * res, transform.tx * res | 0, transform.ty * res | 0);
        } else {
            context.setTransform(transform.a * res, transform.b * res, transform.c * res, transform.d * res, transform.tx * res, transform.ty * res);
        }

        var base = this._texture.baseTexture;
        var textureSource = base.source;
        var w = base.width;
        var h = base.height;

        this.drawSegment(context, textureSource, w, h, 0, 1, 10, 11);
        this.drawSegment(context, textureSource, w, h, 2, 3, 12, 13);
        this.drawSegment(context, textureSource, w, h, 4, 5, 14, 15);
        this.drawSegment(context, textureSource, w, h, 8, 9, 18, 19);
        this.drawSegment(context, textureSource, w, h, 10, 11, 20, 21);
        this.drawSegment(context, textureSource, w, h, 12, 13, 22, 23);
        this.drawSegment(context, textureSource, w, h, 16, 17, 26, 27);
        this.drawSegment(context, textureSource, w, h, 18, 19, 28, 29);
        this.drawSegment(context, textureSource, w, h, 20, 21, 30, 31);
    };

    /**
     * Renders one segment of the plane.
     * to mimic the exact drawing behavior of stretching the image like WebGL does, we need to make sure
     * that the source area is at least 1 pixel in size, otherwise nothing gets drawn when a slice size of 0 is used.
     *
     * @private
     * @param {CanvasRenderingContext2D} context - The context to draw with.
     * @param {CanvasImageSource} textureSource - The source to draw.
     * @param {number} w - width of the texture
     * @param {number} h - height of the texture
     * @param {number} x1 - x index 1
     * @param {number} y1 - y index 1
     * @param {number} x2 - x index 2
     * @param {number} y2 - y index 2
     */


    NineSlicePlane.prototype.drawSegment = function drawSegment(context, textureSource, w, h, x1, y1, x2, y2) {
        // otherwise you get weird results when using slices of that are 0 wide or high.
        var uvs = this.uvs;
        var vertices = this.vertices;

        var sw = (uvs[x2] - uvs[x1]) * w;
        var sh = (uvs[y2] - uvs[y1]) * h;
        var dw = vertices[x2] - vertices[x1];
        var dh = vertices[y2] - vertices[y1];

        // make sure the source is at least 1 pixel wide and high, otherwise nothing will be drawn.
        if (sw < 1) {
            sw = 1;
        }

        if (sh < 1) {
            sh = 1;
        }

        // make sure destination is at least 1 pixel wide and high, otherwise you get
        // lines when rendering close to original size.
        if (dw < 1) {
            dw = 1;
        }

        if (dh < 1) {
            dh = 1;
        }

        context.drawImage(textureSource, uvs[x1] * w, uvs[y1] * h, sw, sh, vertices[x1], vertices[y1], dw, dh);
    };

    /**
     * The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
     *
     * @member {number}
     * @memberof PIXI.NineSlicePlane#
     */


    _createClass(NineSlicePlane, [{
        key: 'width',
        get: function get() {
            return this._width;
        }

        /**
         * Sets the width.
         *
         * @param {number} value - the value to set to.
         */
        ,
        set: function set(value) {
            this._width = value;
            this.updateVerticalVertices();
        }

        /**
         * The height of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
         *
         * @member {number}
         * @memberof PIXI.NineSlicePlane#
         */

    }, {
        key: 'height',
        get: function get() {
            return this._height;
        }

        /**
         * Sets the height.
         *
         * @param {number} value - the value to set to.
         */
        ,
        set: function set(value) {
            this._height = value;
            this.updateHorizontalVertices();
        }

        /**
         * The width of the left column
         *
         * @member {number}
         */

    }, {
        key: 'leftWidth',
        get: function get() {
            return this._leftWidth;
        }

        /**
         * Sets the width of the left column.
         *
         * @param {number} value - the value to set to.
         */
        ,
        set: function set(value) {
            this._leftWidth = value;

            var uvs = this.uvs;
            var vertices = this.vertices;

            uvs[2] = uvs[10] = uvs[18] = uvs[26] = this._uvw * value;
            vertices[2] = vertices[10] = vertices[18] = vertices[26] = value;

            this.dirty = true;
        }

        /**
         * The width of the right column
         *
         * @member {number}
         */

    }, {
        key: 'rightWidth',
        get: function get() {
            return this._rightWidth;
        }

        /**
         * Sets the width of the right column.
         *
         * @param {number} value - the value to set to.
         */
        ,
        set: function set(value) {
            this._rightWidth = value;

            var uvs = this.uvs;
            var vertices = this.vertices;

            uvs[4] = uvs[12] = uvs[20] = uvs[28] = 1 - this._uvw * value;
            vertices[4] = vertices[12] = vertices[20] = vertices[28] = this._width - value;

            this.dirty = true;
        }

        /**
         * The height of the top row
         *
         * @member {number}
         */

    }, {
        key: 'topHeight',
        get: function get() {
            return this._topHeight;
        }

        /**
         * Sets the height of the top row.
         *
         * @param {number} value - the value to set to.
         */
        ,
        set: function set(value) {
            this._topHeight = value;

            var uvs = this.uvs;
            var vertices = this.vertices;

            uvs[9] = uvs[11] = uvs[13] = uvs[15] = this._uvh * value;
            vertices[9] = vertices[11] = vertices[13] = vertices[15] = value;

            this.dirty = true;
        }

        /**
         * The height of the bottom row
         *
         * @member {number}
         */

    }, {
        key: 'bottomHeight',
        get: function get() {
            return this._bottomHeight;
        }

        /**
         * Sets the height of the bottom row.
         *
         * @param {number} value - the value to set to.
         */
        ,
        set: function set(value) {
            this._bottomHeight = value;

            var uvs = this.uvs;
            var vertices = this.vertices;

            uvs[17] = uvs[19] = uvs[21] = uvs[23] = 1 - this._uvh * value;
            vertices[17] = vertices[19] = vertices[21] = vertices[23] = this._height - value;

            this.dirty = true;
        }
    }]);

    return NineSlicePlane;
}(_Plane3.default);

exports.default = NineSlicePlane;
//# sourceMappingURL=NineSlicePlane.js.map