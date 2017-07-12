'use strict';

exports.__esModule = true;

var _core = require('../core');

var core = _interopRequireWildcard(_core);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var tempPoint = new core.Point();
var tempPolygon = new core.Polygon();

/**
 * Base mesh class.
 * The reason for this class is to empower you to have maximum flexbilty to render any kind of webGL you can think of.
 * This class assumes a certain level of webGL knowledge.
 * If you know a bit this should abstract enough away to make you life easier!
 * Pretty much ALL WebGL can be broken down into the following:
 * Geometry - The structure and data for the mesh. This can include anything from positions, uvs, normals, colors etc..
 * Shader - This is the shader that pixi will render the geometry with. (attributes in the shader must match the geometry!)
 * Uniforms - These are the values passed to the shader when the mesh is rendered.
 * As a shader can be resued accross multiple objects, it made sense to allow uniforms to exist outside of the shader
 * State - This is the state of WebGL required to render the mesh.
 * Through a combination of the above elements you can render anything you want, 2D or 3D!
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI.mesh
 */

var RawMesh = function (_core$Container) {
  _inherits(RawMesh, _core$Container);

  /**
   * @param {PIXI.mesh.Geometry} geometry  the geometry the mesh will use
   * @param {PIXI.Shader} shader  the shader the mesh will use
   * @param {PIXI.State} state  the state that the webGL context is required to be in to render the mesh
   * @param {number} drawMode  the drawMode, can be any of the PIXI.DRAW_MODES consts
   */
  function RawMesh(geometry, shader, state) {
    var drawMode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : core.DRAW_MODES.TRIANGLES;

    _classCallCheck(this, RawMesh);

    /**
     * the geometry the mesh will use
     * @type {PIXI.mesh.Geometry}
     */
    var _this = _possibleConstructorReturn(this, _core$Container.call(this));

    _this.geometry = geometry;

    /**
     * the shader the mesh will use
     * @type {PIXI.Shader}
     */
    _this.shader = shader;

    /**
     * the webGL state the mesh requires to render
     * @type {PIXI.State}
     */
    _this.state = state || new core.State();

    /**
     * The way the Mesh should be drawn, can be any of the {@link PIXI.mesh.RawMesh.DRAW_MODES} consts
     *
     * @member {number}
     * @see PIXI.mesh.RawMesh.DRAW_MODES
     */
    _this.drawMode = drawMode;

    /**
     * The way uniforms that will be used by the mesh's shader.
     * @member {Object}
     */

    /**
     * A map of renderer IDs to webgl render data
     *
     * @private
     * @member {object<number, object>}
     */
    _this._glDatas = {};

    /**
     * Plugin that is responsible for rendering this element.
     * Allows to customize the rendering process without overriding '_renderWebGL' & '_renderCanvas' methods.
     *
     * @member {string}
     * @default 'mesh'
     */
    _this.pluginName = 'mesh';

    _this.start = 0;
    _this.size = 0;
    return _this;
  }

  /**
   * Renders the object using the WebGL renderer
   *
   * @param {PIXI.WebGLRenderer} renderer a reference to the WebGL renderer
   * @private
   */


  RawMesh.prototype._renderWebGL = function _renderWebGL(renderer) {
    renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
    renderer.plugins[this.pluginName].render(this);
  };

  /**
   * Renders the object using the Canvas renderer
   *
   * @private
   * @param {PIXI.CanvasRenderer} renderer - The canvas renderer.
   */


  RawMesh.prototype._renderCanvas = function _renderCanvas(renderer) {
    renderer.plugins[this.pluginName].render(this);
  };

  /**
   * Updates the bounds of the mesh as a rectangle. The bounds calculation takes the worldTransform into account.
   * there must be a aVertexPosition attribute present in the geometry for bounds to be calcualted correctly.
   *
   * @private
   */


  RawMesh.prototype._calculateBounds = function _calculateBounds() {
    // The position property could be set manually?
    if (this.geometry.attributes.aVertexPosition) {
      var vertices = this.geometry.getAttribute('aVertexPosition').data;

      // TODO - we can cache local bounds and use them if they are dirty (like graphics)
      this._bounds.addVertices(this.transform, vertices, 0, vertices.length);
    }
  };

  /**
   * Tests if a point is inside this mesh. Works only for TRIANGLE_MESH
   *
   * @param {PIXI.Point} point the point to test
   * @return {boolean} the result of the test
   */


  RawMesh.prototype.containsPoint = function containsPoint(point) {
    if (!this.getBounds().contains(point.x, point.y)) {
      return false;
    }

    this.worldTransform.applyInverse(point, tempPoint);

    var vertices = this.geometry.getAttribute('aVertexPosition').data;

    var points = tempPolygon.points;
    var indices = this.geometry.getIndex().data;
    var len = indices.length;
    var step = this.drawMode === 4 ? 3 : 1;

    for (var i = 0; i + 2 < len; i += step) {
      var ind0 = indices[i] * 2;
      var ind1 = indices[i + 1] * 2;
      var ind2 = indices[i + 2] * 2;

      points[0] = vertices[ind0];
      points[1] = vertices[ind0 + 1];
      points[2] = vertices[ind1];
      points[3] = vertices[ind1 + 1];
      points[4] = vertices[ind2];
      points[5] = vertices[ind2 + 1];

      if (tempPolygon.contains(tempPoint.x, tempPoint.y)) {
        return true;
      }
    }

    return false;
  };

  return RawMesh;
}(core.Container);

exports.default = RawMesh;
//# sourceMappingURL=RawMesh.js.map