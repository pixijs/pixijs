/*!
 * @pixi/mesh - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/mesh is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
import { State, Program, TextureMatrix, Shader, Buffer, Geometry } from '@pixi/core';
import { Point, Polygon, Matrix } from '@pixi/math';
import { DRAW_MODES, BLEND_MODES, TYPES } from '@pixi/constants';
import { Container } from '@pixi/display';
import { settings } from '@pixi/settings';
import { premultiplyTintToRgba } from '@pixi/utils';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

/**
 * Class controls cache for UV mapping from Texture normal space to BaseTexture normal space.
 *
 * @class
 * @memberof PIXI
 */
var MeshBatchUvs = /** @class */ (function () {
    /**
     * @param {PIXI.Buffer} uvBuffer - Buffer with normalized uv's
     * @param {PIXI.TextureMatrix} uvMatrix - Material UV matrix
     */
    function MeshBatchUvs(uvBuffer, uvMatrix) {
        /**
         * Buffer with normalized UV's
         * @member {PIXI.Buffer}
         */
        this.uvBuffer = uvBuffer;
        /**
         * Material UV matrix
         * @member {PIXI.TextureMatrix}
         */
        this.uvMatrix = uvMatrix;
        /**
         * UV Buffer data
         * @member {Float32Array}
         * @readonly
         */
        this.data = null;
        this._bufferUpdateId = -1;
        this._textureUpdateId = -1;
        this._updateID = 0;
    }
    /**
     * updates
     *
     * @param {boolean} [forceUpdate] - force the update
     */
    MeshBatchUvs.prototype.update = function (forceUpdate) {
        if (!forceUpdate
            && this._bufferUpdateId === this.uvBuffer._updateID
            && this._textureUpdateId === this.uvMatrix._updateID) {
            return;
        }
        this._bufferUpdateId = this.uvBuffer._updateID;
        this._textureUpdateId = this.uvMatrix._updateID;
        var data = this.uvBuffer.data;
        if (!this.data || this.data.length !== data.length) {
            this.data = new Float32Array(data.length);
        }
        this.uvMatrix.multiplyUvs(data, this.data);
        this._updateID++;
    };
    return MeshBatchUvs;
}());

var tempPoint = new Point();
var tempPolygon = new Polygon();
/**
 * Base mesh class.
 *
 * This class empowers you to have maximum flexibility to render any kind of WebGL visuals you can think of.
 * This class assumes a certain level of WebGL knowledge.
 * If you know a bit this should abstract enough away to make you life easier!
 *
 * Pretty much ALL WebGL can be broken down into the following:
 * - Geometry - The structure and data for the mesh. This can include anything from positions, uvs, normals, colors etc..
 * - Shader - This is the shader that PixiJS will render the geometry with (attributes in the shader must match the geometry)
 * - State - This is the state of WebGL required to render the mesh.
 *
 * Through a combination of the above elements you can render anything you want, 2D or 3D!
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
var Mesh = /** @class */ (function (_super) {
    __extends(Mesh, _super);
    /**
     * @param {PIXI.Geometry} geometry - the geometry the mesh will use
     * @param {PIXI.MeshMaterial} shader - the shader the mesh will use
     * @param {PIXI.State} [state] - the state that the WebGL context is required to be in to render the mesh
     *        if no state is provided, uses {@link PIXI.State.for2d} to create a 2D state for PixiJS.
     * @param {number} [drawMode=PIXI.DRAW_MODES.TRIANGLES] - the drawMode, can be any of the PIXI.DRAW_MODES consts
     */
    function Mesh(geometry, shader, state, drawMode) {
        if (drawMode === void 0) { drawMode = DRAW_MODES.TRIANGLES; }
        var _this = _super.call(this) || this;
        /**
         * Includes vertex positions, face indices, normals, colors, UVs, and
         * custom attributes within buffers, reducing the cost of passing all
         * this data to the GPU. Can be shared between multiple Mesh objects.
         * @member {PIXI.Geometry}
         * @readonly
         */
        _this.geometry = geometry;
        geometry.refCount++;
        /**
         * Represents the vertex and fragment shaders that processes the geometry and runs on the GPU.
         * Can be shared between multiple Mesh objects.
         * @member {PIXI.Shader|PIXI.MeshMaterial}
         */
        _this.shader = shader;
        /**
         * Represents the WebGL state the Mesh required to render, excludes shader and geometry. E.g.,
         * blend mode, culling, depth testing, direction of rendering triangles, backface, etc.
         * @member {PIXI.State}
         */
        _this.state = state || State.for2d();
        /**
         * The way the Mesh should be drawn, can be any of the {@link PIXI.DRAW_MODES} constants.
         *
         * @member {number}
         * @see PIXI.DRAW_MODES
         */
        _this.drawMode = drawMode;
        /**
         * Typically the index of the IndexBuffer where to start drawing.
         * @member {number}
         * @default 0
         */
        _this.start = 0;
        /**
         * How much of the geometry to draw, by default `0` renders everything.
         * @member {number}
         * @default 0
         */
        _this.size = 0;
        /**
         * thease are used as easy access for batching
         * @member {Float32Array}
         * @private
         */
        _this.uvs = null;
        /**
         * thease are used as easy access for batching
         * @member {Uint16Array}
         * @private
         */
        _this.indices = null;
        /**
         * this is the caching layer used by the batcher
         * @member {Float32Array}
         * @private
         */
        _this.vertexData = new Float32Array(1);
        /**
         * If geometry is changed used to decide to re-transform
         * the vertexData.
         * @member {number}
         * @private
         */
        _this.vertexDirty = 0;
        _this._transformID = -1;
        // Inherited from DisplayMode, set defaults
        _this.tint = 0xFFFFFF;
        _this.blendMode = BLEND_MODES.NORMAL;
        /**
         * Internal roundPixels field
         *
         * @member {boolean}
         * @private
         */
        _this._roundPixels = settings.ROUND_PIXELS;
        /**
         * Batched UV's are cached for atlas textures
         * @member {PIXI.MeshBatchUvs}
         * @private
         */
        _this.batchUvs = null;
        return _this;
    }
    Object.defineProperty(Mesh.prototype, "uvBuffer", {
        /**
         * To change mesh uv's, change its uvBuffer data and increment its _updateID.
         * @member {PIXI.Buffer}
         * @readonly
         */
        get: function () {
            return this.geometry.buffers[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "verticesBuffer", {
        /**
         * To change mesh vertices, change its uvBuffer data and increment its _updateID.
         * Incrementing _updateID is optional because most of Mesh objects do it anyway.
         * @member {PIXI.Buffer}
         * @readonly
         */
        get: function () {
            return this.geometry.buffers[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "material", {
        get: function () {
            return this.shader;
        },
        /**
         * Alias for {@link PIXI.Mesh#shader}.
         * @member {PIXI.MeshMaterial}
         */
        set: function (value) {
            this.shader = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "blendMode", {
        get: function () {
            return this.state.blendMode;
        },
        /**
         * The blend mode to be applied to the Mesh. Apply a value of
         * `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
         *
         * @member {number}
         * @default PIXI.BLEND_MODES.NORMAL;
         * @see PIXI.BLEND_MODES
         */
        set: function (value) {
            this.state.blendMode = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "roundPixels", {
        get: function () {
            return this._roundPixels;
        },
        /**
         * If true PixiJS will Math.floor() x/y values when rendering, stopping pixel interpolation.
         * Advantages can include sharper image quality (like text) and faster rendering on canvas.
         * The main disadvantage is movement of objects may appear less smooth.
         * To set the global default, change {@link PIXI.settings.ROUND_PIXELS}
         *
         * @member {boolean}
         * @default false
         */
        set: function (value) {
            if (this._roundPixels !== value) {
                this._transformID = -1;
            }
            this._roundPixels = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "tint", {
        /**
         * The multiply tint applied to the Mesh. This is a hex value. A value of
         * `0xFFFFFF` will remove any tint effect.
         *
         * @member {number}
         * @default 0xFFFFFF
         */
        get: function () {
            return this.shader.tint;
        },
        set: function (value) {
            this.shader.tint = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "texture", {
        /**
         * The texture that the Mesh uses.
         *
         * @member {PIXI.Texture}
         */
        get: function () {
            return this.shader.texture;
        },
        set: function (value) {
            this.shader.texture = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Standard renderer draw.
     * @protected
     * @param {PIXI.Renderer} renderer - Instance to renderer.
     */
    Mesh.prototype._render = function (renderer) {
        // set properties for batching..
        // TODO could use a different way to grab verts?
        var vertices = this.geometry.buffers[0].data;
        // TODO benchmark check for attribute size..
        if (this.shader.batchable
            && this.drawMode === DRAW_MODES.TRIANGLES
            && vertices.length < Mesh.BATCHABLE_SIZE * 2) {
            this._renderToBatch(renderer);
        }
        else {
            this._renderDefault(renderer);
        }
    };
    /**
     * Standard non-batching way of rendering.
     * @protected
     * @param {PIXI.Renderer} renderer - Instance to renderer.
     */
    Mesh.prototype._renderDefault = function (renderer) {
        var shader = this.shader;
        shader.alpha = this.worldAlpha;
        if (shader.update) {
            shader.update();
        }
        renderer.batch.flush();
        if (shader.program.uniformData.translationMatrix) {
            shader.uniforms.translationMatrix = this.transform.worldTransform.toArray(true);
        }
        // bind and sync uniforms..
        renderer.shader.bind(shader);
        // set state..
        renderer.state.set(this.state);
        // bind the geometry...
        renderer.geometry.bind(this.geometry, shader);
        // then render it
        renderer.geometry.draw(this.drawMode, this.size, this.start, this.geometry.instanceCount);
    };
    /**
     * Rendering by using the Batch system.
     * @protected
     * @param {PIXI.Renderer} renderer - Instance to renderer.
     */
    Mesh.prototype._renderToBatch = function (renderer) {
        var geometry = this.geometry;
        if (this.shader.uvMatrix) {
            this.shader.uvMatrix.update();
            this.calculateUvs();
        }
        // set properties for batching..
        this.calculateVertices();
        this.indices = geometry.indexBuffer.data;
        this._tintRGB = this.shader._tintRGB;
        this._texture = this.shader.texture;
        var pluginName = this.material.pluginName;
        renderer.batch.setObjectRenderer(renderer.plugins[pluginName]);
        renderer.plugins[pluginName].render(this);
    };
    /**
     * Updates vertexData field based on transform and vertices
     */
    Mesh.prototype.calculateVertices = function () {
        var geometry = this.geometry;
        var vertices = geometry.buffers[0].data;
        if (geometry.vertexDirtyId === this.vertexDirty && this._transformID === this.transform._worldID) {
            return;
        }
        this._transformID = this.transform._worldID;
        if (this.vertexData.length !== vertices.length) {
            this.vertexData = new Float32Array(vertices.length);
        }
        var wt = this.transform.worldTransform;
        var a = wt.a;
        var b = wt.b;
        var c = wt.c;
        var d = wt.d;
        var tx = wt.tx;
        var ty = wt.ty;
        var vertexData = this.vertexData;
        for (var i = 0; i < vertexData.length / 2; i++) {
            var x = vertices[(i * 2)];
            var y = vertices[(i * 2) + 1];
            vertexData[(i * 2)] = (a * x) + (c * y) + tx;
            vertexData[(i * 2) + 1] = (b * x) + (d * y) + ty;
        }
        if (this._roundPixels) {
            var resolution = settings.RESOLUTION;
            for (var i = 0; i < vertexData.length; ++i) {
                vertexData[i] = Math.round((vertexData[i] * resolution | 0) / resolution);
            }
        }
        this.vertexDirty = geometry.vertexDirtyId;
    };
    /**
     * Updates uv field based on from geometry uv's or batchUvs
     */
    Mesh.prototype.calculateUvs = function () {
        var geomUvs = this.geometry.buffers[1];
        if (!this.shader.uvMatrix.isSimple) {
            if (!this.batchUvs) {
                this.batchUvs = new MeshBatchUvs(geomUvs, this.shader.uvMatrix);
            }
            this.batchUvs.update();
            this.uvs = this.batchUvs.data;
        }
        else {
            this.uvs = geomUvs.data;
        }
    };
    /**
     * Updates the bounds of the mesh as a rectangle. The bounds calculation takes the worldTransform into account.
     * there must be a aVertexPosition attribute present in the geometry for bounds to be calculated correctly.
     *
     * @protected
     */
    Mesh.prototype._calculateBounds = function () {
        this.calculateVertices();
        this._bounds.addVertexData(this.vertexData, 0, this.vertexData.length);
    };
    /**
     * Tests if a point is inside this mesh. Works only for PIXI.DRAW_MODES.TRIANGLES.
     *
     * @param {PIXI.IPointData} point - the point to test
     * @return {boolean} the result of the test
     */
    Mesh.prototype.containsPoint = function (point) {
        if (!this.getBounds().contains(point.x, point.y)) {
            return false;
        }
        this.worldTransform.applyInverse(point, tempPoint);
        var vertices = this.geometry.getBuffer('aVertexPosition').data;
        var points = tempPolygon.points;
        var indices = this.geometry.getIndex().data;
        var len = indices.length;
        var step = this.drawMode === 4 ? 3 : 1;
        for (var i = 0; i + 2 < len; i += step) {
            var ind0 = indices[i] * 2;
            var ind1 = indices[i + 1] * 2;
            var ind2 = indices[i + 2] * 2;
            points[0] = vertices[ind0];
            points[1] = vertices[ind0 + 1];
            points[2] = vertices[ind1];
            points[3] = vertices[ind1 + 1];
            points[4] = vertices[ind2];
            points[5] = vertices[ind2 + 1];
            if (tempPolygon.contains(tempPoint.x, tempPoint.y)) {
                return true;
            }
        }
        return false;
    };
    /**
     * Destroys the Mesh object.
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all
     *  options have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have
     *  their destroy method called as well. 'options' will be passed on to those calls.
     */
    Mesh.prototype.destroy = function (options) {
        _super.prototype.destroy.call(this, options);
        this.geometry.refCount--;
        if (this.geometry.refCount === 0) {
            this.geometry.dispose();
        }
        if (this._cachedTexture) {
            this._cachedTexture.destroy();
            this._cachedTexture = null;
        }
        this.geometry = null;
        this.shader = null;
        this.state = null;
        this.uvs = null;
        this.indices = null;
        this.vertexData = null;
    };
    /**
     * The maximum number of vertices to consider batchable. Generally, the complexity
     * of the geometry.
     * @memberof PIXI.Mesh
     * @static
     * @member {number} BATCHABLE_SIZE
     */
    Mesh.BATCHABLE_SIZE = 100;
    return Mesh;
}(Container));

var fragment = "varying vec2 vTextureCoord;\nuniform vec4 uColor;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    gl_FragColor = texture2D(uSampler, vTextureCoord) * uColor;\n}\n";

var vertex = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform mat3 uTextureMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = (uTextureMatrix * vec3(aTextureCoord, 1.0)).xy;\n}\n";

/**
 * Slightly opinionated default shader for PixiJS 2D objects.
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 */
var MeshMaterial = /** @class */ (function (_super) {
    __extends(MeshMaterial, _super);
    /**
     * @param {PIXI.Texture} uSampler - Texture that material uses to render.
     * @param {object} [options] - Additional options
     * @param {number} [options.alpha=1] - Default alpha.
     * @param {number} [options.tint=0xFFFFFF] - Default tint.
     * @param {string} [options.pluginName='batch'] - Renderer plugin for batching.
     * @param {PIXI.Program} [options.program=0xFFFFFF] - Custom program.
     * @param {object} [options.uniforms] - Custom uniforms.
     */
    function MeshMaterial(uSampler, options) {
        var _this = this;
        var uniforms = {
            uSampler: uSampler,
            alpha: 1,
            uTextureMatrix: Matrix.IDENTITY,
            uColor: new Float32Array([1, 1, 1, 1]),
        };
        // Set defaults
        options = Object.assign({
            tint: 0xFFFFFF,
            alpha: 1,
            pluginName: 'batch',
        }, options);
        if (options.uniforms) {
            Object.assign(uniforms, options.uniforms);
        }
        _this = _super.call(this, options.program || Program.from(vertex, fragment), uniforms) || this;
        /**
         * Only do update if tint or alpha changes.
         * @member {boolean}
         * @private
         * @default false
         */
        _this._colorDirty = false;
        /**
         * TextureMatrix instance for this Mesh, used to track Texture changes
         *
         * @member {PIXI.TextureMatrix}
         * @readonly
         */
        _this.uvMatrix = new TextureMatrix(uSampler);
        /**
         * `true` if shader can be batch with the renderer's batch system.
         * @member {boolean}
         * @default true
         */
        _this.batchable = options.program === undefined;
        /**
         * Renderer plugin for batching
         *
         * @member {string}
         * @default 'batch'
         */
        _this.pluginName = options.pluginName;
        _this.tint = options.tint;
        _this.alpha = options.alpha;
        return _this;
    }
    Object.defineProperty(MeshMaterial.prototype, "texture", {
        /**
         * Reference to the texture being rendered.
         * @member {PIXI.Texture}
         */
        get: function () {
            return this.uniforms.uSampler;
        },
        set: function (value) {
            if (this.uniforms.uSampler !== value) {
                this.uniforms.uSampler = value;
                this.uvMatrix.texture = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MeshMaterial.prototype, "alpha", {
        get: function () {
            return this._alpha;
        },
        /**
         * This gets automatically set by the object using this.
         *
         * @default 1
         * @member {number}
         */
        set: function (value) {
            if (value === this._alpha)
                { return; }
            this._alpha = value;
            this._colorDirty = true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MeshMaterial.prototype, "tint", {
        get: function () {
            return this._tint;
        },
        /**
         * Multiply tint for the material.
         * @member {number}
         * @default 0xFFFFFF
         */
        set: function (value) {
            if (value === this._tint)
                { return; }
            this._tint = value;
            this._tintRGB = (value >> 16) + (value & 0xff00) + ((value & 0xff) << 16);
            this._colorDirty = true;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets called automatically by the Mesh. Intended to be overridden for custom
     * MeshMaterial objects.
     */
    MeshMaterial.prototype.update = function () {
        if (this._colorDirty) {
            this._colorDirty = false;
            var baseTexture = this.texture.baseTexture;
            premultiplyTintToRgba(this._tint, this._alpha, this.uniforms.uColor, baseTexture.alphaMode);
        }
        if (this.uvMatrix.update()) {
            this.uniforms.uTextureMatrix = this.uvMatrix.mapCoord;
        }
    };
    return MeshMaterial;
}(Shader));

/**
 * Standard 2D geometry used in PixiJS.
 *
 * Geometry can be defined without passing in a style or data if required.
 *
 * ```js
 * const geometry = new PIXI.Geometry();
 *
 * geometry.addAttribute('positions', [0, 0, 100, 0, 100, 100, 0, 100], 2);
 * geometry.addAttribute('uvs', [0,0,1,0,1,1,0,1], 2);
 * geometry.addIndex([0,1,2,1,3,2]);
 *
 * ```
 * @class
 * @memberof PIXI
 * @extends PIXI.Geometry
 */
var MeshGeometry = /** @class */ (function (_super) {
    __extends(MeshGeometry, _super);
    /**
     * @param {Float32Array|number[]} [vertices] - Positional data on geometry.
     * @param {Float32Array|number[]} [uvs] - Texture UVs.
     * @param {Uint16Array|number[]} [index] - IndexBuffer
     */
    function MeshGeometry(vertices, uvs, index) {
        var _this = _super.call(this) || this;
        var verticesBuffer = new Buffer(vertices);
        var uvsBuffer = new Buffer(uvs, true);
        var indexBuffer = new Buffer(index, true, true);
        _this.addAttribute('aVertexPosition', verticesBuffer, 2, false, TYPES.FLOAT)
            .addAttribute('aTextureCoord', uvsBuffer, 2, false, TYPES.FLOAT)
            .addIndex(indexBuffer);
        /**
         * Dirty flag to limit update calls on Mesh. For example,
         * limiting updates on a single Mesh instance with a shared Geometry
         * within the render loop.
         * @private
         * @member {number}
         * @default -1
         */
        _this._updateId = -1;
        return _this;
    }
    Object.defineProperty(MeshGeometry.prototype, "vertexDirtyId", {
        /**
         * If the vertex position is updated.
         * @member {number}
         * @readonly
         * @private
         */
        get: function () {
            return this.buffers[0]._updateID;
        },
        enumerable: false,
        configurable: true
    });
    return MeshGeometry;
}(Geometry));

export { Mesh, MeshBatchUvs, MeshGeometry, MeshMaterial };
//# sourceMappingURL=mesh.es.js.map
