'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require('../core');

var core = _interopRequireWildcard(_core);

var _TextureTransform = require('../extras/TextureTransform');

var _TextureTransform2 = _interopRequireDefault(_TextureTransform);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var tempPoint = new core.Point();
var tempPolygon = new core.Polygon();

/**
 * Base mesh class
 * @class
 * @extends PIXI.Container
 * @memberof PIXI.mesh
 */

var Mesh = function (_core$Container) {
  _inherits(Mesh, _core$Container);

  /**
   * @param {PIXI.Texture} texture - The texture to use
   * @param {Float32Array} [vertices] - if you want to specify the vertices
   * @param {Float32Array} [uvs] - if you want to specify the uvs
   * @param {Uint16Array} [indices] - if you want to specify the indices
   * @param {number} [drawMode] - the drawMode, can be any of the Mesh.DRAW_MODES consts
   */
  function Mesh(texture, vertices, uvs, indices, drawMode) {
    _classCallCheck(this, Mesh);

    /**
     * The texture of the Mesh
     *
     * @member {PIXI.Texture}
     * @private
     */
    var _this = _possibleConstructorReturn(this, _core$Container.call(this));

    _this._texture = texture;

    /**
     * The Uvs of the Mesh
     *
     * @member {Float32Array}
     */
    _this.uvs = uvs || new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);

    /**
     * An array of vertices
     *
     * @member {Float32Array}
     */
    _this.vertices = vertices || new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]);

    /**
     * An array containing the indices of the vertices
     *
     * @member {Uint16Array}
     */
    //  TODO auto generate this based on draw mode!
    _this.indices = indices || new Uint16Array([0, 1, 3, 2]);

    /**
     * Version of mesh uvs are dirty or not
     *
     * @member {number}
     */
    _this.dirty = 0;

    /**
     * Version of mesh indices
     *
     * @member {number}
     */
    _this.indexDirty = 0;

    /**
     * The blend mode to be applied to the sprite. Set to `PIXI.BLEND_MODES.NORMAL` to remove
     * any blend mode.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     * @see PIXI.BLEND_MODES
     */
    _this.blendMode = core.BLEND_MODES.NORMAL;

    /**
     * Triangles in canvas mode are automatically antialiased, use this value to force triangles
     * to overlap a bit with each other.
     *
     * @member {number}
     */
    _this.canvasPadding = 0;

    /**
     * The way the Mesh should be drawn, can be any of the {@link PIXI.mesh.Mesh.DRAW_MODES} consts
     *
     * @member {number}
     * @see PIXI.mesh.Mesh.DRAW_MODES
     */
    _this.drawMode = drawMode || Mesh.DRAW_MODES.TRIANGLE_MESH;

    /**
     * The default shader that is used if a mesh doesn't have a more specific one.
     *
     * @member {PIXI.Shader}
     */
    _this.shader = null;

    /**
     * The tint applied to the mesh. This is a [r,g,b] value. A value of [1,1,1] will remove any
     * tint effect.
     *
     * @member {number}
     */
    _this.tintRgb = new Float32Array([1, 1, 1]);

    /**
     * A map of renderer IDs to webgl render data
     *
     * @private
     * @member {object<number, object>}
     */
    _this._glDatas = {};

    /**
     * transform that is applied to UV to get the texture coords
     * its updated independently from texture uvTransform
     * updates of uvs are tied to that thing
     *
     * @member {PIXI.extras.TextureTransform}
     * @private
     */
    _this._uvTransform = new _TextureTransform2.default(texture);

    /**
     * whether or not upload uvTransform to shader
     * if its false, then uvs should be pre-multiplied
     * if you change it for generated mesh, please call 'refresh(true)'
     * @member {boolean}
     * @default false
     */
    _this.uploadUvTransform = false;

    /**
     * Plugin that is responsible for rendering this element.
     * Allows to customize the rendering process without overriding '_renderWebGL' & '_renderCanvas' methods.
     * @member {string}
     * @default 'mesh'
     */
    _this.pluginName = 'mesh';
    return _this;
  }

  /**
   * Renders the object using the WebGL renderer
   *
   * @private
   * @param {PIXI.WebGLRenderer} renderer - a reference to the WebGL renderer
   */


  Mesh.prototype._renderWebGL = function _renderWebGL(renderer) {
    this.refresh();
    renderer.setObjectRenderer(renderer.plugins[this.pluginName]);
    renderer.plugins[this.pluginName].render(this);
  };

  /**
   * Renders the object using the Canvas renderer
   *
   * @private
   * @param {PIXI.CanvasRenderer} renderer - The canvas renderer.
   */


  Mesh.prototype._renderCanvas = function _renderCanvas(renderer) {
    this.refresh();
    renderer.plugins[this.pluginName].render(this);
  };

  /**
   * When the texture is updated, this event will fire to update the scale and frame
   *
   * @private
   */


  Mesh.prototype._onTextureUpdate = function _onTextureUpdate() {
    this._uvTransform.texture = this._texture;
    this.refresh();
  };

  /**
   * multiplies uvs only if uploadUvTransform is false
   * call it after you change uvs manually
   * make sure that texture is valid
   */


  Mesh.prototype.multiplyUvs = function multiplyUvs() {
    if (!this.uploadUvTransform) {
      this._uvTransform.multiplyUvs(this.uvs);
    }
  };

  /**
   * Refreshes uvs for generated meshes (rope, plane)
   * sometimes refreshes vertices too
   *
   * @param {boolean} [forceUpdate=false] if true, matrices will be updated any case
   */


  Mesh.prototype.refresh = function refresh(forceUpdate) {
    if (this._uvTransform.update(forceUpdate)) {
      this._refresh();
    }
  };

  /**
   * re-calculates mesh coords
   * @protected
   */


  Mesh.prototype._refresh = function _refresh() {}
  /* empty */


  /**
   * Returns the bounds of the mesh as a rectangle. The bounds calculation takes the worldTransform into account.
   *
   */
  ;

  Mesh.prototype._calculateBounds = function _calculateBounds() {
    // TODO - we can cache local bounds and use them if they are dirty (like graphics)
    this._bounds.addVertices(this.transform, this.vertices, 0, this.vertices.length);
  };

  /**
   * Tests if a point is inside this mesh. Works only for TRIANGLE_MESH
   *
   * @param {PIXI.Point} point - the point to test
   * @return {boolean} the result of the test
   */


  Mesh.prototype.containsPoint = function containsPoint(point) {
    if (!this.getBounds().contains(point.x, point.y)) {
      return false;
    }

    this.worldTransform.applyInverse(point, tempPoint);

    var vertices = this.vertices;
    var points = tempPolygon.points;
    var indices = this.indices;
    var len = this.indices.length;
    var step = this.drawMode === Mesh.DRAW_MODES.TRIANGLES ? 3 : 1;

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

  /**
   * The texture that the mesh uses.
   *
   * @member {PIXI.Texture}
   */


  _createClass(Mesh, [{
    key: 'texture',
    get: function get() {
      return this._texture;
    },
    set: function set(value) // eslint-disable-line require-jsdoc
    {
      if (this._texture === value) {
        return;
      }

      this._texture = value;

      if (value) {
        // wait for the texture to load
        if (value.baseTexture.hasLoaded) {
          this._onTextureUpdate();
        } else {
          value.once('update', this._onTextureUpdate, this);
        }
      }
    }

    /**
     * The tint applied to the mesh. This is a hex value. A value of 0xFFFFFF will remove any tint effect.
     *
     * @member {number}
     * @default 0xFFFFFF
     */

  }, {
    key: 'tint',
    get: function get() {
      return core.utils.rgb2hex(this.tintRgb);
    },
    set: function set(value) // eslint-disable-line require-jsdoc
    {
      this.tintRgb = core.utils.hex2rgb(value, this.tintRgb);
    }
  }]);

  return Mesh;
}(core.Container);

/**
 * Different drawing buffer modes supported
 *
 * @static
 * @constant
 * @type {object}
 * @property {number} TRIANGLE_MESH
 * @property {number} TRIANGLES
 */


exports.default = Mesh;
Mesh.DRAW_MODES = {
  TRIANGLE_MESH: 0,
  TRIANGLES: 1
};
//# sourceMappingURL=Mesh.js.map