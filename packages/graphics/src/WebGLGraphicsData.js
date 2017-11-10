import { Geometry, Buffer } from '@pixi/core';

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
     */
    constructor(gl, shader)
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
        this.buffer = new Buffer();

        /**
         * The index buffer
         * @member {WebGLBuffer}
         */
        this.indexBuffer = new Buffer();

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

        this.geometry = new Geometry()
            .addAttribute('aVertexPosition|aColor', this.buffer)
            .addIndex(this.indexBuffer);
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
        this.buffer.update(this.glPoints);

        this.glIndices = new Uint16Array(this.indices);
        this.indexBuffer.update(this.glIndices);

        //     console.log("UPKOADING,.",this.glPoints,this.glIndices)
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
