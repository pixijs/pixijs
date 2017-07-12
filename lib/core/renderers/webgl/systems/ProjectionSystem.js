'use strict';

exports.__esModule = true;

var _WebGLSystem2 = require('./WebGLSystem');

var _WebGLSystem3 = _interopRequireDefault(_WebGLSystem2);

var _math = require('../../../math');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @class
 * @extends PIXI.WebGLSystem
 * @memberof PIXI
 */

var ProjectionSystem = function (_WebGLSystem) {
    _inherits(ProjectionSystem, _WebGLSystem);

    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this System works for.
     */
    function ProjectionSystem(renderer) {
        _classCallCheck(this, ProjectionSystem);

        var _this = _possibleConstructorReturn(this, _WebGLSystem.call(this, renderer));

        _this.projectionMatrix = new _math.Matrix();
        return _this;
    }

    ProjectionSystem.prototype.update = function update(destinationFrame, sourceFrame, resolution, root) {
        this.destinationFrame = destinationFrame || this.destinationFrame || this.defaultFrame;
        this.sourceFrame = sourceFrame || this.sourceFrame || destinationFrame;

        this.calculateProjection(this.destinationFrame, this.sourceFrame, resolution, root);

        this.renderer.globalUniforms.uniforms.projectionMatrix = this.projectionMatrix;
        this.renderer.globalUniforms.update();
    };

    /**
     * Updates the projection matrix based on a projection frame (which is a rectangle)
     *
     * @param {Rectangle} destinationFrame - The destination frame.
     * @param {Rectangle} sourceFrame - The source frame.
     */


    ProjectionSystem.prototype.calculateProjection = function calculateProjection(destinationFrame, sourceFrame, resolution, root) {
        var pm = this.projectionMatrix;

        pm.identity();

        // TODO: make dest scale source
        if (!root) {
            pm.a = 1 / destinationFrame.width * 2;
            pm.d = 1 / destinationFrame.height * 2;

            pm.tx = -1 - sourceFrame.x * pm.a;
            pm.ty = -1 - sourceFrame.y * pm.d;
        } else {
            pm.a = 1 / destinationFrame.width * 2;
            pm.d = -1 / destinationFrame.height * 2;

            pm.tx = -1 - sourceFrame.x * pm.a;
            pm.ty = 1 - sourceFrame.y * pm.d;
        }

        // apply the resolution..
        // TODO - prob should apply this to x and y too!
        pm.a *= resolution;
        pm.d *= resolution;
    };

    /**
     * Sets the transform of the active render target to the given matrix
     *
     * @param {PIXI.Matrix} matrix - The transformation matrix
     */


    ProjectionSystem.prototype.setTransform = function setTransform() // matrix)
    {
        // this._activeRenderTarget.transform = matrix;
    };

    return ProjectionSystem;
}(_WebGLSystem3.default);

exports.default = ProjectionSystem;
//# sourceMappingURL=ProjectionSystem.js.map