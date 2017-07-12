'use strict';

exports.__esModule = true;

var _Mesh2 = require('./Mesh');

var _Mesh3 = _interopRequireDefault(_Mesh2);

var _core = require('../core');

var core = _interopRequireWildcard(_core);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The rope allows you to draw a texture across several points and them manipulate these points
 *
 *```js
 * for (let i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
 * let rope = new PIXI.Rope(PIXI.Texture.fromImage("snake.png"), points);
 *  ```
 *
 * @class
 * @extends PIXI.mesh.Mesh
 * @memberof PIXI.mesh
 *
 */
var Rope = function (_Mesh) {
    _inherits(Rope, _Mesh);

    /**
     * @param {PIXI.Texture} texture - The texture to use on the rope.
     * @param {PIXI.Point[]} points - An array of {@link PIXI.Point} objects to construct this rope.
     */
    function Rope(texture, points) {
        _classCallCheck(this, Rope);

        /*
         * @member {PIXI.Point[]} An array of points that determine the rope
         */
        var _this = _possibleConstructorReturn(this, _Mesh.call(this, texture, new Float32Array(points.length * 4), new Float32Array(points.length * 4), new Uint16Array(points.length * 2), 5));

        _this.points = points;
        _this.refresh();
        return _this;
    }

    /**
     * Refreshes
     */


    Rope.prototype.refresh = function refresh() {
        var points = this.points;

        if (!points) return;

        var vertexBuffer = this.geometry.getAttribute('aVertexPosition');
        var uvBuffer = this.geometry.getAttribute('aTextureCoord');
        var indexBuffer = this.geometry.getIndex();

        // if too little points, or texture hasn't got UVs set yet just move on.
        if (points.length < 1 || !this.texture._uvs) {
            return;
        }

        // if the number of points has changed we will need to recreate the arraybuffers
        if (vertexBuffer.data.length / 4 !== points.length) {
            vertexBuffer.data = new Float32Array(points.length * 4);
            uvBuffer.data = new Float32Array(points.length * 4);
            indexBuffer.data = new Uint16Array(points.length * 2);
        }

        var uvs = uvBuffer.data;
        var indices = indexBuffer.data;

        var textureUvs = this.texture._uvs;
        var offset = new core.Point(textureUvs.x0, textureUvs.y0);
        var factor = new core.Point(textureUvs.x2 - textureUvs.x0, Number(textureUvs.y2 - textureUvs.y0));

        uvs[0] = 0 + offset.x;
        uvs[1] = 0 + offset.y;
        uvs[2] = 0 + offset.x;
        uvs[3] = factor.y + offset.y;

        indices[0] = 0;
        indices[1] = 1;

        var total = points.length;

        for (var i = 1; i < total; i++) {
            // time to do some smart drawing!
            var index = i * 4;
            var amount = i / (total - 1);

            uvs[index] = amount * factor.x + offset.x;
            uvs[index + 1] = 0 + offset.y;

            uvs[index + 2] = amount * factor.x + offset.x;
            uvs[index + 3] = factor.y + offset.y;

            index = i * 2;
            indices[index] = index;
            indices[index + 1] = index + 1;
        }

        // ensure that the changes are uploaded
        vertexBuffer.update();
        uvBuffer.update();
        indexBuffer.update();
    };

    /**
     * Updates the object transform for rendering
     *
     * @private
     */


    Rope.prototype.updateTransform = function updateTransform() {
        var points = this.points;

        if (points.length < 1) {
            return;
        }

        var lastPoint = points[0];
        var nextPoint = void 0;
        var perpX = 0;
        var perpY = 0;

        // this.count -= 0.2;

        var vertexBuffer = this.geometry.getAttribute('aVertexPosition');
        var vertices = vertexBuffer.data;

        var total = points.length;

        for (var i = 0; i < total; i++) {
            var point = points[i];
            var index = i * 4;

            if (i < points.length - 1) {
                nextPoint = points[i + 1];
            } else {
                nextPoint = point;
            }

            perpY = -(nextPoint.x - lastPoint.x);
            perpX = nextPoint.y - lastPoint.y;

            var ratio = (1 - i / (total - 1)) * 10;

            if (ratio > 1) {
                ratio = 1;
            }
            var perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
            var num = this.texture.height / 2; // (20 + Math.abs(Math.sin((i + this.count) * 0.3) * 50) )* ratio;

            perpX /= perpLength;
            perpY /= perpLength;

            perpX *= num;
            perpY *= num;

            vertices[index] = point.x + perpX;
            vertices[index + 1] = point.y + perpY;
            vertices[index + 2] = point.x - perpX;
            vertices[index + 3] = point.y - perpY;

            lastPoint = point;
        }

        // mark the buffer as requiring an upload..
        vertexBuffer.update();

        this.uniforms.alpha = this.worldAlpha;

        this.containerUpdateTransform();
    };

    /**
     * When the texture is updated, this event will fire to update the scale and frame
     *
     * @private
     */


    Rope.prototype._onTextureUpdate = function _onTextureUpdate() {
        this.refresh();
    };

    return Rope;
}(_Mesh3.default);

exports.default = Rope;
//# sourceMappingURL=Rope.js.map