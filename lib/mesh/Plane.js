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
     * @param {object} opts - an options object - add meshWidth and meshHeight
     */
    function Plane(texture, verticesX, verticesY) {
        var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

        _classCallCheck(this, Plane);

        var _this = _possibleConstructorReturn(this, _Mesh.call(this, texture, new Float32Array(1), new Float32Array(1), new Uint16Array(1), 4));

        _this.segmentsX = _this.verticesX = verticesX || 10;
        _this.segmentsY = _this.verticesY = verticesY || 10;

        _this.meshWidth = opts.meshWidth || texture.width;
        _this.meshHeight = opts.meshHeight || texture.height;

        _this.refresh();
        return _this;
    }

    /**
     * Refreshes
     *
     */


    Plane.prototype.refresh = function refresh() {
        var total = this.verticesX * this.verticesY;
        var verts = [];
        var uvs = [];
        var indices = [];
        var texture = this.texture;

        var segmentsX = this.verticesX - 1;
        var segmentsY = this.verticesY - 1;

        var sizeX = this.meshWidth / segmentsX;
        var sizeY = this.meshHeight / segmentsY;

        for (var i = 0; i < total; i++) {
            if (texture._uvs) {
                var x = i % this.verticesX;
                var y = i / this.verticesX | 0;

                verts.push(x * sizeX, y * sizeY);

                // this works for rectangular textures.
                uvs.push(texture._uvs.x0 + (texture._uvs.x1 - texture._uvs.x0) * (x / (this.verticesX - 1)), texture._uvs.y0 + (texture._uvs.y3 - texture._uvs.y0) * (y / (this.verticesY - 1)));
            } else {
                uvs.push(0);
            }
        }

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

        this.shader.uniforms.alpha = 1;
        this.shader.uniforms.uSampler2 = this.texture;

        this.vertices = new Float32Array(verts);
        this.uvs = new Float32Array(uvs);
        this.indices = new Uint16Array(indices);

        this.geometry.buffers[0].data = this.vertices;
        this.geometry.buffers[1].data = this.uvs;
        this.geometry.indexBuffer.data = this.indices;

        // ensure that the changes are uploaded
        this.geometry.buffers[0].update();
        this.geometry.buffers[1].update();
        this.geometry.indexBuffer.update();
    };

    /**
     * Updates the object transform for rendering
     *
     * @private
     */


    Plane.prototype.updateTransform = function updateTransform() {
        this.geometry.buffers[0].update();
        this.containerUpdateTransform();
    };

    return Plane;
}(_Mesh3.default);

exports.default = Plane;
//# sourceMappingURL=Plane.js.map