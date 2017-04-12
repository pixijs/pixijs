'use strict';

exports.__esModule = true;

var _Mesh2 = require('./Mesh');

var _Mesh3 = _interopRequireDefault(_Mesh2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The Plane allows you to draw a texture across several points and them manipulate these points
 *
 *```js
 * for (let i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
 * let Plane = new PIXI.Plane(PIXI.Texture.fromImage("snake.png"), points);
 *  ```
 *
 * @class
 * @extends PIXI.mesh.Mesh
 * @memberof PIXI.mesh
 *
 */
var Plane = function (_Mesh) {
    _inherits(Plane, _Mesh);

    /**
     * @param {PIXI.Texture} texture - The texture to use on the Plane.
     * @param {number} verticesX - The number of vertices in the x-axis
     * @param {number} verticesY - The number of vertices in the y-axis
     */
    function Plane(texture, verticesX, verticesY) {
        _classCallCheck(this, Plane);

        /**
         * Tracker for if the Plane is ready to be drawn. Needed because Mesh ctor can
         * call _onTextureUpdated which could call refresh too early.
         *
         * @member {boolean}
         * @private
         */
        var _this = _possibleConstructorReturn(this, _Mesh.call(this, texture));

        _this._ready = true;

        _this.verticesX = verticesX || 10;
        _this.verticesY = verticesY || 10;

        _this.drawMode = _Mesh3.default.DRAW_MODES.TRIANGLES;
        _this.refresh();
        return _this;
    }

    /**
     * Refreshes plane coordinates
     *
     */


    Plane.prototype._refresh = function _refresh() {
        var texture = this._texture;
        var total = this.verticesX * this.verticesY;
        var verts = [];
        var colors = [];
        var uvs = [];
        var indices = [];

        var segmentsX = this.verticesX - 1;
        var segmentsY = this.verticesY - 1;

        var sizeX = texture.width / segmentsX;
        var sizeY = texture.height / segmentsY;

        for (var i = 0; i < total; i++) {
            var x = i % this.verticesX;
            var y = i / this.verticesX | 0;

            verts.push(x * sizeX, y * sizeY);

            uvs.push(x / segmentsX, y / segmentsY);
        }

        //  cons

        var totalSub = segmentsX * segmentsY;

        for (var _i = 0; _i < totalSub; _i++) {
            var xpos = _i % segmentsX;
            var ypos = _i / segmentsX | 0;

            var value = ypos * this.verticesX + xpos;
            var value2 = ypos * this.verticesX + xpos + 1;
            var value3 = (ypos + 1) * this.verticesX + xpos;
            var value4 = (ypos + 1) * this.verticesX + xpos + 1;

            indices.push(value, value2, value3);
            indices.push(value2, value4, value3);
        }

        // console.log(indices)
        this.vertices = new Float32Array(verts);
        this.uvs = new Float32Array(uvs);
        this.colors = new Float32Array(colors);
        this.indices = new Uint16Array(indices);
        this.indexDirty = true;

        this.multiplyUvs();
    };

    /**
     * Clear texture UVs when new texture is set
     *
     * @private
     */


    Plane.prototype._onTextureUpdate = function _onTextureUpdate() {
        _Mesh3.default.prototype._onTextureUpdate.call(this);

        // wait for the Plane ctor to finish before calling refresh
        if (this._ready) {
            this.refresh();
        }
    };

    return Plane;
}(_Mesh3.default);

exports.default = Plane;
//# sourceMappingURL=Plane.js.map