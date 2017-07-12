'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _RawMesh2 = require('./RawMesh');

var _RawMesh3 = _interopRequireDefault(_RawMesh2);

var _Geometry = require('../core/geometry/Geometry');

var _Geometry2 = _interopRequireDefault(_Geometry);

var _core = require('../core');

var core = _interopRequireWildcard(_core);

var _path = require('path');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var meshProgram = void 0;

/**
 * Base mesh class
 * @class
 * @extends PIXI.Container
 * @memberof PIXI.mesh
 */

var Mesh = function (_RawMesh) {
    _inherits(Mesh, _RawMesh);

    /**
     * @param {PIXI.Texture} texture - The texture to use
     * @param {Float32Array} [vertices] - if you want to specify the vertices
     * @param {Float32Array} [uvs] - if you want to specify the uvs
     * @param {Uint16Array} [indices] - if you want to specify the indices
     * @param {number} [drawMode] - the drawMode, can be any of the Mesh.DRAW_MODES consts
     */
    function Mesh(texture, vertices, uvs, indices, drawMode) {
        _classCallCheck(this, Mesh);

        var geometry = new _Geometry2.default();

        if (!meshProgram) {
            meshProgram = new core.Program('attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform mat3 uTransform;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;\n}\n', 'varying vec2 vTextureCoord;\nuniform float alpha;\nuniform vec3 tint;\n\nuniform sampler2D uSampler2;\n\nvoid main(void)\n{\n    gl_FragColor = texture2D(uSampler2, vTextureCoord) * vec4(tint * alpha, alpha);\n}\n');
        }

        geometry.addAttribute('aVertexPosition', vertices).addAttribute('aTextureCoord', uvs).addIndex(indices);

        geometry.getAttribute('aVertexPosition').static = false;

        var uniforms = {
            uSampler2: texture,
            alpha: 1,
            tint: new Float32Array([1, 1, 1])
        };

        var _this = _possibleConstructorReturn(this, _RawMesh.call(this, geometry, new core.Shader(meshProgram, uniforms), null, drawMode));

        _this.uvs = geometry.getAttribute('aTextureCoord').data;
        _this.vertices = geometry.getAttribute('aVertexPosition').data;

        _this.uniforms = uniforms;
        _this.texture = texture;

        _this._tint = 0xFFFFFF;
        _this.tint = 0xFFFFFF;

        _this.blendMode = core.BLEND_MODES.NORMAL;
        return _this;
    }

    /**
    * The tint applied to the Rope. This is a hex value. A value of
    * 0xFFFFFF will remove any tint effect.
    *
    * @member {number}
    * @memberof PIXI.Sprite#
    * @default 0xFFFFFF
    */


    /**
     * When the texture is updated, this event will fire to update the scale and frame
     *
     * @private
     */
    Mesh.prototype._onTextureUpdate = function _onTextureUpdate() {
        /* empty */
    };

    _createClass(Mesh, [{
        key: 'tint',
        get: function get() {
            return this._tint;
        }

        /**
         * Sets the tint of the rope.
         *
         * @param {number} value - The value to set to.
         */
        ,
        set: function set(value) {
            this._tint = value;
            core.utils.hex2rgb(this._tint, this.uniforms.tint);
        }

        /**
         * The blend mode to be applied to the sprite. Set to `PIXI.BLEND_MODES.NORMAL` to remove any blend mode.
         *
         * @member {number}
         * @default PIXI.BLEND_MODES.NORMAL
         * @see PIXI.BLEND_MODES
         */

    }, {
        key: 'blendMode',
        get: function get() {
            return this.state.blendMode;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this.state.blendMode = value;
        }

        /**
         * The texture that the mesh uses.
         *
         * @member {PIXI.Texture}
         */

    }, {
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
            this.uniforms.uSampler2 = this.texture;

            if (value) {
                // wait for the texture to load
                if (value.baseTexture.hasLoaded) {
                    this._onTextureUpdate();
                } else {
                    value.once('update', this._onTextureUpdate, this);
                }
            }
        }
    }]);

    return Mesh;
}(_RawMesh3.default);

exports.default = Mesh;
//# sourceMappingURL=Mesh.js.map