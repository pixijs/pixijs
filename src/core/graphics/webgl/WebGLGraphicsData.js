import glCore from 'pixi-gl-core';

/**
 * An object containing WebGL specific properties to be used by the WebGL renderer
 *
 * @class
 * @private
 * @memberof PIXI
 */
export default class WebGLGraphicsData
{
    /**
     * @param {WebGLRenderingContext} gl - The current WebGL drawing context
     * @param {PIXI.Shader} shader - The shader
     * @param {object} attribsState - The state for the VAO
     */
    constructor(gl, shader, attribsState)
    {
        /**
         * The current WebGL drawing context
         *
         * @member {WebGLRenderingContext}
         */
        this.gl = gl;

        // TODO does this need to be split before uploading??
        /**
         * An array of color components (r,g,b)
         * @member {number[]}
         */
        this.color = [0, 0, 0]; // color split!

        /**
         * An array of points to draw
         * @member {PIXI.Point[]}
         */
        this.points = [];

        /**
         * The indices of the vertices
         * @member {number[]}
         */
        this.indices = [];
        /**
         * The main buffer
         * @member {WebGLBuffer}
         */
        this.buffer = glCore.GLBuffer.createVertexBuffer(gl);

        /**
         * The index buffer
         * @member {WebGLBuffer}
         */
        this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl);

        /**
         * Whether this graphics is dirty or not
         * @member {boolean}
         */
        this.dirty = true;

        /**
         * Whether this graphics is nativeLines or not
         * @member {boolean}
         */
        this.nativeLines = false;

        this.glPoints = null;
        this.glIndices = null;

        /**
         *
         * @member {PIXI.Shader}
         */
        this.shader = shader;

        this.vao = new glCore.VertexArrayObject(gl, attribsState)
        .addIndex(this.indexBuffer)
        .addAttribute(this.buffer, shader.attributes.aVertexPosition, gl.FLOAT, false, 4 * 6, 0)
        .addAttribute(this.buffer, shader.attributes.aColor, gl.FLOAT, false, 4 * 6, 2 * 4);
    }

    /**
     * Resets the vertices and the indices
     */
    reset()
    {
        this.points.length = 0;
        this.indices.length = 0;
    }

    /**
     * Binds the buffers and uploads the data
     */
    upload()
    {
        this.glPoints = new Float32Array(this.points);
        this.buffer.upload(this.glPoints);

        this.glIndices = new Uint16Array(this.indices);
        this.indexBuffer.upload(this.glIndices);

        this.dirty = false;
    }

    /**
     * Empties all the data
     */
    destroy()
    {
        this.color = null;
        this.points = null;
        this.indices = null;

        this.vao.destroy();
        this.buffer.destroy();
        this.indexBuffer.destroy();

        this.gl = null;

        this.buffer = null;
        this.indexBuffer = null;

        this.glPoints = null;
        this.glIndices = null;
    }
}
