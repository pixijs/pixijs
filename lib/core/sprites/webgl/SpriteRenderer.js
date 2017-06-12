'use strict';

exports.__esModule = true;

var _ObjectRenderer2 = require('../../renderers/webgl/utils/ObjectRenderer');

var _ObjectRenderer3 = _interopRequireDefault(_ObjectRenderer2);

var _WebGLRenderer = require('../../renderers/webgl/WebGLRenderer');

var _WebGLRenderer2 = _interopRequireDefault(_WebGLRenderer);

var _createIndicesForQuads = require('../../utils/createIndicesForQuads');

var _createIndicesForQuads2 = _interopRequireDefault(_createIndicesForQuads);

var _generateMultiTextureShader = require('./generateMultiTextureShader');

var _generateMultiTextureShader2 = _interopRequireDefault(_generateMultiTextureShader);

var _checkMaxIfStatmentsInShader = require('../../renderers/webgl/utils/checkMaxIfStatmentsInShader');

var _checkMaxIfStatmentsInShader2 = _interopRequireDefault(_checkMaxIfStatmentsInShader);

var _BatchBuffer = require('./BatchBuffer');

var _BatchBuffer2 = _interopRequireDefault(_BatchBuffer);

var _settings = require('../../settings');

var _settings2 = _interopRequireDefault(_settings);

var _utils = require('../../utils');

var _pixiGlCore = require('pixi-gl-core');

var _pixiGlCore2 = _interopRequireDefault(_pixiGlCore);

var _bitTwiddle = require('bit-twiddle');

var _bitTwiddle2 = _interopRequireDefault(_bitTwiddle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TICK = 0;
var TEXTURE_TICK = 0;

/**
 * Renderer dedicated to drawing and batching sprites.
 *
 * @class
 * @private
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 */

var SpriteRenderer = function (_ObjectRenderer) {
    _inherits(SpriteRenderer, _ObjectRenderer);

    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this sprite batch works for.
     */
    function SpriteRenderer(renderer) {
        _classCallCheck(this, SpriteRenderer);

        /**
         * Number of values sent in the vertex buffer.
         * aVertexPosition(2), aTextureCoord(1), aColor(1), aTextureId(1) = 5
         *
         * @member {number}
         */
        var _this = _possibleConstructorReturn(this, _ObjectRenderer.call(this, renderer));

        _this.vertSize = 5;

        /**
         * The size of the vertex information in bytes.
         *
         * @member {number}
         */
        _this.vertByteSize = _this.vertSize * 4;

        /**
         * The number of images in the SpriteRenderer before it flushes.
         *
         * @member {number}
         */
        _this.size = _settings2.default.SPRITE_BATCH_SIZE; // 2000 is a nice balance between mobile / desktop

        // the total number of bytes in our batch
        // let numVerts = this.size * 4 * this.vertByteSize;

        _this.buffers = [];
        for (var i = 1; i <= _bitTwiddle2.default.nextPow2(_this.size); i *= 2) {
            _this.buffers.push(new _BatchBuffer2.default(i * 4 * _this.vertByteSize));
        }

        /**
         * Holds the indices of the geometry (quads) to draw
         *
         * @member {Uint16Array}
         */
        _this.indices = (0, _createIndicesForQuads2.default)(_this.size);

        /**
         * The default shaders that is used if a sprite doesn't have a more specific one.
         * there is a shader for each number of textures that can be rendererd.
         * These shaders will also be generated on the fly as required.
         * @member {PIXI.Shader[]}
         */
        _this.shader = null;

        _this.currentIndex = 0;
        _this.groups = [];

        for (var k = 0; k < _this.size; k++) {
            _this.groups[k] = { textures: [], textureCount: 0, ids: [], size: 0, start: 0, blend: 0 };
        }

        _this.sprites = [];

        _this.vertexBuffers = [];
        _this.vaos = [];

        _this.vaoMax = 2;
        _this.vertexCount = 0;

        _this.renderer.on('prerender', _this.onPrerender, _this);
        return _this;
    }

    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */


    SpriteRenderer.prototype.onContextChange = function onContextChange() {
        var gl = this.renderer.gl;

        if (this.renderer.legacy) {
            this.MAX_TEXTURES = 1;
        } else {
            // step 1: first check max textures the GPU can handle.
            this.MAX_TEXTURES = Math.min(gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), _settings2.default.SPRITE_MAX_TEXTURES);

            // step 2: check the maximum number of if statements the shader can have too..
            this.MAX_TEXTURES = (0, _checkMaxIfStatmentsInShader2.default)(this.MAX_TEXTURES, gl);
        }

        this.shader = (0, _generateMultiTextureShader2.default)(gl, this.MAX_TEXTURES);

        // create a couple of buffers
        this.indexBuffer = _pixiGlCore2.default.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);

        // we use the second shader as the first one depending on your browser may omit aTextureId
        // as it is not used by the shader so is optimized out.

        this.renderer.bindVao(null);

        var attrs = this.shader.attributes;

        for (var i = 0; i < this.vaoMax; i++) {
            /* eslint-disable max-len */
            var vertexBuffer = this.vertexBuffers[i] = _pixiGlCore2.default.GLBuffer.createVertexBuffer(gl, null, gl.STREAM_DRAW);
            /* eslint-enable max-len */

            // build the vao object that will render..
            var vao = this.renderer.createVao().addIndex(this.indexBuffer).addAttribute(vertexBuffer, attrs.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0).addAttribute(vertexBuffer, attrs.aTextureCoord, gl.UNSIGNED_SHORT, true, this.vertByteSize, 2 * 4).addAttribute(vertexBuffer, attrs.aColor, gl.UNSIGNED_BYTE, true, this.vertByteSize, 3 * 4);

            if (attrs.aTextureId) {
                vao.addAttribute(vertexBuffer, attrs.aTextureId, gl.FLOAT, false, this.vertByteSize, 4 * 4);
            }

            this.vaos[i] = vao;
        }

        this.vao = this.vaos[0];
        this.currentBlendMode = 99999;

        this.boundTextures = new Array(this.MAX_TEXTURES);
    };

    /**
     * Called before the renderer starts rendering.
     *
     */


    SpriteRenderer.prototype.onPrerender = function onPrerender() {
        this.vertexCount = 0;
    };

    /**
     * Renders the sprite object.
     *
     * @param {PIXI.Sprite} sprite - the sprite to render when using this spritebatch
     */


    SpriteRenderer.prototype.render = function render(sprite) {
        // TODO set blend modes..
        // check texture..
        if (this.currentIndex >= this.size) {
            this.flush();
        }

        // get the uvs for the texture

        // if the uvs have not updated then no point rendering just yet!
        if (!sprite._texture._uvs) {
            return;
        }

        // push a texture.
        // increment the batchsize
        this.sprites[this.currentIndex++] = sprite;
    };

    /**
     * Renders the content and empties the current batch.
     *
     */


    SpriteRenderer.prototype.flush = function flush() {
        if (this.currentIndex === 0) {
            return;
        }

        var gl = this.renderer.gl;
        var MAX_TEXTURES = this.MAX_TEXTURES;

        var np2 = _bitTwiddle2.default.nextPow2(this.currentIndex);
        var log2 = _bitTwiddle2.default.log2(np2);
        var buffer = this.buffers[log2];

        var sprites = this.sprites;
        var groups = this.groups;

        var float32View = buffer.float32View;
        var uint32View = buffer.uint32View;

        var boundTextures = this.boundTextures;
        var rendererBoundTextures = this.renderer.boundTextures;
        var touch = this.renderer.textureGC.count;

        var index = 0;
        var nextTexture = void 0;
        var currentTexture = void 0;
        var groupCount = 1;
        var textureCount = 0;
        var currentGroup = groups[0];
        var vertexData = void 0;
        var uvs = void 0;
        var blendMode = _utils.premultiplyBlendMode[sprites[0]._texture.baseTexture.premultipliedAlpha ? 1 : 0][sprites[0].blendMode];

        currentGroup.textureCount = 0;
        currentGroup.start = 0;
        currentGroup.blend = blendMode;

        TICK++;

        var i = void 0;

        // copy textures..
        for (i = 0; i < MAX_TEXTURES; ++i) {
            boundTextures[i] = rendererBoundTextures[i];
            boundTextures[i]._virtalBoundId = i;
        }

        for (i = 0; i < this.currentIndex; ++i) {
            // upload the sprite elemetns...
            // they have all ready been calculated so we just need to push them into the buffer.
            var sprite = sprites[i];

            nextTexture = sprite._texture.baseTexture;

            var spriteBlendMode = _utils.premultiplyBlendMode[Number(nextTexture.premultipliedAlpha)][sprite.blendMode];

            if (blendMode !== spriteBlendMode) {
                // finish a group..
                blendMode = spriteBlendMode;

                // force the batch to break!
                currentTexture = null;
                textureCount = MAX_TEXTURES;
                TICK++;
            }

            if (currentTexture !== nextTexture) {
                currentTexture = nextTexture;

                if (nextTexture._enabled !== TICK) {
                    if (textureCount === MAX_TEXTURES) {
                        TICK++;

                        currentGroup.size = i - currentGroup.start;

                        textureCount = 0;

                        currentGroup = groups[groupCount++];
                        currentGroup.blend = blendMode;
                        currentGroup.textureCount = 0;
                        currentGroup.start = i;
                    }

                    nextTexture.touched = touch;

                    if (nextTexture._virtalBoundId === -1) {
                        for (var j = 0; j < MAX_TEXTURES; ++j) {
                            var tIndex = (j + TEXTURE_TICK) % MAX_TEXTURES;

                            var t = boundTextures[tIndex];

                            if (t._enabled !== TICK) {
                                TEXTURE_TICK++;

                                t._virtalBoundId = -1;

                                nextTexture._virtalBoundId = tIndex;

                                boundTextures[tIndex] = nextTexture;
                                break;
                            }
                        }
                    }

                    nextTexture._enabled = TICK;

                    currentGroup.textureCount++;
                    currentGroup.ids[textureCount] = nextTexture._virtalBoundId;
                    currentGroup.textures[textureCount++] = nextTexture;
                }
            }

            vertexData = sprite.vertexData;

            // TODO this sum does not need to be set each frame..
            uvs = sprite._texture._uvs.uvsUint32;

            if (this.renderer.roundPixels) {
                var resolution = this.renderer.resolution;

                // xy
                float32View[index] = (vertexData[0] * resolution | 0) / resolution;
                float32View[index + 1] = (vertexData[1] * resolution | 0) / resolution;

                // xy
                float32View[index + 5] = (vertexData[2] * resolution | 0) / resolution;
                float32View[index + 6] = (vertexData[3] * resolution | 0) / resolution;

                // xy
                float32View[index + 10] = (vertexData[4] * resolution | 0) / resolution;
                float32View[index + 11] = (vertexData[5] * resolution | 0) / resolution;

                // xy
                float32View[index + 15] = (vertexData[6] * resolution | 0) / resolution;
                float32View[index + 16] = (vertexData[7] * resolution | 0) / resolution;
            } else {
                // xy
                float32View[index] = vertexData[0];
                float32View[index + 1] = vertexData[1];

                // xy
                float32View[index + 5] = vertexData[2];
                float32View[index + 6] = vertexData[3];

                // xy
                float32View[index + 10] = vertexData[4];
                float32View[index + 11] = vertexData[5];

                // xy
                float32View[index + 15] = vertexData[6];
                float32View[index + 16] = vertexData[7];
            }

            uint32View[index + 2] = uvs[0];
            uint32View[index + 7] = uvs[1];
            uint32View[index + 12] = uvs[2];
            uint32View[index + 17] = uvs[3];
            /* eslint-disable max-len */
            var alpha = Math.min(sprite.worldAlpha, 1.0);
            // we dont call extra function if alpha is 1.0, that's faster
            var argb = alpha < 1.0 && nextTexture.premultipliedAlpha ? (0, _utils.premultiplyTint)(sprite._tintRGB, alpha) : sprite._tintRGB + (alpha * 255 << 24);

            uint32View[index + 3] = uint32View[index + 8] = uint32View[index + 13] = uint32View[index + 18] = argb;
            float32View[index + 4] = float32View[index + 9] = float32View[index + 14] = float32View[index + 19] = nextTexture._virtalBoundId;
            /* eslint-enable max-len */

            index += 20;
        }

        currentGroup.size = i - currentGroup.start;

        if (!_settings2.default.CAN_UPLOAD_SAME_BUFFER) {
            // this is still needed for IOS performance..
            // it really does not like uploading to the same buffer in a single frame!
            if (this.vaoMax <= this.vertexCount) {
                this.vaoMax++;

                var attrs = this.shader.attributes;

                /* eslint-disable max-len */
                var vertexBuffer = this.vertexBuffers[this.vertexCount] = _pixiGlCore2.default.GLBuffer.createVertexBuffer(gl, null, gl.STREAM_DRAW);
                /* eslint-enable max-len */

                // build the vao object that will render..
                var vao = this.renderer.createVao().addIndex(this.indexBuffer).addAttribute(vertexBuffer, attrs.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0).addAttribute(vertexBuffer, attrs.aTextureCoord, gl.UNSIGNED_SHORT, true, this.vertByteSize, 2 * 4).addAttribute(vertexBuffer, attrs.aColor, gl.UNSIGNED_BYTE, true, this.vertByteSize, 3 * 4);

                if (attrs.aTextureId) {
                    vao.addAttribute(vertexBuffer, attrs.aTextureId, gl.FLOAT, false, this.vertByteSize, 4 * 4);
                }

                this.vaos[this.vertexCount] = vao;
            }

            this.renderer.bindVao(this.vaos[this.vertexCount]);

            this.vertexBuffers[this.vertexCount].upload(buffer.vertices, 0, false);

            this.vertexCount++;
        } else {
            // lets use the faster option, always use buffer number 0
            this.vertexBuffers[this.vertexCount].upload(buffer.vertices, 0, true);
        }

        for (i = 0; i < MAX_TEXTURES; ++i) {
            rendererBoundTextures[i]._virtalBoundId = -1;
        }

        // render the groups..
        for (i = 0; i < groupCount; ++i) {
            var group = groups[i];
            var groupTextureCount = group.textureCount;

            for (var _j = 0; _j < groupTextureCount; _j++) {
                currentTexture = group.textures[_j];

                // reset virtual ids..
                // lets do a quick check..
                if (rendererBoundTextures[group.ids[_j]] !== currentTexture) {
                    this.renderer.bindTexture(currentTexture, group.ids[_j], true);
                }

                // reset the virtualId..
                currentTexture._virtalBoundId = -1;
            }

            // set the blend mode..
            this.renderer.state.setBlendMode(group.blend);

            gl.drawElements(gl.TRIANGLES, group.size * 6, gl.UNSIGNED_SHORT, group.start * 6 * 2);
        }

        // reset elements for the next flush
        this.currentIndex = 0;
    };

    /**
     * Starts a new sprite batch.
     */


    SpriteRenderer.prototype.start = function start() {
        this.renderer.bindShader(this.shader);

        if (_settings2.default.CAN_UPLOAD_SAME_BUFFER) {
            // bind buffer #0, we don't need others
            this.renderer.bindVao(this.vaos[this.vertexCount]);

            this.vertexBuffers[this.vertexCount].bind();
        }
    };

    /**
     * Stops and flushes the current batch.
     *
     */


    SpriteRenderer.prototype.stop = function stop() {
        this.flush();
    };

    /**
     * Destroys the SpriteRenderer.
     *
     */


    SpriteRenderer.prototype.destroy = function destroy() {
        for (var i = 0; i < this.vaoMax; i++) {
            if (this.vertexBuffers[i]) {
                this.vertexBuffers[i].destroy();
            }
            if (this.vaos[i]) {
                this.vaos[i].destroy();
            }
        }

        if (this.indexBuffer) {
            this.indexBuffer.destroy();
        }

        this.renderer.off('prerender', this.onPrerender, this);

        _ObjectRenderer.prototype.destroy.call(this);

        if (this.shader) {
            this.shader.destroy();
            this.shader = null;
        }

        this.vertexBuffers = null;
        this.vaos = null;
        this.indexBuffer = null;
        this.indices = null;

        this.sprites = null;

        for (var _i = 0; _i < this.buffers.length; ++_i) {
            this.buffers[_i].destroy();
        }
    };

    return SpriteRenderer;
}(_ObjectRenderer3.default);

exports.default = SpriteRenderer;


_WebGLRenderer2.default.registerPlugin('sprite', SpriteRenderer);
//# sourceMappingURL=SpriteRenderer.js.map