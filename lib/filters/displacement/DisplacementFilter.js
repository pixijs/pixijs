'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var _path = require('path');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The DisplacementFilter class uses the pixel values from the specified texture
 * (called the displacement map) to perform a displacement of an object. You can
 * use this filter to apply all manor of crazy warping effects. Currently the r
 * property of the texture is used to offset the x and the g property of the texture
 * is used to offset the y.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
var DisplacementFilter = function (_core$Filter) {
    _inherits(DisplacementFilter, _core$Filter);

    /**
     * @param {PIXI.Sprite} sprite - The sprite used for the displacement map. (make sure its added to the scene!)
     * @param {number} scale - The scale of the displacement
     */
    function DisplacementFilter(sprite, scale) {
        _classCallCheck(this, DisplacementFilter);

        var maskMatrix = new core.Matrix();

        sprite.renderable = false;

        var _this = _possibleConstructorReturn(this, _core$Filter.call(this,
        // vertex shader
        'attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 filterMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vFilterCoord;\n\nvoid main(void)\n{\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vFilterCoord = ( filterMatrix * vec3( aTextureCoord, 1.0)  ).xy;\n   vTextureCoord = aTextureCoord;\n}',
        // fragment shader
        'varying vec2 vFilterCoord;\nvarying vec2 vTextureCoord;\n\nuniform vec2 scale;\n\nuniform sampler2D uSampler;\nuniform sampler2D mapSampler;\n\nuniform vec4 filterClamp;\n\nvoid main(void)\n{\n   vec4 map =  texture2D(mapSampler, vFilterCoord);\n\n   map -= 0.5;\n   map.xy *= scale;\n\n   gl_FragColor = texture2D(uSampler, clamp(vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y), filterClamp.xy, filterClamp.zw));\n}\n'));

        _this.maskSprite = sprite;
        _this.maskMatrix = maskMatrix;

        _this.uniforms.mapSampler = sprite._texture;
        _this.uniforms.filterMatrix = maskMatrix;
        _this.uniforms.scale = { x: 1, y: 1 };

        if (scale === null || scale === undefined) {
            scale = 20;
        }

        _this.scale = new core.Point(scale, scale);
        return _this;
    }

    /**
     * Applies the filter.
     *
     * @param {PIXI.FilterManager} filterManager - The manager.
     * @param {PIXI.RenderTarget} input - The input target.
     * @param {PIXI.RenderTarget} output - The output target.
     */


    DisplacementFilter.prototype.apply = function apply(filterManager, input, output) {
        var ratio = 1 / output.destinationFrame.width * (output.size.width / input.size.width);

        this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, this.maskSprite);
        this.uniforms.scale.x = this.scale.x * ratio;
        this.uniforms.scale.y = this.scale.y * ratio;

        // draw the filter...
        filterManager.applyFilter(this, input, output);
    };

    /**
     * The texture used for the displacement map. Must be power of 2 sized texture.
     *
     * @member {PIXI.Texture}
     */


    _createClass(DisplacementFilter, [{
        key: 'map',
        get: function get() {
            return this.uniforms.mapSampler;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this.uniforms.mapSampler = value;
        }
    }]);

    return DisplacementFilter;
}(core.Filter);

exports.default = DisplacementFilter;
//# sourceMappingURL=DisplacementFilter.js.map