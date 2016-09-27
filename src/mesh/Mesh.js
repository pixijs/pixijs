import * as core from '../core';
import glCore from 'pixi-gl-core';
import Shader from './webgl/MeshShader';

const tempPoint = new core.Point();
const tempPolygon = new core.Polygon();

/**
 * Base mesh class
 * @class
 * @extends PIXI.Container
 * @memberof PIXI.mesh
 */
export default class Mesh extends core.Container
{
    /**
     * @param {PIXI.Texture} texture - The texture to use
     * @param {Float32Array} [vertices] - if you want to specify the vertices
     * @param {Float32Array} [uvs] - if you want to specify the uvs
     * @param {Uint16Array} [indices] - if you want to specify the indices
     * @param {number} [drawMode] - the drawMode, can be any of the Mesh.DRAW_MODES consts
     */
    constructor(texture, vertices, uvs, indices, drawMode)
    {
        super();

        /**
         * The texture of the Mesh
         *
         * @member {PIXI.Texture}
         * @private
         */
        this._texture = null;

        /**
         * The Uvs of the Mesh
         *
         * @member {Float32Array}
         */
        this.uvs = uvs || new Float32Array([0, 0,
                1, 0,
                1, 1,
                0, 1]);

        /**
         * An array of vertices
         *
         * @member {Float32Array}
         */
        this.vertices = vertices || new Float32Array([0, 0,
                100, 0,
                100, 100,
                0, 100]);

        /*
         * @member {Uint16Array} An array containing the indices of the vertices
         */
        //  TODO auto generate this based on draw mode!
        this.indices = indices || new Uint16Array([0, 1, 3, 2]);

        /**
         * Whether the Mesh is dirty or not
         *
         * @member {number}
         */
        this.dirty = 0;
        this.indexDirty = 0;

        /**
         * The blend mode to be applied to the sprite. Set to `PIXI.BLEND_MODES.NORMAL` to remove
         * any blend mode.
         *
         * @member {number}
         * @default PIXI.BLEND_MODES.NORMAL
         * @see PIXI.BLEND_MODES
         */
        this.blendMode = core.BLEND_MODES.NORMAL;

        /**
         * Triangles in canvas mode are automatically antialiased, use this value to force triangles
         * to overlap a bit with each other.
         *
         * @member {number}
         */
        this.canvasPadding = 0;

        /**
         * The way the Mesh should be drawn, can be any of the {@link PIXI.mesh.Mesh.DRAW_MODES} consts
         *
         * @member {number}
         * @see PIXI.mesh.Mesh.DRAW_MODES
         */
        this.drawMode = drawMode || Mesh.DRAW_MODES.TRIANGLE_MESH;

        // run texture setter;
        this.texture = texture;

        /**
         * The default shader that is used if a mesh doesn't have a more specific one.
         *
         * @member {PIXI.Shader}
         */
        this.shader = null;

        /**
         * The tint applied to the mesh. This is a [r,g,b] value. A value of [1,1,1] will remove any
         * tint effect.
         *
         * @member {number}
         * @memberof PIXI.mesh.Mesh#
         */
        this.tintRgb = new Float32Array([1, 1, 1]);

        this._glDatas = [];
    }

    /**
     * Renders the object using the WebGL renderer
     *
     * @private
     * @param {PIXI.WebGLRenderer} renderer - a reference to the WebGL renderer
     */
    _renderWebGL(renderer)
    {
        // get rid of any thing that may be batching.
        renderer.flush();

        //  renderer.plugins.mesh.render(this);
        const gl = renderer.gl;
        let glData = this._glDatas[renderer.CONTEXT_UID];

        if (!glData)
        {
            glData = {
                shader: new Shader(gl),
                vertexBuffer: glCore.GLBuffer.createVertexBuffer(gl, this.vertices, gl.STREAM_DRAW),
                uvBuffer: glCore.GLBuffer.createVertexBuffer(gl, this.uvs, gl.STREAM_DRAW),
                indexBuffer: glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW),
                // build the vao object that will render..
                vao: new glCore.VertexArrayObject(gl),
                dirty: this.dirty,
                indexDirty: this.indexDirty,
            };

            // build the vao object that will render..
            glData.vao = new glCore.VertexArrayObject(gl)
                .addIndex(glData.indexBuffer)
                .addAttribute(glData.vertexBuffer, glData.shader.attributes.aVertexPosition, gl.FLOAT, false, 2 * 4, 0)
                .addAttribute(glData.uvBuffer, glData.shader.attributes.aTextureCoord, gl.FLOAT, false, 2 * 4, 0);

            this._glDatas[renderer.CONTEXT_UID] = glData;
        }

        if (this.dirty !== glData.dirty)
        {
            glData.dirty = this.dirty;
            glData.uvBuffer.upload();
        }

        if (this.indexDirty !== glData.indexDirty)
        {
            glData.indexDirty = this.indexDirty;
            glData.indexBuffer.upload();
        }

        glData.vertexBuffer.upload();

        renderer.bindShader(glData.shader);
        renderer.bindTexture(this._texture, 0);
        renderer.state.setBlendMode(this.blendMode);

        glData.shader.uniforms.translationMatrix = this.worldTransform.toArray(true);
        glData.shader.uniforms.alpha = this.worldAlpha;
        glData.shader.uniforms.tint = this.tintRgb;

        const drawMode = this.drawMode === Mesh.DRAW_MODES.TRIANGLE_MESH ? gl.TRIANGLE_STRIP : gl.TRIANGLES;

        glData.vao.bind()
            .draw(drawMode, this.indices.length)
            .unbind();
    }

    /**
     * Renders the object using the Canvas renderer
     *
     * @private
     * @param {PIXI.CanvasRenderer} renderer - The canvas renderer.
     */
    _renderCanvas(renderer)
    {
        const context = renderer.context;

        const transform = this.worldTransform;
        const res = renderer.resolution;

        if (renderer.roundPixels)
        {
            context.setTransform(
                transform.a * res,
                transform.b * res,
                transform.c * res,
                transform.d * res,
                (transform.tx * res) | 0,
                (transform.ty * res) | 0
            );
        }
        else
        {
            context.setTransform(
                transform.a * res,
                transform.b * res,
                transform.c * res,
                transform.d * res,
                transform.tx * res,
                transform.ty * res
            );
        }

        if (this.drawMode === Mesh.DRAW_MODES.TRIANGLE_MESH)
        {
            this._renderCanvasTriangleMesh(context);
        }
        else
        {
            this._renderCanvasTriangles(context);
        }
    }

    /**
     * Draws the object in Triangle Mesh mode using canvas
     *
     * @private
     * @param {CanvasRenderingContext2D} context - The current drawing context
     */
    _renderCanvasTriangleMesh(context)
    {
        // draw triangles!!
        const vertices = this.vertices;
        const uvs = this.uvs;
        const length = vertices.length / 2;

        // this.count++;

        for (let i = 0; i < length - 2; i++)
        {
            // draw some triangles!
            const index = i * 2;

            this._renderCanvasDrawTriangle(context, vertices, uvs, index, (index + 2), (index + 4));
        }
    }

    /**
     * Draws the object in triangle mode using canvas
     *
     * @private
     * @param {CanvasRenderingContext2D} context - the current drawing context
     */
    _renderCanvasTriangles(context)
    {
        // draw triangles!!
        const vertices = this.vertices;
        const uvs = this.uvs;
        const indices = this.indices;
        const length = indices.length;
        // this.count++;

        for (let i = 0; i < length; i += 3)
        {
            // draw some triangles!
            const index0 = indices[i] * 2;
            const index1 = indices[i + 1] * 2;
            const index2 = indices[i + 2] * 2;

            this._renderCanvasDrawTriangle(context, vertices, uvs, index0, index1, index2);
        }
    }

    /**
     * Draws one of the triangles that form this Mesh
     *
     * @private
     * @param {CanvasRenderingContext2D} context - the current drawing context
     * @param {Float32Array} vertices - a reference to the vertices of the Mesh
     * @param {Float32Array} uvs - a reference to the uvs of the Mesh
     * @param {number} index0 - the index of the first vertex
     * @param {number} index1 - the index of the second vertex
     * @param {number} index2 - the index of the third vertex
     */
    _renderCanvasDrawTriangle(context, vertices, uvs, index0, index1, index2)
    {
        const base = this._texture.baseTexture;
        const textureSource = base.source;
        const textureWidth = base.width;
        const textureHeight = base.height;

        const u0 = uvs[index0] * base.width;
        const u1 = uvs[index1] * base.width;
        const u2 = uvs[index2] * base.width;
        const v0 = uvs[index0 + 1] * base.height;
        const v1 = uvs[index1 + 1] * base.height;
        const v2 = uvs[index2 + 1] * base.height;

        let x0 = vertices[index0];
        let x1 = vertices[index1];
        let x2 = vertices[index2];
        let y0 = vertices[index0 + 1];
        let y1 = vertices[index1 + 1];
        let y2 = vertices[index2 + 1];

        if (this.canvasPadding > 0)
        {
            const paddingX = this.canvasPadding / this.worldTransform.a;
            const paddingY = this.canvasPadding / this.worldTransform.d;
            const centerX = (x0 + x1 + x2) / 3;
            const centerY = (y0 + y1 + y2) / 3;

            let normX = x0 - centerX;
            let normY = y0 - centerY;

            let dist = Math.sqrt((normX * normX) + (normY * normY));

            x0 = centerX + ((normX / dist) * (dist + paddingX));
            y0 = centerY + ((normY / dist) * (dist + paddingY));

            //

            normX = x1 - centerX;
            normY = y1 - centerY;

            dist = Math.sqrt((normX * normX) + (normY * normY));
            x1 = centerX + ((normX / dist) * (dist + paddingX));
            y1 = centerY + ((normY / dist) * (dist + paddingY));

            normX = x2 - centerX;
            normY = y2 - centerY;

            dist = Math.sqrt((normX * normX) + (normY * normY));
            x2 = centerX + ((normX / dist) * (dist + paddingX));
            y2 = centerY + ((normY / dist) * (dist + paddingY));
        }

        context.save();
        context.beginPath();

        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.lineTo(x2, y2);

        context.closePath();

        context.clip();

        // Compute matrix transform
        const delta = (u0 * v1) + (v0 * u2) + (u1 * v2) - (v1 * u2) - (v0 * u1) - (u0 * v2);
        const deltaA = (x0 * v1) + (v0 * x2) + (x1 * v2) - (v1 * x2) - (v0 * x1) - (x0 * v2);
        const deltaB = (u0 * x1) + (x0 * u2) + (u1 * x2) - (x1 * u2) - (x0 * u1) - (u0 * x2);
        const deltaC = (u0 * v1 * x2) + (v0 * x1 * u2) + (x0 * u1 * v2) - (x0 * v1 * u2) - (v0 * u1 * x2) - (u0 * x1 * v2);
        const deltaD = (y0 * v1) + (v0 * y2) + (y1 * v2) - (v1 * y2) - (v0 * y1) - (y0 * v2);
        const deltaE = (u0 * y1) + (y0 * u2) + (u1 * y2) - (y1 * u2) - (y0 * u1) - (u0 * y2);
        const deltaF = (u0 * v1 * y2) + (v0 * y1 * u2) + (y0 * u1 * v2) - (y0 * v1 * u2) - (v0 * u1 * y2) - (u0 * y1 * v2);

        context.transform(
            deltaA / delta,
            deltaD / delta,
            deltaB / delta,
            deltaE / delta,
            deltaC / delta,
            deltaF / delta
        );

        context.drawImage(
            textureSource,
            0,
            0,
            textureWidth * base.resolution,
            textureHeight * base.resolution,
            0,
            0,
            textureWidth,
            textureHeight
        );

        context.restore();
    }

    /**
     * Renders a flat Mesh
     *
     * @private
     * @param {PIXI.mesh.Mesh} mesh - The Mesh to render
     */
    renderMeshFlat(mesh)
    {
        const context = this.context;
        const vertices = mesh.vertices;
        const length = vertices.length / 2;

        // this.count++;

        context.beginPath();

        for (let i = 1; i < length - 2; ++i)
        {
            // draw some triangles!
            const index = i * 2;

            const x0 = vertices[index];
            const y0 = vertices[index + 1];

            const x1 = vertices[index + 2];
            const y1 = vertices[index + 3];

            const x2 = vertices[index + 4];
            const y2 = vertices[index + 5];

            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.lineTo(x2, y2);
        }

        context.fillStyle = '#FF0000';
        context.fill();
        context.closePath();
    }

    /**
     * When the texture is updated, this event will fire to update the scale and frame
     *
     * @private
     */
    _onTextureUpdate()
    {
        /* empty */
    }

    /**
     * Returns the bounds of the mesh as a rectangle. The bounds calculation takes the worldTransform into account.
     *
     */
    _calculateBounds()
    {
        // TODO - we can cache local bounds and use them if they are dirty (like graphics)
        this._bounds.addVertices(this.transform, this.vertices, 0, this.vertices.length);
    }

    /**
     * Tests if a point is inside this mesh. Works only for TRIANGLE_MESH
     *
     * @param {PIXI.Point} point - the point to test
     * @return {boolean} the result of the test
     */
    containsPoint(point)
    {
        if (!this.getBounds().contains(point.x, point.y))
        {
            return false;
        }

        this.worldTransform.applyInverse(point, tempPoint);

        const vertices = this.vertices;
        const points = tempPolygon.points;
        const indices = this.indices;
        const len = this.indices.length;
        const step = this.drawMode === Mesh.DRAW_MODES.TRIANGLES ? 3 : 1;

        for (let i = 0; i + 2 < len; i += step)
        {
            const ind0 = indices[i] * 2;
            const ind1 = indices[i + 1] * 2;
            const ind2 = indices[i + 2] * 2;

            points[0] = vertices[ind0];
            points[1] = vertices[ind0 + 1];
            points[2] = vertices[ind1];
            points[3] = vertices[ind1 + 1];
            points[4] = vertices[ind2];
            points[5] = vertices[ind2 + 1];

            if (tempPolygon.contains(tempPoint.x, tempPoint.y))
            {
                return true;
            }
        }

        return false;
    }

    /**
     * The texture that the mesh uses.
     *
     * @member {PIXI.Texture}
     * @memberof PIXI.mesh.Mesh#
     */
    get texture()
    {
        return this._texture;
    }

    /**
     * Sets the texture the mesh uses.
     *
     * @param {Texture} value - The value to set.
     */
    set texture(value)
    {
        if (this._texture === value)
        {
            return;
        }

        this._texture = value;

        if (value)
        {
            // wait for the texture to load
            if (value.baseTexture.hasLoaded)
            {
                this._onTextureUpdate();
            }
            else
            {
                value.once('update', this._onTextureUpdate, this);
            }
        }
    }

    /**
     * The tint applied to the mesh. This is a hex value. A value of 0xFFFFFF will remove any tint effect.
     *
     * @member {number}
     * @memberof PIXI.mesh.Mesh#
     * @default 0xFFFFFF
     */
    get tint()
    {
        return core.utils.rgb2hex(this.tintRgb);
    }

    /**
     * Sets the tint the mesh uses.
     *
     * @param {number} value - The value to set.
     */
    set tint(value)
    {
        this.tintRgb = core.utils.hex2rgb(value, this.tintRgb);
    }
}

/**
 * Different drawing buffer modes supported
 *
 * @static
 * @constant
 * @type {object}
 * @property {number} TRIANGLE_MESH
 * @property {number} TRIANGLES
 */
Mesh.DRAW_MODES = {
    TRIANGLE_MESH: 0,
    TRIANGLES: 1,
};
