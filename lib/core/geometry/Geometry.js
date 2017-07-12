'use strict';

exports.__esModule = true;

var _Attribute = require('./Attribute');

var _Attribute2 = _interopRequireDefault(_Attribute);

var _Buffer = require('./Buffer');

var _Buffer2 = _interopRequireDefault(_Buffer);

var _interleaveTypedArrays = require('../utils/interleaveTypedArrays');

var _interleaveTypedArrays2 = _interopRequireDefault(_interleaveTypedArrays);

var _getBufferType = require('../utils/getBufferType');

var _getBufferType2 = _interopRequireDefault(_getBufferType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var byteSizeMap = { 5126: 4, 5123: 2, 5121: 1 };
var UID = 0;

/* eslint-disable object-shorthand */
var map = {
    Float32Array: Float32Array,
    Uint32Array: Uint32Array,
    Int32Array: Int32Array,
    Uint8Array: Uint8Array,
    Uint16Array: Uint16Array
};

/* eslint-disable max-len */

/**
 * The Geometry represents a model. It consists of two components:
 * GeometryStyle - The structure of the model such as the attributes layout
 * GeometryData - the data of the model - this consits of buffers.
 *
 * This can include anything from positions, uvs, normals, colors etc..
 *
 * Geometry can be defined without passing in a style or data if required (thats how I prefer!)
 *
 * ```js
 * let geometry = new PIXI.mesh.Geometry();
 *
 * geometry.addAttribute('positions', [0, 0, 100, 0, 100, 100, 0, 100], 2);
 * geometry.addAttribute('uvs', [0,0,1,0,1,1,0,1],2)
 * geometry.addIndex([0,1,2,1,3,2])
 *
 * ```
 * @class
 * @memberof PIXI.mesh.Geometry
 */

var Geometry = function () {
    /**
     * @param {array} buffers  an array of buffers. optional.
     * @param {object} attributes of the geometry, optional structure of the attributes layout
     */
    function Geometry(buffers, attributes) {
        _classCallCheck(this, Geometry);

        this.buffers = buffers || [];

        this.indexBuffer = null;

        this.attributes = attributes || {};

        /**
         * A map of renderer IDs to webgl VAOs
         *
         * @private
         * @type {Array<VertexArrayObject>}
         */
        this.glVertexArrayObjects = {};

        this.id = UID++;

        this.instanced = false;

        this.instanceCount = 1;

        this._size = null;
    }

    /**
    *
    * Adds an attribute to the geometry
    *
    * @param {String} id - the name of the attribute (matching up to a shader)
    * @param {PIXI.mesh.Buffer} [buffer] the buffer that holds the data of the attribute . You can also provide an Array and a buffer will be created from it.
    * @param {Number} [size=0] the size of the attribute. If you hava 2 floats per vertex (eg position x and y) this would be 2
    * @param {Boolean} [normalised=false] should the data be normalised.
    * @param {Number} [type=PIXI.TYPES.FLOAT] what type of numbe is the attribute. Check {PIXI.TYPES} to see the ones available
    * @param {Number} [stride=0] How far apart (in floats) the start of each value is. (used for interleaving data)
    * @param {Number} [start=0] How far into the array to start reading values (used for interleaving data)
    *
    * @return {PIXI.mesh.Geometry} returns self, useful for chaining.
    */


    Geometry.prototype.addAttribute = function addAttribute(id, buffer, size) {
        var normalised = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
        var type = arguments[4];
        var stride = arguments[5];
        var start = arguments[6];
        var instance = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;

        if (!buffer) {
            throw new Error('You must pass a buffer when creating an attribute');
        }

        // check if this is a buffer!
        if (!buffer.data) {
            // its an array!
            if (buffer instanceof Array) {
                buffer = new Float32Array(buffer);
            }

            buffer = new _Buffer2.default(buffer);
        }

        var ids = id.split('|');

        if (ids.length > 1) {
            for (var i = 0; i < ids.length; i++) {
                this.addAttribute(ids[i], buffer, size, normalised, type);
            }

            return this;
        }

        var bufferIndex = this.buffers.indexOf(buffer);

        if (bufferIndex === -1) {
            this.buffers.push(buffer);
            bufferIndex = this.buffers.length - 1;
        }

        this.attributes[id] = new _Attribute2.default(bufferIndex, size, normalised, type, stride, start, instance);

        // assuming that if there is instanced data then this will be drawn with instancing!
        this.instanced = this.instanced || instance;

        return this;
    };

    /**
     * returns the requested attribute
     *
     * @param {String} id  the name of the attribute required
     * @return {PIXI.mesh.Attribute} the attribute requested.
     */


    Geometry.prototype.getAttribute = function getAttribute(id) {
        return this.buffers[this.attributes[id].buffer];
    };

    /**
    *
    * Adds an index buffer to the geometry
    * The index buffer contains integers, three for each triangle in the geometry, which reference the various attribute buffers (position, colour, UV coordinates, other UV coordinates, normal, …). There is only ONE index buffer.
    *
    * @param {PIXI.mesh.Buffer} [buffer] the buffer that holds the data of the index buffer. You can also provide an Array and a buffer will be created from it.
    * @return {PIXI.mesh.Geometry} returns self, useful for chaining.
    */


    Geometry.prototype.addIndex = function addIndex(buffer) {
        if (!buffer.data) {
            // its an array!
            if (buffer instanceof Array) {
                buffer = new Uint16Array(buffer);
            }

            buffer = new _Buffer2.default(buffer);
        }

        buffer.index = true;
        this.indexBuffer = buffer;

        if (this.buffers.indexOf(buffer) === -1) {
            this.buffers.push(buffer);
        }

        return this;
    };

    /**
     * returns the index buffer
     *
     * @return {PIXI.mesh.Buffer} the index buffer.
     */


    Geometry.prototype.getIndex = function getIndex() {
        return this.indexBuffer;
    };

    /**
     * this function modifies the structure so that all current attributes become interleaved into a single buffer
     * This can be useful if your model remains static as it offers a little performance boost
     *
     * @return {PIXI.mesh.Geometry} returns self, useful for chaining.
     */


    Geometry.prototype.interleave = function interleave() {
        // a simple check to see if buffers are already interleaved..
        if (this.buffers.length === 1 || this.buffers.length === 2 && this.indexBuffer) return this;

        // assume already that no buffers are interleaved
        var arrays = [];
        var sizes = [];
        var interleavedBuffer = new _Buffer2.default();
        var i = void 0;

        for (i in this.attributes) {
            var attribute = this.attributes[i];

            var buffer = this.buffers[attribute.buffer];

            arrays.push(buffer.data);

            sizes.push(attribute.size * byteSizeMap[attribute.type] / 4);

            attribute.buffer = 0;
        }

        interleavedBuffer.data = (0, _interleaveTypedArrays2.default)(arrays, sizes);

        for (i = 0; i < this.buffers.length; i++) {
            if (this.buffers[i] !== this.indexBuffer) {
                this.buffers[i].destroy();
            }
        }

        this.buffers = [interleavedBuffer];

        if (this.indexBuffer) {
            this.buffers.push(this.indexBuffer);
        }

        return this;
    };

    Geometry.prototype.getSize = function getSize() {
        for (var i in this.attributes) {
            var attribute = this.attributes[i];
            var buffer = this.buffers[attribute.buffer];

            return buffer.data.length / (attribute.stride / 4 || attribute.size);
        }

        return 0;
    };

    /**
     * Destroys the geometry.
     */


    Geometry.prototype.destroy = function destroy() {
        for (var i = 0; i < this.glVertexArrayObjects.length; i++) {
            this.glVertexArrayObjects[i].destroy();
        }

        this.glVertexArrayObjects = null;

        for (var _i = 0; _i < this.buffers.length; _i++) {
            this.buffers[_i].destroy();
        }

        this.buffers = null;
        this.indexBuffer.destroy();

        this.attributes = null;
    };

    /**
     * returns a clone of the geometry
     *
     * @returns {PIXI.mesh.Geometry} a new clone of this geometry
     */


    Geometry.prototype.clone = function clone() {
        var geometry = new Geometry();

        for (var i = 0; i < this.buffers.length; i++) {
            geometry.buffers[i] = new _Buffer2.default(this.buffers[i].data.slice());
        }

        for (var _i2 in this.attributes) {
            var attrib = this.attributes[_i2];

            geometry.attributes[_i2] = new _Attribute2.default(attrib.buffer, attrib.size, attrib.normalized, attrib.type, attrib.stride, attrib.start, attrib.instance);
        }

        if (this.indexBuffer) {
            geometry.indexBuffer = geometry.buffers[this.buffers.indexOf(this.indexBuffer)];
            geometry.indexBuffer.index = true;
        }

        return geometry;
    };

    /**
     * merges an array of geometries into a new single one
     * geometry attribute styles must match for this operation to work
     *
     * @param {array|PIXI.mesh.Geometry} geometries array of geometries to merge
     * @returns {PIXI.mesh.Geometry} shiney new geometry
     */


    Geometry.merge = function merge(geometries) {
        // todo add a geometry check!
        // also a size check.. cant be too big!]

        var geometryOut = new Geometry();

        var arrays = [];
        var sizes = [];
        var offsets = [];

        var geometry = void 0;

        // pass one.. get sizes..
        for (var i = 0; i < geometries.length; i++) {
            geometry = geometries[i];

            for (var j = 0; j < geometry.buffers.length; j++) {
                sizes[j] = sizes[j] || 0;
                sizes[j] += geometry.buffers[j].data.length;
                offsets[j] = 0;
            }
        }

        // build the correct size arrays..
        for (var _i3 = 0; _i3 < geometry.buffers.length; _i3++) {
            // TODO types!
            arrays[_i3] = new map[(0, _getBufferType2.default)(geometry.buffers[_i3].data)](sizes[_i3]);
            geometryOut.buffers[_i3] = new _Buffer2.default(arrays[_i3]);
        }

        // pass to set data..
        for (var _i4 = 0; _i4 < geometries.length; _i4++) {
            geometry = geometries[_i4];

            for (var _j = 0; _j < geometry.buffers.length; _j++) {
                arrays[_j].set(geometry.buffers[_j].data, offsets[_j]);
                offsets[_j] += geometry.buffers[_j].data.length;
            }
        }

        geometryOut.attributes = geometry.attributes;

        if (geometry.indexBuffer) {
            geometryOut.indexBuffer = geometryOut.buffers[geometry.buffers.indexOf(geometry.indexBuffer)];
            geometryOut.indexBuffer.index = true;

            var offset = 0;
            var stride = 0;
            var offset2 = 0;
            var bufferIndexToCount = 0;

            // get a buffer
            for (var _i5 = 0; _i5 < geometry.buffers.length; _i5++) {
                if (geometry.buffers[_i5] !== geometry.indexBuffer) {
                    bufferIndexToCount = _i5;
                    break;
                }
            }

            // figure out the stride of one buffer..
            for (var _i6 in geometry.attributes) {
                var attribute = geometry.attributes[_i6];

                if ((attribute.buffer | 0) === bufferIndexToCount) {
                    stride += attribute.size * byteSizeMap[attribute.type] / 4;
                }
            }

            // time to off set all indexes..
            for (var _i7 = 0; _i7 < geometries.length; _i7++) {
                var indexBufferData = geometries[_i7].indexBuffer.data;

                for (var _j2 = 0; _j2 < indexBufferData.length; _j2++) {
                    geometryOut.indexBuffer.data[_j2 + offset2] += offset;
                }

                offset += geometry.buffers[bufferIndexToCount].data.length / stride;
                offset2 += indexBufferData.length;
            }
        }

        return geometryOut;
    };

    return Geometry;
}();

exports.default = Geometry;
//# sourceMappingURL=Geometry.js.map