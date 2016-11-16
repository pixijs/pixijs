'use strict';

exports.__esModule = true;

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var _ParticleShader = require('./ParticleShader');

var _ParticleShader2 = _interopRequireDefault(_ParticleShader);

var _ParticleBuffer = require('./ParticleBuffer');

var _ParticleBuffer2 = _interopRequireDefault(_ParticleBuffer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now
 * share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's ParticleRenderer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/ParticleRenderer.java
 */

/**
 *
 * @class
 * @private
 * @memberof PIXI
 */
var ParticleRenderer = function (_core$ObjectRenderer) {
    _inherits(ParticleRenderer, _core$ObjectRenderer);

    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this sprite batch works for.
     */
    function ParticleRenderer(renderer) {
        _classCallCheck(this, ParticleRenderer);

        // 65535 is max vertex index in the index buffer (see ParticleRenderer)
        // so max number of particles is 65536 / 4 = 16384
        // and max number of element in the index buffer is 16384 * 6 = 98304
        // Creating a full index buffer, overhead is 98304 * 2 = 196Ko
        // let numIndices = 98304;

        /**
         * The default shader that is used if a sprite doesn't have a more specific one.
         *
         * @member {PIXI.Shader}
         */
        var _this = _possibleConstructorReturn(this, _core$ObjectRenderer.call(this, renderer));

        _this.shader = null;

        _this.indexBuffer = null;

        _this.properties = null;

        _this.tempMatrix = new core.Matrix();

        _this.CONTEXT_UID = 0;
        return _this;
    }

    /**
     * When there is a WebGL context change
     *
     * @private
     */


    ParticleRenderer.prototype.onContextChange = function onContextChange() {
        var gl = this.renderer.gl;

        this.CONTEXT_UID = this.renderer.CONTEXT_UID;

        // setup default shader
        this.shader = new _ParticleShader2.default(gl);

        this.properties = [
        // verticesData
        {
            attribute: this.shader.attributes.aVertexPosition,
            size: 2,
            uploadFunction: this.uploadVertices,
            offset: 0
        },
        // positionData
        {
            attribute: this.shader.attributes.aPositionCoord,
            size: 2,
            uploadFunction: this.uploadPosition,
            offset: 0
        },
        // rotationData
        {
            attribute: this.shader.attributes.aRotation,
            size: 1,
            uploadFunction: this.uploadRotation,
            offset: 0
        },
        // uvsData
        {
            attribute: this.shader.attributes.aTextureCoord,
            size: 2,
            uploadFunction: this.uploadUvs,
            offset: 0
        },
        // alphaData
        {
            attribute: this.shader.attributes.aColor,
            size: 1,
            uploadFunction: this.uploadAlpha,
            offset: 0
        }];
    };

    /**
     * Starts a new particle batch.
     *
     */


    ParticleRenderer.prototype.start = function start() {
        this.renderer.bindShader(this.shader);
    };

    /**
     * Renders the particle container object.
     *
     * @param {PIXI.ParticleContainer} container - The container to render using this ParticleRenderer
     */


    ParticleRenderer.prototype.render = function render(container) {
        var children = container.children;
        var maxSize = container._maxSize;
        var batchSize = container._batchSize;
        var renderer = this.renderer;
        var totalChildren = children.length;

        if (totalChildren === 0) {
            return;
        } else if (totalChildren > maxSize) {
            totalChildren = maxSize;
        }

        var buffers = container._glBuffers[renderer.CONTEXT_UID];

        if (!buffers) {
            buffers = container._glBuffers[renderer.CONTEXT_UID] = this.generateBuffers(container);
        }

        // if the uvs have not updated then no point rendering just yet!
        this.renderer.setBlendMode(container.blendMode);

        var gl = renderer.gl;

        var m = container.worldTransform.copy(this.tempMatrix);

        m.prepend(renderer._activeRenderTarget.projectionMatrix);

        this.shader.uniforms.projectionMatrix = m.toArray(true);
        this.shader.uniforms.uAlpha = container.worldAlpha;

        // make sure the texture is bound..
        var baseTexture = children[0]._texture.baseTexture;

        this.shader.uniforms.uSampler = renderer.bindTexture(baseTexture);

        // now lets upload and render the buffers..
        for (var i = 0, j = 0; i < totalChildren; i += batchSize, j += 1) {
            var amount = totalChildren - i;

            if (amount > batchSize) {
                amount = batchSize;
            }

            var buffer = buffers[j];

            // we always upload the dynamic
            buffer.uploadDynamic(children, i, amount);

            // we only upload the static content when we have to!
            if (container._bufferToUpdate === j) {
                buffer.uploadStatic(children, i, amount);
                container._bufferToUpdate = j + 1;
            }

            // bind the buffer
            renderer.bindVao(buffer.vao);
            buffer.vao.draw(gl.TRIANGLES, amount * 6);
        }
    };

    /**
     * Creates one particle buffer for each child in the container we want to render and updates internal properties
     *
     * @param {PIXI.ParticleContainer} container - The container to render using this ParticleRenderer
     * @return {PIXI.ParticleBuffer[]} The buffers
     */


    ParticleRenderer.prototype.generateBuffers = function generateBuffers(container) {
        var gl = this.renderer.gl;
        var buffers = [];
        var size = container._maxSize;
        var batchSize = container._batchSize;
        var dynamicPropertyFlags = container._properties;

        for (var i = 0; i < size; i += batchSize) {
            buffers.push(new _ParticleBuffer2.default(gl, this.properties, dynamicPropertyFlags, batchSize));
        }

        return buffers;
    };

    /**
     * Uploads the verticies.
     *
     * @param {PIXI.DisplayObject[]} children - the array of display objects to render
     * @param {number} startIndex - the index to start from in the children array
     * @param {number} amount - the amount of children that will have their vertices uploaded
     * @param {number[]} array - The vertices to upload.
     * @param {number} stride - Stride to use for iteration.
     * @param {number} offset - Offset to start at.
     */


    ParticleRenderer.prototype.uploadVertices = function uploadVertices(children, startIndex, amount, array, stride, offset) {
        var w0 = 0;
        var w1 = 0;
        var h0 = 0;
        var h1 = 0;

        for (var i = 0; i < amount; ++i) {
            var sprite = children[startIndex + i];
            var texture = sprite._texture;
            var sx = sprite.scale.x;
            var sy = sprite.scale.y;
            var trim = texture.trim;
            var orig = texture.orig;

            if (trim) {
                // if the sprite is trimmed and is not a tilingsprite then we need to add the
                // extra space before transforming the sprite coords..
                w1 = trim.x - sprite.anchor.x * orig.width;
                w0 = w1 + trim.width;

                h1 = trim.y - sprite.anchor.y * orig.height;
                h0 = h1 + trim.height;
            } else {
                w0 = orig.width * (1 - sprite.anchor.x);
                w1 = orig.width * -sprite.anchor.x;

                h0 = orig.height * (1 - sprite.anchor.y);
                h1 = orig.height * -sprite.anchor.y;
            }

            array[offset] = w1 * sx;
            array[offset + 1] = h1 * sy;

            array[offset + stride] = w0 * sx;
            array[offset + stride + 1] = h1 * sy;

            array[offset + stride * 2] = w0 * sx;
            array[offset + stride * 2 + 1] = h0 * sy;

            array[offset + stride * 3] = w1 * sx;
            array[offset + stride * 3 + 1] = h0 * sy;

            offset += stride * 4;
        }
    };

    /**
     *
     * @param {PIXI.DisplayObject[]} children - the array of display objects to render
     * @param {number} startIndex - the index to start from in the children array
     * @param {number} amount - the amount of children that will have their positions uploaded
     * @param {number[]} array - The vertices to upload.
     * @param {number} stride - Stride to use for iteration.
     * @param {number} offset - Offset to start at.
     */


    ParticleRenderer.prototype.uploadPosition = function uploadPosition(children, startIndex, amount, array, stride, offset) {
        for (var i = 0; i < amount; i++) {
            var spritePosition = children[startIndex + i].position;

            array[offset] = spritePosition.x;
            array[offset + 1] = spritePosition.y;

            array[offset + stride] = spritePosition.x;
            array[offset + stride + 1] = spritePosition.y;

            array[offset + stride * 2] = spritePosition.x;
            array[offset + stride * 2 + 1] = spritePosition.y;

            array[offset + stride * 3] = spritePosition.x;
            array[offset + stride * 3 + 1] = spritePosition.y;

            offset += stride * 4;
        }
    };

    /**
     *
     * @param {PIXI.DisplayObject[]} children - the array of display objects to render
     * @param {number} startIndex - the index to start from in the children array
     * @param {number} amount - the amount of children that will have their rotation uploaded
     * @param {number[]} array - The vertices to upload.
     * @param {number} stride - Stride to use for iteration.
     * @param {number} offset - Offset to start at.
     */


    ParticleRenderer.prototype.uploadRotation = function uploadRotation(children, startIndex, amount, array, stride, offset) {
        for (var i = 0; i < amount; i++) {
            var spriteRotation = children[startIndex + i].rotation;

            array[offset] = spriteRotation;
            array[offset + stride] = spriteRotation;
            array[offset + stride * 2] = spriteRotation;
            array[offset + stride * 3] = spriteRotation;

            offset += stride * 4;
        }
    };

    /**
     *
     * @param {PIXI.DisplayObject[]} children - the array of display objects to render
     * @param {number} startIndex - the index to start from in the children array
     * @param {number} amount - the amount of children that will have their rotation uploaded
     * @param {number[]} array - The vertices to upload.
     * @param {number} stride - Stride to use for iteration.
     * @param {number} offset - Offset to start at.
     */


    ParticleRenderer.prototype.uploadUvs = function uploadUvs(children, startIndex, amount, array, stride, offset) {
        for (var i = 0; i < amount; ++i) {
            var textureUvs = children[startIndex + i]._texture._uvs;

            if (textureUvs) {
                array[offset] = textureUvs.x0;
                array[offset + 1] = textureUvs.y0;

                array[offset + stride] = textureUvs.x1;
                array[offset + stride + 1] = textureUvs.y1;

                array[offset + stride * 2] = textureUvs.x2;
                array[offset + stride * 2 + 1] = textureUvs.y2;

                array[offset + stride * 3] = textureUvs.x3;
                array[offset + stride * 3 + 1] = textureUvs.y3;

                offset += stride * 4;
            } else {
                // TODO you know this can be easier!
                array[offset] = 0;
                array[offset + 1] = 0;

                array[offset + stride] = 0;
                array[offset + stride + 1] = 0;

                array[offset + stride * 2] = 0;
                array[offset + stride * 2 + 1] = 0;

                array[offset + stride * 3] = 0;
                array[offset + stride * 3 + 1] = 0;

                offset += stride * 4;
            }
        }
    };

    /**
     *
     * @param {PIXI.DisplayObject[]} children - the array of display objects to render
     * @param {number} startIndex - the index to start from in the children array
     * @param {number} amount - the amount of children that will have their rotation uploaded
     * @param {number[]} array - The vertices to upload.
     * @param {number} stride - Stride to use for iteration.
     * @param {number} offset - Offset to start at.
     */


    ParticleRenderer.prototype.uploadAlpha = function uploadAlpha(children, startIndex, amount, array, stride, offset) {
        for (var i = 0; i < amount; i++) {
            var spriteAlpha = children[startIndex + i].alpha;

            array[offset] = spriteAlpha;
            array[offset + stride] = spriteAlpha;
            array[offset + stride * 2] = spriteAlpha;
            array[offset + stride * 3] = spriteAlpha;

            offset += stride * 4;
        }
    };

    /**
     * Destroys the ParticleRenderer.
     *
     */


    ParticleRenderer.prototype.destroy = function destroy() {
        if (this.renderer.gl) {
            this.renderer.gl.deleteBuffer(this.indexBuffer);
        }

        _core$ObjectRenderer.prototype.destroy.call(this);

        this.shader.destroy();

        this.indices = null;
        this.tempMatrix = null;
    };

    return ParticleRenderer;
}(core.ObjectRenderer);

exports.default = ParticleRenderer;


core.WebGLRenderer.registerPlugin('particle', ParticleRenderer);
//# sourceMappingURL=ParticleRenderer.js.map