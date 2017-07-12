'use strict';

exports.__esModule = true;

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * WebGL renderer plugin for tiling sprites
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 */
var MeshRenderer = function (_core$ObjectRenderer) {
    _inherits(MeshRenderer, _core$ObjectRenderer);

    /**
     * constructor for renderer
     *
     * @param {WebGLRenderer} renderer The renderer this tiling awesomeness works for.
     */
    function MeshRenderer(renderer) {
        _classCallCheck(this, MeshRenderer);

        var _this = _possibleConstructorReturn(this, _core$ObjectRenderer.call(this, renderer));

        _this.shader = null;
        return _this;
    }

    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */


    MeshRenderer.prototype.contextChange = function contextChange() {
        this.gl = this.renderer.gl;
        this.CONTEXT_UID = this.renderer.CONTEXT_UID;
    };

    /**
     * renders mesh
     * @private
     * @param {PIXI.mesh.RawMesh} mesh mesh instance
     */


    MeshRenderer.prototype.render = function render(mesh) {
        // bind the shader..

        // TODO
        // set the shader props..
        // probably only need to set once!
        // as its then a refference..
        if (mesh.shader.program.uniformData.translationMatrix) {
            // the transform!
            mesh.shader.uniforms.translationMatrix = mesh.transform.worldTransform.toArray(true);
        }

        // bind and sync uniforms..
        this.renderer.shader.bind(mesh.shader);

        // set state..
        this.renderer.state.setState(mesh.state);

        // bind the geometry...
        this.renderer.geometry.bind(mesh.geometry, mesh.shader);
        // then render it
        this.renderer.geometry.draw(mesh.drawMode, mesh.size, mesh.start, mesh.geometry.instanceCount);
    };

    return MeshRenderer;
}(core.ObjectRenderer);

exports.default = MeshRenderer;


core.WebGLRenderer.registerPlugin('mesh', MeshRenderer);
//# sourceMappingURL=MeshRenderer.js.map