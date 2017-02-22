'use strict';

exports.__esModule = true;

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var _const = require('../../core/const');

var _path = require('path');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var tempMat = new core.Matrix();
var tempArray = new Float32Array(4);

/**
 * WebGL renderer plugin for tiling sprites
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 */

var TilingSpriteRenderer = function (_core$ObjectRenderer) {
    _inherits(TilingSpriteRenderer, _core$ObjectRenderer);

    /**
     * constructor for renderer
     *
     * @param {WebGLRenderer} renderer The renderer this tiling awesomeness works for.
     */
    function TilingSpriteRenderer(renderer) {
        _classCallCheck(this, TilingSpriteRenderer);

        var _this = _possibleConstructorReturn(this, _core$ObjectRenderer.call(this, renderer));

        _this.shader = null;
        _this.simpleShader = null;
        _this.quad = null;
        return _this;
    }

    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */


    TilingSpriteRenderer.prototype.onContextChange = function onContextChange() {
        var gl = this.renderer.gl;

        this.shader = new core.Shader(gl, 'attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform mat3 uTransform;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;\n}\n', 'varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 uColor;\nuniform mat3 uMapCoord;\nuniform vec4 uClampFrame;\nuniform vec2 uClampOffset;\n\nvoid main(void)\n{\n    vec2 coord = mod(vTextureCoord - uClampOffset, vec2(1.0, 1.0)) + uClampOffset;\n    coord = (uMapCoord * vec3(coord, 1.0)).xy;\n    coord = clamp(coord, uClampFrame.xy, uClampFrame.zw);\n\n    vec4 sample = texture2D(uSampler, coord);\n    vec4 color = vec4(uColor.rgb * uColor.a, uColor.a);\n\n    gl_FragColor = sample * color ;\n}\n');
        this.simpleShader = new core.Shader(gl, 'attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform mat3 uTransform;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;\n}\n', 'varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 uColor;\n\nvoid main(void)\n{\n    vec4 sample = texture2D(uSampler, vTextureCoord);\n    vec4 color = vec4(uColor.rgb * uColor.a, uColor.a);\n    gl_FragColor = sample * color;\n}\n');

        this.renderer.bindVao(null);
        this.quad = new core.Quad(gl, this.renderer.state.attribState);
        this.quad.initVao(this.shader);
    };

    /**
     *
     * @param {PIXI.extras.TilingSprite} ts tilingSprite to be rendered
     */


    TilingSpriteRenderer.prototype.render = function render(ts) {
        var renderer = this.renderer;
        var quad = this.quad;

        renderer.bindVao(quad.vao);

        var vertices = quad.vertices;

        vertices[0] = vertices[6] = ts._width * -ts.anchor.x;
        vertices[1] = vertices[3] = ts._height * -ts.anchor.y;

        vertices[2] = vertices[4] = ts._width * (1.0 - ts.anchor.x);
        vertices[5] = vertices[7] = ts._height * (1.0 - ts.anchor.y);

        if (ts.uvRespectAnchor) {
            vertices = quad.uvs;

            vertices[0] = vertices[6] = -ts.anchor.x;
            vertices[1] = vertices[3] = -ts.anchor.y;

            vertices[2] = vertices[4] = 1.0 - ts.anchor.x;
            vertices[5] = vertices[7] = 1.0 - ts.anchor.y;
        }

        quad.upload();

        var tex = ts._texture;
        var baseTex = tex.baseTexture;
        var lt = ts.tileTransform.localTransform;
        var uv = ts.uvTransform;
        var isSimple = baseTex.isPowerOfTwo && tex.frame.width === baseTex.width && tex.frame.height === baseTex.height;

        // auto, force repeat wrapMode for big tiling textures
        if (isSimple) {
            if (!baseTex._glTextures[renderer.CONTEXT_UID]) {
                if (baseTex.wrapMode === _const.WRAP_MODES.CLAMP) {
                    baseTex.wrapMode = _const.WRAP_MODES.REPEAT;
                }
            } else {
                isSimple = baseTex.wrapMode !== _const.WRAP_MODES.CLAMP;
            }
        }

        var shader = isSimple ? this.simpleShader : this.shader;

        renderer.bindShader(shader);

        var w = tex.width;
        var h = tex.height;
        var W = ts._width;
        var H = ts._height;

        tempMat.set(lt.a * w / W, lt.b * w / H, lt.c * h / W, lt.d * h / H, lt.tx / W, lt.ty / H);

        // that part is the same as above:
        // tempMat.identity();
        // tempMat.scale(tex.width, tex.height);
        // tempMat.prepend(lt);
        // tempMat.scale(1.0 / ts._width, 1.0 / ts._height);

        tempMat.invert();
        if (isSimple) {
            tempMat.append(uv.mapCoord);
        } else {
            shader.uniforms.uMapCoord = uv.mapCoord.toArray(true);
            shader.uniforms.uClampFrame = uv.uClampFrame;
            shader.uniforms.uClampOffset = uv.uClampOffset;
        }

        shader.uniforms.uTransform = tempMat.toArray(true);

        var color = tempArray;

        core.utils.hex2rgb(ts.tint, color);
        color[3] = ts.worldAlpha;
        shader.uniforms.uColor = color;
        shader.uniforms.translationMatrix = ts.transform.worldTransform.toArray(true);

        shader.uniforms.uSampler = renderer.bindTexture(tex);

        renderer.setBlendMode(ts.blendMode);

        quad.vao.draw(this.renderer.gl.TRIANGLES, 6, 0);
    };

    return TilingSpriteRenderer;
}(core.ObjectRenderer);

exports.default = TilingSpriteRenderer;


core.WebGLRenderer.registerPlugin('tilingSprite', TilingSpriteRenderer);
//# sourceMappingURL=TilingSpriteRenderer.js.map