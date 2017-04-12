'use strict';

exports.__esModule = true;

var _Mesh2 = require('./Mesh');

var _Mesh3 = _interopRequireDefault(_Mesh2);

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

        /**
         * An array of points that determine the rope
         *
         * @member {PIXI.Point[]}
         */
        var _this = _possibleConstructorReturn(this, _Mesh.call(this, texture));

        _this.points = points;

        /**
         * An array of vertices used to construct this rope.
         *
         * @member {Float32Array}
         */
        _this.vertices = new Float32Array(points.length * 4);

        /**
         * The WebGL Uvs of the rope.
         *
         * @member {Float32Array}
         */
        _this.uvs = new Float32Array(points.length * 4);

        /**
         * An array containing the color components
         *
         * @member {Float32Array}
         */
        _this.colors = new Float32Array(points.length * 2);

        /**
         * An array containing the indices of the vertices
         *
         * @member {Uint16Array}
         */
        _this.indices = new Uint16Array(points.length * 2);

        /**
         * refreshes vertices on every updateTransform
         * @member {boolean}
         * @default true
         */
        _this.autoUpdate = true;

        _this.refresh();
        return _this;
    }

    /**
     * Refreshes
     *
     */


    Rope.prototype._refresh = function _refresh() {
        var points = this.points;

        // if too little points, or texture hasn't got UVs set yet just move on.
        if (points.length < 1 || !this._texture._uvs) {
            return;
        }

        // if the number of points has changed we will need to recreate the arraybuffers
        if (this.vertices.length / 4 !== points.length) {
            this.vertices = new Float32Array(points.length * 4);
            this.uvs = new Float32Array(points.length * 4);
            this.colors = new Float32Array(points.length * 2);
            this.indices = new Uint16Array(points.length * 2);
        }

        var uvs = this.uvs;

        var indices = this.indices;
        var colors = this.colors;

        uvs[0] = 0;
        uvs[1] = 0;
        uvs[2] = 0;
        uvs[3] = 1;

        colors[0] = 1;
        colors[1] = 1;

        indices[0] = 0;
        indices[1] = 1;

        var total = points.length;

        for (var i = 1; i < total; i++) {
            // time to do some smart drawing!
            var index = i * 4;
            var amount = i / (total - 1);

            uvs[index] = amount;
            uvs[index + 1] = 0;

            uvs[index + 2] = amount;
            uvs[index + 3] = 1;

            index = i * 2;
            colors[index] = 1;
            colors[index + 1] = 1;

            index = i * 2;
            indices[index] = index;
            indices[index + 1] = index + 1;
        }

        // ensure that the changes are uploaded
        this.dirty++;
        this.indexDirty++;

        this.multiplyUvs();
        this.refreshVertices();
    };

    /**
     * refreshes vertices of Rope mesh
     */


    Rope.prototype.refreshVertices = function refreshVertices() {
        var points = this.points;

        if (points.length < 1) {
            return;
        }

        var lastPoint = points[0];
        var nextPoint = void 0;
        var perpX = 0;
        var perpY = 0;

        // this.count -= 0.2;

        var vertices = this.vertices;
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
            var num = this._texture.height / 2; // (20 + Math.abs(Math.sin((i + this.count) * 0.3) * 50) )* ratio;

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
    };

    /**
     * Updates the object transform for rendering
     *
     * @private
     */


    Rope.prototype.updateTransform = function updateTransform() {
        if (this.autoUpdate) {
            this.refreshVertices();
        }
        this.containerUpdateTransform();
    };

    return Rope;
}(_Mesh3.default);

exports.default = Rope;
//# sourceMappingURL=Rope.js.map