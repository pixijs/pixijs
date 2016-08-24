var glCore = require('pixi-gl-core'),
    createIndicesForQuads = require('../../../utils/createIndicesForQuads');

/**
 * Helper class to create a quad
 *
 * @class
 * @memberof PIXI
 * @param gl {WebGLRenderingContext} The gl context for this quad to use.
 * @param state {object} TODO: Description
 */
function Quad(gl, state)
{
    /*
     * the current WebGL drawing context
     *
     * @member {WebGLRenderingContext}
     */
    this.gl = gl;

    /**
     * An array of vertices
     *
     * @member {Float32Array}
     */
    this.vertices = new Float32Array([
        -1,-1,
        1,-1,
        1,1,
        -1,1
    ]);

    /**
     * The Uvs of the quad
     *
     * @member {Float32Array}
     */
    this.uvs = new Float32Array([
        0,0,
        1,0,
        1,1,
        0,1
    ]);

    this.interleaved = new Float32Array(8 * 2);

    for (var i = 0; i < 4; i++) {
        this.interleaved[i*4] = this.vertices[(i*2)];
        this.interleaved[(i*4)+1] = this.vertices[(i*2)+1];
        this.interleaved[(i*4)+2] = this.uvs[i*2];
        this.interleaved[(i*4)+3] = this.uvs[(i*2)+1];
    }

    /*
     * @member {Uint16Array} An array containing the indices of the vertices
     */
    this.indices = createIndicesForQuads(1);

    /*
     * @member {glCore.GLBuffer} The vertex buffer
     */
    this.vertexBuffer = glCore.GLBuffer.createVertexBuffer(gl, this.interleaved, gl.STATIC_DRAW);

    /*
     * @member {glCore.GLBuffer} The index buffer
     */
    this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);

    /*
     * @member {glCore.VertexArrayObject} The index buffer
     */
    this.vao = new glCore.VertexArrayObject(gl, state);

}

Quad.prototype.constructor = Quad;

/**
 * Initialises the vaos and uses the shader
 * @param shader {PIXI.Shader} the shader to use
 */
Quad.prototype.initVao = function(shader)
{
    this.vao.clear()
    .addIndex(this.indexBuffer)
    .addAttribute(this.vertexBuffer, shader.attributes.aVertexPosition, this.gl.FLOAT, false, 4 * 4, 0)
    .addAttribute(this.vertexBuffer, shader.attributes.aTextureCoord, this.gl.FLOAT, false, 4 * 4, 2 * 4);
};

/**
 * Maps two Rectangle to the quad
 * @param targetTextureFrame {PIXI.Rectangle} the first rectangle
 * @param destinationFrame {PIXI.Rectangle} the second rectangle
 */
Quad.prototype.map = function(targetTextureFrame, destinationFrame)
{
    var x = 0; //destinationFrame.x / targetTextureFrame.width;
    var y = 0; //destinationFrame.y / targetTextureFrame.height;

    this.uvs[0] = x;
    this.uvs[1] = y;

    this.uvs[2] = x + destinationFrame.width / targetTextureFrame.width;
    this.uvs[3] = y;

    this.uvs[4] = x + destinationFrame.width / targetTextureFrame.width;
    this.uvs[5] = y + destinationFrame.height / targetTextureFrame.height;

    this.uvs[6] = x;
    this.uvs[7] = y + destinationFrame.height / targetTextureFrame.height;

    /// -----
    x = destinationFrame.x;
    y = destinationFrame.y;

    this.vertices[0] = x;
    this.vertices[1] = y;

    this.vertices[2] = x + destinationFrame.width;
    this.vertices[3] = y;

    this.vertices[4] = x + destinationFrame.width;
    this.vertices[5] = y + destinationFrame.height;

    this.vertices[6] = x;
    this.vertices[7] = y + destinationFrame.height;

    return this;
};

/**
 * Draws the quad
 */
Quad.prototype.draw = function()
{
    this.vao.bind()
    .draw(this.gl.TRIANGLES, 6, 0)
    .unbind();

    return this;
};

/**
 * Binds the buffer and uploads the data
 */
Quad.prototype.upload = function()
{
    for (var i = 0; i < 4; i++) {
        this.interleaved[i*4] = this.vertices[(i*2)];
        this.interleaved[(i*4)+1] = this.vertices[(i*2)+1];
        this.interleaved[(i*4)+2] = this.uvs[i*2];
        this.interleaved[(i*4)+3] = this.uvs[(i*2)+1];
    }

    this.vertexBuffer.upload(this.interleaved);

    return this;
};

/**
 * Removes this quad from WebGL
 */
Quad.prototype.destroy = function()
{
    var gl = this.gl;

     gl.deleteBuffer(this.vertexBuffer);
     gl.deleteBuffer(this.indexBuffer);
};

module.exports = Quad;
