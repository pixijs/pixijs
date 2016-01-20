var glCore = require('pixi-gl-core');


/**
 * An object containing WebGL specific properties to be used by the WebGL renderer
 *
 * @class
 * @memberof PIXI
 * @param gl {WebGLRenderingContext} the current WebGL drawing context
 * @private
 */
function PrimitiveObject(gl) 
{

    /**
     * The current WebGL drawing context
     *
     * @member {WebGLRenderingContext}
     */
    this.gl = gl;

    //TODO does this need to be split before uploding??
    /**
     * An array of color components (r,g,b)
     * @member {number[]}
     */
    this.color = [0,0,0]; // color split!

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
     * todo @alvin
     * @member {number}
     */
    this.mode = 1;

    /**
     * The alpha of the graphics
     * @member {number}
     */
    this.alpha = 1;

    /**
     * Whether this graphics is dirty or not
     * @member {boolean}
     */
    this.dirty = true;

    this.glPoints = null;
    this.glIndices = null;

    // 
    this.shader = shader;
    this.vao = vao;

    
}

PrimitiveObject.prototype.constructor = PrimitiveObject;
module.exports = PrimitiveObject;

/**
 * Resets the vertices and the indices
 */
PrimitiveObject.prototype.reset = function () 
{
    this.points.length = 0;
    this.indices.length = 0;
};

/**
 * Binds the buffers and uploads the data
 */
PrimitiveObject.prototype.upload = function () 
{
    var gl = this.gl;

    this.glPoints = new Float32Array(this.points);
    this.buffer.upload( this.glPoints );

    this.glIndices = new Uint16Array(this.indices);
    this.indexBuffer.upload( this.glIndices );

    this.dirty = false;
};

PrimitiveObject.prototype.destroy = function () 
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
};

PrimitiveObject.createComplexPrimitive = function(gl, shader)
{
    var vao = new glCore.VertexArrayObject(gl)
    .addIndex(this.indexBuffer)
    .addAttribute(this.buffer, shader.attributes.aVertexPosition, gl.FLOAT, false, 4 * 6, 0)
    .addAttribute(this.buffer, shader.attributes.aColor, gl.FLOAT, false, 4 * 6, 2 * 4);

    return new PrimitiveObject(gl, shader, vao);
}

PrimitiveObject.createPrimitive = function(gl, shader)
{
    var vao = new glCore.VertexArrayObject(gl)
    .addIndex(this.indexBuffer)
    .addAttribute(this.buffer, shader.attributes.aVertexPosition, gl.FLOAT, false, 4 * 6, 0)
    .addAttribute(this.buffer, shader.attributes.aColor, gl.FLOAT, false, 4 * 6, 2 * 4);

    return new PrimitiveObject(gl, shader, vao)
}

