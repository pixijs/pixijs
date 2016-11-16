'use strict';

exports.__esModule = true;

var _pixiGlCore = require('pixi-gl-core');

var _pixiGlCore2 = _interopRequireDefault(_pixiGlCore);

var _createIndicesForQuads = require('../../core/utils/createIndicesForQuads');

var _createIndicesForQuads2 = _interopRequireDefault(_createIndicesForQuads);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that
 * they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's ParticleBuffer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/ParticleBuffer.java
 */

/**
 * The particle buffer manages the static and dynamic buffers for a particle container.
 *
 * @class
 * @private
 * @memberof PIXI
 */
var ParticleBuffer = function () {
    /**
     * @param {WebGLRenderingContext} gl - The rendering context.
     * @param {object} properties - The properties to upload.
     * @param {boolean[]} dynamicPropertyFlags - Flags for which properties are dynamic.
     * @param {number} size - The size of the batch.
     */
    function ParticleBuffer(gl, properties, dynamicPropertyFlags, size) {
        _classCallCheck(this, ParticleBuffer);

        /**
         * The current WebGL drawing context.
         *
         * @member {WebGLRenderingContext}
         */
        this.gl = gl;

        /**
         * Size of a single vertex.
         *
         * @member {number}
         */
        this.vertSize = 2;

        /**
         * Size of a single vertex in bytes.
         *
         * @member {number}
         */
        this.vertByteSize = this.vertSize * 4;

        /**
         * The number of particles the buffer can hold
         *
         * @member {number}
         */
        this.size = size;

        /**
         * A list of the properties that are dynamic.
         *
         * @member {object[]}
         */
        this.dynamicProperties = [];

        /**
         * A list of the properties that are static.
         *
         * @member {object[]}
         */
        this.staticProperties = [];

        for (var i = 0; i < properties.length; ++i) {
            var property = properties[i];

            // Make copy of properties object so that when we edit the offset it doesn't
            // change all other instances of the object literal
            property = {
                attribute: property.attribute,
                size: property.size,
                uploadFunction: property.uploadFunction,
                offset: property.offset
            };

            if (dynamicPropertyFlags[i]) {
                this.dynamicProperties.push(property);
            } else {
                this.staticProperties.push(property);
            }
        }

        this.staticStride = 0;
        this.staticBuffer = null;
        this.staticData = null;

        this.dynamicStride = 0;
        this.dynamicBuffer = null;
        this.dynamicData = null;

        this.initBuffers();
    }

    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */


    ParticleBuffer.prototype.initBuffers = function initBuffers() {
        var gl = this.gl;
        var dynamicOffset = 0;

        /**
         * Holds the indices of the geometry (quads) to draw
         *
         * @member {Uint16Array}
         */
        this.indices = (0, _createIndicesForQuads2.default)(this.size);
        this.indexBuffer = _pixiGlCore2.default.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);

        this.dynamicStride = 0;

        for (var i = 0; i < this.dynamicProperties.length; ++i) {
            var property = this.dynamicProperties[i];

            property.offset = dynamicOffset;
            dynamicOffset += property.size;
            this.dynamicStride += property.size;
        }

        this.dynamicData = new Float32Array(this.size * this.dynamicStride * 4);
        this.dynamicBuffer = _pixiGlCore2.default.GLBuffer.createVertexBuffer(gl, this.dynamicData, gl.STREAM_DRAW);

        // static //
        var staticOffset = 0;

        this.staticStride = 0;

        for (var _i = 0; _i < this.staticProperties.length; ++_i) {
            var _property = this.staticProperties[_i];

            _property.offset = staticOffset;
            staticOffset += _property.size;
            this.staticStride += _property.size;
        }

        this.staticData = new Float32Array(this.size * this.staticStride * 4);
        this.staticBuffer = _pixiGlCore2.default.GLBuffer.createVertexBuffer(gl, this.staticData, gl.STATIC_DRAW);

        this.vao = new _pixiGlCore2.default.VertexArrayObject(gl).addIndex(this.indexBuffer);

        for (var _i2 = 0; _i2 < this.dynamicProperties.length; ++_i2) {
            var _property2 = this.dynamicProperties[_i2];

            this.vao.addAttribute(this.dynamicBuffer, _property2.attribute, gl.FLOAT, false, this.dynamicStride * 4, _property2.offset * 4);
        }

        for (var _i3 = 0; _i3 < this.staticProperties.length; ++_i3) {
            var _property3 = this.staticProperties[_i3];

            this.vao.addAttribute(this.staticBuffer, _property3.attribute, gl.FLOAT, false, this.staticStride * 4, _property3.offset * 4);
        }
    };

    /**
     * Uploads the dynamic properties.
     *
     * @param {PIXI.DisplayObject[]} children - The children to upload.
     * @param {number} startIndex - The index to start at.
     * @param {number} amount - The number to upload.
     */


    ParticleBuffer.prototype.uploadDynamic = function uploadDynamic(children, startIndex, amount) {
        for (var i = 0; i < this.dynamicProperties.length; i++) {
            var property = this.dynamicProperties[i];

            property.uploadFunction(children, startIndex, amount, this.dynamicData, this.dynamicStride, property.offset);
        }

        this.dynamicBuffer.upload();
    };

    /**
     * Uploads the static properties.
     *
     * @param {PIXI.DisplayObject[]} children - The children to upload.
     * @param {number} startIndex - The index to start at.
     * @param {number} amount - The number to upload.
     */


    ParticleBuffer.prototype.uploadStatic = function uploadStatic(children, startIndex, amount) {
        for (var i = 0; i < this.staticProperties.length; i++) {
            var property = this.staticProperties[i];

            property.uploadFunction(children, startIndex, amount, this.staticData, this.staticStride, property.offset);
        }

        this.staticBuffer.upload();
    };

    /**
     * Destroys the ParticleBuffer.
     *
     */


    ParticleBuffer.prototype.destroy = function destroy() {
        this.dynamicProperties = null;
        this.dynamicData = null;
        this.dynamicBuffer.destroy();

        this.staticProperties = null;
        this.staticData = null;
        this.staticBuffer.destroy();
    };

    return ParticleBuffer;
}();

exports.default = ParticleBuffer;
//# sourceMappingURL=ParticleBuffer.js.map