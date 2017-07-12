'use strict';

exports.__esModule = true;

var _WebGLSystem2 = require('../WebGLSystem');

var _WebGLSystem3 = _interopRequireDefault(_WebGLSystem2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var byteSizeMap = { 5126: 4, 5123: 2, 5121: 1 };

var GLBufferData = function GLBufferData(buffer) {
    _classCallCheck(this, GLBufferData);

    this.buffer = buffer;
    this.updateID = -1;
    this.byteLength = -1;
};

/**
 * @class
 * @extends PIXI.WebGLSystem
 * @memberof PIXI
 */


var GeometrySystem = function (_WebGLSystem) {
    _inherits(GeometrySystem, _WebGLSystem);

    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this System works for.
     */
    function GeometrySystem(renderer) {
        _classCallCheck(this, GeometrySystem);

        var _this = _possibleConstructorReturn(this, _WebGLSystem.call(this, renderer));

        _this._activeGeometry = null;
        _this._activeVao = null;

        _this.hasVao = true;
        _this.hasInstance = true;
        return _this;
    }

    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */


    GeometrySystem.prototype.contextChange = function contextChange() {
        var gl = this.gl = this.renderer.gl;

        this.CONTEXT_UID = this.renderer.CONTEXT_UID;

        // webgl2
        if (!gl.createVertexArray) {
            // webgl 1!
            var nativeVaoExtension = this.renderer.context.extensions.vertexArrayObject;

            if (this.renderer.legacy) {
                nativeVaoExtension = null;
            }

            if (nativeVaoExtension) {
                gl.createVertexArray = function () {
                    return nativeVaoExtension.createVertexArrayOES();
                };

                gl.bindVertexArray = function (vao) {
                    return nativeVaoExtension.bindVertexArrayOES(vao);
                };

                gl.deleteVertexArray = function (vao) {
                    return nativeVaoExtension.deleteVertexArrayOES(vao);
                };
            } else {
                this.hasVao = false;
                gl.createVertexArray = function () {
                    // empty
                };

                gl.bindVertexArray = function () {
                    // empty
                };

                gl.deleteVertexArray = function () {
                    // empty
                };
            }
        }

        if (!gl.vertexAttribDivisor) {
            var instanceExt = gl.getExtension('ANGLE_instanced_arrays');

            if (instanceExt) {
                gl.vertexAttribDivisor = function (a, b) {
                    return instanceExt.vertexAttribDivisorANGLE(a, b);
                };

                gl.drawElementsInstanced = function (a, b, c, d, e) {
                    return instanceExt.drawElementsInstancedANGLE(a, b, c, d, e);
                };

                gl.drawArraysInstanced = function (a, b, c, d) {
                    return instanceExt.drawArraysInstancedANGLE(a, b, c, d);
                };
            } else {
                this.hasInstance = false;
            }
        }
    };

    /**
     * Binds geometry so that is can be drawn. Creating a Vao if required
     * @private
     * @param {PIXI.mesh.Geometry} geometry instance of geometry to bind
     */


    GeometrySystem.prototype.bind = function bind(geometry, shader) {
        shader = shader || this.renderer.shader.shader;

        var gl = this.gl;

        // not sure the best way to address this..
        // currently different shaders require different VAOs for the same geometry
        // Still mulling over the best way to solve this one..
        // will likely need to modify the shader attribute locations at run time!
        var vaos = geometry.glVertexArrayObjects[this.CONTEXT_UID];

        if (!vaos) {
            geometry.glVertexArrayObjects[this.CONTEXT_UID] = vaos = {};
        }

        var vao = vaos[shader.program.id] || this.initGeometryVao(geometry, shader.program);

        this._activeGeometry = geometry;

        if (this._activeVao !== vao) {
            this._activeVao = vao;

            if (this.hasVao) {
                gl.bindVertexArray(vao);
            } else {
                this.activateVao(geometry, shader.program);
            }
        }

        // TODO - optimise later!
        // don't need to loop through if nothing changed!
        // maybe look to add an 'autoupdate' to geometry?
        this.updateBuffers();
    };

    GeometrySystem.prototype.updateBuffers = function updateBuffers() {
        var geometry = this._activeGeometry;
        var gl = this.gl;

        for (var i = 0; i < geometry.buffers.length; i++) {
            var buffer = geometry.buffers[i];

            var glBuffer = buffer._glBuffers[this.CONTEXT_UID];

            if (buffer._updateID !== glBuffer.updateID) {
                glBuffer.updateID = buffer._updateID;

                // TODO can cache this on buffer! maybe added a getter / setter?
                var type = buffer.index ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
                var drawType = buffer.static ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW;

                gl.bindBuffer(type, glBuffer.buffer);

                if (glBuffer.byteLength >= buffer.data.byteLength) {
                    // offset is always zero for now!
                    gl.bufferSubData(type, 0, buffer.data);
                } else {
                    gl.bufferData(type, buffer.data, drawType);
                }
            }
        }
    };

    GeometrySystem.prototype.checkCompatability = function checkCompatability(geometry, program) {
        // geometry must have at least all the attributes that the shader requires.
        var geometryAttributes = geometry.attributes;
        var shaderAttributes = program.attributeData;

        for (var j in shaderAttributes) {
            if (!geometryAttributes[j]) {
                throw new Error('shader and geometry incompatible, geometry missing the "' + j + '" attribute');
            }
        }
    };

    /**
     * Creates a Vao with the same structure as the geometry and stores it on the geometry.
     * @private
     * @param {PIXI.mesh.Geometry} geometry instance of geometry to to generate Vao for
     */


    GeometrySystem.prototype.initGeometryVao = function initGeometryVao(geometry, program) {
        this.checkCompatability(geometry, program);

        var gl = this.gl;
        var CONTEXT_UID = this.CONTEXT_UID;
        var buffers = geometry.buffers;
        var attributes = geometry.attributes;

        var tempStride = {};
        var tempStart = {};

        for (var j in buffers) {
            tempStride[j] = 0;
            tempStart[j] = 0;
        }

        for (var _j in attributes) {
            if (!attributes[_j].size && program.attributeData[_j]) {
                attributes[_j].size = program.attributeData[_j].size;
            }

            tempStride[attributes[_j].buffer] += attributes[_j].size * byteSizeMap[attributes[_j].type];
        }

        for (var _j2 in attributes) {
            var attribute = attributes[_j2];
            var attribSize = attribute.size;

            if (attribute.stride === undefined) {
                if (tempStride[attribute.buffer] === attribSize * byteSizeMap[attribute.type]) {
                    attribute.stride = 0;
                } else {
                    attribute.stride = tempStride[attribute.buffer];
                }
            }

            if (attribute.start === undefined) {
                attribute.start = tempStart[attribute.buffer];

                tempStart[attribute.buffer] += attribSize * byteSizeMap[attribute.type];
            }
        }

        // first update - and create the buffers!
        // only create a gl buffer if it actually gets
        for (var i = 0; i < buffers.length; i++) {
            var buffer = buffers[i];

            if (!buffer._glBuffers[CONTEXT_UID]) {
                buffer._glBuffers[CONTEXT_UID] = new GLBufferData(gl.createBuffer());
            }
        }

        // TODO - maybe make this a data object?
        // lets wait to see if we need to first!
        var vao = gl.createVertexArray();

        gl.bindVertexArray(vao);

        this.activateVao(geometry, program);

        gl.bindVertexArray(null);

        // add it to the cache!
        geometry.glVertexArrayObjects[this.CONTEXT_UID][program.id] = vao;
    };

    GeometrySystem.prototype.activateVao = function activateVao(geometry, program) {
        var gl = this.gl;
        var CONTEXT_UID = this.CONTEXT_UID;
        var buffers = geometry.buffers;
        var attributes = geometry.attributes;

        if (geometry.indexBuffer) {
            // first update the index buffer if we have one..
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indexBuffer._glBuffers[CONTEXT_UID].buffer);
        }

        var lastBuffer = null;

        // add a new one!
        for (var j in attributes) {
            var attribute = attributes[j];
            var buffer = buffers[attribute.buffer];
            var glBuffer = buffer._glBuffers[CONTEXT_UID];

            if (program.attributeData[j]) {
                if (lastBuffer !== glBuffer) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer.buffer);

                    lastBuffer = glBuffer;
                }

                var location = program.attributeData[j].location;

                // TODO introduce state again
                // we can optimise this for older devices that have no VAOs
                gl.enableVertexAttribArray(location);

                gl.vertexAttribPointer(location, attribute.size, attribute.type || gl.FLOAT, attribute.normalized, attribute.stride, attribute.start);

                if (attribute.instance) {
                    // TODO calculate instance count based of this...
                    if (this.hasInstance) {
                        gl.vertexAttribDivisor(location, 1);
                    } else {
                        throw new Error('geometry error, GPU Instancing is not supported on this device');
                    }
                }
            }
        }
    };

    GeometrySystem.prototype.draw = function draw(type, size, start, instanceCount) {
        var gl = this.gl;
        var geometry = this._activeGeometry;

        // TODO.. this should not change so maybe cache the function?

        if (geometry.indexBuffer) {
            if (geometry.instanced) {
                /* eslint-disable max-len */
                gl.drawElementsInstanced(type, size || geometry.indexBuffer.data.length, gl.UNSIGNED_SHORT, (start || 0) * 2, instanceCount || 1);
                /* eslint-enable max-len */
            } else {
                gl.drawElements(type, size || geometry.indexBuffer.data.length, gl.UNSIGNED_SHORT, (start || 0) * 2);
            }
        } else if (geometry.instanced) {
            // TODO need a better way to calculate size..
            gl.drawArraysInstanced(type, start, size || geometry.getSize(), instanceCount || 1);
        } else {
            gl.drawArrays(type, start, size || geometry.getSize());
        }

        return this;
    };

    return GeometrySystem;
}(_WebGLSystem3.default);

exports.default = GeometrySystem;
//# sourceMappingURL=GeometrySystem.js.map