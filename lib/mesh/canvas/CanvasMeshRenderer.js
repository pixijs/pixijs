'use strict';

exports.__esModule = true;

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var _Mesh = require('../Mesh');

var _Mesh2 = _interopRequireDefault(_Mesh);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Renderer dedicated to meshes.
 *
 * @class
 * @private
 * @memberof PIXI
 */
var MeshSpriteRenderer = function () {
    /**
     * @param {PIXI.CanvasRenderer} renderer - The renderer this downport works for
     */
    function MeshSpriteRenderer(renderer) {
        _classCallCheck(this, MeshSpriteRenderer);

        this.renderer = renderer;
    }

    /**
     * Renders the Mesh
     *
     * @param {PIXI.mesh.Mesh} mesh - the Mesh to render
     */


    MeshSpriteRenderer.prototype.render = function render(mesh) {
        var renderer = this.renderer;
        var context = renderer.context;

        var transform = mesh.worldTransform;
        var res = renderer.resolution;

        if (renderer.roundPixels) {
            context.setTransform(transform.a * res, transform.b * res, transform.c * res, transform.d * res, transform.tx * res | 0, transform.ty * res | 0);
        } else {
            context.setTransform(transform.a * res, transform.b * res, transform.c * res, transform.d * res, transform.tx * res, transform.ty * res);
        }

        renderer.setBlendMode(mesh.blendMode);

        if (mesh.drawMode === _Mesh2.default.DRAW_MODES.TRIANGLE_MESH) {
            this._renderTriangleMesh(mesh);
        } else {
            this._renderTriangles(mesh);
        }
    };

    /**
     * Draws the object in Triangle Mesh mode
     *
     * @private
     * @param {PIXI.mesh.Mesh} mesh - the Mesh to render
     */


    MeshSpriteRenderer.prototype._renderTriangleMesh = function _renderTriangleMesh(mesh) {
        // draw triangles!!
        var length = mesh.vertices.length / 2;

        for (var i = 0; i < length - 2; i++) {
            // draw some triangles!
            var index = i * 2;

            this._renderDrawTriangle(mesh, index, index + 2, index + 4);
        }
    };

    /**
     * Draws the object in triangle mode using canvas
     *
     * @private
     * @param {PIXI.mesh.Mesh} mesh - the current mesh
     */


    MeshSpriteRenderer.prototype._renderTriangles = function _renderTriangles(mesh) {
        // draw triangles!!
        var indices = mesh.indices;
        var length = indices.length;

        for (var i = 0; i < length; i += 3) {
            // draw some triangles!
            var index0 = indices[i] * 2;
            var index1 = indices[i + 1] * 2;
            var index2 = indices[i + 2] * 2;

            this._renderDrawTriangle(mesh, index0, index1, index2);
        }
    };

    /**
     * Draws one of the triangles that from the Mesh
     *
     * @private
     * @param {PIXI.mesh.Mesh} mesh - the current mesh
     * @param {number} index0 - the index of the first vertex
     * @param {number} index1 - the index of the second vertex
     * @param {number} index2 - the index of the third vertex
     */


    MeshSpriteRenderer.prototype._renderDrawTriangle = function _renderDrawTriangle(mesh, index0, index1, index2) {
        var context = this.renderer.context;
        var uvs = mesh.uvs;
        var vertices = mesh.vertices;
        var texture = mesh._texture;

        if (!texture.valid) {
            return;
        }

        var base = texture.baseTexture;
        var textureSource = base.source;
        var textureWidth = base.width;
        var textureHeight = base.height;

        var u0 = uvs[index0] * base.width;
        var u1 = uvs[index1] * base.width;
        var u2 = uvs[index2] * base.width;
        var v0 = uvs[index0 + 1] * base.height;
        var v1 = uvs[index1 + 1] * base.height;
        var v2 = uvs[index2 + 1] * base.height;

        var x0 = vertices[index0];
        var x1 = vertices[index1];
        var x2 = vertices[index2];
        var y0 = vertices[index0 + 1];
        var y1 = vertices[index1 + 1];
        var y2 = vertices[index2 + 1];

        if (mesh.canvasPadding > 0) {
            var paddingX = mesh.canvasPadding / mesh.worldTransform.a;
            var paddingY = mesh.canvasPadding / mesh.worldTransform.d;
            var centerX = (x0 + x1 + x2) / 3;
            var centerY = (y0 + y1 + y2) / 3;

            var normX = x0 - centerX;
            var normY = y0 - centerY;

            var dist = Math.sqrt(normX * normX + normY * normY);

            x0 = centerX + normX / dist * (dist + paddingX);
            y0 = centerY + normY / dist * (dist + paddingY);

            //

            normX = x1 - centerX;
            normY = y1 - centerY;

            dist = Math.sqrt(normX * normX + normY * normY);
            x1 = centerX + normX / dist * (dist + paddingX);
            y1 = centerY + normY / dist * (dist + paddingY);

            normX = x2 - centerX;
            normY = y2 - centerY;

            dist = Math.sqrt(normX * normX + normY * normY);
            x2 = centerX + normX / dist * (dist + paddingX);
            y2 = centerY + normY / dist * (dist + paddingY);
        }

        context.save();
        context.beginPath();

        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.lineTo(x2, y2);

        context.closePath();

        context.clip();

        // Compute matrix transform
        var delta = u0 * v1 + v0 * u2 + u1 * v2 - v1 * u2 - v0 * u1 - u0 * v2;
        var deltaA = x0 * v1 + v0 * x2 + x1 * v2 - v1 * x2 - v0 * x1 - x0 * v2;
        var deltaB = u0 * x1 + x0 * u2 + u1 * x2 - x1 * u2 - x0 * u1 - u0 * x2;
        var deltaC = u0 * v1 * x2 + v0 * x1 * u2 + x0 * u1 * v2 - x0 * v1 * u2 - v0 * u1 * x2 - u0 * x1 * v2;
        var deltaD = y0 * v1 + v0 * y2 + y1 * v2 - v1 * y2 - v0 * y1 - y0 * v2;
        var deltaE = u0 * y1 + y0 * u2 + u1 * y2 - y1 * u2 - y0 * u1 - u0 * y2;
        var deltaF = u0 * v1 * y2 + v0 * y1 * u2 + y0 * u1 * v2 - y0 * v1 * u2 - v0 * u1 * y2 - u0 * y1 * v2;

        context.transform(deltaA / delta, deltaD / delta, deltaB / delta, deltaE / delta, deltaC / delta, deltaF / delta);

        context.drawImage(textureSource, 0, 0, textureWidth * base.resolution, textureHeight * base.resolution, 0, 0, textureWidth, textureHeight);

        context.restore();
    };

    /**
     * Renders a flat Mesh
     *
     * @private
     * @param {PIXI.mesh.Mesh} mesh - The Mesh to render
     */


    MeshSpriteRenderer.prototype.renderMeshFlat = function renderMeshFlat(mesh) {
        var context = this.renderer.context;
        var vertices = mesh.vertices;
        var length = vertices.length / 2;

        // this.count++;

        context.beginPath();

        for (var i = 1; i < length - 2; ++i) {
            // draw some triangles!
            var index = i * 2;

            var x0 = vertices[index];
            var y0 = vertices[index + 1];

            var x1 = vertices[index + 2];
            var y1 = vertices[index + 3];

            var x2 = vertices[index + 4];
            var y2 = vertices[index + 5];

            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.lineTo(x2, y2);
        }

        context.fillStyle = '#FF0000';
        context.fill();
        context.closePath();
    };

    /**
     * destroy the the renderer.
     *
     */


    MeshSpriteRenderer.prototype.destroy = function destroy() {
        this.renderer = null;
    };

    return MeshSpriteRenderer;
}();

exports.default = MeshSpriteRenderer;


core.CanvasRenderer.registerPlugin('mesh', MeshSpriteRenderer);
//# sourceMappingURL=CanvasMeshRenderer.js.map