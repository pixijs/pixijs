'use strict';

exports.__esModule = true;

var _mapWebGLBlendModesToPixi = require('../utils/mapWebGLBlendModesToPixi');

var _mapWebGLBlendModesToPixi2 = _interopRequireDefault(_mapWebGLBlendModesToPixi);

var _WebGLSystem2 = require('./WebGLSystem');

var _WebGLSystem3 = _interopRequireDefault(_WebGLSystem2);

var _State = require('../State');

var _State2 = _interopRequireDefault(_State);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BLEND = 0;
var OFFSET = 1;
var CULLING = 2;
var DEPTH_TEST = 3;
var WINDING = 4;

/**
 * A WebGL state machines
 *
 * @memberof PIXI
 * @class
 */

var StateSystem = function (_WebGLSystem) {
    _inherits(StateSystem, _WebGLSystem);

    /**
     * @param {WebGLRenderingContext} gl - The current WebGL rendering context
     */
    function StateSystem(renderer) {
        _classCallCheck(this, StateSystem);

        var _this = _possibleConstructorReturn(this, _WebGLSystem.call(this, renderer));

        _this.gl = null;

        _this.maxAttribs = null;

        // check we have vao..
        _this.nativeVaoExtension = null;

        _this.attribState = null;

        _this.stateId = 0;
        _this.polygonOffset = 0;
        _this.blendMode = 17;

        _this.map = [];

        // map functions for when we set state..
        _this.map[BLEND] = _this.setBlend;
        _this.map[OFFSET] = _this.setOffset;
        _this.map[CULLING] = _this.setCullFace;
        _this.map[DEPTH_TEST] = _this.setDepthTest;
        _this.map[WINDING] = _this.setFrontFace;

        _this.checks = [];

        _this.defaultState = new _State2.default();
        _this.defaultState.blend = true;
        _this.defaultState.depth = true;
        return _this;
    }

    StateSystem.prototype.contextChange = function contextChange(gl) {
        /**
         * The current WebGL rendering context
         *
         * @member {WebGLRenderingContext}
         */
        this.gl = gl;

        this.maxAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

        // check we have vao..
        this.nativeVaoExtension = gl.getExtension('OES_vertex_array_object') || gl.getExtension('MOZ_OES_vertex_array_object') || gl.getExtension('WEBKIT_OES_vertex_array_object');

        this.attribState = {
            tempAttribState: new Array(this.maxAttribs),
            attribState: new Array(this.maxAttribs)
        };

        this.blendModes = (0, _mapWebGLBlendModesToPixi2.default)(gl);

        this.setState(this.defaultState);

        this.reset();
    };

    /**
     * Sets the current state
     *
     * @param {*} state - The state to set.
     */


    StateSystem.prototype.setState = function setState(state) {
        state = state || this.defaultState;

        // TODO maybe to an object check? ( this.state === state )?
        if (this.stateId !== state.data) {
            var diff = this.stateId ^ state.data;
            var i = 0;

            // order from least to most common
            while (diff) {
                if (diff & 1) {
                    // state change!
                    this.map[i].call(this, !!(state.data & 1 << i));
                }

                diff = diff >> 1;
                i++;
            }

            this.stateId = state.data;
        }

        // based on the above settings we check for specific modes..
        // for example if blend is active we check and set the blend modes
        // or of polygon offset is active we check the poly depth.
        for (var _i = 0; _i < this.checks.length; _i++) {
            this.checks[_i](this, state);
        }
    };

    /**
     * Enables or disabled blending.
     *
     * @param {boolean} value - Turn on or off webgl blending.
     */


    StateSystem.prototype.setBlend = function setBlend(value) {
        this.updateCheck(StateSystem.checkBlendMode, value);

        this.gl[value ? 'enable' : 'disable'](this.gl.BLEND);
    };

    /**
     * Enables or disable polygon offset fill
     *
     * @param {boolean} value - Turn on or off webgl polygon offset testing.
     */


    StateSystem.prototype.setOffset = function setOffset(value) {
        this.gl[value ? 'enable' : 'disable'](this.gl.POLYGON_OFFSET_FILL);
    };

    /**
     * Sets whether to enable or disable depth test.
     *
     * @param {boolean} value - Turn on or off webgl depth testing.
     */


    StateSystem.prototype.setDepthTest = function setDepthTest(value) {
        this.gl[value ? 'enable' : 'disable'](this.gl.DEPTH_TEST);
    };

    /**
     * Sets whether to enable or disable cull face.
     *
     * @param {boolean} value - Turn on or off webgl cull face.
     */


    StateSystem.prototype.setCullFace = function setCullFace(value) {
        this.gl[value ? 'enable' : 'disable'](this.gl.CULL_FACE);
    };

    /**
     * Sets the gl front face.
     *
     * @param {boolean} value - true is clockwise and false is counter-clockwise
     */


    StateSystem.prototype.setFrontFace = function setFrontFace(value) {
        this.gl.frontFace(this.gl[value ? 'CW' : 'CCW']);
    };

    /**
     * Sets the blend mode.
     *
     * @param {number} value - The blend mode to set to.
     */


    StateSystem.prototype.setBlendMode = function setBlendMode(value) {
        if (value === this.blendMode) {
            return;
        }

        this.blendMode = value;
        this.gl.blendFunc(this.blendModes[value][0], this.blendModes[value][1]);
    };

    /**
     * Sets the polygon offset.
     *
     * @param {number} value - the polygon offset
     * @param {number} scale - the polygon offset scale
     */


    StateSystem.prototype.setPolygonOffset = function setPolygonOffset(value, scale) {
        this.gl.polygonOffset(value, scale);
    };

    /**
     * Disables all the vaos in use
     *
     */


    StateSystem.prototype.resetAttributes = function resetAttributes() {
        for (var i = 0; i < this.attribState.tempAttribState.length; i++) {
            this.attribState.tempAttribState[i] = 0;
        }

        for (var _i2 = 0; _i2 < this.attribState.attribState.length; _i2++) {
            this.attribState.attribState[_i2] = 0;
        }

        // im going to assume one is always active for performance reasons.
        for (var _i3 = 1; _i3 < this.maxAttribs; _i3++) {
            this.gl.disableVertexAttribArray(_i3);
        }
    };

    // used
    /**
     * Resets all the logic and disables the vaos
     */


    StateSystem.prototype.reset = function reset() {
        // unbind any VAO if they exist..
        if (this.nativeVaoExtension) {
            this.nativeVaoExtension.bindVertexArrayOES(null);
        }

        // reset all attributes..
        this.resetAttributes();

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);

        this.setBlendMode(0);

        // TODO?
        // this.setState(this.defaultState);
    };

    /**
     * checks to see which updates should be checked based on which settings have been activated
     * for example if blend is enabled then we shold check the blend modes each time the state is changed
     * or if poygon fill is activated then we need to check if the polygone offset changes.
     * The idea is that we only check what we have too.
     *
     * @param {Function} func  the checking function to add or remove
     * @param {boolean} value  should the check function be added or removed.
     */


    StateSystem.prototype.updateCheck = function updateCheck(func, value) {
        var index = this.checks.indexOf(func);

        if (value && index === -1) {
            this.checks.push(func);
        } else if (!value && index !== -1) {
            this.checks.splice(index, 1);
        }
    };

    /**
     * A private little wrapper function that we call to check the blend mode.
     *
     * @static
     * @private
     * @param {PIXI.StateSystem} System  the System to perform the state check on
     * @param {PIXI.State} state  the state that the blendMode will pulled from
     */


    StateSystem.checkBlendMode = function checkBlendMode(system, state) {
        system.setBlendMode(state.blendMode);
    };

    // TODO - add polygon offset?


    return StateSystem;
}(_WebGLSystem3.default);

exports.default = StateSystem;
//# sourceMappingURL=StateSystem.js.map